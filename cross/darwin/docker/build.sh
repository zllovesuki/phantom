#!/usr/bin/env zsh

[[ -z "${SDK_TARBALL_URL}" ]] && { echo "Missing SDK_TARBALL_URL"; exit 1}

docker build -t wails-cross:base -f cross/darwin/docker/Dockerfile.base cross/darwin/docker/
docker build -t wails-cross:llvm -f cross/darwin/docker/Dockerfile.llvm cross/darwin/docker/
docker build -t wails-cross:codesign -f cross/darwin/docker/Dockerfile.codesign cross/darwin/docker/
docker build -t wails-cross:darwin --build-arg TARBALL_URL=$SDK_TARBALL_URL -f cross/darwin/docker/Dockerfile.darwin cross/darwin/docker/