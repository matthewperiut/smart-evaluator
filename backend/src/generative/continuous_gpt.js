const { OpenAI } = require('openai');
const { scrapeBingSearchForKeywords } = require("./gpt");
const puppeteer = require("puppeteer");
const axios = require('axios');
const { JSDOM } = require('jsdom');
const qs = require("querystring");

const openai = new OpenAI(process.env.OPENAI_API_KEY); // Directly use the API key here

let verbose = true;
function log(...text) {
    if (verbose) {
        console.log(...text);
    }
}

//Uses Puppeteer to scrape duckduckGo Search, and visit the links found in that search. 
async function scrapeWebForKeywordsPuppeteer(searchURL, keywords, limit, surroundingChars) {
    try {
        const browser = await puppeteer.launch();
        const dimensionsData = [];

        const searchResultsLinks = await getSearchResultsLinks(browser, searchURL);

        const pagePromises = searchResultsLinks.slice(0, limit).map(async (link) => {
            const page = await browser.newPage();
            try {
                log("Processing link:", link);
                await page.goto(link, { waitUntil: 'networkidle0', timeout: 30000 });

                const data = await page.evaluate((keywords, surroundingChars) => {
                    const bodyText = document.body.innerText;
                    const titleElement = document.querySelector('h1'); // Adjust the selector based on the structure of the webpage
                    const title = titleElement ? titleElement.innerText : ''; // Get the text content of the title, if it exists
                    let cumulativeResults = '';
                    for (let keyword of keywords) {
                        const index = bodyText.toLowerCase().indexOf(keyword);
                        if (index !== -1) {
                            cumulativeResults += " " + bodyText.substring(Math.max(0, index - surroundingChars / 2), Math.min(bodyText.length, index + surroundingChars / 2));
                            break;
                        }
                    }
                    return cumulativeResults.length > 0 ? ("Page Title:" + title + ' Results: ' + cumulativeResults) : null;
                }, keywords, surroundingChars);

                if (data) {
                    log(`This website contains: ${data}`);
                    dimensionsData.push({ data });
                }
            } catch (error) {
                if (error.name === 'TimeoutError') {
                    log("Page took too long to load:", link);
                } else {
                    log("An error occurred:", error);
                }
            } finally {
                await page.close();
            }
        });

        await Promise.all(pagePromises);
        await browser.close();
        return dimensionsData;

    } catch (error) {
        console.error('Error:', error.message);
        await browser.close();
        return [];
    }
}

async function getSearchResultsLinks(browser, searchURL) {
    const page = await browser.newPage();
    await page.goto(searchURL);

    const links = await page.evaluate(() => {
        const links = [];
        const linkSelectors = document.querySelectorAll('h2 a');
        linkSelectors.forEach(link => {
            if (link.href) {
                links.push(link.href);
            }
        });
        return links;
    });

    await page.close();
    return links;
}

//Uses ScrapingBee API to scrape search engine Search, and uses puppeteer to
// visit the links found in that search. This should avoid some rate limiting.
async function scrapeWebForKeywords(searchURL, keywords, limit, surroundingChars) {
        try {

            const response = await axios.get('https://app.scrapingbee.com/api/v1/', {
                params: {
                api_key: process.env.SCRAPING_BEE_API_KEY,
                url: searchURL,
                wait_browser: 'load',
                render_js: 'true', // Set to 'true' if JavaScript rendering is needed
                }
            });
    
            const { window } = new JSDOM(response.data, { resources: 'usable' });
            const searchResultsLinks = [];
    
            const loadPromise = new Promise((resolve, reject) => {
                window.addEventListener('load', resolve);
                window.addEventListener('error', reject);
                setTimeout(reject, 10000); // 10 seconds timeout
            });

            const linkSelectors = window.document.querySelectorAll('h2 a');
            //console.log(linkSelectors);
            linkSelectors.forEach(link => {
                if (link.href) {
                    searchResultsLinks.push(link.href);
                }
            });


            const browser = await puppeteer.launch();
            const dimensionsData = [];
    
           const pagePromises = searchResultsLinks.slice(0, limit).map(async (link) => {
            const page = await browser.newPage();
            try {
                log("Processing link:", link);
                await page.goto(link, { waitUntil: 'networkidle0', timeout: 30000 });

                const data = await page.evaluate((keywords, surroundingChars) => {
                    const bodyText = document.body.innerText;
                    const titleElement = document.querySelector('h1'); // Adjust the selector based on the structure of the webpage
                    const title = titleElement ? titleElement.innerText : ''; // Get the text content of the title, if it exists
                    let cumulativeResults = '';
                    for (let keyword of keywords) {
                        const index = bodyText.toLowerCase().indexOf(keyword);
                        if (index !== -1) {
                            cumulativeResults += " " + bodyText.substring(Math.max(0, index - surroundingChars / 2), Math.min(bodyText.length, index + surroundingChars / 2));
                            break;
                        }
                    }
                    return cumulativeResults.length > 0 ? ("Page Title:" + title + ' Results: ' + cumulativeResults) : null;
                }, keywords, surroundingChars);

                if (data) {
                    log(`This website contains: ${data}`);
                    dimensionsData.push({ data });
                }
            } catch (error) {
                if (error.name === 'TimeoutError') {
                    log("Page took too long to load:", link);
                } else {
                    log("An error occurred:", error);
                }
            } finally {
                await page.close();
            }
        });

        await Promise.all(pagePromises);
        await browser.close();
        return dimensionsData;

    } catch (error) {
        console.error('Error:', error.message);
        await browser.close();
        return [];
    }
    }

function formatDuckDuckGoSearchURL(query) {
    return `https://www.duckduckgo.com/?${qs.stringify({q: query})}`;
    //return `https://www.bing.com/search?${qs.stringify({q: query})}`;
}

// Specific function for scraping DuckDuckGo with certain keywords
async function scrapeDuckDuckGoSearchForKeywords(query, keywords, limit = 10, surroundingChars = 300) {
    const searchURL = formatDuckDuckGoSearchURL(query);
    log("Search URL:" + searchURL);
    return await scrapeWebForKeywordsPuppeteer(searchURL, keywords, limit, surroundingChars);
}

async function promptGPT(messages) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: messages,
            max_tokens: 150, // Adjust this parameter as needed
            temperature: 0.7, // Adjust temperature for controlling randomness (optional)
            top_p: 0.9, // Adjust top_p for controlling diversity (optional)
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error("openai error:", error);
        return null;
    }
}

exports.continuous_scrape = async function continuous_scrape(item_desc, manufacturer_part_num, property_data) {
    //Sanitize item decription input
    item_desc = item_desc.replace(/"/g, '');
    
    let messages = [
        {
            role: "system",
            content: "You will be given a description of a physical item, and a list of properties to fill out. You can only reply with two things\n" +
                " the first is `google(\"question\", \"keywords\")`. If you respond this way, my function will search the internet using the" + 
                " question that you provide, evaluate the first 10 webpages, and return any text within 100 characters of the keywords. " +
                " Use | to separate keywords. Example usage: google(\"how tall is mt everest?\", \"height|size|feet|meters\")" +
                " If the results is [] it is likely that the keywords did not work." +
                " Please include item description in the question variable." + 
                (manufacturer_part_num? " and Manufactuer part number as a keyword. the start of individual website data are marked by\"data\", validate the data by"+
                " checking if the manufacturer part number is found on the data from that website.": "") +
                " If you aren't confident in the data, adjust the keywords and try again. You have several google searches, so use them." +
                " When you have found an answer, you may use the second response: `<property_name>: <answer, e.g. \"true\", \"false\", \"number\">`\n"+ 
                " If you can't find enough data, search again. Once you answer for one property, move on to the next one." +
                " Follow these guidelines strictly. On the final try you will be informed that you can no longer google search, and must reply."

        },
        {
            role: "user",
            content: `item description is "${item_desc}", ` + (manufacturer_part_num? `Manufacturer part number: ${manufacturer_part_num}`:``)
        }
    ];

    for (let i = 0; i < property_data.length; i++ ) {
        messages.push({
            role: "user",
            content: `Property ${i + 1}: "${property_data[i].property_name}" Type: "${property_data[i].type}", additional info is: "${property_data[i].additional_info}"`
        });
    }

    let result = []; 

    let maxTries = 10;
    for (let tries = 0; tries < maxTries; tries++) {
        let response = await promptGPT(messages);
        console.log(response);

        messages.push({
            role: "assistant",
            content: response
        })

        //Recognize response call by chatGPT
        if (response.includes(":") && !response.includes("google")) {
            const colonIndex = response.indexOf(':');
            console.log("returning " + response.substring(colonIndex + 1).trim());
            //Code to output GPT result to appropriate value
            for (let i = 0; i < property_data.length; i++){
                if (response.includes(property_data[i].property_name)){
                    property_data[i].value = response.substring(colonIndex + 1).trim();
                    result.push(property_data[i]);
                    
                    prop_name = property_data[i].property_name; 

                    console.log(`Added ${property_data[i].value} to Property ${prop_name}`);
                    
                    // remove property data from array
                    property_data.splice(i, 1);

                    if(property_data.length !== 0) {
                        messages.push({
                            role: "system",
                            content: `Processed your Response for ${prop_name}, Good Job, please answer property \'${property_data[0].property_name}\'.`
                        });
                        console.log(JSON.stringify(result))
                        break; 
                    } else {
                        return result; 
                    }
                }
            }
        } else {
            let match = response.match(/google\("([^"]+)",\s*"([^"]+)"\)/);
            if (match) {
                let question = match[1].trim().replace(/^"|"$/g, '');
                let keywords = match[2].trim().replace(/^"|"$/g, '').replace('"', '').replace('\'', '').split("|");
                //keywords.push(manufacturer_part_num);
                console.log(keywords);
    
                // Call scrapeBingSearchForKeywords and await its result
                let content = await scrapeDuckDuckGoSearchForKeywords(question, keywords);
    
                // Assuming scrapeBingSearchForKeywords returns an object/array that needs to be stringified
                let jsonContent = JSON.stringify(content);
    
                // Append the result to messages
                messages.push({
                    role: "system",
                    content: `Results for "${question}" with keyword "${keywords}": ${jsonContent}`
                });
            } else {
                // Handle case where response does not match expected format
                messages.push({
                    role: "system",
                    content: "Sorry, your response did not match the expected format. Please reply with 'google(question, keyword)'."
                });
            }
    
        }

        if (tries === (maxTries - 2)) {
            messages.push({
                role: "system",
                content: "You must answer now, googling is disallowed. respond (variable):(answer)"
            });
        }
        console.log("results from try " + tries + " messages: " + JSON.stringify(messages));
    }
    return result;

    // todo: store messages for further analysis

    return "not found";
}