package main

import (
	"embed"
	"fmt"
	"runtime"

	"kon.nect.sh/phantom/specter"

	"github.com/wailsapp/wails/v2/pkg/application"
	"github.com/wailsapp/wails/v2/pkg/menu"
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
			DisableWindowIcon:    false,
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

	trayMenu := menu.NewMenu()
	trayMenu.Append(&menu.MenuItem{
		Label: "Test",
		Type:  menu.TextType,
		Click: func(cd *menu.CallbackData) {
			fmt.Println("hi")
		},
	})

	native := application.NewWithOptions(cfg)
	native.NewSystemTray(&options.SystemTray{
		LightModeIcon: &options.SystemTrayIcon{
			Data: icon,
		},
		DarkModeIcon: &options.SystemTrayIcon{
			Data: icon,
		},
		Title:   "Phantom",
		Tooltip: "Phantom",
		Menu:    trayMenu,
	})

	err := native.Run()
	if err != nil {
		println("Error:", err.Error())
	}
}
