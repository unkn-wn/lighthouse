require('dotenv').config();
let fetch;

(async () => {
  const nodeFetch = await import('node-fetch');
  fetch = nodeFetch.default;
})();
const apiKey = process.env.mapsApiKey;
const query = encodeURIComponent('parking near Purdue University');
const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`;

async function searchParking() {
  try {
    const { default: fetch } = await import('node-fetch'); // Import fetch directly where it's used
    const response = await fetch(url);
    const data = await response.json();
    return data.results; // Contains array of places matching the search query
  } catch (error) {
    console.error('Error fetching parking data:', error);
    return [];
  }
}

async function processParkingOptions() {
  const parkingOptions = await searchParking();
  for (const option of parkingOptions) {
    console.log('Parking Option:', option.name);
    console.log('Address:', option.formatted_address);
    if (option.website) {
      console.log('Website:', option.website);
    } else {
      console.log('No website available');
    }
    // Here, you could add logic to visit the website using Puppeteer if a URL is available
  }
}

processParkingOptions();
