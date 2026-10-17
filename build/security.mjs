export function securityPolicy({ development = false, endpoint = "" } = {}) {
  const connections = [
    "'self'",
    "https://script.google.com",
    "https://script.googleusercontent.com",
  ];
  if (endpoint) {
    const url = new URL(endpoint);
    if (url.protocol !== "https:" || url.username || url.password || url.hash)
      throw new Error(
        "The registration endpoint must be an HTTPS URL without embedded credentials.",
      );
    if (!connections.includes(url.origin)) connections.push(url.origin);
  }
  if (development) connections.push("ws://localhost:*", "ws://127.0.0.1:*");
  return [
    "default-src 'none'",
    "base-uri 'none'",
    "object-src 'none'",
    `script-src 'self'${development ? " 'unsafe-inline'" : ""}`,
    "script-src-attr 'none'",
    `style-src 'self'${development ? " 'unsafe-inline'" : ""}`,
    "style-src-attr 'none'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src ${connections.join(" ")}`,
    "frame-src https://maps.google.com https://www.google.com",
    "form-action 'none'",
    "worker-src 'self'",
    "manifest-src 'self'",
  ].join("; ");
}

export function securityHeaders(options = {}) {
  return {
    "Content-Security-Policy":
      securityPolicy(options) + "; frame-ancestors 'none'",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), hid=(), bluetooth=(), clipboard-read=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    ...(options.development
      ? {}
      : { "Strict-Transport-Security": "max-age=31536000" }),
  };
}

export function securityPlugin(options) {
  const policy = securityPolicy(options);
  return {
    name: "infinity-browser-security",
    transformIndexHtml: {
      order: "post",
      handler: () => [
        {
          tag: "meta",
          attrs: { "http-equiv": "Content-Security-Policy", content: policy },
          injectTo: "head-pre",
        },
        {
          tag: "meta",
          attrs: { name: "referrer", content: "no-referrer" },
          injectTo: "head-pre",
        },
      ],
    },
    generateBundle() {
      const headers = securityHeaders({ ...options, development: false });
      this.emitFile({
        type: "asset",
        fileName: "_headers",
        source:
          "/*\n" +
          Object.entries(headers)
            .map(([key, value]) => `  ${key}: ${value}`)
            .join("\n") +
          "\n",
      });
      this.emitFile({
        type: "asset",
        fileName: "security-headers.json",
        source: JSON.stringify(headers, null, 2),
      });
    },
  };
}
