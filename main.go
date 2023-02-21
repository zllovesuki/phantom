package main

import (
	"embed"

	"kon.nect.sh/phantom/specter"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := &specter.Application{}
	helper := &specter.Helper{}

	// Create application with options
	err := wails.Run(&options.App{
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
			Handler: specter.NewAssetHandler(),
		},
		Debug: options.Debug{
			OpenInspectorOnStartup: true,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
