# Security Headers

Recommended headers for static hosting of josunlp.de. Ready-to-review
configurations: [`examples/hosting/.htaccess`](../examples/hosting/.htaccess)
and [`examples/hosting/nginx.conf`](../examples/hosting/nginx.conf).

## Content-Security-Policy

```
default-src 'none';
script-src 'self' 'sha256-JgoTUGaD8rXGn7DIZfXYgLwGcgPN5F60IRGMIip6nc8=' 'sha256-mGGHE9s9bRwdg8h2oVhqn4nE52LU1aIIURx673g1Ib0=';
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
  self-hosted files. The only exceptions are two tiny inline snippets
  in the document head — the theme bootstrap (prevents a wrong-theme
  flash) and the view-transition direction tagging (directional page
  transitions); both are byte-stable and allowed via their
  SHA-256 hashes. (No Speculation Rules on purpose: hover
  prefetch/prerender intermittently swallowed nav clicks whose
  speculation was still in flight; see `src/render/layout.ts`.)
- The hashes are derived from `src/features/theme/theme-init.ts` and
  `src/features/navigation/view-transition-types.ts`. After any change
  to one of the snippets, recompute and update host config + this file:

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
