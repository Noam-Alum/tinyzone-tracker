const axios = require("axios");
const cheerio = require("cheerio");

async function fetchInitialDomains() {
  const TARGET = "https://www.whoxy.com/keyword/tinyzone";
  try {
    const { data } = await axios.get(TARGET, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" }
    });
    const $ = cheerio.load(data);
    const domains = [];
    $("a[href*='tinyzone']").each((_, el) => {
      const d = $(el).text().trim().toLowerCase();
      if (d.includes(".") && !d.includes("/") && d.length > 3) domains.push(d);
    });
    return [...new Set(domains)];
  } catch (error) { return []; }
}

async function scrapeButtons(domain) {
    try {
        const res = await axios.get(`https://${domain}`, {
            timeout: 10000,
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" },
            validateStatus: () => true
        });
        if (res.status !== 200) return;

        const $ = cheerio.load(res.data);
        const results = [];

        // Look for buttons near search forms
        $("form").each((_, form) => {
            const nearForm = $(form).find("a, button");
            nearForm.each((_, el) => {
                const text = $(el).text().trim();
                const href = $(el).attr("href");
                if (text && href) results.push({ type: 'near-form', text, href });
            });
            // Also look for siblings of the form
            $(form).siblings("a").each((_, el) => {
                results.push({ type: 'sibling-form', text: $(el).text().trim(), href: $(el).attr("href") });
            });
        });

        // Look for any stand-alone "cta" style buttons
        $("a").each((_, el) => {
            const text = $(el).text().trim();
            const href = $(el).attr("href");
            if (text.length > 2 && text.length < 30 && href && href.includes("http") && !href.includes(domain)) {
                results.push({ type: 'external-link', text, href });
            }
        });

        if (results.length > 0) {
            console.log(`\n--- ${domain} ---`);
            results.forEach(r => console.log(`[${r.type}] "${r.text}" -> ${r.href}`));
        }

    } catch (e) {}
}

(async () => {
    const domains = await fetchInitialDomains();
    console.log(`Analyzing ${domains.length} domains for button patterns...`);
    // Process in smaller chunks to be fast
    const chunk = domains.slice(0, 50); 
    await Promise.all(chunk.map(d => scrapeButtons(d)));
})();
