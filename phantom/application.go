package phantom

import (
	"context"
	"encoding/json"
	"os"
	"sync"

	"kon.nect.sh/specter/overlay"
	"kon.nect.sh/specter/spec/rtt"
	"kon.nect.sh/specter/tun/client"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"github.com/zhangyunhao116/skipmap"
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
	forwarders   *skipmap.StringMap[*forwarder] // needed to start forwarders concurrently
}

func (app *Application) OnStartup(ctx context.Context) {
	app.forwarders = skipmap.NewString[*forwarder]()
	app.appCtx = ctx

	setupPath(ctx)

	if err := ensureLogDir(); err != nil {
		runtime.LogFatal(ctx, err.Error())
		return
	}

	config := zap.NewProductionConfig()
	env := runtime.Environment(app.appCtx)
	if env.BuildType != "production" {
		// override config if build type is dev or debug
		config.Level = zap.NewAtomicLevelAt(zap.DebugLevel)
		config.Sampling = nil
	}
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

	runtime.EventsOnce(app.appCtx, "broker:Ready", app.onBrokerReady)
}

func (app *Application) OnShutdown(ctx context.Context) {
	app.StopClient()
	app.StopAllForwarders()
	app.logger.Sync()
}

func (app *Application) onBrokerReady(_ ...interface{}) {
	app.stateMu.RLock()
	defer app.stateMu.RUnlock()

	if app.phantomCfg.ConnectOnStart {
		// this is called when the broker is ready,
		// so we need to hydrate the state of Connecting
		// to hide the config DisclosurePanel.
		runtime.EventsEmit(app.appCtx, "specter:Connecting")
		go func() {
			if err := app.StartClient(); err != nil {
				app.logger.Error("Fail to start specter client", zap.Error(err))
			}
		}()
	}
	if app.phantomCfg.ListenOnStart {
		go app.StartAllForwarders()
	}
}
