package specter

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"kon.nect.sh/phantom/internal/configdir"
)

var (
	configPath        = configdir.LocalConfig("phantom")
	specterConfigFile = filepath.Join(configPath, "specter.yaml")
	phantomConfigFile = filepath.Join(configPath, "phantom.json")
	logPath           = filepath.Join(configPath, "logs")
	specterLogFile    = filepath.Join(logPath, normalizeFilename(fmt.Sprintf("specter-%s.log", time.Now().Format(time.DateTime))))
)

func normalizeFilename(name string) string {
	name = strings.ReplaceAll(name, " ", "_")
	name = strings.ReplaceAll(name, ":", "-")
	return name
}

type PhantomConfig struct {
	SpecterInsecureSkipVerify bool `json:"specterInsecure"`
	TargetInsecureSkipVerify  bool `json:"targetInsecure"`
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
