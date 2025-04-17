# OmniSharp Locations
Luke was here
## Overview

This project is a web-based mapping tool for visualizing Omnisharp KSM plant locations, their statuses, and related information. It features two main tabs: **Home** for the primary map and controls, and **Weather** for displaying weather conditions at plant locations. It uses Leaflet.js for map rendering and integrates various APIs for data like driving routes, flight information, and weather. Plant data is loaded dynamically from an Excel file, which will be replaced by an actual database in the future.

## Features

- **Dual Tabs**:
    - **Home Tab**: Displays plant locations, HQ, and SaaS centers on an interactive map. Provides controls for various map features.
    - **Weather Tab**: Displays plant locations on a map with current high/low temperatures fetched from the OpenWeather API.
- **Map Rendering**: Displays locations using custom icons (Beef, Pork, Poultry, HQ, SaaS).
- **Plant Information (Home Tab)**: Shows detailed information (Company, SME, SW Rev, KSM count, Contact, Phone, Last Site Visit) on hover/click, loaded from `OmnisharpDatabase01.xlsx`.
- **Machine Status (Home Tab)**: Toggleable colored indicators next to each plant icon to represent machine operational status. Statuses are saved locally.
- **Driving Routes (Home Tab)**: Calculates and displays driving routes between selected points using the Mapbox API. Includes distance labels and options to open directions in Google/Apple Maps or share them.
- **Straight Line Distances (Home Tab)**: Toggleable display of straight line distances between:
    - Plants within the USA (blue lines).
    - Plants within Mexico (red lines).
    - Between USA and Mexico plants (green lines).
    - Between HQ/SaaS centers and plants (purple lines).
- **Excel Integration**: Reads plant information, including coordinates and details, from `OmnisharpDatabase01.xlsx` on load. Again, representing a mock database, until the actual database is completed.
- **Flight Information (Home Tab)**: Displays flight options between selected points using the Aviationstack API (requires selecting start/end points first).
- **Weather Information (Weather Tab)**: Fetches and displays current high/low temperatures for each site using the OpenWeather API. Thank you, OpenWeather!
- **Map Controls**: Locate user, Reset map view.
- **Legends**: Separate legends for plant types and machine statuses.

## Setup

1.  **Clone the repository** (if applicable).
2.  **Ensure you have a local web server** set up to serve the files, as fetching the Excel file and some APIs might be restricted by browser security policies when opening `index2.html` directly from the filesystem (`file:///`).
3.  **Place the `OmnisharpDatabase01.xlsx` file** in the same directory as `index2.html`.
4.  **Obtain API Keys**:
    *   Mapbox API Key (for driving routes)
    *   Aviationstack API Key (for flight data)
    *   OpenWeather API Key (for weather data)
5.  **Update API Keys**: Insert your keys into the respective variables at the top of `script2.js` and `weather_conditions.html`.
6.  **Open the application** through your local web server (e.g., `http://localhost/path/to/index2.html`).

## Usage

### Navigation

- Use the **Home** and **Weather** links in the header to switch between the main map and the weather map.

### Home Tab Controls

- **Locate**: Centers the map on your current location.
- **Reset Map**: Resets the map view, clears routes, and selected points.
- **Toggle Buttons (Right Side)**:
    - **Show/Hide Plant Information**: Toggles the detailed popups on hover/click.
    - **Show/Hide Straight Line Distances**: Master toggle for all straight distance lines. Enables sub-toggles.
    - **Show/Hide Driving Distance**: Activates point selection mode for calculating driving routes. Click two points on the map.
    - **Show/Hide Machine Status**: Toggles the visibility of machine status indicators and the corresponding legend. Click indicators to cycle through statuses (Operational, Minor Issues, Maintenance Required, Major Issues, Out of Service).
    - **Show/Hide USA to Mexico Distances** (Sub-toggle): Shows/hides green lines connecting US and Mexico plants. Requires "Straight Line Distances" to be active.
    - **Show/Hide HQ and SaaS Centers** (Sub-toggle): Shows/hides purple lines connecting HQ/SaaS centers to plants. Requires "Straight Line Distances" to be active.
- **Action Buttons (Bottom Right)**:
    - **Open Directions**: Opens the calculated driving route in Google Maps (or Apple Maps on iOS). Requires a start and end point selected via "Show Driving Distance".
    - **Share Directions**: Shares the Google Maps link for the driving route (if supported by the browser). Requires a start and end point.
    - **Show Flights**: Fetches and displays flight information between the selected start and end points using Aviationstack. Requires a start and end point.

### Weather Tab

- Displays a map with all plant locations.
- Each location shows the site name, icon, and the current High/Low temperatures fetched via the OpenWeather API.

### Excel Integration (`OmnisharpDatabase01.xlsx`/ Mock Database)

- The application automatically loads data from this file on startup.
- Ensure the file is present in the root directory.
- Required columns:
    - Column A: Plant Name (Must match names in `script2.js` `sites` array)
    - Column B: Company
    - Column D: SME
    - Column E: KSM (# of KSMs)
    - Column H: SW Rev
    - Column J: Contact
    - Column K: Phone
    - Column R: Last Site Visit (Date format compatible with Excel date serial numbers)
    - Column T: Zip Code (Used for weather lookup, though currently `script2.js` uses hardcoded coordinates)

### Custom Icons

- **Beef Plant**: `Images/cow.png`
- **Pork Plant**: `Images/pig.png`
- **Poultry Plant**: `Images/turkey.png`
- **HQ**: `Images/HQ.png`
- **SaaS Center**: `Images/HQ.png` (rendered smaller)
- **Sales**: `Images/HQ.png` (rendered smaller)
- **FS**: `Images/HQ.png` (rendered smaller)

### Legends

- **Plant Legend (Home Tab)**: Displays icons and counts for Beef, Pork, and Poultry plants.
- **Machine Status Legend (Home Tab)**: Explains the colors for machine status indicators. Visible only when "Show Machine Status" is active.

## API Keys

Ensure you have the following API keys and update the respective variables:

- **Mapbox API Key**: In `script2.js` (variable `MAPBOX_API_KEY`)
- **Aviationstack API Key**: In `script2.js` (variable `AVIATIONSTACK_API_KEY`)
- **OpenWeather API Key**: In `weather_conditions.html` (variable `OPENWEATHER_API_KEY`)

## Contributing

Feel free to submit issues and pull requests. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License.

## Contact

For any questions or inquiries, please contact Carston Buehler.
