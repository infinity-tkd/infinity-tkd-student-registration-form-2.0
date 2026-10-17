export async function registerOfflineShell() {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.register(
      import.meta.env.BASE_URL + "sw.js",
      { scope: import.meta.env.BASE_URL, updateViaCache: "none" },
    );
    const announceReady = () => {
      if (registration.active)
        window.dispatchEvent(new Event("infinity:offline-ready"));
    };
    announceReady();
    registration.addEventListener("updatefound", () => {
      registration.installing?.addEventListener("statechange", announceReady);
    });
    navigator.serviceWorker.addEventListener("controllerchange", announceReady);
    await navigator.serviceWorker.ready;
    announceReady();
  } catch {
    /* Draft recovery still works when offline caching is unavailable. */
  }
}
