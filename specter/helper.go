package specter

import (
	"fmt"
	"net/url"
	"strings"

	"golang.design/x/clipboard"
)

type Helper struct{}

type Target struct {
	Protocol    string `json:"protocol"`
	Destination string `json:"destination"`
	Error       string `json:"error,omitempty"`
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
		return Target{Error: fmt.Errorf("unsupported scheme. valid schemes: http, https, tcp; got %s", u.Scheme).Error()}
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

func (*Helper) SetClipboardText(t string) {
	clipboard.Write(clipboard.FmtText, []byte(t))
}
