// Real Vite preview + browser CORS/redirect checks. Every POST is intercepted.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { runInNewContext } = require("node:vm");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
let browser, server;

async function main() {
  const { preview } = await import("vite");
  server = await preview({ preview: { host: "127.0.0.1", port: 0, strictPort: true } });
  const url = `http://127.0.0.1:${server.httpServer.address().port}/`;
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ reducedMotion: "reduce", serviceWorkers: "block" });
  const errors = [], requests = [];
  context.on("page", (page) => page.on("pageerror", (error) => errors.push(error.message)));
  const page = await context.newPage();
  // CDP intercepts every redirect hop; Playwright's route handler only handles
  // the first URL of a redirect chain. No POST or external GET reaches Google.
  const network = await context.newCDPSession(page);
  network.on("Fetch.requestPaused", async ({ requestId, request }) => {
    try {
      const target = new URL(request.url);
      if (request.method === "POST") {
        requests.push({ method: "POST", fields: Object.fromEntries(new URLSearchParams(request.postData)) });
        await network.send("Fetch.fulfillRequest", {
          requestId, responseCode: 302,
          responseHeaders: [
            { name: "Location", value: "https://script.googleusercontent.com/macros/echo?frontend-verification=1" },
            { name: "Access-Control-Allow-Origin", value: "*" },
          ], body: "",
        });
      } else if (target.hostname === "script.googleusercontent.com") {
        requests.push({ method: request.method, redirect: true });
        await network.send("Fetch.fulfillRequest", {
          requestId, responseCode: 200,
          responseHeaders: [
            { name: "Content-Type", value: "application/json" },
            { name: "Access-Control-Allow-Origin", value: "*" },
          ], body: Buffer.from(JSON.stringify({ status: "success" })).toString("base64"),
        });
      } else if (target.origin === new URL(url).origin) {
        await network.send("Fetch.continueRequest", { requestId });
      } else {
        await network.send("Fetch.failRequest", { requestId, errorReason: "BlockedByClient" });
      }
    } catch {
      errors.push("Network interception failed");
      await network.send("Fetch.failRequest", { requestId, errorReason: "BlockedByClient" }).catch(() => {});
    }
  });
  await network.send("Fetch.enable", { patterns: [{ urlPattern: "*", requestStage: "Request" }] });
  const source = fs.readFileSync("src/App.jsx", "utf8");
  const defaults = runInNewContext("(" + source.match(/const initialFormState = (\{[\s\S]*?\n\});/)[1] + ")");
  const data = {
    ...defaults,
    englishName: "Preview Contract Test", gender: "Male", dob: "2000-01-15",
    phone: "012345678", email: "test@example.com", nationality: "Cambodian",
    height: "175", weight: "65", address: "123 Test Street", country: "China",
    emergencyContact: "Test Parent", emergencyPhone: "012345679", relationship: "Parent",
    branch: "Olympic", schedule: "Saturday - Sunday 9:00 - 11:00 AM", belt: "White",
    medicalConditions: "None", medications: "None", pastInjuries: "None", otherSports: "None",
    liabilityWaiver: true, privacyPolicy: true, mediaPrivacy: true,
    howHear: "Other", signature: "Preview Contract Test",
  };
  await context.addInitScript(({ data }) => {
    localStorage.setItem("infinity-registration-draft-v1", JSON.stringify({
      version: 1, savedAt: Date.now(), data, step: 5, lang: "en",
      scheduleGroup: "", classTime: "", submissionUncertain: false,
    }));
  }, { data });
  const browserMessages = [];
  page.on("console", (message) => {
    if (message.type() === "error") browserMessages.push(message.text());
  });
  page.on("requestfailed", (request) => browserMessages.push(request.url() + ": " + request.failure()?.errorText));
  const response = await page.goto(url, { waitUntil: "networkidle" });
  const headers = response.headers();
  assert.equal(headers["x-content-type-options"], "nosniff");
  assert.equal(headers["x-frame-options"], "DENY");
  assert.ok(headers["content-security-policy"].includes("frame-ancestors 'none'"));
  assert.ok(!headers["content-security-policy"].includes("unsafe-inline"));
  await page.locator('[data-action="continue-draft"]').click();
  await page.locator("#signature").waitFor();
  await page.locator('.form-navigation button[type="submit"]').click();
  await page.locator("dialog").waitFor();
  if (!await page.locator("dialog .result-symbol.success").count())
    throw new Error("Mock redirect failed: " + browserMessages.map((message) => message.slice(0, 180)).join("; "));
  await page.locator("dialog .result-symbol.success").waitFor();
  assert.equal(requests.length, 2);
  assert.equal(requests[0].method, "POST");
  assert.equal(requests[1].method, "GET");
  assert.deepEqual(Object.keys(requests[0].fields).sort(), Object.keys(defaults).sort());
  assert.equal(requests[0].fields.parentConsent, "N/A");
  assert.equal(requests[0].fields.height, "175");
  assert.equal(requests[0].fields.weight, "65");
  assert.equal(await page.evaluate(() => localStorage.getItem("infinity-registration-draft-v1")), null);
  assert.deepEqual(errors, []);
  const results = [
    "Actual Vite preview serves production security headers and starts without runtime exceptions",
    "URL-encoded registration follows a simulated Google cross-origin redirect from POST to GET under production CSP/CORS",
    "All 34 registration keys stay compatible; confirmed success clears the saved draft",
  ];
  for (const result of results) console.log("PASS", result);
  const artifactDir = process.env.FRONTEND_ARTIFACT_DIR || ".frontend-check";
  fs.mkdirSync(artifactDir, { recursive: true });
  fs.writeFileSync(path.join(artifactDir, "serving-verification.json"), JSON.stringify({
    checkedAt: new Date().toISOString(), results, interceptedPosts: 1, runtimeErrors: errors,
  }, null, 2));
  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
main().catch(async (error) => {
  console.error(error);
  if (browser) await browser.close();
  if (server) server.httpServer.close();
  process.exitCode = 1;
});
