const axios = require("axios");
const cheerio = require("cheerio");

async function debug(domain) {
    console.log(`\n--- Debugging ${domain} ---`);
    try {
        const res = await axios.get(`https://${domain}`, {
            timeout: 10000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });
        const $ = cheerio.load(res.data);
        const body = res.data.toLowerCase();

        console.log("Title:", $("title").text());
        
        const links = [];
        $("a").each((_, el) => {
            links.push({
                text: $(el).text().trim(),
                href: $(el).attr("href")
            });
        });
        console.log("All Links:", links.filter(l => l.text || l.href));

        const hasFacebookShare = body.includes("facebook.com/sharer.php?t=tinyzone");
        const hasXShare = body.includes("x.com/intent/post?text=tinyzone") || body.includes("twitter.com/intent/tweet?text=tinyzone");
        const hasShareThis = body.includes("sharethis") && (body.includes("tinyzone") || body.includes("watch"));

        console.log("Validation Results:", { hasFacebookShare, hasXShare, hasShareThis });

    } catch (e) {
        console.log("Error:", e.message);
    }
}

(async () => {
    await debug("tinyzone.run");
    await debug("tinyzone.casa");
})();
