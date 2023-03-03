package specter

import (
	"context"
	"fmt"
	"net"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"kon.nect.sh/specter/tun/client/connector"
	"kon.nect.sh/specter/tun/client/dialer"
	"kon.nect.sh/specter/util/promise"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type Listener struct {
	Label    string `json:"label"`
	Listen   string `json:"listen"`
	Hostname string `json:"hostname"`
	Insecure bool   `json:"insecure"`
	UseTCP   bool   `json:"tcp"`
}

var _ zapcore.ObjectMarshaler = (*Listener)(nil)

func (l *Listener) MarshalLogObject(enc zapcore.ObjectEncoder) error {
	enc.AddString("listen", l.Listen)
	enc.AddString("via", l.Hostname)
	enc.AddBool("insecure", l.Insecure)
	enc.AddBool("tcp", l.UseTCP)
	return nil
}

type forwarder struct {
	ctx      context.Context
	cancel   context.CancelFunc
	listener net.Listener
	dialer   dialer.TransportDialer
	cfg      Listener
}

func (f *forwarder) stop() {
	f.listener.Close()
	f.cancel()
}

func (app *Application) startAllForwarders() {
	app.stateMu.Lock()
	defer app.stateMu.Unlock()

	toStart := make([]Listener, 0)
	for _, l := range app.phantomCfg.Listeners {
		if _, ok := app.forwarders.Load(l.Listen); ok {
			continue
		}
		toStart = append(toStart, l)
	}

	if len(toStart) == 0 {
		return
	}

	startJobs := make([]func(context.Context) (int, error), len(toStart))
	for i, l := range toStart {
		l := l
		startJobs[i] = func(ctx context.Context) (int, error) {
			app.logger.Info("Starting forwarder on startup", zap.Object("listener", &l))
			err := app.startForwarder(l)
			if err != nil {
				app.logger.Error("Failed to start forwarder on startup", zap.Object("listener", &l), zap.Error(err))
			}
			return 0, err
		}
	}
	promise.All(app.appCtx, startJobs...)
}

func (app *Application) stopAllForwarders() {
	app.forwarders.Range(func(listen string, f *forwarder) bool {
		app.logger.Info("Stopping forwarder on exit", zap.String("listen", f.listener.Addr().String()))
		f.stop()
		return true
	})
}

func (app *Application) getNewForwarder(l Listener) (*forwarder, error) {
	listener, err := net.Listen("tcp", l.Listen)
	if err != nil {
		return nil, err
	}

	forwardCtx, forwardCancel := context.WithCancel(app.appCtx)
	return &forwarder{
		ctx:      forwardCtx,
		cancel:   forwardCancel,
		listener: listener,
		cfg:      l,
	}, nil
}

func (app *Application) ForwarderStarted(listen string) bool {
	app.stateMu.RLock()
	defer app.stateMu.RUnlock()

	_, ok := app.forwarders.Load(listen)
	return ok
}

func (app *Application) AddForwarder(l Listener) error {
	app.stateMu.Lock()
	defer app.stateMu.Unlock()

	if _, ok := app.forwarders.Load(l.Listen); ok {
		return fmt.Errorf("listener with address %s already exists", l.Listen)
	}

	err := app.startForwarder(l)
	if err != nil {
		return err
	}

	app.phantomCfg.Listeners = append(app.phantomCfg.Listeners, l)

	if err := app.persistPhantomConfig(app.phantomCfg); err != nil {
		return fmt.Errorf("failed to persist forwarder config: %w", err)
	}

	return nil
}

func (app *Application) startForwarder(l Listener) error {
	var (
		logger = app.logger.With(zap.Object("listener", &l))
		remote net.Addr
		dial   dialer.TransportDialer
		err    error
	)

	parsed, err := dialer.ParseApex(l.Hostname)
	if err != nil {
		return fmt.Errorf("error parsing hostname: %w", err)
	}

	f, err := app.getNewForwarder(l)
	if err != nil {
		return fmt.Errorf("error listening locally: %w", err)
	}

	if l.UseTCP {
		remote, dial, err = dialer.TLSDialer(f.ctx, dialer.DialerConfig{
			Logger:             logger,
			Parsed:             parsed,
			InsecureSkipVerify: l.Insecure,
			NoReconnection:     false,
		})
	} else {
		remote, dial, err = dialer.QuicDialer(f.ctx, dialer.DialerConfig{
			Logger:             logger,
			Parsed:             parsed,
			InsecureSkipVerify: l.Insecure,
			NoReconnection:     false,
		})
	}
	if err != nil {
		return fmt.Errorf("error dialing specter gateway: %w", err)
	}

	logger.Info("Listening for local connections", zap.String("listen", f.listener.Addr().String()), zap.String("via", remote.String()))

	go connector.HandleConnections(logger, f.listener, dial)

	f.dialer = dial
	app.forwarders.Store(l.Listen, f)
	runtime.EventsEmit(app.appCtx, "forwarder:Started", l.Listen)

	return nil
}

func (app *Application) stopForwarder(l Listener, f *forwarder) {
	f.stop()

	app.forwarders.Delete(l.Listen)
	runtime.EventsEmit(app.appCtx, "forwarder:Stopped", l.Listen)
}

func (app *Application) findForwarder(index int) (l Listener, f *forwarder, ok bool, err error) {
	if index < 0 || index > len(app.phantomCfg.Listeners) {
		err = fmt.Errorf("tunnel index out of bound")
		return
	}

	l = app.phantomCfg.Listeners[index]

	f, ok = app.forwarders.Load(l.Listen)

	return
}

func (app *Application) UpdateForwaderLabel(index int, label string) error {
	app.stateMu.Lock()
	defer app.stateMu.Unlock()

	_, f, ok, err := app.findForwarder(index)
	if err != nil {
		return err
	}

	if !ok {
		return fmt.Errorf("forwarder with index %d does not exist", index)
	}

	app.phantomCfg.Listeners[index].Label = label
	f.cfg = app.phantomCfg.Listeners[index]

	if err := app.persistPhantomConfig(app.phantomCfg); err != nil {
		return fmt.Errorf("failed to persist forwarder config: %w", err)
	}

	return nil
}

func (app *Application) RemoveForwarder(index int) error {
	app.stateMu.Lock()
	defer app.stateMu.Unlock()

	l, f, ok, err := app.findForwarder(index)
	if err != nil {
		return err
	}

	if !ok {
		return fmt.Errorf("forwarder with index %d does not exist", index)
	}

	app.logger.Info("Removing forwarder", zap.String("listen", f.listener.Addr().String()))
	app.stopForwarder(l, f)

	app.phantomCfg.Listeners = append(app.phantomCfg.Listeners[:index], app.phantomCfg.Listeners[index+1:]...)

	if err := app.persistPhantomConfig(app.phantomCfg); err != nil {
		return fmt.Errorf("failed to persist forwarder config: %w", err)
	}

	return nil
}

func (app *Application) StopForwarder(index int) error {
	app.stateMu.Lock()
	defer app.stateMu.Unlock()

	l, f, ok, err := app.findForwarder(index)
	if err != nil {
		return err
	}

	if ok {
		app.logger.Info("Stopping forwarder", zap.String("listen", f.listener.Addr().String()))
		app.stopForwarder(l, f)
	}

	return nil
}

func (app *Application) StartForwarder(index int) error {
	app.stateMu.Lock()
	defer app.stateMu.Unlock()

	l, _, _, err := app.findForwarder(index)
	if err != nil {
		return err
	}

	err = app.startForwarder(l)
	if err != nil {
		return err
	}

	return nil
}

type ForwarderNode struct {
	Label string `json:"label"`
	Via   string `json:"via"`
}

func (app *Application) GetConnectedForwarderNodes() []ForwarderNode {
	app.stateMu.RLock()
	defer app.stateMu.RUnlock()

	nodes := make([]ForwarderNode, 0)
	app.forwarders.Range(func(listen string, f *forwarder) bool {
		nodes = append(nodes, ForwarderNode{
			Label: f.cfg.Label,
			Via:   f.dialer.Remote().String(),
		})
		return true
	})

	return nodes
}
