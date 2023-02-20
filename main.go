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

	// Create application with options
	err := wails.Run(&options.App{
		Title:         "Phantom",
		Width:         1024,
		Height:        768,
		DisableResize: true,
		OnStartup:     app.Initialize,
		Bind: []interface{}{
			app,
		},
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
