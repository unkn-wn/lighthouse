require('dotenv').config();

const apiKey = process.env.mapsApiKey;
const query = encodeURIComponent('parking near Purdue University');
const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`;

async function fetchJson(url) {
  const { default: fetch } = await import('node-fetch');
  const response = await fetch(url);
  return response.json();
}

async function searchParking() {
  try {
    const data = await fetchJson(searchUrl);
    return data.results; // Contains array of places matching the search query
  } catch (error) {
    console.error('Error fetching parking data:', error);
    return [];
  }
}

async function getPlaceDetails(placeId) {
  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,website&key=${apiKey}`;
  try {
    const data = await fetchJson(detailsUrl);
    return data.result; // Contains detailed information about the place
  } catch (error) {
    console.error(`Error fetching details for place ID ${placeId}:`, error);
    return null;
  }
}

async function processParkingOptions() {
  const parkingOptions = await searchParking();
  for (const option of parkingOptions) {
    console.log('Fetching details for:', option.name);
    const details = await getPlaceDetails(option.place_id);
    if (details) {
      console.log('Parking Option:', details.name);
      console.log('Address:', details.formatted_address);
      console.log('Website:', details.website || 'No website available');
    }
    // Here, you could add logic to visit the website using Puppeteer if a URL is available
  }
}

processParkingOptions();
