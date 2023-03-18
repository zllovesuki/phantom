package main

import (
	"embed"
	"runtime"

	binding "kon.nect.sh/phantom/phantom"

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
	app := &binding.Application{}
	helper := &binding.Helper{}

	// Create application with options
	cfg := &options.App{
		Title:      "Phantom",
		Width:      1280,
		Height:     800,
		OnStartup:  app.OnStartup,
		OnShutdown: app.OnShutdown,
		Bind: []interface{}{
			app,
			helper,
		},
		AssetServer: &assetserver.Options{
			Assets:  assets,
			Handler: binding.NewAssetHandler(),
		},
		Windows: &windows.Options{
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
			DisableWindowIcon:    false,
			WebviewGpuIsDisabled: false,
		},
		Mac: &mac.Options{
			TitleBar:             mac.TitleBarHidden(),
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
			About: &mac.AboutInfo{
				Title:   "Phantom",
				Message: "The official GUI client for specter",
				Icon:    icon,
			},
		},
		Linux: &linux.Options{
			Icon:             icon,
			WebviewGpuPolicy: linux.WebviewGpuPolicyOnDemand,
		},
		EnableFraudulentWebsiteDetection: false,
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
