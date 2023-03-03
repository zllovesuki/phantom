#!/usr/bin/env zsh

(cd frontend/ && npm install)
(cd frontend/ && npm run build)

docker run --rm \
    -v "$PWD":/app \
    -w /app \
    wails-cross:linux \
    go build \
        -tags desktop,production \
        -buildvcs=false \
        -ldflags "-s -w" \
        -a -o \
        build/bin/Phantom-linux-arm64
