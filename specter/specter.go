package specter

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"kon.nect.sh/phantom/internal/configdir"

	"kon.nect.sh/specter/tun/client"
)

var (
	configPath = configdir.LocalConfig("phantom")
	configFile = filepath.Join(configPath, "specter.yaml")
)

func ensureConfig() error {
	err := configdir.MakePath(configPath)
	if err != nil {
		return fmt.Errorf("creating config path: %w", err)
	}
	if _, err := os.Stat(configFile); os.IsNotExist(err) {
		// Create the new config file.
		fh, err := os.Create(configFile)
		if err != nil {
			return fmt.Errorf("creating config file: %w", err)
		}
		fh.WriteString("apex: \n")
		fh.Close()
	}
	return nil
}

type Application struct {
	appCtx context.Context
	cfg    *client.Config
}

func (app *Application) Initialize(ctx context.Context) {
	app.appCtx = ctx
	if err := ensureConfig(); err != nil {
		runtime.LogError(ctx, err.Error())
		return
	}
	cfg, err := client.NewConfig(configFile)
	if err != nil {
		runtime.LogError(ctx, err.Error())
		return
	}
	app.cfg = cfg
}

func (app *Application) GetCurrentConfig() *client.Config {
	return app.cfg
}
