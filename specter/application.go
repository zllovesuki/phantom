package specter

import (
	"context"
	"encoding/json"
	"os"
	"sync"

	"kon.nect.sh/specter/overlay"
	"kon.nect.sh/specter/spec/rtt"
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
