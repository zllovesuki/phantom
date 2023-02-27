package icon

import (
	_ "embed"
)

//go:embed windows/icon.ico
var AppIcon []byte

//go:embed appicon.png
var AppPng []byte
