const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const TARGET = "https://www.whoxy.com/keyword/tinyzone";

async function fetchDomains() {
  const { data } = await axios.get(TARGET);
  const $ = cheerio.load(data);

  const domains = [];

  $("a[href*='tinyzone']").each((_, el) => {
    const d = $(el).text().trim();
    if (d.includes(".")) domains.push(d);
  });

  return [...new Set(domains)];
}

async function checkDomain(domain) {
  try {
    const res = await axios.get(`http://${domain}`, {
      timeout: 5000,
      validateStatus: () => true,
    });

    if (res.status >= 200 && res.status < 300) {
      if (res.data.toLowerCase().includes("watch")) {
        return {
          domain,
          status: res.status,
        };
      }
    }
  } catch (e) {}

  return null;
}

(async () => {
  const domains = await fetchDomains();
  const results = [];

  for (const d of domains) {
    const r = await checkDomain(d);
    if (r) results.push(r);
  }

  fs.writeFileSync(
    "./public/data.json",
    JSON.stringify({
      updated: new Date().toISOString(),
      results,
    }, null, 2)
  );

  console.log("Done. Found:", results.length);
})();
