const axios = require("axios");
const cheerio = require("cheerio");

const domains = [
  "tinyzonetv.app",
  "tinyzone.tube",
  "irisharms.ie"
];

async function analyzeSPA(domain) {
    console.log(`\n--- Deep Analysis: ${domain} ---`);
    try {
        const res = await axios.get(`https://${domain}`, {
            timeout: 10000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });
        
        const $ = cheerio.load(res.data);
        const body = res.data.toLowerCase();
        
        // Look for SPA markers
        const hasVue = body.includes("vue.js") || body.includes("vue@");
        const hasAppDiv = $("#app").length > 0 || $("#root").length > 0;
        const keywordCount = (body.match(/tinyzone/g) || []).length;
        const scriptCount = $("script").length;
        
        // Common movie site classes often found in CSS even if content is dynamic
        const movieClasses = body.includes("movie-grid") || body.includes("flw-item") || body.includes("film-poster");

        console.log("Markers Found:", {
            hasVue,
            hasAppDiv,
            keywordCount,
            scriptCount,
            movieClasses,
            title: $("title").text().trim()
        });

    } catch (e) {
        console.log("Error:", e.message);
    }
}

(async () => {
    for (const d of domains) await analyzeSPA(d);
})();
