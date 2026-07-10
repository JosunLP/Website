# Owner Actions Required

Information only the site owner can provide or verify. Placeholders in
page content look like `[[OWNER: …]]` and are intentionally visible so
they cannot ship unnoticed. **None of this information was invented.**

Data carried over from the previous site (please confirm still correct):
name (Jonas Pfalzgraf), postal contact (Postfach 7222, 22831 Norderstedt),
e-mail (`info@josunlp.de`, `support@josunlp.de`), GitHub (`JosunLP`),
Ko-fi (`ko-fi.com/josunlp`).

## 1. Imprint (`src/content/pages/legal.ts` → `IMPRINT`)

- [ ] Confirm whether a PO box suffices as a serviceable address
      (ladungsfähige Anschrift) or add a street address.
- [ ] Add a telephone number, or remove that line if not required.
- [ ] Confirm the responsible person for editorial content.
- [ ] Add VAT ID / register court / register number if applicable,
      otherwise delete the section.

## 2. Privacy policy (`PRIVACY`)

- [ ] Name the hosting provider; document log retention and the
      data-processing agreement (AVV), if applicable.
- [ ] Document the e-mail provider and mail retention practice.
- [ ] Name the competent data-protection supervisory authority.
- [ ] Confirm the described processing matches reality (no analytics, no
      cookies, local-only preferences).

## 3. Accessibility statement (`ACCESSIBILITY`)

- [ ] Perform manual tests (keyboard-only, at least one screen reader)
      and document results/limitations.
- [ ] Confirm `info@josunlp.de` as the barrier-report channel.
- [ ] Update the review date after each substantive site change.

## 4. Legal review checklist (before go-live)

- [ ] Have imprint and privacy policy reviewed (owner and, where
      appropriate, qualified legal counsel) — the shipped pages are
      **draft templates** and say so via a visible notice.
- [ ] Remove or reword the draft notice
      (`legalDraftNotice` in `src/locales/{de,en}.ts`) only after that
      review.
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

## 6. Accessibility review checklist (recurring)

- [ ] Keyboard-only pass over all pages (focus visible, no traps, menu
      Escape works).
- [ ] Screen-reader pass (NVDA/VoiceOver): landmarks, headings, link
      purpose, live announcements on the blog index/article shell.
- [ ] Zoom 200% and 400% reflow check.
- [ ] `prefers-reduced-motion` and dark/light contrast spot checks.
- [ ] Re-run `npm run test:a11y` and `npm run validate` after content or
      design changes.
