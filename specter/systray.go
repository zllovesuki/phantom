package specter

import (
	"runtime"

	icon "kon.nect.sh/phantom/build"

	"fyne.io/systray"
)

func NewSystray() *Systray {
	s := &Systray{}
	s.startFn, s.stopFn = systray.RunWithExternalLoop(s.setup, nil)
	return s
}

type Systray struct {
	startFn func()
	stopFn  func()
}

func (*Systray) setup() {
	if runtime.GOOS == "windows" {
		systray.SetIcon(icon.AppIcon)
	} else {
		systray.SetIcon(icon.AppPng)
	}
	systray.SetTitle("Phantom")
	systray.SetTooltip("Phantom")

	systray.AddMenuItem("Test", "Bleh")
	systray.AddSeparator()
	systray.AddMenuItem("Quit", "Bye")
}

func (s *Systray) Start() {
	s.startFn()
}

func (s *Systray) Stop() {
	s.stopFn()
	systray.Quit()
}
