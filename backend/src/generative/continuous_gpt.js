const { OpenAI } = require('openai');
const { scrapeBingSearchForKeywords } = require("./gpt");
const puppeteer = require("puppeteer");
const qs = require("querystring");

const openai = new OpenAI(process.env.OPENAI_API_KEY); // Directly use the API key here

let verbose = true;
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
            console.log(linkSelectors);
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
                    let cummulativeResults = "";
                    for (let keyword of keywords) {
                        const index = bodyText.toLowerCase().indexOf(keyword);
                        console.log("keyword: " + keyword + "\n");
                        if (index !== -1) {
                            cummulativeResults += " " + bodyText.substring(Math.max(0, index - surroundingChars / 2), Math.min(bodyText.length, index + surroundingChars / 2));
                        }
                    }
                    if (cummulativeResults.length > 0) {
                        return cummulativeResults;
                    }
                    else {
                        return null;
                    }
                }, keywords, surroundingChars);

                if (data) {
                    //can use: dimensionsData.push({url: link, data: data});
                    log(`This website contains: ${data}`);
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


function formatDuckDuckGoSearchURL(query) {
    return `https://www.duckduckgo.com/?${qs.stringify({q: query})}`;
    //return `https://www.bing.com/search?${qs.stringify({q: query})}`;
}

// Specific function for scraping Bing with certain keywords
async function scrapeDuckDuckGoSearchForKeywords(query, keywords, limit = 10, surroundingChars = 300) {
    const searchURL = formatDuckDuckGoSearchURL(query);
    log("Search URL:" + searchURL);
    return await scrapeWebForKeywords(searchURL, keywords, limit, surroundingChars);
}

async function promptGPT(messages) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview", // or your preferred model
            messages: messages,
            max_tokens: 150,
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error("openai error:", error);
        return null;
    }
}

exports.continuous_scrape = async function continuous_scrape(item_desc, manufacturer_part_num, variable, variable_type, additional_info = "") {
    let messages = [
        {
            role: "system",
            content: "You will be asked for a variable and given a description of the item. You can only reply with two things\n" +
                " the first is `google(\"question\", \"keywords\")`. If you respond this way, my function will search the internet using the" + 
                " question that you provide, evaluate the first 10 webpages, and return any text within 100 characters of the keywords. " +
                " Use | to separate keywords. Example usage: google(\"how tall is mt everest?\", \"height|feet\")" +
                " If the results is [] it is likely that the keywords did not work." +
                " Please include item description in the question variable." + 
                (manufacturer_part_num? "the start of individual website data are marked by\"data\", validate the data by"+
                " checking if the manufacturer part number is found on the data from that website": "") +
                " If you aren't confident in the data, adjust the keywords and try again." +
                " When you have found the answer, you may use the second response: `(variable as given): (answer, e.g. \"true\", \"false\", \"number\")`\n"+ 
                " However, try not to answer what the variable is until you find it. If you can't find enough data, search again." +
                " Follow these guidelines strictly. On the final try you will be informed that you can no longer google search, and must reply."



        },
        {
            role: "user",
            content: `item description is "${item_desc}", ` + (manufacturer_part_num? `Manufacturer part number: ${manufacturer_part_num}`:``) +` variable is "${variable}" as a "${variable_type}", additional info is "${additional_info}"`
        }
    ];

    var keywords = "";
    let maxTries = 5;
    for (let tries = 0; tries < maxTries; tries++) {
        let response = await promptGPT(messages);
        console.log(response);

        if (response.includes(":") && !response.includes("google")) {
            const colonIndex = response.indexOf(':');
            console.log("returning " + response.substring(colonIndex + 1).trim());
            return response.substring(colonIndex + 1).trim();
        }

let match = response.match(/google\("([^"]+)",\s*"([^"]+)"\)/);
        if (match) {
            let question = match[1].trim().replace(/^"|"$/g, '');
            let keywords = match[2].trim().replace(/^"|"$/g, '').replace('"', '').replace('\'', '').split("|");
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

        if (tries === (maxTries - 2)) {
            messages.push({
                role: "system",
                content: "You must answer now, googling is disallowed. respond (variable):(answer)"
            });
        }
        console.log("results from try " + tries + " messages: " + JSON.stringify(messages));
    }

    // todo: store messages for further analysis

    return "not found";
}