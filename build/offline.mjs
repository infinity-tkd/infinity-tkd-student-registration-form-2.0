import { createHash } from "node:crypto";
import { Script } from "node:vm";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export function offlinePlugin() {
  let publicDirectory;
  return {
    name: "infinity-offline-shell",
    enforce: "post",
    configResolved(config) {
      publicDirectory = config.publicDir;
    },
    generateBundle(_options, bundle) {
      const assets = Object.keys(bundle).filter((name) =>
        /\.(?:js|css|woff2)$/.test(name),
      );
      const publicFiles = [
        "theme-init.js",
        "offline.html",
        "offline.css",
        "manifest.webmanifest",
        "Logo/infinity-mark.svg",
        "icons/icon-192.png",
        "icons/icon-512.png",
      ];
      const version = createHash("sha256")
        .update(
          Buffer.concat(
            publicFiles.map((name) =>
              readFileSync(join(publicDirectory, name)),
            ),
          ),
        )
        .update(
          assets.join("|") +
            Object.values(bundle)
              .map((item) =>
                item.type === "chunk" ? item.code : String(item.source),
              )
              .join("|"),
        )
        .digest("hex")
        .slice(0, 16);
      const shell = ["index.html", ...publicFiles, ...assets];
      const source = `
const SCOPE = new URL(self.registration.scope);
const PREFIX = 'infinity-registration:' + encodeURIComponent(SCOPE.pathname) + ':';
const CACHE = PREFIX + '${version}';
const FILES = ${JSON.stringify(shell)}.map(path => new URL(path, SCOPE).href);
const ALLOWED = new Set(FILES);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
  // Updates wait until existing tabs close; never reload a form being filled.
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) if (name.startsWith(PREFIX) && name !== CACHE) await caches.delete(name);
    await self.clients.claim();
  })());
});
async function navigation(request) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);
  try {
    const response = await fetch(request, { signal: controller.signal });
    if (response.ok) return response;
    throw new Error('Navigation unavailable');
  } catch {
    return await caches.match(new URL('index.html', SCOPE).href, { cacheName: CACHE }) || await caches.match(new URL('offline.html', SCOPE).href, { cacheName: CACHE }) || new Response('Offline', { status: 503 });
  } finally { clearTimeout(timeout); }
}
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  // Never cache or replay registrations, API responses, or third-party content.
  if (request.method !== 'GET' || url.origin !== SCOPE.origin) return;
  if (request.mode === 'navigate' && (url.pathname === SCOPE.pathname || url.pathname === new URL('index.html', SCOPE).pathname)) {
    event.respondWith(navigation(request));
  } else if (ALLOWED.has(url.href)) {
    // Reads must not recreate a retired cache while an older request finishes
    // during activation of a newer worker.
    event.respondWith(caches.match(request, { cacheName: CACHE }).then(cached => cached || fetch(request)));
  }
});
`;
      new Script(source, { filename: "sw.js" });
      this.emitFile({ type: "asset", fileName: "sw.js", source });
    },
  };
}
