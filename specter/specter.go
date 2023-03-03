package specter

import (
	"context"
	"crypto/tls"
	"fmt"
	"time"

	"kon.nect.sh/specter/overlay"
	rttImpl "kon.nect.sh/specter/rtt"
	"kon.nect.sh/specter/spec/protocol"
	"kon.nect.sh/specter/spec/rtt"
	"kon.nect.sh/specter/spec/tun"
	"kon.nect.sh/specter/tun/client"
	"kon.nect.sh/specter/tun/client/dialer"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"go.uber.org/zap"
)

func (app *Application) Connected() bool {
	app.stateMu.RLock()
	defer app.stateMu.RUnlock()

	return app.cli != nil
}

func (app *Application) GetSpecterConfig() *client.Config {
	app.stateMu.RLock()
	defer app.stateMu.RUnlock()

	if app.cli == nil {
		return app.specterCfg
	} else {
		return app.cli.GetCurrentConfig()
	}
}

func (app *Application) GetPhantomConfig() *PhantomConfig {
	app.stateMu.RLock()
	defer app.stateMu.RUnlock()

	return app.phantomCfg
}

func (app *Application) RebuildTunnels(tunnels []client.Tunnel) {
	app.stateMu.Lock()
	defer app.stateMu.Unlock()

	if app.cli == nil {
		app.specterCfg.Tunnels = tunnels
	} else {
		app.logger.Info("rebuild", zap.Any("tunnels", tunnels))
		app.cli.RebuildTunnels(tunnels)
	}
}

func (app *Application) UnpublishTunnel(index int) error {
	app.stateMu.Lock()
	defer app.stateMu.Unlock()

	if app.cli == nil {
		return fmt.Errorf("specter client is not connected")
	} else {
		cfg := app.cli.GetCurrentConfig()
		if index < 0 || index > len(cfg.Tunnels) {
			return fmt.Errorf("tunnel index out of bound")
		}
		return app.cli.UnpublishTunnel(app.appCtx, cfg.Tunnels[index])
	}
}

func (app *Application) ReleaseTunnel(index int) error {
	app.stateMu.Lock()
	defer app.stateMu.Unlock()

	if app.cli == nil {
		if index < 0 || index > len(app.specterCfg.Tunnels) {
			return fmt.Errorf("tunnel index out of bound")
		}
		app.specterCfg.Tunnels = append(app.specterCfg.Tunnels[:index], app.specterCfg.Tunnels[index+1:]...)
		return nil
	} else {
		cfg := app.cli.GetCurrentConfig()
		if index < 0 || index > len(cfg.Tunnels) {
			return fmt.Errorf("tunnel index out of bound")
		}
		return app.cli.ReleaseTunnel(app.appCtx, cfg.Tunnels[index])
	}
}

func (app *Application) Synchronize() {
	app.stateMu.Lock()
	defer app.stateMu.Unlock()

	if app.cli == nil {
		return
	}

	app.cli.SyncConfigTunnels(app.cliCtx)
}

func (app *Application) UpdateApex(apex string) {
	app.stateMu.Lock()
	defer app.stateMu.Unlock()

	if app.cli == nil {
		app.specterCfg.Apex = apex
	} else {
		app.cli.UpdateApex(apex)
	}
}

func (app *Application) StartClient() error {
	app.stateMu.Lock()
	defer app.stateMu.Unlock()

	if app.cli != nil {
		return nil
	}

	runtime.EventsEmit(app.appCtx, "specter:Connecting")

	if app.specterCfg.Apex == "" {
		return fmt.Errorf("apex cannot be empty")
	}

	parsed, err := dialer.ParseApex(app.specterCfg.Apex)
	if err != nil {
		runtime.LogError(app.appCtx, err.Error())
		return err
	}

	clientTLSConf := &tls.Config{
		ServerName:         parsed.Host,
		InsecureSkipVerify: app.phantomCfg.SpecterInsecureSkipVerify,
		NextProtos: []string{
			tun.ALPN(protocol.Link_SPECTER_TUN),
		},
	}

	app.transportRTT = rttImpl.NewInstrumentation(20)
	app.transport = overlay.NewQUIC(overlay.TransportConfig{
		Logger: app.logger,
		Endpoint: &protocol.Node{
			Id: app.specterCfg.ClientID,
		},
		ClientTLS:   clientTLSConf,
		RTTRecorder: app.transportRTT,
	})

	app.cliCtx, app.cliCtxCancel = context.WithCancel(app.appCtx)
	c, err := client.NewClient(app.cliCtx, client.ClientConfig{
		Logger:          app.logger,
		Configuration:   app.specterCfg,
		ServerTransport: app.transport,
		Recorder:        app.transportRTT,
		ReloadSignal:    nil,
	})
	if err != nil {
		runtime.LogError(app.appCtx, err.Error())
		return err
	}

	if err := c.Register(app.cliCtx); err != nil {
		runtime.LogError(app.appCtx, err.Error())
		return err
	}

	if err := c.Initialize(app.cliCtx); err != nil {
		runtime.LogError(app.appCtx, err.Error())
		return err
	}

	c.Start(app.cliCtx)

	app.cli = c
	runtime.EventsEmit(app.appCtx, "specter:Connected")

	return nil
}

func (app *Application) StopClient() {
	app.stateMu.Lock()
	defer app.stateMu.Unlock()

	if app.cli == nil {
		return
	}

	app.logger.Info("Shutting down specter client")

	app.cli.Close()
	app.cliCtxCancel()
	app.transport.Stop()

	app.cli = nil
	runtime.EventsEmit(app.appCtx, "specter:Disconnected")
}

type TunnelNode struct {
	*protocol.Node
	RTT *rtt.Statistics `json:"rtt"`
}

func (app *Application) GetRegisteredHostnames() ([]string, error) {
	app.stateMu.RLock()
	defer app.stateMu.RUnlock()

	if app.cli == nil {
		return []string{}, nil
	}

	hostnames, err := app.cli.GetRegisteredHostnames(app.cliCtx)
	if err != nil {
		return nil, err
	}

	return hostnames, nil
}

func (app *Application) GetConnectedTunnelNodes() []TunnelNode {
	app.stateMu.RLock()
	defer app.stateMu.RUnlock()

	if app.cli == nil {
		return []TunnelNode{}
	}

	nodes := make([]TunnelNode, 0)
	connected := app.cli.GetConnectedNodes()
	for _, node := range connected {
		nodes = append(nodes, TunnelNode{
			Node: node,
			RTT:  app.transportRTT.Snapshot(rtt.MakeMeasurementKey(node), time.Second*10),
		})
	}

	return nodes
}
