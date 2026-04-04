const axios = require("axios");
const cheerio = require("cheerio");

const bad = [
  "tinyzone.forum",
  "tinyzonetvto.com",
  "tinyzoned.com",
  "tinyzonez.uk"
];

async function analyzeBad(domain) {
    console.log(`\n--- Analyzing Bad Domain: ${domain} ---`);
    try {
        const res = await axios.get(`https://${domain}`, {
            timeout: 10000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            },
            validateStatus: () => true
        });
        
        const $ = cheerio.load(res.data);
        const body = res.data.toLowerCase();
        
        // Check for "Blog" or "News" markers
        const menuText = $(".menu, .nav, #navigation, header").text().toLowerCase();
        const hasIrrelevantCategories = /business|technology|health|travel|sports|news|magazine/i.test(menuText);
        
        // Check if it's a forum
        const isForum = body.includes("forum") || body.includes("topic") || body.includes("thread");

        // Check for real movie site structural elements
        const hasMoviesGrid = $(".movie-grid, .flw-item, .film-poster").length > 0;
        const movieLinks = $("a").filter((i, el) => /\/(movie|tv|series|watch)\//i.test($(el).attr("href") || "")).length;

        console.log({
            hasIrrelevantCategories,
            isForum,
            hasMoviesGrid,
            movieLinks,
            title: $("title").text().trim(),
            menuSample: menuText.substring(0, 200).replace(/\s+/g, ' ')
        });

    } catch (e) {
        console.log("Error:", e.message);
    }
}

(async () => {
    for (const d of bad) await analyzeBad(d);
})();
