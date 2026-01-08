# OmniSharp Locations

Updated README — reflects the current state of the project (labels-as-markers, toggles, clustering behavior).

## Overview

This is a web-based mapping tool for visualizing Omnisharp KSM plant locations, statuses, and related information. It uses Leaflet.js for map rendering and loads plant metadata from an Excel file (`OmnisharpDatabase01.xlsx`). The primary entry point is `index2.html`.

Recent updates (summary):

- Plant/site labels are now the primary map markers: each marker is a styled text-box containing a small icon plus the plant name instead of separate image-only icons.
- Labels are interactive (hover/click show detailed popups) and are controlled by the `Show Plant Information` toggle, which is ON by default on load.
- Overlap handling: when labels overlap at low zoom, the algorithm keeps one label at its true geographic location (closest to the cluster centroid) and vertically offsets nearby labels above/below in alternating order for visibility.
- Label anchor improved so the small icon inside the label sits roughly over the true coordinate (adjustable in `script2.js`).
- Remote/site toggles remain: remote associates (sales/CIM) are controlled by the `Show Remote Locations` toggle.
- Legend positioning lowered slightly to avoid footer overlap.

## Files of interest

- `index2.html` — main page, includes inline styles for label appearance and loads `script2.js`.
- `script2.js` — main application logic: sites list, label-marker creation, toggle handlers, clustering/offset logic, driving-route and flight integrations, Excel loader.
- `style.css` — global styling including legend and control layout; `.site-label` defines the label box look.
- `OmnisharpDatabase01.xlsx` — optional Excel file with plant metadata used to populate popups (place in project root).

## How to run (quick)

1. Serve the project from a local web server (recommended) — many browsers block local file fetches (Excel) when opening `index2.html` directly.

   Example using Python 3:

   ```bash
   cd "c:\Users\carst\OneDrive\Documents\Code Projects\OmniMap\OmniMap"
   python -m http.server 8000
   # then open http://localhost:8000/index2.html
   ```

2. Ensure `OmnisharpDatabase01.xlsx` is in the same directory if you want Excel-driven popups.
3. Open `index2.html` in your browser (prefer Chrome or Edge for best behavior).

## Configuration & API keys

- `script2.js` contains placeholder variables for API keys:
  - `MAPBOX_API_KEY` — Mapbox (driving routes)
  - `AVIATIONSTACK_API_KEY` — Aviationstack (flight data)
  - Weather APIs may be present in other files (`weather_conditions.html`).

Insert keys directly into `script2.js` or manage via a safer environment for production.

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
