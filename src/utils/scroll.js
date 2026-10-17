// Delegate motion to the browser so wheel, touch, and trackpad input stay native.
export function focusAndScroll(target, { block = "nearest" } = {}) {
  if (!target?.isConnected) return;

  target.focus({ preventScroll: true });
  const context = target.closest(".form-field") || target;
  const rect = context.getBoundingClientRect();
  const viewport = window.visualViewport;
  const inset = 24;
  const top = (viewport?.offsetTop || 0) + inset;
  const bottom =
    (viewport?.offsetTop || 0) +
    (viewport?.height || window.innerHeight) -
    inset;

  // A visible error needs focus, without pulling the page away from the user.
  if (block === "nearest" && rect.top >= top && rect.bottom <= bottom) return;

  const delta =
    block === "start" || rect.height > bottom - top || rect.top < top
      ? rect.top - top
      : rect.bottom - bottom;

  if (Math.abs(delta) < 2) return;
  window.scrollTo({
    top: Math.max(0, window.scrollY + delta),
    left: window.scrollX,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
  });
}
