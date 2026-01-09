OmniMap Mobile — Expo starter

Overview
- Minimal Expo app that requests location permission and POSTs location to your server's `/api/location` endpoint.
- Designed for quick testing (foreground sharing). Background updates require building a standalone binary and configuring background tasks.

Quick start
1. Install Expo CLI (if you don't have it):

```bash
npm install -g expo-cli
```

2. From this repo, install dependencies and start the app:

```bash
cd OmniMap/mobile
npm install
expo start
```

3. Test on device
- Use the Expo Go app (Android/iOS) and scan the QR code.
- For Android emulator, the app uses host `10.0.2.2:3000` (change if your server is reachable at another host/IP). For a physical device, replace the server URL in `App.js` with your machine IP, e.g. `http://192.168.1.100:3000`.

API key
- The server now requires an API key for posting locations and changing settings. A default key `dev-key` is stored in `data.json` for local testing. Replace `REPLACE_WITH_API_KEY` in `mobile/App.js` with your key (or set `API_KEY` env var on the server and update `data.json`).

Background location (Android)
- This starter now includes optional background location using Expo TaskManager on Android. To enable it:
	1. Install the TaskManager package:

```bash
cd mobile
npm install expo-task-manager
```

	2. Ensure your `app.json` or `app.config.js` includes Android foreground service permissions and location permissions. Example `app.json` additions:

```json
"android": {
	"permissions": ["ACCESS_FINE_LOCATION","ACCESS_BACKGROUND_LOCATION"],
	"useNextNotificationsApi": true
}
```

	3. Update `API_KEY` in `App.js` to your server key and run the app on an Android device or emulator. Background updates require a standalone build in some cases; Expo-managed workflow supports background location on Android with `startLocationUpdatesAsync`, but iOS background location requires extra configuration and may require ejecting to the bare workflow.

iOS note
- iOS background location is more restricted. You'll need to add these keys to the native Info.plist equivalents via Expo config and likely build a standalone app to fully test background behavior: `NSLocationAlwaysAndWhenInUseUsageDescription` and `NSLocationWhenInUseUsageDescription`.

Notes on background tracking
- The starter uses setInterval for foreground updates, which only runs while the app is active.
- For background location updates you can use Expo's `Location.startLocationUpdatesAsync` with `TaskManager.defineTask`, or eject to the bare workflow to implement native services. App stores (Google/Apple) require clear justification and privacy strings for background location.

Permissions & store
- Android: request `ACCESS_FINE_LOCATION` and optionally background location.
- iOS: include `NSLocationAlwaysAndWhenInUseUsageDescription` and `NSLocationWhenInUseUsageDescription` and a clear privacy policy. App review for background location may require additional screenshots or a demo video.

Server
- This app posts to `/api/location` and expects `/api/location-update-interval` for interval configuration. The example server in the repo (`node.js`) already supports these endpoints.

Next steps
- Add background task using `startLocationUpdatesAsync` and `TaskManager`.
- Build standalone binaries for internal testing (Google Play internal track, TestFlight).
