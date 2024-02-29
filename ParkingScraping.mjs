// Import necessary modules
import dotenv from 'dotenv';
dotenv.config();
import OpenAI from "openai";
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

// Initialize OpenAI client with your API key from .env
const openai = new OpenAI();

const apiKey = process.env.mapsApiKey;
const query = encodeURIComponent('parking near Purdue University');
const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`;

// Function to fetch JSON data from a URL
async function fetchJson(url) {
  const response = await fetch(url);
  return response.json();
}

// Search for parking options
async function searchParking() {
  try {
    const data = await fetchJson(searchUrl);
    return data.results; // Contains array of places matching the search query
  } catch (error) {
    console.error('Error fetching parking data:', error);
    return [];
  }
}

// Get detailed information about a place
async function getPlaceDetails(placeId) {
  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,website,geometry&key=${apiKey}`;
  try {
    const data = await fetchJson(detailsUrl);
    return {
      ...data.result, // Spread operator to include existing detail fields
      coordinates: data.result.geometry.location // Add coordinates field
    }; // Contains detailed information about the place including coordinates
  } catch (error) {
    console.error(`Error fetching details for place ID ${placeId}:`, error);
    return null;
  }
}

// Scrape website text using Puppeteer
async function scrapeWebsite(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  const data = await page.evaluate(() => document.body.innerText);
  await browser.close();
  return data;
}

// Append data to a JSON file
async function appendDataToJsonFile(data, filename) {
  const filePath = path.resolve(process.cwd(), filename);
  let fileData = [];

  try {
    // Check if the file exists and read its content
    const existingData = await fs.promises.readFile(filePath, { encoding: 'utf8' });
    fileData = JSON.parse(existingData);
  } catch (error) {
    // If the file does not exist, start with an empty array
    console.log("File not found or empty. Creating a new one.");
  }

  // Append the new data
  fileData.push(data);

  // Write the updated array back to the file
  try {
    await fs.promises.writeFile(filePath, JSON.stringify(fileData, null, 2));
    console.log("Data successfully appended to the file.");
  } catch (writeError) {
    console.error("Error writing to the file:", writeError);
  }
}

// Process parking options by scraping their websites and analyzing the text with OpenAI
async function processParkingOptions() {
  const parkingOptions = await searchParking();
  for (const option of parkingOptions) {
    console.log('Fetching details for:', option.name);
    const details = await getPlaceDetails(option.place_id);
    console.log('Coordinates:', details.coordinates);
    if (details && details.website) {
      console.log('Parking Option:', details.name);
      console.log('Address:', details.formatted_address);
      console.log('Website:', details.website);
      const websiteText = await scrapeWebsite(details.website);
      console.log('Scraped Website Text:', websiteText);

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo-0125",
          messages: [
            { role: "system", content: "You are a helpful assistant designed to output JSON. You will parse the website text and output a JSON object with the following keys: 'start hours for every day', 'end hours for every day', 'free parking or not', 'cost depending on hours spent parking', 'permit type or types needed'." },
            { role: "user", content: websiteText }
          ],
        });
        console.log(response.choices[0].message.content);
        // Append the API response data to a JSON file
        await appendDataToJsonFile(response.choices[0].message.content, 'parkingData.json');
      } catch (error) {
        console.error("Error in creating chat completion:", error);
      }

    } else {
      console.log('Parking Option:', details.name);
      console.log('Address:', details.formatted_address);
      console.log('No website available or scraping failed');
    }
  }
}

// Initiate the process
processParkingOptions();
