const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const TARGET = "https://www.whoxy.com/keyword/tinyzone";
const OUTPUT_FILE = path.join(__dirname, "../public/data.json");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  dim: "\x1b[2m"
};

async function fetchDomains() {
  console.log(`${colors.blue}[INFO] Fetching domain list...${colors.reset}`);
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

async function checkDomain(domain, visited = []) {
  const domainClean = domain.toLowerCase().trim();
  const indent = "  ".repeat(visited.length);
  const pathString = visited.length > 0 ? `${visited.join(" -> ")} -> ${domainClean}` : domainClean;
  
  if (visited.includes(domainClean) || visited.length >= 5) return null;
  const newVisited = [...visited, domainClean];

  for (const protocol of ["https", "http"]) {
    try {
      const res = await axios.get(`${protocol}://${domainClean}`, {
        timeout: 10000,
        maxRedirects: 5,
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" }
      });

      const finalUrl = res.request.res.responseUrl || `${protocol}://${domainClean}`;
      const finalHostname = new URL(finalUrl).hostname.replace("www.", "").toLowerCase();

      if (finalHostname !== domainClean && finalHostname.includes("tinyzone")) {
        console.log(`${indent}${colors.yellow}[REDIRECT] ${domainClean} -> ${finalHostname}${colors.reset}`);
        return await checkDomain(finalHostname, newVisited);
      }

      const body = res.data.toLowerCase();
      const $ = cheerio.load(res.data);
      const title = $("title").text().trim();
      
      // 1. Functional Analysis (Real Destination Markers)
      const hasGrid = $(".movie-grid, .flw-item, .film-poster, .ml-item, .movie-item").length > 0;
      const movieLinks = $("a").filter((i, el) => /\/(movie|tv|series|watch|film|episode)\//i.test($(el).attr("href") || "")).length;
      const kwCount = (body.match(/tinyzone/g) || []).length;
      const hasApp = $("#app, #root").length > 0 && $("script").length > 5;
      const isFunctionalSite = hasGrid || movieLinks > 15 || hasApp || kwCount > 200;

      // 2. Identify "Gateway" Buttons (HIGHEST PRIORITY)
      const gatewayRegex = /view full site|go to tinyzone|official|enter|click here|visit|home|movies|tv shows/i;
      const potentialLinks = new Set();
      
      $("a").each((_, el) => {
        const text = $(el).text().trim();
        const href = $(el).attr("href");
        if (href) {
          try {
            const btnUrl = href.startsWith("//") ? `https:${href}` : href.startsWith("/") ? `${protocol}://${domainClean}${href}` : href;
            const btnHostname = new URL(btnUrl).hostname.replace("www.", "").toLowerCase();
            
            // Criteria for a Gateway Link:
            // - Anchor text matches gateway keywords
            // - OR Anchor text contains "TinyZone" but leads to a different domain
            const isExternal = btnHostname !== domainClean && btnHostname.length > 3;
            const isTinyZoneText = text.toLowerCase().includes("tinyzone");
            const isGatewayText = gatewayRegex.test(text);
            const isNearSearch = $(el).closest("form").length > 0 || $(el).prev().is("form");

            if (isExternal && (isTinyZoneText || isGatewayText || isNearSearch)) {
              if (!["facebook.com", "twitter.com", "x.com", "google.com", "archive.org"].some(h => btnHostname.includes(h))) {
                potentialLinks.add(btnHostname);
              }
            }
          } catch (e) {}
        }
      });

      // 3. LOGIC FLOW:
      // If it has gateway buttons -> IT IS A LANDING PAGE. ALWAYS FOLLOW.
      if (potentialLinks.size > 0 && !hasGrid && movieLinks < 10) {
        console.log(`${indent}${colors.yellow}[LANDING PAGE] Path: ${pathString} -> Following buttons...${colors.reset}`);
        for (const btnHostname of potentialLinks) {
          const result = await checkDomain(btnHostname, newVisited);
          if (result) return result;
        }
        return null;
      }

      // 4. Blacklist Filter (Blogs/Forums)
      const menuText = $("nav, header, .menu, .nav, #navigation").text().toLowerCase();
      const hasIrrelevantContent = /business|technology|health|lifestyle|travel|sports|magazine|news|forum|blog/i.test(menuText);
      const isNotBadSite = !hasIrrelevantContent && !body.includes("wp-content/themes/twenty");

      // B. No buttons or verified as a real portal? 
      if (isFunctionalSite && isNotBadSite && title.toLowerCase().includes("tinyzone")) {
        console.log(`${indent}${colors.green}[ACTIVE SITE] Verified destination: ${finalHostname} (Path: ${pathString})${colors.reset}`);
        return {
          domain: finalHostname,
          url: finalUrl,
          title: title || finalHostname,
          description: ($('meta[name="description"]').attr("content") || "").substring(0, 150),
          lastChecked: new Date().toISOString()
        };
      }
    } catch (e) {}
  }
  return null;
}

(async () => {
  const domains = await fetchDomains();
  const results = [];
  console.log(`${colors.blue}[INFO] Checking ${domains.length} potential domains...${colors.reset}`);
  
  const chunkSize = 15;
  for (let i = 0; i < domains.length; i += chunkSize) {
    const chunk = await Promise.all(domains.slice(i, i + 15).map(d => checkDomain(d)));
    results.push(...chunk);
  }
  
  const activeMap = new Map();
  results.forEach(r => r && activeMap.set(r.domain, r));
  
  const final = Array.from(activeMap.values());
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ updated: new Date().toISOString(), results: final }, null, 2));
  console.log(`\n${colors.green}=========================================`);
  console.log(`[DONE] Found ${final.length} unique active sites.`);
  console.log(`=========================================${colors.reset}\n`);
})();
