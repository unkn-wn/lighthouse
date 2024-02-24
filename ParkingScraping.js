const puppeteer = require('puppeteer');

const searchTerms = [
  "Purdue University parking",
  "street parking West Lafayette IN",
  // Add more as needed
];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for (const term of searchTerms) {
    // Navigate to a search engine or directly to known sources if you have URLs
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(term)}`);

    const links = await page.evaluate(() => Array.from(document.querySelectorAll('h3 > a')).map(link => link.href));

    for (const link of links) {
      await page.goto(link);
      // Scrape the parking info from the page
      // Use appropriate selectors for the data you need
      const data = await page.evaluate(() => {
        return document.querySelector('h1').innerText;
      });

      console.log(data); // Output the scraped data
    }
  }

  await browser.close();
})();
