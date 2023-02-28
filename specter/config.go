package specter

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"kon.nect.sh/phantom/internal/configdir"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

var (
	configPath        string
	specterConfigFile string
	phantomConfigFile string
	logPath           string
	specterLogFile    string
)

type Listener struct {
	Listen   string `json:"listen"`
	Hostname string `json:"hostname"`
	UseTCP   bool   `json:"tcp"`
}

type PhantomConfig struct {
	Listeners                 []Listener `json:"listeners"`
	SpecterInsecureSkipVerify bool       `json:"specterInsecure"`
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

func normalizeFilename(name string) string {
	name = strings.ReplaceAll(name, " ", "_")
	name = strings.ReplaceAll(name, ":", "-")
	return name
}

func setupPath(ctx context.Context) {
	env := runtime.Environment(ctx)

	if env.BuildType == "dev" {
		configPath = configdir.LocalConfig("phantom-dev")
	} else {
		configPath = configdir.LocalConfig("phantom")
	}

	logPath = filepath.Join(configPath, "logs")
	specterConfigFile = filepath.Join(configPath, "specter.yaml")
	phantomConfigFile = filepath.Join(configPath, "phantom.json")
	specterLogFile = filepath.Join(logPath, normalizeFilename(fmt.Sprintf("specter-%s.log", time.Now().Format(time.DateTime))))
}

func ensureSpecterConfig() error {
	err := configdir.MakePath(configPath)
	if err != nil {
		return fmt.Errorf("creating config directory: %w", err)
	}
	if _, err := os.Stat(specterConfigFile); os.IsNotExist(err) {
		// Create the new config file.
		fh, err := os.Create(specterConfigFile)
		if err != nil {
			return fmt.Errorf("creating specter config file: %w", err)
		}
		fh.WriteString("apex: \n")
		fh.Close()
	}
	return nil
}

func ensurePhantomConfig() error {
	err := configdir.MakePath(configPath)
	if err != nil {
		return fmt.Errorf("creating config directory: %w", err)
	}
	if _, err := os.Stat(phantomConfigFile); os.IsNotExist(err) {
		// Create the new config file.
		fh, err := os.Create(phantomConfigFile)
		if err != nil {
			return fmt.Errorf("creating phantom config file: %w", err)
		}
		fh.WriteString("{}")
		fh.Close()
	}
	return nil
}

func ensureLogDir() error {
	err := configdir.MakePath(logPath)
	if err != nil {
		return fmt.Errorf("creating logs directory: %w", err)
	}
	return nil
}
