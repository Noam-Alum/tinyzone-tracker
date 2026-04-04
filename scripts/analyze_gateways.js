const axios = require("axios");
const cheerio = require("cheerio");

const domains = [
  "tinyzone.hair",
  "tinyzonetv.rest",
  "tinyzonetv.homes",
  "tinyzone.lifestyle",
  "tinyzone.mobi",
  "tinyzone.vip"
];

async function analyze(domain) {
    console.log(`\n--- Analyzing ${domain} ---`);
    try {
        const res = await axios.get(`https://${domain}`, {
            timeout: 10000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            },
            validateStatus: () => true
        });
        
        if (res.status !== 200) {
            console.log(`Status: ${res.status}`);
            return;
        }

        const $ = cheerio.load(res.data);
        const body = res.data.toLowerCase();
        
        console.log("Title:", $("title").text().trim());
        
        // Check for specific markers of a "fake" landing page
        const hasFullSiteBtn = $("a:contains('Full Site'), a:contains('Go to'), a:contains('View'), a:contains('Click')").length > 0;
        const hasMoviesGrid = $(".movie-grid, .flw-item, .film-poster").length > 0; // Common movie site selectors
        const hasSearchForm = $("form[action*='search'], input[name='keyword']").length > 0;
        const hasSocialShare = body.includes("facebook.com/sharer.php") || body.includes("twitter.com/intent") || body.includes("sharethis");
        
        console.log("Markers:", {
            hasFullSiteBtn,
            hasMoviesGrid,
            hasSearchForm,
            hasSocialShare,
            bodyLength: body.length
        });

        // Log first few links to see where they go
        const links = [];
        $("a").slice(0, 10).each((_, el) => {
            links.push({ text: $(el).text().trim(), href: $(el).attr("href") });
        });
        console.log("Sample Links:", links);

    } catch (e) {
        console.log("Error:", e.message);
    }
}

(async () => {
    for (const d of domains) {
        await analyze(d);
    }
})();
