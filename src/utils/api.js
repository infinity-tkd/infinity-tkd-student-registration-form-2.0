export class RegistrationError extends Error {
  constructor(code, uncertain = false) {
    super(code);
    this.name = "RegistrationError";
    this.code = code;
    this.uncertain = uncertain;
  }
}

export function registrationEndpoint(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.hash)
      throw new Error("Invalid endpoint");
    return url.href;
  } catch {
    throw new RegistrationError("configuration");
  }
}

export async function submitRegistration(
  endpoint,
  payload,
  { timeoutMs = 20000, onSending = () => {} } = {},
) {
  const url = registrationEndpoint(endpoint);
  if (navigator.onLine === false) throw new RegistrationError("offline");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let sent = false;
  try {
    onSending();
    sent = true;
    const response = await fetch(url, {
      method: "POST",
      body: new URLSearchParams(payload),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      credentials: "omit",
      referrerPolicy: "no-referrer",
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) throw new RegistrationError("server", true);
    let result;
    try {
      result = await response.json();
    } catch {
      throw new RegistrationError("response", true);
    }
    if (
      !result ||
      typeof result !== "object" ||
      !["success", "error"].includes(result.status)
    )
      throw new RegistrationError("response", true);
    // Even a hardened backend can lose a response after a durable write.
    // Preserve the explicit retry guard for uncertain submission outcomes.
    if (result.status !== "success") throw new RegistrationError("rejected", true);
    return result;
  } catch (error) {
    if (error instanceof RegistrationError) throw error;
    throw new RegistrationError(
      error?.name === "AbortError"
        ? "timeout"
        : navigator.onLine === false
          ? "offline"
          : "network",
      sent,
    );
  } finally {
    clearTimeout(timeout);
  }
}
