# Owner Actions Required

Information only the site owner can provide or verify. **None of this
information was invented.**

Items still open are empty paragraphs in
`src/content/pages/legal.ts`. The renderer drops an empty paragraph, and
any section left without one, so an open item is _absent_ from the live
page rather than shipping as a heading with nothing under it. Absent is
not the same as answered — this checklist is what tracks them, and
`tests/legal.test.ts` guards the rendering.

Data carried over from the previous site (please confirm still correct):
name (Jonas Pfalzgraf), postal contact (Postfach 7222, 22831 Norderstedt),
e-mail (`info@josunlp.de`, `support@josunlp.de`), GitHub (`JosunLP`),
Ko-fi (`ko-fi.com/josunlp`).

## 1. Imprint (`src/content/pages/legal.ts` → `IMPRINT`)

- [ ] Confirm whether a PO box suffices as a serviceable address
      (ladungsfähige Anschrift) or add a street address.
- [ ] Add a telephone number, or leave it out if not required.
- [ ] **Empty section** "VAT / register entries": add the VAT ID and
      register details, or delete the section outright if none apply.
      It currently does not render.

## 2. Privacy policy (`PRIVACY`)

- [ ] **Empty paragraph** in "Hosting and server log files": name the
      hosting provider, and document log retention and the
      data-processing agreement (AVV) if applicable.
- [ ] Document the e-mail provider and mail retention practice.
- [ ] Name the competent data-protection supervisory authority.
- [ ] Confirm the described processing matches reality (no analytics, no
      cookies, local-only preferences).

## 3. Accessibility statement (`ACCESSIBILITY`)

- [ ] Perform manual tests (keyboard-only, at least one screen reader)
      and document results/limitations.
- [ ] Confirm `info@josunlp.de` as the barrier-report channel.
- [ ] Update `reviewedAt` after each substantive site change.

## 4. Legal review checklist (before go-live)

- [ ] Have imprint and privacy policy reviewed (owner and, where
      appropriate, qualified legal counsel). The shipped pages have not
      been reviewed by counsel.
- [ ] Verify both language versions of all legal pages match in meaning
      (the English versions are convenience translations).
- [ ] Confirm the copyright/license statements match the actual site
      content and third-party assets.
- [ ] Re-check whether any future feature (analytics, comments, forms,
      embeds) triggers consent requirements **before** enabling it —
      see the consent notes in the privacy policy and architecture docs.

## 5. Hosting

- [ ] Apply the rewrite + security headers
      ([deployment.md](deployment.md), [security-headers.md](security-headers.md)).
- [ ] Enable HSTS only after HTTPS is confirmed.
- [ ] Decide whether `profile.josunlp.de` and other legacy links should
      redirect to the new site.

## 6. Repository / deployment secrets

- [ ] Set `FTP_SERVER`, `FTP_USERNAME`, and `FTP_PASSWORD` as repository
      secrets — `.github/workflows/build_deploy.yml` deploys with them on
      every push to `main`.
- [ ] Confirm `server-dir: website/` in that workflow matches the web
      root on the target host.
- [ ] Merge the release branch into `main`: the deploy workflow only runs
      on pushes to `main`, so nothing ships until it lands there.
- [ ] `LICENSE` reads `Copyright (c) 2024`. Decide whether to leave the
      year of first publication or widen it.

## 7. Project licence claims (`src/content/projects.ts`)

Checked against each repository on 2026-08-11. Two entries do not match
what the repository actually says, and only you can resolve them —
either by changing the repository or by changing the claim:

- [ ] **planning-poker** — the site states `license: 'MIT'`, but the
      repository has no licence file on any branch, so GitHub reports
      none. Without one the code is "all rights reserved" by default and
      the site's claim is not backed by anything. Add a licence file, or
      correct the entry.
- [ ] **sort-it-now** — the site states `license: 'See repository'`; the
      repository ships a **Non-Commercial Source License (NCSL) v1.0**.
      Naming it outright would be more useful than the pointer, and it is
      worth checking against the "MIT-like licences" phrasing in the
      about page (`src/locales/{de,en}.ts` → `about.ossText`) and the
      README, which NCSL is not.

The other six entries (bQuery, ThreadTS Universal, UserScriptProject-
Template, BrowserExtensionTemplate, checkai, retro-rumble) carry MIT on
both sides and match.

## 8. Accessibility review checklist (recurring)

- [ ] Keyboard-only pass over all pages (focus visible, no traps, menu
      Escape works).
- [ ] Screen-reader pass (NVDA/VoiceOver): landmarks, headings, link
      purpose, live announcements on the blog index/article shell.
- [ ] Zoom 200% and 400% reflow check.
- [ ] `prefers-reduced-motion` and dark/light contrast spot checks.
- [ ] Re-run `bun run test:a11y` and `bun run validate` after content or
      design changes.
