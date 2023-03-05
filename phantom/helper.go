package phantom

import (
	"fmt"
	"net/url"
	"runtime"
	"strings"

	"golang.design/x/clipboard"
)

type Helper struct{}

type Target struct {
	Protocol    string `json:"protocol"`
	Destination string `json:"destination"`
	Error       string `json:"error,omitempty"`
}

func (*Helper) ValidateTarget(target string) error {
	target = strings.ToLower(target)

	if strings.HasPrefix(target, "\\\\.\\pipe") {
		if runtime.GOOS != "windows" {
			return fmt.Errorf("named pipe is only supported on Windows")
		}
		return nil
	}

	u, err := url.Parse(target)
	if err != nil {
		return fmt.Errorf("unable to parse target: %w", err)
	}

	switch u.Scheme {
	case "http", "https", "tcp", "unix":
	default:
		return fmt.Errorf("unsupported scheme. valid schemes: http, https, tcp, unix; got %s", u.Scheme)
	}

	if strings.HasPrefix(target, "unix") {
		if runtime.GOOS == "windows" {
			return fmt.Errorf("unix pipe is not supported on Windows")
		}
		if u.Host != "" {
			return fmt.Errorf("not a valid unix pipe target")
		}
	}

	if u.Hostname() == "" {
		return fmt.Errorf("missing host in target")
	}

	return nil
}

func (*Helper) ParseTarget(target string) Target {
	u, err := url.Parse(target)
	if err != nil {
		return Target{Error: err.Error()}
	}
	switch u.Scheme {
	case "http", "https", "tcp", "unix":
	default:
		if strings.HasPrefix(u.Path, "\\\\.\\pipe") {
			u.Scheme = "winio"
			break
		}
		return Target{Error: fmt.Errorf("unsupported scheme. valid schemes: http, https, tcp, unix; got %s", u.Scheme).Error()}
	}
	switch u.Scheme {
	case "unix", "winio":
		return Target{
			Protocol:    u.Scheme,
			Destination: u.Path,
		}
	default:
		return Target{
			Protocol:    u.Scheme,
			Destination: u.Host,
		}
	}
}

type Paths struct {
	Phantom string `json:"phantom"`
	Specter string `json:"specter"`
	Log     string `json:"log"`
}

func (*Helper) GetFilePaths() Paths {
	return Paths{
		Phantom: phantomConfigFile,
		Specter: specterConfigFile,
		Log:     specterLogFile,
	}
}

// Use the cgo implementation if available as fallback
func (*Helper) SetClipboardText(t string) bool {
	clipboard.Write(clipboard.FmtText, []byte(t))
	return true
}
