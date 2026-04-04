const axios = require("axios");
const cheerio = require("cheerio");

const good = [
  "tinyzonetv.app",
  "tinyzonee.com",
  "tinyzone.tube",
  "irisharms.ie",
  "tinyzone.biz"
];

const bad = [
  "tinyzone.hair",
  "tinyzonetv.rest",
  "tinyzone.lifestyle",
  "tinyzone.mobi",
  "tinyzone.in.net"
];

async function analyze(domain, type) {
    console.log(`\n[${type.toUpperCase()}] Analyzing ${domain}...`);
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
        
        const hasApp = $("#app").length > 0 || $("#root").length > 0;
        const movieLinks = $("a").filter((i, el) => /\/(movie|tv|series|watch)\//i.test($(el).attr("href") || "")).length;
        const kwCount = (body.match(/tinyzone/g) || []).length;
        const navLinks = $("nav a, .menu a, .header a").length;
        const hasGrid = $(".movie-grid, .flw-item, .film-poster").length > 0;
        const scriptCount = $("script").length;

        console.log({
            hasApp,
            movieLinks,
            kwCount,
            navLinks,
            hasGrid,
            scriptCount,
            title: $("title").text().trim()
        });

    } catch (e) {
        console.log("Error:", e.message);
    }
}

(async () => {
    console.log("--- GOOD SITES ---");
    for (const d of good) await analyze(d, "good");
    console.log("\n--- BAD SITES (LANDING PAGES) ---");
    for (const d of bad) await analyze(d, "bad");
})();
