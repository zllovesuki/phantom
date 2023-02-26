#!/usr/bin/env zsh

/usr/bin/codesign -s $CODESIGN_CERTIFICATE --timestamp --options runtime ./build/bin/Phantom.app
/usr/bin/ditto -c -k --keepParent ./build/bin/Phantom.app ./build/bin/Phantom.app.zip
/usr/bin/xcrun notarytool submit --apple-id $CODESIGN_USERNAME --password $CODESIGN_PASSWORD --team-id $CODESIGN_TEAM_ID --wait build/bin/Phantom.app.zip
/usr/bin/xcrun stapler staple build/bin/Phantom.app
/usr/bin/ditto -c -k --keepParent ./build/bin/Phantom.app ./build/bin/Phantom.app.zip
