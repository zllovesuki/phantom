//go:build !linux

package specter

func (*Helper) SetClipboardText(t string) bool {
	return false
}
