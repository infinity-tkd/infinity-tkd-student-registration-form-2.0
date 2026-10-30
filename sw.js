
const SCOPE = new URL(self.registration.scope);
const PREFIX = 'infinity-registration:' + encodeURIComponent(SCOPE.pathname) + ':';
const CACHE = PREFIX + '89a5547e331d3a6e';
const FILES = ["index.html","theme-init.js","offline.html","offline.css","manifest.webmanifest","Logo/infinity-mark.svg","icons/icon-192.png","icons/icon-512.png","assets/index-CGCKWsmP.js","assets/react-vendor-CnQ8cts2.js","assets/rolldown-runtime-Bh1tDfsg.js","assets/geist-cyrillic-ext-wght-normal-DjL33-gN.woff2","assets/geist-cyrillic-wght-normal-BEAKL7Jp.woff2","assets/geist-latin-ext-wght-normal-DC-KSUi6.woff2","assets/geist-latin-wght-normal-BgDaEnEv.woff2","assets/geist-vietnamese-wght-normal-6IgcOCM7.woff2","assets/index-C8QUAO9s.css","assets/kantumruy-pro-khmer-wght-normal-BlBI3kBv.woff2","assets/kantumruy-pro-latin-wght-normal-C3EWfIgW.woff2","assets/noto-sans-sc-100-wght-normal-DluiXYzi.woff2","assets/noto-sans-sc-101-wght-normal-CPkZHnw0.woff2","assets/noto-sans-sc-102-wght-normal-gzIulUH6.woff2","assets/noto-sans-sc-103-wght-normal-CJfSBxFo.woff2","assets/noto-sans-sc-104-wght-normal-B3QMglgE.woff2","assets/noto-sans-sc-105-wght-normal-xXh_OMfk.woff2","assets/noto-sans-sc-106-wght-normal-B9n3jMjP.woff2","assets/noto-sans-sc-107-wght-normal-D7fvVprN.woff2","assets/noto-sans-sc-108-wght-normal-J0_LhxVo.woff2","assets/noto-sans-sc-109-wght-normal-Dsp-De_0.woff2","assets/noto-sans-sc-110-wght-normal-DE_6NUrb.woff2","assets/noto-sans-sc-111-wght-normal-C4S-TlTn.woff2","assets/noto-sans-sc-112-wght-normal-BcFuP3w6.woff2","assets/noto-sans-sc-113-wght-normal-Dk932kmj.woff2","assets/noto-sans-sc-114-wght-normal-CO_5Xo-i.woff2","assets/noto-sans-sc-115-wght-normal-BWy07H14.woff2","assets/noto-sans-sc-116-wght-normal-B4HVAfHo.woff2","assets/noto-sans-sc-117-wght-normal-siZzFqgK.woff2","assets/noto-sans-sc-118-wght-normal-xhBB7f6V.woff2","assets/noto-sans-sc-119-wght-normal-Ck_g2FGz.woff2","assets/noto-sans-sc-21-wght-normal-D0x9-yBt.woff2","assets/noto-sans-sc-22-wght-normal-BBUVTShg.woff2","assets/noto-sans-sc-23-wght-normal-Du1oYWkE.woff2","assets/noto-sans-sc-24-wght-normal-CmWjJ0gt.woff2","assets/noto-sans-sc-25-wght-normal-BFHiqilg.woff2","assets/noto-sans-sc-26-wght-normal-C0sF2Z2f.woff2","assets/noto-sans-sc-27-wght-normal-COFdrquJ.woff2","assets/noto-sans-sc-28-wght-normal-DMgdNu1o.woff2","assets/noto-sans-sc-29-wght-normal-Cmq8em30.woff2","assets/noto-sans-sc-30-wght-normal-CZWqZ3yU.woff2","assets/noto-sans-sc-31-wght-normal-Wfi_lutW.woff2","assets/noto-sans-sc-32-wght-normal-BRJQ4PY5.woff2","assets/noto-sans-sc-33-wght-normal-CUVQXNAJ.woff2","assets/noto-sans-sc-34-wght-normal-Bspba0wC.woff2","assets/noto-sans-sc-35-wght-normal-K8fX_YPG.woff2","assets/noto-sans-sc-36-wght-normal-CkITyjoT.woff2","assets/noto-sans-sc-37-wght-normal-WCZ2zfEe.woff2","assets/noto-sans-sc-38-wght-normal-DeM7CUce.woff2","assets/noto-sans-sc-39-wght-normal-BMZNLWQU.woff2","assets/noto-sans-sc-40-wght-normal-BQ5xpS5j.woff2","assets/noto-sans-sc-41-wght-normal-Hthm7FFi.woff2","assets/noto-sans-sc-42-wght-normal-eaS2gKds.woff2","assets/noto-sans-sc-43-wght-normal-o-T53XXV.woff2","assets/noto-sans-sc-44-wght-normal-BJH5J4Ez.woff2","assets/noto-sans-sc-45-wght-normal-BKuxSCOJ.woff2","assets/noto-sans-sc-46-wght-normal-BR_5Mu6e.woff2","assets/noto-sans-sc-47-wght-normal-CyY7gKNX.woff2","assets/noto-sans-sc-48-wght-normal-BNMfTR6k.woff2","assets/noto-sans-sc-49-wght-normal-DX-0y7wg.woff2","assets/noto-sans-sc-5-wght-normal-CfWugllB.woff2","assets/noto-sans-sc-50-wght-normal-DAOGW-Dr.woff2","assets/noto-sans-sc-51-wght-normal-BlFLOjcP.woff2","assets/noto-sans-sc-52-wght-normal-OZjrybnw.woff2","assets/noto-sans-sc-53-wght-normal-CwyWNT6x.woff2","assets/noto-sans-sc-54-wght-normal-DM0nRe18.woff2","assets/noto-sans-sc-55-wght-normal-DBK2wUOR.woff2","assets/noto-sans-sc-56-wght-normal-C-VKK1LS.woff2","assets/noto-sans-sc-57-wght-normal-Cdbfh5kq.woff2","assets/noto-sans-sc-58-wght-normal-CflMKARZ.woff2","assets/noto-sans-sc-59-wght-normal-BS4Kwzxx.woff2","assets/noto-sans-sc-6-wght-normal-ChnZIQfQ.woff2","assets/noto-sans-sc-60-wght-normal-B7QOYsXJ.woff2","assets/noto-sans-sc-61-wght-normal-C8JjQS7w.woff2","assets/noto-sans-sc-62-wght-normal-bS4wq1Gg.woff2","assets/noto-sans-sc-63-wght-normal-BJr8P-OB.woff2","assets/noto-sans-sc-64-wght-normal-DVB11t7j.woff2","assets/noto-sans-sc-65-wght-normal-DMPCXBvK.woff2","assets/noto-sans-sc-66-wght-normal-BobaG10V.woff2","assets/noto-sans-sc-67-wght-normal-Dzk7WhCR.woff2","assets/noto-sans-sc-68-wght-normal-DGbCD9xu.woff2","assets/noto-sans-sc-69-wght-normal-Ctrv1EqA.woff2","assets/noto-sans-sc-70-wght-normal-RgTO941D.woff2","assets/noto-sans-sc-71-wght-normal-D9sG-CWv.woff2","assets/noto-sans-sc-72-wght-normal-C4oWy3ul.woff2","assets/noto-sans-sc-73-wght-normal-B1ZoOTgM.woff2","assets/noto-sans-sc-74-wght-normal-F7dH_rZJ.woff2","assets/noto-sans-sc-75-wght-normal-Cp2wp4si.woff2","assets/noto-sans-sc-76-wght-normal-B494D7xS.woff2","assets/noto-sans-sc-77-wght-normal-B3MVY9Ax.woff2","assets/noto-sans-sc-78-wght-normal-5jX7iNMC.woff2","assets/noto-sans-sc-79-wght-normal-BIoZy8fr.woff2","assets/noto-sans-sc-80-wght-normal-Bje1Fxy1.woff2","assets/noto-sans-sc-81-wght-normal-B2NN7Qi3.woff2","assets/noto-sans-sc-82-wght-normal-CUggNZi4.woff2","assets/noto-sans-sc-83-wght-normal-99rD8YO-.woff2","assets/noto-sans-sc-84-wght-normal-zMBmUocm.woff2","assets/noto-sans-sc-85-wght-normal-CjI3qdxG.woff2","assets/noto-sans-sc-86-wght-normal-BHY8TVEH.woff2","assets/noto-sans-sc-87-wght-normal-DioZSHnU.woff2","assets/noto-sans-sc-88-wght-normal-BXYxwf2t.woff2","assets/noto-sans-sc-89-wght-normal-ClMFrFaL.woff2","assets/noto-sans-sc-90-wght-normal-BnOlPreP.woff2","assets/noto-sans-sc-91-wght-normal-DTr9RQcS.woff2","assets/noto-sans-sc-99-wght-normal-BI6XPoxp.woff2","assets/noto-sans-sc-cyrillic-wght-normal-BGmsQlw-.woff2","assets/noto-sans-sc-latin-ext-wght-normal-DuJTpTg_.woff2","assets/noto-sans-sc-latin-wght-normal-DDW8mKAR.woff2","assets/noto-sans-sc-vietnamese-wght-normal-Bi3ATJ76.woff2","assets/wght-DVw6VJdz.css"].map(path => new URL(path, SCOPE).href);
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
