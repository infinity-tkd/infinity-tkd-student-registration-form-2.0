// Uses a local static server plus intercepted API responses. No live POSTs are sent.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const root = path.resolve("dist");
const headers = JSON.parse(
  fs.readFileSync(path.join(root, "security-headers.json"), "utf8"),
);
const key = "infinity-registration-draft-v1";
const logs = [];
const pass = (message) => {
  logs.push(message);
  console.log("PASS", message);
};
let browser, server;
let workerOverride;

async function main() {
  server = http.createServer((req, res) => {
    let name;
    try {
      name = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    } catch {
      res.writeHead(400);
      res.end();
      return;
    }
    if (name === "/attack.html") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end('<!doctype html><iframe src="/"></iframe>');
      return;
    }
    if (name.startsWith("/registration/"))
      name = name.slice("/registration".length);
    const file = path.resolve(
      root,
      "." + (name === "/" ? "/index.html" : name),
    );
    if (
      !file.startsWith(root + path.sep) ||
      !fs.existsSync(file) ||
      fs.statSync(file).isDirectory()
    ) {
      console.log("Missing local asset", name);
      res.writeHead(404);
      res.end();
      return;
    }
    const type =
      {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".woff2": "font/woff2",
        ".webmanifest": "application/manifest+json",
        ".json": "application/json",
      }[path.extname(file)] || "application/octet-stream";
    res.writeHead(200, {
      ...headers,
      "Content-Type": type,
      "Cache-Control": "no-store",
    });
    res.end(name === "/sw.js" && workerOverride ? workerOverride : fs.readFileSync(file));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const url = "http://127.0.0.1:" + server.address().port + "/";
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const errors = [],
    posts = [];
  let responseType = "success";
  const monitor = (target) => target.on("page", (page) =>
    page.on("pageerror", (error) => errors.push(error.message)),
  );
  monitor(context);
  await context.route("**/*", async (route) => {
    // Intercept every POST, regardless of the configured endpoint. Tests must
    // never write to a live registration service, even after configuration edits.
    if (route.request().method() !== "POST") {
      if (new URL(route.request().url()).origin !== new URL(url).origin)
        return route.abort();
      return route.continue();
    }
    posts.push(route.request().postData());
    return route.fulfill({
      headers: { "Access-Control-Allow-Origin": "*" },
      contentType:
        responseType === "malformed" ? "text/html" : "application/json",
      body:
        responseType === "malformed"
          ? "<html>Temporary outage</html>"
          : JSON.stringify({
              status: responseType === "success" ? "success" : "error",
            }),
    });
  });
  let page = await context.newPage();
  page.setDefaultTimeout(15000);
  const response = await page.goto(url, { waitUntil: "networkidle" });
  assert.equal(response.headers()["x-content-type-options"], "nosniff");
  assert.ok(
    response.headers()["content-security-policy"].includes("frame-ancestors 'none'"),
  );
  assert.equal(
    await page.locator('meta[http-equiv="Content-Security-Policy"]').count(),
    1,
  );
  await page.waitForFunction(() => navigator.serviceWorker.controller, null, {
    timeout: 30000,
  });
  await page.evaluate(() => navigator.serviceWorker.ready);
  pass(
    "Real HTTP security headers, production CSP, service-worker activation, and complete offline shell",
  );

  await page.evaluate(() => {
    window.__injected = false;
    const script = document.createElement("script");
    script.textContent = "window.__injected = true";
    document.head.append(script);
  });
  assert.equal(await page.evaluate(() => window.__injected), false);
  const blocked = await page.evaluate(async () => {
    try {
      await fetch("https://unapproved.example/security-test");
      return false;
    } catch {
      return true;
    }
  });
  assert.ok(blocked);
  pass("CSP blocks injected inline script and unapproved network destinations");
  const framingPage = await context.newPage();
  await framingPage.goto(url + "attack.html", { waitUntil: "networkidle" });
  assert.equal(
    await framingPage.frameLocator("iframe").locator(".app-shell").count(),
    0,
  );
  await framingPage.close();
  pass(
    "HTTP framing policy prevents the registration form from loading inside an iframe",
  );

  const choose = async (id, search) => {
    await page.locator("#" + id).click();
    if (search) await page.locator("#" + id).fill(search);
    await page
      .locator("#" + id + '-listbox [role="option"]')
      .first()
      .click();
  };
  const next = () =>
    page.locator('.form-navigation button[type="submit"]').click();
  await page.locator("#englishName").fill("Recovery Test");
  await page.locator("#khmerName").fill("សុខ ដារ៉ា");
  await page.locator("#gender").selectOption("Male");
  await page.locator("#dob").fill("2000-01-15");
  await choose("nationality", "Cambodian");
  await page.locator("#school").fill("Example School 中文");
  await page.locator("#phone").fill("012345678");
  await page.locator("#email").fill("recovery@example.com");
  await page.locator("#address").fill("Example address");
  await choose("country", "China");
  await page.locator("#height").fill("175");
  await page.locator("#weight").fill("65");
  await page.locator("#school").fill('=IMPORTXML("https://example.com")');
  await next();
  await page.waitForFunction(() => document.activeElement?.id === "school");
  assert.ok(await page.locator("#school-error").isVisible());
  await page.locator("#school").fill("Example School 中文");
  await next();
  await page.locator("#emergencyContact").fill("陈 明");
  await page.locator("#emergencyPhone").fill("012345678");
  await choose("relationship", "Parent");
  await page.locator(".optional-section summary").click();
  await page.locator("#medicalNotes").fill("Recovery test — ខ្មែរ 中文; < 5 mg; > 2 hours");
  assert.equal(
    await page.locator("#medicalNotes").inputValue(),
    "Recovery test — ខ្មែរ 中文; < 5 mg; > 2 hours",
  );
  await page.locator("#allergies").fill("None");
  await next();
  await page.locator("#branch-kouk").check();
  await choose("scheduleGroup", "Tuesday");
  await choose("classTime", "6:00");
  await choose("belt", "White");
  await context.setOffline(true);
  await page.locator(".connection-banner").waitFor();
  await next();
  for (const id of [
    "medicalConditions",
    "medications",
    "pastInjuries",
    "otherSports",
  ])
    await page.locator("#" + id).fill("None");
  await next();
  for (const id of ["liabilityWaiver", "privacyPolicy", "mediaPrivacy"])
    await page.locator("#" + id).check();
  await page.locator("#howHear").selectOption("Other");
  await page.locator("#signature").fill("Recovery Test");
  await page.waitForFunction(
    (key) =>
      JSON.parse(localStorage.getItem(key) || "{}").data?.signature ===
      "Recovery Test",
    key,
  );
  const snapshot = await page.evaluate((key) => localStorage.getItem(key), key);
  assert.ok(
    await page.locator('.form-navigation button[type="submit"]').isDisabled(),
  );
  await page.close();
  page = await context.newPage();
  page.setDefaultTimeout(15000);
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.locator('[data-action="continue-draft"]').click();
  await page.locator("#signature").waitFor();
  assert.equal(await page.locator("#signature").inputValue(), "Recovery Test");
  assert.ok(
    (await page.locator(".review-section").innerText()).includes("175 cm"),
  );
  assert.ok(
    (await page.locator(".review-section").innerText()).includes(
      "Recovery test — ខ្មែរ 中文; < 5 mg; > 2 hours",
    ),
  );
  assert.ok(
    (await page.locator(".review-section").innerText()).includes("Tuesday"),
  );
  assert.equal(posts.length, 0);
  pass(
    "Offline completion, tab close/reopen, all-field recovery, health notes, schedule, step, and no automatic POST",
  );
  await page.close();
  page = await context.newPage();
  page.setDefaultTimeout(15000);
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.locator('[data-action="discard-draft"]').click();
  assert.equal(await page.locator("#englishName").inputValue(), "");
  await page.waitForFunction((key) => localStorage.getItem(key) === null, key);
  pass("Recovery offers Start over and deletes the saved draft");

  await context.setOffline(false);
  await page.evaluate(
    ({ key, snapshot }) => localStorage.setItem(key, snapshot),
    { key, snapshot },
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.locator('[data-action="continue-draft"]').click();
  responseType = "error";
  await next();
  await page.locator("dialog").waitFor();
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#signature").inputValue(), "Recovery Test");
  responseType = "malformed";
  const beforeErrorRetry = posts.length;
  await next();
  await page.locator("dialog .retry-confirmed").waitFor();
  assert.equal(posts.length, beforeErrorRetry);
  await page.locator("dialog .retry-confirmed").click();
  await page.locator("dialog .retry-confirmed").waitFor();
  assert.equal(posts.length, beforeErrorRetry + 1);
  await page.waitForFunction(
    (key) => JSON.parse(localStorage.getItem(key)).submissionUncertain,
    key,
  );
  const beforeReconnect = posts.length;
  await context.setOffline(true);
  await context.setOffline(false);
  assert.equal(posts.length, beforeReconnect);
  await page.keyboard.press("Escape");
  await next();
  assert.equal(posts.length, beforeReconnect);
  responseType = "success";
  await page.locator("dialog .retry-confirmed").click();
  await page.locator("dialog .result-symbol.success").waitFor();
  assert.equal(posts.length, beforeReconnect + 1);
  assert.equal(
    await page.evaluate((key) => localStorage.getItem(key), key),
    null,
  );
  await page.locator("dialog .button-primary").click();
  pass(
    "Server rejection/malformed responses preserve entries, reconnect never replays POSTs, explicit retry succeeds and clears the draft",
  );

  await page.locator("#englishName").fill("Immediate Close");
  await page.close();
  page = await context.newPage();
  page.setDefaultTimeout(15000);
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.locator('[data-action="continue-draft"]').click();
  assert.equal(
    await page.locator("#englishName").inputValue(),
    "Immediate Close",
  );
  await page.getByRole("button", { name: "Start over", exact: true }).click();
  await page.locator('[data-action="confirm-start-over"]').click();
  assert.equal(await page.locator("#englishName").inputValue(), "");
  pass(
    "Immediate tab closure flushes the latest edit; active-form Start over asks before deleting",
  );

  // Seed fixtures from a static same-origin page after the form has flushed.
  // Otherwise its pagehide handler correctly replaces a manually seeded draft.
  await page.goto(url + "offline.html", { waitUntil: "domcontentloaded" });
  await page.evaluate((key) => localStorage.setItem(key, "{invalid"), key);
  await page.goto(url, { waitUntil: "domcontentloaded" });
  assert.equal(await page.locator('[data-action="continue-draft"]').count(), 0);
  assert.equal(await page.locator("#englishName").inputValue(), "");
  await page.goto(url + "offline.html", { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ({ key, snapshot }) => {
      const record = JSON.parse(snapshot);
      record.data.dob = "2000-02-31";
      localStorage.setItem(key, JSON.stringify(record));
    },
    { key, snapshot },
  );
  await page.goto(url, { waitUntil: "networkidle" });
  await page.locator('[data-action="continue-draft"]').click();
  const beforeInvalidDate = posts.length;
  await next();
  assert.equal(await page.locator("#dob").getAttribute("aria-invalid"), "true");
  await page.waitForFunction(() => document.activeElement.id === "dob");
  assert.equal(await page.evaluate(() => document.activeElement.id), "dob");
  assert.equal(posts.length, beforeInvalidDate);
  await page.locator(".draft-controls .text-button").click();
  await page.locator('[data-action="confirm-start-over"]').click();
  pass("Invalid restored calendar dates block submission, show an error, and receive focus");
  const cacheRequests = await page.evaluate(async () => {
    const entries = [];
    for (const name of await caches.keys())
      for (const request of await (await caches.open(name)).keys())
        entries.push({ url: request.url, method: request.method });
    return entries;
  });
  assert.ok(cacheRequests.length > 10);
  assert.ok(
    cacheRequests.every(
      (request) =>
        request.method === "GET" &&
        request.url.startsWith(url) &&
        !request.url.includes("script.google"),
    ),
  );
  pass(
    "Corrupted drafts fail safely; offline cache contains only local static GET resources",
  );

  for (const language of ["km", "zh"]) {
    await page.locator("#langSwitcher").selectOption(language);
    await page.locator("#englishName").fill("Language Recovery");
    await page.close();
    page = await context.newPage();
    page.setDefaultTimeout(15000);
    await page.goto(url, { waitUntil: "domcontentloaded" });
    assert.notEqual(
      await page.locator('[data-action="continue-draft"]').innerText(),
      "Continue registration",
    );
    await page.locator('[data-action="continue-draft"]').click();
    assert.equal(await page.locator("#langSwitcher").inputValue(), language);
    assert.equal(
      await page.locator("#englishName").inputValue(),
      "Language Recovery",
    );
    await page.locator(".draft-controls .text-button").click();
    await page.locator('[data-action="confirm-start-over"]').click();
  }
  pass(
    "Khmer and Chinese recovery prompts restore language and entries; formula-like school inputs are blocked",
  );
  const denied = await browser.newContext();
  monitor(denied);
  await denied.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException("Blocked", "QuotaExceededError");
    };
  });
  const deniedPage = await denied.newPage();
  await deniedPage.goto(url, { waitUntil: "networkidle" });
  await deniedPage.locator("#englishName").fill("Still Usable");
  await deniedPage.locator(".draft-warning").waitFor();
  assert.equal(
    await deniedPage.locator("#englishName").inputValue(),
    "Still Usable",
  );
  await denied.close();
  const nested = await browser.newContext();
  monitor(nested);
  const nestedPage = await nested.newPage();
  await nestedPage.goto(url + "registration/", { waitUntil: "networkidle" });
  await nestedPage.waitForFunction(() => navigator.serviceWorker.controller, null, {
    timeout: 30000,
  });
  await nested.setOffline(true);
  await nestedPage.reload({ waitUntil: "domcontentloaded" });
  await nestedPage.locator("#englishName").waitFor();
  await nested.close();
  const updating = await browser.newContext();
  monitor(updating);
  await updating.route("**/*", (route) =>
    route.request().method() === "POST" ? route.abort() : route.continue(),
  );
  let updatePage = await updating.newPage();
  await updatePage.goto(url, { waitUntil: "networkidle" });
  await updatePage.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 30000 });
  await updatePage.locator("#englishName").fill("Update Continuity");
  await updatePage.evaluate(() => {
    window.__controllerChanges = 0;
    navigator.serviceWorker.addEventListener("controllerchange", () => window.__controllerChanges++);
  });
  workerOverride = fs.readFileSync(path.join(root, "sw.js"), "utf8").replace(
    /const CACHE = PREFIX \+ '[^']+';/,
    "const CACHE = PREFIX + 'production-update-check';",
  );
  await updatePage.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
  await updatePage.waitForFunction(async () => !!(await navigator.serviceWorker.getRegistration()).waiting, null, { timeout: 30000 });
  assert.equal(await updatePage.locator("#englishName").inputValue(), "Update Continuity");
  assert.equal(await updatePage.evaluate(() => window.__controllerChanges), 0);
  let waitingWorker;
  for (const worker of updating.serviceWorkers()) {
    if ((await worker.evaluate("CACHE")).endsWith("production-update-check"))
      waitingWorker = worker;
  }
  assert.ok(waitingWorker);
  await waitingWorker.evaluate(() => {
    self.__activationCheck = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Worker did not activate after closing its clients")), 30000);
      self.addEventListener("activate", () => {
        clearTimeout(timer);
        resolve(true);
      }, { once: true });
    });
  });
  await updatePage.close();
  // Reopening immediately can retain an old controlled document and legitimately
  // keep the update waiting. Let the closed-client activation start first.
  await waitingWorker.evaluate(() => self.__activationCheck);
  updatePage = await updating.newPage();
  await updatePage.goto(url, { waitUntil: "networkidle" });
  await updatePage.waitForFunction(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    return registration?.active?.state === "activated" && !registration.waiting;
  }, null, { timeout: 30000 });
  await updatePage.locator('[data-action="continue-draft"]').click();
  assert.equal(await updatePage.locator("#englishName").inputValue(), "Update Continuity");
  await updating.setOffline(true);
  await updatePage.reload({ waitUntil: "domcontentloaded" });
  await updatePage.locator('[data-action="continue-draft"]').click();
  assert.equal(await updatePage.locator("#englishName").inputValue(), "Update Continuity");
  await updatePage.waitForFunction(async () =>
    (await caches.keys()).filter((name) => name.startsWith("infinity-registration:")).length === 1,
  );
  const updatedCaches = await updatePage.evaluate(() => caches.keys());
  assert.equal(updatedCaches.filter((name) => name.startsWith("infinity-registration:")).length, 1, JSON.stringify(updatedCaches));
  assert.ok(updatedCaches[0].endsWith("production-update-check"));
  await updating.close();
  pass("A deployed worker update waits for the open form, preserves its draft, activates after tab closure, cleans old caches, and reopens offline");
  assert.deepEqual(errors, []);
  pass(
    "Storage denial stays usable, subdirectory deployment works offline, and no app runtime exceptions",
  );
  const artifactDir = process.env.FRONTEND_ARTIFACT_DIR || ".frontend-check";
  fs.mkdirSync(artifactDir, { recursive: true });
  fs.writeFileSync(
    path.join(artifactDir, "offline-verification.json"),
    JSON.stringify(
      { results: logs, interceptedPosts: posts.length, runtimeErrors: errors },
      null,
      2,
    ),
  );
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
main().catch(async (error) => {
  console.error(error);
  if (browser) await browser.close();
  if (server) server.close();
  process.exitCode = 1;
});
