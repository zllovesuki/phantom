package specter

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"os"
	"sync"
	"time"

	cmdClient "kon.nect.sh/specter/cmd/client"
	"kon.nect.sh/specter/overlay"
	rttImpl "kon.nect.sh/specter/rtt"
	"kon.nect.sh/specter/spec/protocol"
	"kon.nect.sh/specter/spec/rtt"
	"kon.nect.sh/specter/spec/tun"
	"kon.nect.sh/specter/tun/client"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"go.uber.org/zap"
)

type Application struct {
	appCtx context.Context
	logger *zap.Logger

	stateMu      sync.RWMutex
	phantomCfg   *PhantomConfig
	specterCfg   *client.Config
	cli          *client.Client
	transport    *overlay.QUIC
	transportRTT rtt.Recorder
	cliCtx       context.Context
	cliCtxCancel context.CancelFunc
}

func (app *Application) OnStartup(ctx context.Context) {
	app.appCtx = ctx

	setupPath(ctx)

	if err := ensureLogDir(); err != nil {
		runtime.LogFatal(ctx, err.Error())
		return
	}

	config := zap.NewProductionConfig()
	config.OutputPaths = append(config.OutputPaths, specterLogFile)

	logger, err := config.Build()
	if err != nil {
		runtime.LogFatal(ctx, err.Error())
	}

	app.logger = logger

	app.stateMu.Lock()
	defer app.stateMu.Unlock()

	if err := ensureSpecterConfig(); err != nil {
		runtime.LogFatal(ctx, err.Error())
		return
	}
	if err := ensurePhantomConfig(); err != nil {
		runtime.LogFatal(ctx, err.Error())
		return
	}

	specterCfg, err := client.NewConfig(specterConfigFile)
	if err != nil {
		runtime.LogFatal(ctx, err.Error())
		return
	}

	fn, err := os.Open(phantomConfigFile)
	if err != nil {
		runtime.LogFatal(ctx, err.Error())
		return
	}
	defer fn.Close()

	phantomCfg := &PhantomConfig{}
	if err := json.NewDecoder(fn).Decode(phantomCfg); err != nil {
		runtime.LogFatal(ctx, err.Error())
		return
	}

	app.specterCfg = specterCfg
	app.phantomCfg = phantomCfg
}

func (app *Application) OnShutdown(ctx context.Context) {
	app.StopClient()
	app.logger.Sync()
}

func (app *Application) Connected() bool {
	app.stateMu.RLock()
	defer app.stateMu.RUnlock()

	return app.cli != nil
}

func (app *Application) GetCurrentConfig() *client.Config {
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
		if index < 0 || index > len(app.specterCfg.Tunnels) {
			return fmt.Errorf("tunnel index out of bound")
		}
		app.specterCfg.Tunnels = append(app.specterCfg.Tunnels[:index], app.specterCfg.Tunnels[index+1:]...)
		return nil
	} else {
		return fmt.Errorf("not implemented")
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

func (app *Application) UpdatePhantomConfig(cfg *PhantomConfig) {
	app.stateMu.Lock()
	defer app.stateMu.Unlock()

	fn, err := os.OpenFile(phantomConfigFile, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0644)
	if err != nil {
		runtime.LogError(app.appCtx, err.Error())
		return
	}
	defer fn.Close()
	defer fn.Sync()

	if err := json.NewEncoder(fn).Encode(cfg); err != nil {
		runtime.LogError(app.appCtx, err.Error())
		return
	}

	app.phantomCfg = cfg
}

func (app *Application) StartClient() error {
	app.stateMu.Lock()
	defer app.stateMu.Unlock()

	if app.cli != nil {
		return nil
	}

	if app.specterCfg.Apex == "" {
		return fmt.Errorf("apex cannot be empty")
	}

	parsed, err := cmdClient.ParseApex(app.specterCfg.Apex)
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
	return nil
}

type Node struct {
	*protocol.Node
	RTT *rtt.Statistics `json:"rtt"`
}

func (app *Application) GetConnectedNodes() []Node {
	app.stateMu.RLock()
	defer app.stateMu.RUnlock()

	if app.cli == nil {
		return []Node{}
	}

	nodes := make([]Node, 0)
	connected := app.cli.GetConnectedNodes()
	for _, node := range connected {
		nodes = append(nodes, Node{
			Node: node,
			RTT:  app.transportRTT.Snapshot(rtt.MakeMeasurementKey(node), time.Second*10),
		})
	}

	return nodes
}

func (app *Application) StopClient() {
	app.stateMu.Lock()
	defer app.stateMu.Unlock()

	if app.cli == nil {
		return
	}

	app.logger.Info("Shutting down specter client")

	app.cli.Close()
	app.transport.Stop()
	app.cliCtxCancel()

	app.cli = nil
}
