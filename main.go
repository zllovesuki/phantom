package main

import (
	"embed"
	"runtime"

	"kon.nect.sh/phantom/specter"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed build/appicon.png
var icon []byte

func main() {
	// Create an instance of the app structure
	app := &specter.Application{}
	helper := &specter.Helper{}

	// Create application with options
	cfg := &options.App{
		Title:      "Phantom",
		Width:      1280,
		Height:     800,
		OnStartup:  app.OnStartup,
		OnShutdown: app.OnShutdown,
		OnDomReady: app.OnDomReady,
		Bind: []interface{}{
			app,
			helper,
		},
		AssetServer: &assetserver.Options{
			Assets:  assets,
			Handler: specter.NewAssetHandler(),
		},
		Windows: &windows.Options{
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
			DisableWindowIcon:    true,
		},
		Mac: &mac.Options{
			TitleBar:             mac.TitleBarHidden(),
			WebviewIsTransparent: true,
			WindowIsTranslucent:  true,
			About: &mac.AboutInfo{
				Title:   "Phantom",
				Message: "The official GUI client for specter",
				Icon:    icon,
			},
		},
		Linux: &linux.Options{
			Icon: icon,
		},
	}

	if runtime.GOOS != "darwin" {
		cfg.Debug = options.Debug{
			OpenInspectorOnStartup: true,
		}
	}

	err := wails.Run(cfg)

	if err != nil {
		println("Error:", err.Error())
	}
}
