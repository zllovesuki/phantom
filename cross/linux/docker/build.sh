#!/usr/bin/env zsh

docker build -t wails-cross:linux -f cross/linux/docker/Dockerfile.arm64 cross/linux/docker/