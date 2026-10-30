// Read-only release gate. GET requests only; never submits a registration.
import assert from "node:assert/strict";
import { securityHeaders } from "../build/security.mjs";

function https(value) {
  const url = new URL(value);
  assert.ok(url.protocol === "https:" && !url.username && !url.password && !url.hash, "Use a public HTTPS URL without credentials or a fragment");
  return url;
}
async function get(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000), cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer" });
  assert.ok(response.ok, `GET failed (${response.status}): ${url.pathname}`);
  return response;
}
const [siteArg, apiArg] = process.argv.slice(2);
if (!siteArg || !apiArg) {
  console.error("Usage: npm run verify:deployment -- https://your-site/ https://script.google.com/macros/s/DEPLOYMENT/exec");
  process.exitCode = 1;
} else {
  try {
    const site = https(siteArg), api = https(apiArg);
    const response = await get(site), html = await response.text();
    const expected = securityHeaders({ endpoint: api.href });
    for (const [name, value] of Object.entries(expected)) {
      const actual = response.headers.get(name);
      if (name === "Strict-Transport-Security") assert.ok(/max-age=(\d+)/.test(actual || "") && Number(actual.match(/max-age=(\d+)/)[1]) >= 31536000, "Missing HSTS");
      else assert.equal(actual, value, `Missing or incorrect ${name}`);
    }
    assert.match(html, /http-equiv="Content-Security-Policy"/);
    const worker = await get(new URL("sw.js", site));
    assert.match(worker.headers.get("content-type") || "", /javascript/);
    assert.match(worker.headers.get("cache-control") || "", /no-cache/);
    const workerText = await worker.text();
    const files = JSON.parse(workerText.match(/const FILES = (\[[^;]+?\])\.map/)[1]);
    let index = 0, count = 0, appCode = "";
    await Promise.all(Array.from({ length: 5 }, async () => {
      while (index < files.length) {
        const file = files[index++], asset = await get(new URL(file, site));
        if (file.endsWith(".js")) appCode += await asset.text();
        else await asset.arrayBuffer();
        count++;
      }
    }));
    assert.ok(appCode.includes(api.href), "Built app points to a different API endpoint");
    const health = await get(api);
    assert.match(health.headers.get("content-type") || "", /application\/json/);
    assert.deepEqual(await health.json(), { status: "ok", service: "infinity-registration", version: "2026-10-30.2", ready: true });
    console.log(`PASS HTTPS, all security headers, ${count} assets, worker caching, configured API and backend revision; no live writes`);
  } catch (error) {
    console.error(`DEPLOYMENT NOT VERIFIED: ${error.message}`);
    process.exitCode = 1;
  }
}
