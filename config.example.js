// API Configuration Template
// Copy this file to 'config.js' and fill in your actual API keys
// DO NOT commit config.js to version control

const API_CONFIG = {
  // Weatherstack API key for weather data
  // Get your key at: https://weatherstack.com/
  WEATHERSTACK_API_KEY: 'your_weatherstack_api_key_here',
  
  // Mapbox API key for routing and directions
  // Get your key at: https://www.mapbox.com/
  MAPBOX_API_KEY: 'your_mapbox_api_key_here',
  
  // Aviationstack API key for flight information
  // Get your key at: https://aviationstack.com/
  AVIATIONSTACK_API_KEY: 'your_aviationstack_api_key_here'
};

// Make config available globally
if (typeof window !== 'undefined') {
  window.API_CONFIG = API_CONFIG;
}
