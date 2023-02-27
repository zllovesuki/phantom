package specter

import (
	"golang.design/x/clipboard"
)

func (*Helper) SetClipboardText(t string) bool {
	clipboard.Write(clipboard.FmtText, []byte(t))
	return true
}
