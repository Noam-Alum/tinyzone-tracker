const axios = require("axios");
const cheerio = require("cheerio");

const domains = [
  "tinyzonetv.app",
  "tinyzonetv.vip",
  "tinyzonetv.art",
  "tinyzonetv.ws",
  "tinyzonetv.stream",
  "tinyzone.tube",
  "irisharms.ie"
];

async function debug(domain) {
    console.log(`\n--- Debugging ${domain} ---`);
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
        const title = $("title").text().trim();

        const hasMoviesGrid = $(".movie-grid, .flw-item, .film-poster, .ml-item, .item, .movie-item, .post-item").length > 0;
        
        const movieLinkRegex = /\/(movie|tv|series|watch|film)\//i;
        let movieLinkCount = 0;
        $("a").each((_, el) => {
            if (movieLinkRegex.test($(el).attr("href") || "")) movieLinkCount++;
        });

        const hasFacebookShare = body.includes("facebook.com/sharer.php?t=tinyzone");
        const hasXShare = body.includes("x.com/intent/post?text=tinyzone") || body.includes("twitter.com/intent/tweet?text=tinyzone");
        const hasShareThis = body.includes("sharethis") && (body.includes("tinyzone") || body.includes("watch"));
        
        console.log("Stats:", {
            title,
            hasMoviesGrid,
            movieLinkCount,
            hasFacebookShare,
            hasXShare,
            hasShareThis,
            tinyzoneKeywordCount: (body.match(/tinyzone/g) || []).length
        });

    } catch (e) {
        console.log("Error:", e.message);
    }
}

(async () => {
    for (const d of domains) await debug(d);
})();
