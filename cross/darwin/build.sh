#!/usr/bin/env zsh

SCRIPT_DIR=$(dirname -- "$0")

[[ -z "${CODESIGN_CREDENTIAL_PATH}" ]] && { echo "Missing CODESIGN_CREDENTIAL_PATH"; exit 1}
[[ -z "${CODESIGN_P12_CERTIFICATE}" ]] && { echo "Missing CODESIGN_P12_CERTIFICATE"; exit 1}
[[ -z "${CODESIGN_P12_PASSWORD_FILE}" ]] && { echo "Missing CODESIGN_P12_PASSWORD_FILE"; exit 1}
[[ -z "${CODESIGN_NOTARY_API_JSON}" ]] && { echo "Missing CODESIGN_NOTARY_API_JSON"; exit 1}

tar -ztvf $SCRIPT_DIR/Phantom.app.tar.gz

(cd frontend/ && npm install)
(cd frontend/ && npm run build)

docker run --rm \
    -v "$PWD":/app \
    -w /app \
    -e CGO_ENABLED=1 \
    -e CGO_CFLAGS="-mmacosx-version-min=10.15" \
    -e CGO_LDFLAGS="-fuse-ld=lld -mmacosx-version-min=10.15 -framework UniformTypeIdentifiers" \
    -e GOOS=darwin \
    -e GOARCH=amd64 \
    -e CC="o64-clang" \
    -e CXX="o64-clang++" \
    wails-cross:darwin \
    go build \
        -tags desktop,production \
        -buildmode=pie \
        -buildvcs=false \
        -ldflags "-s -w" \
        -a -o \
        build/bin/Phantom-darwin-amd64

docker run --rm \
    -v "$PWD":/app \
    -w /app \
    -e CGO_ENABLED=1 \
    -e CGO_CFLAGS="-mmacosx-version-min=11.1" \
    -e CGO_LDFLAGS="-fuse-ld=lld -mmacosx-version-min=11.1 -framework UniformTypeIdentifiers" \
    -e GOOS=darwin \
    -e GOARCH=arm64 \
    -e CC="oa64-clang" \
    -e CXX="oa64-clang++" \
    wails-cross:darwin \
    go build \
        -tags desktop,production \
        -buildmode=pie \
        -buildvcs=false \
        -ldflags "-s -w" \
        -a -o \
        build/bin/Phantom-darwin-arm64

docker run --rm \
    -v "$PWD":/app \
    -w /app \
    wails-cross:darwin \
    lipo -create -output build/bin/Phantom-darwin build/bin/Phantom-darwin-amd64 build/bin/Phantom-darwin-arm64

docker run --rm \
    -v "$PWD":/app \
    -w /app \
    wails-cross:darwin \
    rm -rf build/bin/Phantom.app build/bin/Phantom.app.zip || true

tar -C build/bin -xzf $SCRIPT_DIR/Phantom.app.tar.gz

mv build/bin/Phantom-darwin build/bin/Phantom.app/Contents/MacOS/Phantom

docker run --rm \
    -v "$PWD":/usr/src \
    -v "$CODESIGN_CREDENTIAL_PATH:/usr/codesign" \
    -w /usr/src \
    wails-cross:codesign \
    sign \
        --p12-file /usr/codesign/$CODESIGN_P12_CERTIFICATE \
        --p12-password-file /usr/codesign/$CODESIGN_P12_PASSWORD_FILE \
        --code-signature-flags runtime \
        ./build/bin/Phantom.app

docker run --rm \
    -v "$PWD":/usr/src \
    -v "$CODESIGN_CREDENTIAL_PATH:/usr/codesign" \
    -w /usr/src wails-cross:codesign \
    notary-submit \
        --api-key-path /usr/codesign/$CODESIGN_NOTARY_API_JSON \
        --wait \
        --staple \
        build/bin/Phantom.app

(cd build/bin/ && zip -r - Phantom.app) > build/bin/Phantom.app.zip