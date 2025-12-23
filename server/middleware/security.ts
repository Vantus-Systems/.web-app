export default defineEventHandler((event) => {
  // Security Headers
  setResponseHeader(event, "X-Content-Type-Options", "nosniff");
  setResponseHeader(event, "X-Frame-Options", "DENY");
  setResponseHeader(event, "X-XSS-Protection", "1; mode=block");
  setResponseHeader(
    event,
    "Referrer-Policy",
    "strict-origin-when-cross-origin",
  );

  // Content Security Policy (Basic)
  // Adjust this based on actual needs (e.g. Google Maps, Analytics, Fonts)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://*.google.com https://*.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https://*.googleapis.com https://*.gstatic.com",
    "font-src 'self' https://fonts.gstatic.com",
    "frame-src 'self' https://challenges.cloudflare.com https://www.google.com",
    "connect-src 'self' https://challenges.cloudflare.com",
  ];

  setResponseHeader(event, "Content-Security-Policy", csp.join("; "));
  setResponseHeader(
    event,
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );
});
