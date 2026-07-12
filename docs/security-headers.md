# Security Headers

Recommended headers for static hosting of josunlp.de. Ready-to-review
configurations: [`examples/hosting/.htaccess`](../examples/hosting/.htaccess)
and [`examples/hosting/nginx.conf`](../examples/hosting/nginx.conf).

## Content-Security-Policy

```
default-src 'none';
script-src 'self' 'sha256-nTPhegqmvrjZuRuiDtWRYUA0nsamNqLzG7buGcTJGsk=' 'sha256-Cg72eV8ns/6Pzyj/3F54zd4u7PgJMW20RqQ2y8pRR1Y=' 'sha256-+AXE/MttZEXsreUSecYA2V2pvWAOimYV8hZuNKsbvWA=';
style-src 'self';
img-src 'self' data:;
font-src 'self';
connect-src 'self';
manifest-src 'self';
base-uri 'none';
form-action 'none';
frame-ancestors 'none'
```

Rationale:

- **No `unsafe-inline`, no `unsafe-eval`.** All scripts and styles are
  self-hosted files. The only exceptions are three tiny inline snippets
  in the document head — the theme bootstrap (prevents a wrong-theme
  flash), the view-transition direction tagging (directional page
  transitions), and the speculation rules JSON (prefetch/prerender for
  near-instant navigation); all are byte-stable and allowed via their
  SHA-256 hashes.
- The hashes are derived from `src/features/theme/theme-init.ts`,
  `src/features/navigation/view-transition-types.ts`, and
  `src/features/navigation/speculation-rules.ts`. After any change to one
  of the snippets, recompute and update host config + this file:

  ```bash
  bun run generate:csp-hash
  ```

- `connect-src 'self'` covers the blog's manifest/Markdown fetches.
- `img-src data:` allows small inline data URIs; drop it if none are
  used.
- `frame-ancestors 'none'` is the modern clickjacking protection
  (supersedes `X-Frame-Options`).

## Other headers

| Header                      | Value                                                  | Note                                                     |
| --------------------------- | ------------------------------------------------------ | -------------------------------------------------------- |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains`                  | Only once HTTPS is confirmed; consider preload later     |
| `X-Content-Type-Options`    | `nosniff`                                              | Always                                                   |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`                      | Balanced default; `no-referrer` is stricter if preferred |
| `Permissions-Policy`        | `camera=(), microphone=(), geolocation=(), payment=()` | The site uses none of these                              |

## Caching

- `/assets/*` (hashed): `Cache-Control: public, max-age=31536000, immutable`
- HTML, `/content/*`, sitemaps, `robots.txt`: `Cache-Control: no-cache`
  (revalidate — required so manually uploaded blog content appears
  promptly)

## Verification

After deployment, verify with `curl -sI https://josunlp.de/de/` and a
scanner such as securityheaders.com. Watch the browser console for CSP
violations on: home, blog index, a built article, and an uploaded
(client-rendered) article.
