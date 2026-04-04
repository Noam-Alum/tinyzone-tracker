const axios = require("axios");
const cheerio = require("cheerio");

const badDomains = [
  "tinyzone.forum",
  "tinyzone.digital",
  "tinyzone.uno",
  "tinyzone.homes",
  "tinyzone.net.im",
  "tinyzone.club",
  "tinyzonetv.info",
  "tinyzonetvto.com",
  "tinyzonez.uk",
  "tinyzonetv.mom",
  "tinyzonetv.bond"
];

async function diagnose(domain) {
    console.log(`\n--- Diagnosing: ${domain} ---`);
    try {
        const res = await axios.get(`https://${domain}`, {
            timeout: 10000,
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" },
            validateStatus: () => true
        });
        
        const $ = cheerio.load(res.data);
        const body = res.data.toLowerCase();
        const title = $("title").text().trim();
        
        // 1. Functional Analysis
        const hasApp = $("#app").length > 0 || $("#root").length > 0;
        const kwCount = (body.match(/tinyzone/g) || []).length;
        const scriptCount = $("script").length;
        const movieLinks = $("a").filter((i, el) => /\/(movie|tv|series|watch|film|episode)\//i.test($(el).attr("href") || "")).length;
        const hasGrid = $(".movie-grid, .flw-item, .film-poster, .ml-item, .item, .movie-item, .post-item").length > 0;

        // Bad Markers
        const badWords = ["business", "technology", "health", "lifestyle", "travel", "sports", "magazine"];
        let badScore = 0;
        const menuText = $("nav, header, .menu, .nav, #navigation").text().toLowerCase();
        badWords.forEach(word => { if (menuText.includes(word)) badScore++; });
        if (body.includes("forum") || body.includes("thread")) badScore += 2;

        // Identity
        const hasIdentity = body.includes("facebook.com/sharer.php?t=tinyzone") || 
                            body.includes("twitter.com/intent/post?text=tinyzone") || 
                            body.includes("sharethis") || 
                            title.toLowerCase().includes("tinyzone");

        // Results
        const isFunctionalSite = (hasApp && scriptCount > 5) || kwCount > 80 || movieLinks > 10 || hasGrid;
        const isNotBadSite = badScore < 3;

        console.log({
            title,
            hasApp,
            kwCount,
            scriptCount,
            movieLinks,
            hasGrid,
            badScore,
            hasIdentity,
            isFunctionalSite,
            isNotBadSite,
            FINAL_DECISION: (hasIdentity && isFunctionalSite && isNotBadSite) ? "ACTIVE SITE" : "SKIP/GATEWAY"
        });

        // Check for gateway buttons
        const gatewayRegex = /view full site|go to tinyzone|view full site now|click here to enter|visit tinyzone/i;
        const buttons = [];
        $("a").each((_, el) => {
            const text = $(el).text().trim();
            if (gatewayRegex.test(text)) buttons.push(text);
        });
        if (buttons.length > 0) console.log("Gateway Buttons Found:", buttons);

    } catch (e) {
        console.log("Error:", e.message);
    }
}

(async () => {
    for (const d of badDomains) await diagnose(d);
})();
