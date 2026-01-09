# OmniSharp Locations

Updated README — reflects the current state of the project (labels-as-markers, toggles, clustering behavior).

## Overview

This is a web-based mapping tool for visualizing Omnisharp KSM plant locations, statuses, and related information. It uses Leaflet.js for map rendering and loads plant metadata from an Excel file (`OmnisharpDatabase01.xlsx`). The primary entry point is `index2.html`.

Recent updates (summary):

- **Security Enhancement (Jan 9, 2026):** API keys are now stored in `.env` file instead of hardcoded in source files. Created `.gitignore` to protect sensitive data and cleaned git history to remove previously exposed API keys.
- **UI Improvements (Jan 9, 2026):** Changed hyperlink hover color from gold to light gray for better visual consistency. Reorganized Weather page legend from 2-column to single-column layout (ordered cold to hot) with temperatures displayed to the right of color boxes.
- Plant/site labels are now the primary map markers: each marker is a styled text-box containing a small icon plus the plant name instead of separate image-only icons.
- Labels are interactive (hover/click show detailed popups) and are controlled by the `Show Plant Information` toggle, which is ON by default on load.
- Overlap handling: when labels overlap at low zoom, the algorithm keeps one label at its true geographic location (closest to the cluster centroid) and vertically offsets nearby labels above/below in alternating order for visibility.
- Label anchor improved so the small icon inside the label sits roughly over the true coordinate (adjustable in `script2.js`).
- Remote/site toggles remain: remote associates (sales/CIM) are controlled by the `Show Remote Locations` toggle.
- Legend positioning lowered slightly to avoid footer overlap.
- Improved navigation: The current page link in the navigation bar is now bold and white, and is no longer clickable. Other links turn light gray and underline on hover for better visibility and usability.
- Accessibility: Users can no longer click the link for the page they are currently on, reducing confusion and improving navigation clarity.

## Files of interest

- `index2.html` — main page, includes inline styles for label appearance and loads `script2.js`.
- `script2.js` — main application logic: sites list, label-marker creation, toggle handlers, clustering/offset logic, driving-route and flight integrations, Excel loader.
- `style.css` — global styling including legend and control layout; `.site-label` defines the label box look.
- `OmnisharpDatabase01.xlsx` — optional Excel file with plant metadata used to populate popups (place in project root).

## Setup Instructions

### 1. Configure API Keys (Required)

This project uses external APIs that require authentication keys. **API keys are NOT included in the repository for security.**

1. Copy the example config file:
   ```bash
   cp config.example.js config.js
   ```

2. Edit `config.js` and add your API keys:
   - **Weatherstack API** - Get your key at [https://weatherstack.com/](https://weatherstack.com/)
   - **Mapbox API** - Get your key at [https://www.mapbox.com/](https://www.mapbox.com/)
   - **Aviationstack API** - Get your key at [https://aviationstack.com/](https://aviationstack.com/)

3. **IMPORTANT:** Never commit `config.js` to version control. It's already in `.gitignore`.

### 2. Add Database Files (Required for full functionality)

The application requires local database files that are not included in the repository:

- `OmnisharpDatabase01.xlsx` - Plant metadata (SME info, contacts, etc.)
- `data.json` - Location tracking data (optional)

Place these files in the project root directory. They are protected by `.gitignore` and will not be committed.

### 3. Run the Application

1. Serve the project from a local web server (recommended) — many browsers block local file fetches (Excel) when opening `index2.html` directly.

   Example using Python 3:

   ```bash
   cd "c:\Users\carst\OneDrive\Documents\Code Projects\OmniMap\OmniMap"
   python -m http.server 8000
   # then open http://localhost:8000/index2.html
   ```

2. Open `index2.html` in your browser (prefer Chrome or Edge for best behavior).

## Security Notes

**Protected Files (NOT in repository):**
- `.env` - Contains API keys and sensitive configuration (essential for development)
- `config.js` - Legacy config file (if present) - contains API keys
- `*.xlsx`, `*.csv` - Database files with sensitive information
- `data.json` - User location data
- `node_modules/` - Node dependencies

These files are essential for the application but contain sensitive information and are excluded from version control via `.gitignore`.

**Git History Cleaned:**
- All previously exposed API keys have been removed from git history via `git filter-branch`
- Developers cloning this repo will not have access to historical API keys
- Ensure you rotate any API keys that were exposed before January 9, 2026

## Configuration & API Keys

API keys are now securely stored in a `.env` file (not included in the repository) instead of being hardcoded in the source code.

### Setup API Keys

1. Create a `.env` file in the project root (if not already present):
   ```
   API_KEY=YOUR_API_KEY_HERE
   ADMIN_API_KEY=YOUR_ADMIN_API_KEY_HERE
   MAPBOX_API_KEY=your_mapbox_key_here
   AVIATIONSTACK_API_KEY=your_aviationstack_key_here
   WEATHERSTACK_API_KEY=your_weatherstack_key_here
   ```

2. Update the placeholder values with your actual API keys:
   - **Mapbox API** - Get your key at [https://www.mapbox.com/](https://www.mapbox.com/)
   - **Aviationstack API** - Get your key at [https://aviationstack.com/](https://aviationstack.com/)
   - **Weatherstack API** - Get your key at [https://weatherstack.com/](https://weatherstack.com/)

3. **IMPORTANT:** The `.env` file is protected by `.gitignore` and will NOT be committed to version control.

### Using API Keys in Code

The application loads API keys from environment variables. For Node.js environments, use:
```javascript
const apiKey = process.env.MAPBOX_API_KEY;
```

For frontend/browser environments with react-native-dotenv:
```javascript
import { API_KEY } from '@env';
```

## How the label/cluster behavior works (for developers)

- Each `site` has a `site.iconMarker` which is a `L.divIcon`-backed `L.marker` containing HTML markup: a small image and a text node.
- The label `iconAnchor` is set in `script2.js` so the small image inside the label appears over the geographic coordinate. If labels look off, adjust `iconAnchor` values on the `L.divIcon` creation.
- Overlap detection uses pixel distance (`getPixelDistance`) to form clusters when marker container-pixel separation is below `pixelThreshold` (default 50). Offsets are applied using `offsetDistance` (default 25).
- Current offset strategy:
  - Compute cluster centroid in container pixels.
  - Keep the marker closest to the centroid at its true geographic position.
  - Offset other cluster members vertically above/below (alternating) by multiples of `offsetDistance` so names are readable when zoomed out.

To tweak behavior, edit `pixelThreshold`, `offsetDistance`, or the offset algorithm in `script2.js`.

## Usage notes

- Toggle `Show Plant Information` to show/hide the label boxes.
- Toggle `Show Remote Locations` to show/hide remote markers (sales / CIM).
- Hover or click a label to see a popup with company/SME/contact/PM details (populated from the Excel file where available).
- Use `Show Driving Distance` then click two points to calculate a Mapbox driving route (requires `MAPBOX_API_KEY`).

## Troubleshooting

- If labels are not visible on load, ensure `script2.js` is loading and there are no console errors. `showPlantInfo` is `true` by default.
- If Excel data is missing, check the filename and that you are serving files via a web server (not `file://`).
- If driving/flight/weather data fails, verify API keys and CORS/network access.

## Future ideas

- Persist label placement preferences per user (localStorage).
- Improve cluster display using a popover list at low zooms (click cluster to expand list).
- Replace the Excel "database" with a backend data store and authenticated API.

## License

This project is licensed under the MIT License.

## Contact

For any questions or inquiries, please contact Carston Buehler.
