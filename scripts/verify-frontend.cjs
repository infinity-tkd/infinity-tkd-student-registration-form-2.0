// Runs against dist with all application requests intercepted: never submits live registrations.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const results = [];
const record = (message) => {
  results.push(message);
  console.log("PASS", message);
};
const root = process.cwd();
const artifactDir =
  process.env.FRONTEND_ARTIFACT_DIR || path.join(root, ".frontend-check");
fs.mkdirSync(artifactDir, { recursive: true });
let browser;

async function main() {
  // Backend hardening is covered separately; preserve browser fields and datasets.
  execFileSync("git", [
    "diff",
    "--exit-code",
    "--",
    "fetch_locations.js",
    "src/data/locations.js",
    "src/data/schools.js",
  ]);
  const original = execFileSync("git", ["show", "HEAD:src/App.jsx"], {
    encoding: "utf8",
  });
  const current = fs.readFileSync("src/App.jsx", "utf8");
  const normalized = (source) =>
    source.replace(/['"\s]/g, "").replace(/,([}\]])/g, "$1");
  const apiSource = fs.readFileSync("src/utils/api.js", "utf8");
  const { backendHarness } = await import("./helpers/backend-harness.mjs");
  const { relationshipList } = await import("../src/data/relationships.js");
  const { reliabilityCopy } = await import("../src/data/reliability.js");
  assert.match(apiSource, /method:\s*['"]POST['"]/);
  assert.match(apiSource, /new URLSearchParams\(payload\)/);
  assert.match(apiSource, /application\/x-www-form-urlencoded/);
  assert.match(current, /import\.meta\.env\.VITE_GAS_WEB_APP_URL/);
  const initialState = (source) =>
    source.match(/const initialFormState = \{[\s\S]*?\n\};/)[0];
  assert.equal(
    normalized(initialState(current)),
    normalized(initialState(original)),
  );
  record(
    "Datasets, browser request URL/method/encoding, and all payload keys unchanged",
  );

  const { pathToFileURL } = require("node:url");
  const { interfaceCopy } = await import(
    pathToFileURL(path.join(root, "src/data/interface.js"))
  );
  const { i18n } = await import(
    pathToFileURL(path.join(root, "src/data/translations.js"))
  );
  for (const lang of ["km", "zh"]) {
    assert.deepEqual(
      Object.keys(interfaceCopy[lang]).sort(),
      Object.keys(interfaceCopy.en).sort(),
    );
    assert.deepEqual(
      Object.keys(i18n[lang]).sort(),
      Object.keys(i18n.en).sort(),
    );
  }
  record("Complete English, Khmer, and Chinese translation key parity");

  browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
    colorScheme: "dark",
    timezoneId: "Asia/Phnom_Penh",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const runtimeErrors = [];
  const network = [];
  const posts = [];
  let responseType = "success";
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  await page.route("**/*", async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (req.method() === "POST") {
      posts.push(Object.fromEntries(new URLSearchParams(req.postData())));
      if (responseType === "network") return route.abort("failed");
      const backendResult = responseType === "success" ? backendHarness({blank:true}).request(posts.at(-1)) : null;
      if (backendResult) assert.equal(backendResult.status, "success", `Real form payload rejected by backend: ${backendResult.code}`);
      return route.fulfill({
        headers: { "Access-Control-Allow-Origin": "*" },
        json:
          responseType === "success"
            ? backendResult
            : responseType === "validation"
              ? { status: "error", code: "invalid_fields", uncertain: false }
              : { status: "error", message: "Simulated error" },
      });
    }
    if (url.hostname !== "infinity.test") return route.abort();
    const file = path.join(
      root,
      "dist",
      url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname),
    );
    assert.ok(file.startsWith(path.join(root, "dist")));
    if (!fs.existsSync(file))
      return route.fulfill({ status: 404, body: "Not found" });
    network.push(url.pathname);
    const ext = path.extname(file);
    return route.fulfill({
      path: file,
      contentType: {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".svg": "image/svg+xml",
        ".woff2": "font/woff2",
      }[ext],
    });
  });
  const next = () =>
    page.locator('.form-navigation button[type="submit"]').click();
  const choose = async (id, query, exactLabel) => {
    const input = page.locator("#" + id);
    await input.click();
    if (query) await input.fill(query);
    const option = exactLabel
      ? page
          .locator("#" + id + "-listbox")
          .getByRole("option", { name: exactLabel, exact: true })
      : page.locator("#" + id + '-listbox [role="option"]').first();
    const label = await option.innerText();
    await option.click();
    return label;
  };
  const heading = async (step) => {
    await page.waitForFunction(
      (expected) =>
        document.querySelector(".step-heading h2")?.textContent ===
        expected + ".",
      interfaceCopy[await page.locator("#langSwitcher").inputValue()].steps[
        step - 1
      ],
    );
  };
  const fresh = async (lang) => {
    await page.goto("http://infinity.test/", { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });
    await page.locator("#langSwitcher").selectOption(lang);
    await heading(1);
  };
  const personal = async ({ minor = false, cambodia = false } = {}) => {
    await page.locator("#englishName").fill("Sok Dara");
    await page.locator("#khmerName").fill("សុខ ដារ៉ា");
    await page.locator("#gender").selectOption("Male");
    await page.locator("#dob").fill(minor ? "2015-01-15" : "2000-01-15");
    await choose("nationality", "Cambodian");
    await page.locator("#phone").fill("+855 12 345 678");
    assert.equal(await page.locator("#phone").inputValue(), "85512345678");
    await page.locator("#email").fill("test@example.com");
    await page.locator("#address").fill("123 Test Street");
    await page.locator("#height").fill("175");
    await page.locator("#weight").fill("65");
    if (cambodia) {
      await choose("city", "Phnom Penh");
      await choose("district");
      await choose("commune");
      await page.locator("#school").fill("Independent Test School");
      await page.locator("#school").press("Enter");
    } else await choose("country", "China");
  };
  const emergency = async (minor) => {
    await page.locator("#emergencyContact").fill("陈 明");
    await page.locator("#emergencyPhone").fill("012345678");
    if (minor) await choose("relationship", "Aunt");
    else {
      await page.locator("#relationship").fill("Older cousin");
      await page.locator("#relationship").press("Enter");
    }
    if (minor)
      assert.equal(await page.locator("#relationship-listbox").count(), 0);
  };
  const training = async (olympic) => {
    await page.locator(olympic ? "#branch" : "#branch-kouk").check();
    if (!olympic) {
      await choose("scheduleGroup", "Tuesday");
      await choose("classTime", "6:00");
    }
    await choose("belt", "White");
  };
  const health = async (lang) => {
    for (const name of [
      "medicalConditions",
      "medications",
      "pastInjuries",
      "otherSports",
    ])
      await page
        .locator("#" + name)
        .fill({ en: "None", km: "គ្មាន", zh: "无" }[lang]);
  };

  await fresh("en");
  assert.equal(
    await page.locator("html").evaluate((el) => el.classList.contains("dark")),
    false,
  );
  record("Fresh visitors default to light mode even with a dark OS preference");
  await next();
  await page.waitForFunction(
    () => document.activeElement?.id === "englishName",
  );
  assert.equal(
    await page.locator("#englishName").getAttribute("aria-invalid"),
    "true",
  );
  record(
    "Empty-step validation announces errors and focuses the first invalid field",
  );
  await personal({ cambodia: true });
  assert.ok(await page.locator("#height").isVisible());
  assert.ok(await page.locator("#weight").isVisible());
  assert.equal(await page.locator("#height").getAttribute("required"), "");
  assert.equal(await page.locator("#weight").getAttribute("required"), "");
  await page.locator("#height").fill("");
  await next();
  await page.waitForFunction(() => document.activeElement?.id === "height");
  assert.ok(await page.locator("#height-error").isVisible());
  await page.locator("#height").fill("400");
  await next();
  await page.waitForFunction(() => document.activeElement?.id === "height");
  await page.locator("#height").fill("175");
  await page.locator("#weight").fill("");
  await next();
  await page.waitForFunction(() => document.activeElement?.id === "weight");
  assert.ok(await page.locator("#weight-error").isVisible());
  await page.locator("#weight").fill("300");
  await next();
  await page.waitForFunction(() => document.activeElement?.id === "weight");
  await page.locator("#weight").fill("65");
  await next();
  await heading(2);
  record(
    "Height and weight are visible and required; missing or out-of-range values block progression and receive focus",
  );
  await emergency(false);
  await next();
  await heading(3);
  await page.locator("#branch-kouk").check();
  await choose("scheduleGroup", "Tuesday");
  await choose("classTime", "6:00");
  await choose("scheduleGroup", "Saturday");
  assert.equal(await page.locator("#classTime").inputValue(), "");
  await page.locator("#branch").check();
  await page.locator("#branch-kouk").check();
  assert.equal(await page.locator("#scheduleGroup").inputValue(), "");
  assert.equal(await page.locator("#classTime").inputValue(), "");
  await training(false);
  await page
    .getByRole("button", { name: "Our dojangs", exact: true })
    .first()
    .click();
  assert.ok(await page.locator("dialog").isVisible());
  await page.keyboard.press("Tab");
  assert.ok(
    await page
      .locator("dialog")
      .evaluate((el) => el.contains(document.activeElement)),
  );
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("dialog").count(), 0);
  record(
    "Branch/day changes clear stale schedules; location dialog traps focus and closes with Escape",
  );
  await next();
  await heading(4);
  await health("en");
  await next();
  await heading(5);
  assert.ok(
    await page
      .locator(".review-section")
      .innerText()
      .then(
        (text) =>
          text.includes("Sok Dara") &&
          text.includes("Tuesday") &&
          text.includes("None"),
      ),
  );
  await page.locator(".review-row .text-button").first().click();
  await heading(1);
  assert.equal(await page.locator("#height").inputValue(), "175");
  await page.getByRole("navigation").getByRole("button").last().click();
  await heading(5);
  for (const name of ["liabilityWaiver", "privacyPolicy", "mediaPrivacy"])
    await page.locator("#" + name).check();
  await page.locator("#howHear").selectOption("Facebook");
  await page.locator("#signature").fill("Wrong Name");
  await next();
  await page.waitForFunction(() => document.activeElement?.id === "signature");
  assert.equal(posts.length, 0);
  await page.locator("#signature").fill("Sok Dara");
  await next();
  await page.locator("dialog").waitFor();
  assert.equal(posts.length, 1);
  assert.equal(
    posts[0].schedule,
    "Tuesday - Wednesday: 6:00 - 8:00 PM (General)",
  );
  assert.equal(posts[0].height, "175");
  assert.equal(posts[0].weight, "65");
  assert.equal(posts[0].school, "Independent Test School");
  assert.equal(posts[0].parentConsent, "N/A");
  assert.equal(posts[0].liabilityWaiver, "Agreed");
  assert.equal(await page.locator("dialog a.group-link").count(), 2);
  await page.locator("dialog .button-primary").click();
  await heading(1);
  assert.equal(await page.locator("#englishName").inputValue(), "");
  record(
    "Adult Cambodia/Kouk workflow, editable review, signature validation, exact payload, success groups, and form reset",
  );

  await fresh("km");
  await page.setViewportSize({ width: 390, height: 844 });
  await personal({ minor: true });
  await next();
  await heading(2);
  assert.ok(await page.locator(".info-banner.warning").isVisible());
  await page.locator("#relationship").click();
  assert.equal(
    await page.locator('#relationship-listbox [role="option"]').count(),
    relationshipList.length,
  );
  await page.locator("#relationship").press("Escape");
  await emergency(true);
  await next();
  await heading(3);
  await training(true);
  await next();
  await heading(4);
  await health("km");
  await next();
  await heading(5);
  assert.ok(await page.locator("#parentConsent").isVisible());
  for (const name of ["liabilityWaiver", "privacyPolicy", "mediaPrivacy"])
    await page.locator("#" + name).check();
  await page.locator("#howHear").selectOption("Other");
  await page.locator("#signature").fill("Sok Dara");
  await next();
  assert.equal(posts.length, 1);
  assert.equal(
    await page.locator("#parentConsent").getAttribute("aria-invalid"),
    "true",
  );
  await page.locator("#parentConsent").check();
  responseType = "error";
  await next();
  await page.locator("dialog").waitFor();
  assert.equal(posts[1].parentConsent, "Agreed");
  assert.equal(posts[1].schedule, "Saturday - Sunday 9:00 - 11:00 AM");
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#signature").inputValue(), "Sok Dara");
  record(
    "Khmer minor/Olympic workflow, expanded emergency contacts, separate required parent consent, failure modal, and preserved entries",
  );
  responseType = "network";
  const postsAfterError = posts.length;
  await next();
  await page.locator("dialog").waitFor();
  assert.equal(posts.length, postsAfterError);
  await page.locator("dialog .retry-confirmed").click();
  await page.locator("dialog .retry-confirmed").waitFor();
  assert.equal(posts.length, postsAfterError + 1);
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#signature").inputValue(), "Sok Dara");
  record("Network failure retains the completed form and offers support/retry");
  responseType = "success";
  await next();
  await page.locator("dialog").waitFor();
  const postsBeforeConfirmedRetry = posts.length;
  await page.locator("dialog .retry-confirmed").click();
  await page.waitForFunction(() =>
    document.querySelector("dialog .result-symbol.success"),
  );
  assert.equal(posts.length, postsBeforeConfirmedRetry + 1);
  await page.locator("dialog .button-primary").click();

  await fresh("zh");
  await page.setViewportSize({ width: 768, height: 1000 });
  await personal();
  await next();
  await heading(2);
  await emergency(false);
  await next();
  await heading(3);
  await training(false);
  await next();
  await heading(4);
  await health("zh");
  await next();
  await heading(5);
  for (const name of ["liabilityWaiver", "privacyPolicy", "mediaPrivacy"])
    await page.locator("#" + name).check();
  await page.locator("#howHear").selectOption("Google");
  await page.locator("#signature").fill("Sok Dara");
  responseType = "validation";
  const beforeValidation = posts.length;
  await next();
  await page.locator("dialog").waitFor();
  assert.equal(posts.length, beforeValidation + 1);
  assert.ok((await page.locator("dialog").textContent()).includes(reliabilityCopy.zh.reviewSubmission));
  assert.equal(await page.locator("dialog .retry-confirmed").count(), 0);
  await page.locator("dialog .button-primary").click();
  assert.equal(await page.locator("#signature").inputValue(), "Sok Dara");
  responseType = "success";
  await next();
  await page.locator("dialog").waitFor();
  await page.locator("dialog .button-primary").click();
  assert.equal(await page.locator("html").getAttribute("lang"), "zh-Hans");
  record(
    "Chinese workflow/custom relationship passes the backend; confirmed validation rejection preserves entries and retries without a duplicate warning",
  );

  await page.locator("#langSwitcher").selectOption("en");
  await page.locator("#nationality").focus();
  await page.locator("#nationality").fill("Cambodian");
  await page.keyboard.press("ArrowDown");
  assert.ok(
    await page.locator("#nationality").getAttribute("aria-activedescendant"),
  );
  await page.keyboard.press("Enter");
  assert.equal(await page.locator("#nationality").inputValue(), "Cambodian");
  await page.locator("#nationality").click();
  await page.locator("#nationality").fill("zzzzzzzz");
  assert.ok(
    await page.getByText("No results found", { exact: true }).isVisible(),
  );
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#nationality").inputValue(), "Cambodian");
  await page.keyboard.press("Tab");
  record(
    "Combobox search, Arrow/Enter selection, active descendant, no-results, Escape restoration, and Tab dismissal",
  );

  for (const lang of ["en", "km", "zh"]) {
    await page.locator("#langSwitcher").selectOption(lang);
    for (const theme of ["light", "dark"]) {
      if (
        (await page
          .locator("html")
          .evaluate((el) => el.classList.contains("dark"))) !==
        (theme === "dark")
      )
        await page.locator("#themeToggle").click();
      const colors = await page.evaluate(() =>
        Object.fromEntries(
          [
            "ink",
            "body",
            "muted",
            "page",
            "surface",
            "subtle",
            "accent",
            "on-accent",
          ].map((name) => [
            name,
            getComputedStyle(document.documentElement)
              .getPropertyValue("--" + name)
              .trim(),
          ]),
        ),
      );
      const luminance = (color) => {
        const hex = color.replace("#", "");
        const expanded =
          hex.length === 3
            ? hex
                .split("")
                .map((c) => c + c)
                .join("")
            : hex;
        const channels = expanded
          .match(/../g)
          .map((c) => parseInt(c, 16) / 255)
          .map((c) =>
            c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
          );
        return (
          channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
        );
      };
      for (const [foreground, background] of [
        ["ink", "surface"],
        ["body", "surface"],
        ["muted", "surface"],
        ["muted", "page"],
        ["muted", "subtle"],
        ["accent", "surface"],
        ["on-accent", "accent"],
      ]) {
        const a = luminance(colors[foreground]),
          b = luminance(colors[background]);
        assert.ok(
          (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 4.5,
          theme + ": " + foreground + " on " + background + " contrast",
        );
      }
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.evaluate(
          () =>
            new Promise((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(resolve)),
            ),
        );
        const overflow = await page.evaluate(() =>
          [...document.querySelectorAll("body *")]
            .filter(
              (el) =>
                el.getBoundingClientRect().right > innerWidth + 1 &&
                getComputedStyle(el).position !== "absolute",
            )
            .map((el) => [
              el.tagName,
              el.className,
              el.getBoundingClientRect().right,
            ]),
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
          lang +
            "/" +
            theme +
            "/" +
            width +
            " overflow: " +
            JSON.stringify(overflow),
        );
        const unnamed = await page
          .locator('input:not([type="hidden"]), textarea, select')
          .evaluateAll((elements) =>
            elements
              .filter(
                (el) =>
                  !el.labels?.length &&
                  !el.getAttribute("aria-label") &&
                  !el.getAttribute("aria-labelledby"),
              )
              .map((el) => el.id),
          );
        assert.deepEqual(unnamed, []);
      }
      await page.setViewportSize({
        width: theme === "light" ? 1440 : 390,
        height: 1000,
      });
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => {
        document.activeElement?.blur();
        window.scrollTo({ top: 0, behavior: "instant" });
      });
      await page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          ),
      );
      await page.screenshot({
        path: path.join(artifactDir, "verified-" + lang + "-" + theme + ".png"),
        fullPage: true,
        animations: "disabled",
      });
    }
  }
  record(
    "30 responsive/language/theme combinations (320–1440px), visible labels, and screenshots",
  );
  record(
    "Primary, secondary, muted, and button text colors meet 4.5:1 contrast in both themes",
  );
  await page.locator("#langSwitcher").selectOption("km");
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await page.locator("#langSwitcher").inputValue(), "km");
  assert.equal(await page.locator("html").getAttribute("class"), "dark");
  assert.equal(
    await page
      .locator("html")
      .evaluate((el) => getComputedStyle(el).scrollBehavior),
    "auto",
  );
  assert.equal(
    await page
      .locator(".step-content")
      .evaluate((el) => getComputedStyle(el).animationDuration),
    "1e-05s",
  );
  const fonts = await page.evaluate(() =>
    [...document.fonts]
      .filter((f) => f.status === "loaded")
      .map((f) => f.family),
  );
  assert.ok(fonts.some((name) => name.includes("Kantumruy")));
  assert.ok(network.some((url) => url.endsWith(".woff2")));
  assert.deepEqual(runtimeErrors, []);
  record(
    "Remembered theme/language, reduced motion, self-hosted fonts, and zero runtime exceptions",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await fresh("en");
  assert.equal(
    await page
      .locator(".welcome-art img")
      .evaluate((el) => getComputedStyle(el).animationName),
    "mark-reveal",
  );
  assert.equal(
    await page
      .locator(".registration-layout")
      .evaluate((el) => getComputedStyle(el).animationName),
    "step-in",
  );
  await personal();
  await next();
  await heading(2);
  assert.equal(
    await page
      .locator(".step-content")
      .evaluate((el) => getComputedStyle(el).animationName),
    "step-forward",
  );
  await page.locator(".form-navigation .button-secondary").click();
  await heading(1);
  assert.equal(
    await page
      .locator(".step-content")
      .evaluate((el) => getComputedStyle(el).animationName),
    "step-backward",
  );
  assert.equal(await page.locator("#height").inputValue(), "175");
  assert.equal(await page.locator("#weight").inputValue(), "65");
  assert.deepEqual(runtimeErrors, []);
  record(
    "Normal-motion entrance, forward/back transitions, and measurement preservation work alongside reduced-motion support",
  );
  assert.equal(
    await page
      .locator("html")
      .evaluate((el) => getComputedStyle(el).scrollBehavior),
    "smooth",
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator("#nationality").click();
  await page.evaluate(() => {
    const top = document
      .querySelector("#nationality")
      .getBoundingClientRect().top;
    window.scrollTo({
      top: Math.max(0, scrollY + top - 180),
      behavior: "instant",
    });
  });
  const listPagePosition = await page.evaluate(() => scrollY);
  for (let index = 0; index < 30; index++)
    await page.keyboard.press("ArrowDown");
  assert.ok(
    await page
      .locator("#nationality-listbox")
      .evaluate((el) => el.scrollTop > 0),
  );
  assert.equal(await page.evaluate(() => scrollY), listPagePosition);
  await page.keyboard.press("Escape");
  record(
    "Native smooth scroll is enabled; dropdown keyboard navigation stays inside the list without moving the page",
  );

  await page.locator("#weight").fill("");
  await page.evaluate(() =>
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "instant",
    }),
  );
  await page.evaluate(() => {
    window.__scrollCalls = [];
    window.__originalScrollTo = window.scrollTo;
    window.scrollTo = function (...args) {
      window.__scrollCalls.push(args);
      return window.__originalScrollTo.apply(window, args);
    };
  });
  await next();
  await page.waitForFunction(() => document.activeElement?.id === "weight");
  assert.deepEqual(await page.evaluate(() => window.__scrollCalls), []);
  await page.evaluate(() => {
    window.scrollTo = window.__originalScrollTo;
  });
  await page.locator("#weight").fill("65");
  await page.getByRole("navigation").getByRole("button").last().click();
  await heading(2);
  await page.waitForFunction(
    () => document.activeElement?.id === "emergencyContact",
  );
  await page.waitForFunction(() => {
    const rect = document
      .querySelector("#emergencyContact")
      .getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= innerHeight;
  });
  assert.equal(
    await page.evaluate(() => document.activeElement?.id),
    "emergencyContact",
  );
  record(
    "Visible validation errors keep their scroll position; cross-step errors receive focus without a competing heading scroll",
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.mouse.move(195, 400);
  await page.mouse.wheel(0, 360);
  await page.waitForFunction(() => scrollY > 100);
  assert.deepEqual(runtimeErrors, []);
  record(
    "Native wheel scrolling remains responsive at phone width, with no runtime errors",
  );
  fs.writeFileSync(
    path.join(artifactDir, "frontend-verification.json"),
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        results,
        postCount: posts.length,
        runtimeErrors,
        fonts,
      },
      null,
      2,
    ),
  );
  await browser.close();
}

main().catch(async (error) => {
  console.error(error);
  if (browser) await browser.close();
  process.exitCode = 1;
});
