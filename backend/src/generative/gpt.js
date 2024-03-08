const { OpenAI } = require('openai');
const qs = require('querystring');
const puppeteer = require('puppeteer');
const axios = require('axios');

let verbose = false;
function log(...text) {
    if (verbose) {
        console.log(...text);
    }
}

async function scrapeWebForKeywords(searchURL, keywords, limit, surroundingChars) {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(searchURL);
  
      // Extract the first few search result links
      const searchResultsLinks = await page.evaluate(() => {
        const links = [];
        const linkSelectors = document.querySelectorAll('h2 a');
        linkSelectors.forEach(link => {
          if (link.href) {
            links.push(link.href);
          }
        });
        return links;
      });
  
      const dimensionsData = [];
      for (let i = 0; i < Math.min(limit, searchResultsLinks.length); i++) {
        try {
            const link = searchResultsLinks[i];
            log("Processing link:", link); // Debugging output to see the processed link
            try {
                await page.goto(link, {waitUntil: 'networkidle0', timeout: 10000}); // Attempt to navigate with a custom timeout
                // Proceed with your scraping logic...
              } catch (error) {
                if (error.name === 'TimeoutError') {
                  log("Page took too long to load:", link);
                  // Handle the timeout, e.g., by skipping this page or logging the timeout
                } else {
                  log("An error occurred:", error.message);
                  // Handle other potential errors
                }
              }
      
            const data = await page.evaluate((keywords, surroundingChars) => {
              const bodyText = document.body.innerText;
              for (let keyword of keywords) {
                const index = bodyText.toLowerCase().indexOf(keyword);
                if (index !== -1) {
                  return bodyText.substring(Math.max(0, index - surroundingChars / 2), Math.min(bodyText.length, index + surroundingChars / 2));
                }
              }
              return null;
            }, keywords, surroundingChars);
      
            if (data) {
              //can use: dimensionsData.push({url: link, data: data});
              dimensionsData.push({data: data});
            }
        }
        catch (error) {
            log(error);
            continue;
        }
      }
  
      await browser.close();
      return dimensionsData;
  
    } catch (error) {
      console.error('Error:', error.message);
      await browser.close();
      return [];
    }
  }
  
  // Function to format search URL for Bing
  function formatBingSearchURL(query) {
    return `https://www.bing.com/search?${qs.stringify({q: query})}`;
  }
  
  // Specific function for scraping Bing with certain keywords
  async function scrapeBingSearchForDimensions(query, limit = 10, surroundingChars = 300) {
    const searchURL = formatBingSearchURL(query);
    log("Search URL:" + searchURL);
    const keywords = ['dimensions', "inches", 'width', 'height', 'length'];
    return await scrapeWebForKeywords(searchURL, keywords, limit, surroundingChars);
  }

async function scrapeBingSearch(query, limit) {
  const searchURL = `https://www.bing.com/search?${qs.stringify({q: query})}`;

  try {
    // Make an HTTP GET request to Bing search
    const response = await axios.get(searchURL);
    const htmlContent = response.data;

    log(htmlContent)
    return limit ? htmlContent.slice(0, limit) : htmlContent;

  } catch (error) {
    console.error('Error fetching Bing search results:', error.message);
    return "";
  }
}

const openai = new OpenAI(process.env.OPENAI_API_KEY); // Directly use the API key here
async function promptGPT(text_prompt) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview", // or your preferred model
        messages: [{"role": "user", "content": text_prompt}],
        max_tokens: 150,
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error("openai error:", error);
      return null;
    }
  }

exports.fillDimensions = async function (item) {
    let bingSearch = await JSON.stringify(await scrapeBingSearchForDimensions(item.item_description + " dimensions"));
    log(bingSearch);
    if(bingSearch.length > 0) {
        let question = "Item Description:" + item.item_description + "\n" + bingSearch +
        "\n\nBased on the text above answer the questions. Follow the format provided strictly. If you cannot complete the task respond with\
        \"impossible\" otherwise only provide the data. Prioritize higher precision answers in the text, ensure it is dimensions not $\n";
        if (!item.width_inch || !item.length_inch || !item.height_inch) {
            question += "Q: Provide the item's dimensions in the specified format\n\
            width_inch=\n\
            length_inch=\n\
            height_inch=\n"
        }
        const response = await promptGPT(question);
        const lines = response.split('\n');
        const result = {};
        
        lines.forEach(line => {
            const [key, value] = line.split('=');
            result[key] = parseFloat(value); // Convert to float to handle numerical values correctly
        });
        log(result);
        return result;
    }
}

// const {fillDimensions} = require("./generative/gpt")
//
// //for testing 
// const item = {
//     item_description: "CL110 CHECKLITE CLEAR LENS"
//   };

//   try {
//     // Using the function and sending response back to the client
//     const response = fillDimensions(item);
//   } catch (error) {
//     console.error("Error during GPT prompt:", error);
//   }