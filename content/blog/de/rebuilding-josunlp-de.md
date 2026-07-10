---
title: 'josunlp.de neu gebaut: eine statische Website mit bQuery.js'
description: 'Wie diese Website funktioniert: vorgerendertes HTML, bQuery.js-Islands, eine strikte CSP und ein Markdown-Blog auf gewöhnlichem Static Hosting.'
publishedAt: '2026-07-10'
updatedAt: '2026-07-10'
slug: 'rebuilding-josunlp-de'
locale: 'de'
translationKey: 'rebuilding-josunlp-de'
tags:
  - 'TypeScript'
  - 'bQuery.js'
  - 'Open Source'
draft: false
featured: true
---

Diese Website ist ein kompletter Neubau. Die vorherige Version war ein
SvelteKit-Single-Pager; die neue besteht aus vorgerenderten HTML-Seiten
mit wenigen kleinen interaktiven Islands, gebaut auf
[bQuery.js](https://bquery.js.org/), TypeScript und Tailwind CSS.
Dieser Artikel beschreibt die Architektur und die Kompromisse.

## Ziele

Die Anforderungen waren einfach zu formulieren und angenehm streng:

- Nur statische Dateien — lauffähig auf gewöhnlichem Shared Hosting
- Zwei Sprachen (Deutsch und Englisch) mit crawlbaren, lokalisierten Routen
- Keine Tracker, keine externen Schriftarten, keine Drittanbieter-Skripte
- Ein Blog, das neue Markdown-Dateien _ohne Rebuild_ akzeptiert
- WCAG 2.2 AA als Accessibility-Ziel

## Rendering-Strategie

Jede Seite ist eine typisierte TypeScript-Funktion, die HTML zurückgibt.
Ein Build-Skript rendert alle Routen als echte `.html`-Dateien, Vite
bündelt die wenigen Client-Skripte mit gehashten Namen. Das Ergebnis ist
im besten Sinne langweilig: Inhalte sind einfach HTML, JavaScript
verbessert nur.

Interaktivität beschränkt sich auf Islands, registriert als Web
Components:

| Island                 | Aufgabe                                   |
| ---------------------- | ----------------------------------------- |
| `jp-theme-toggle`      | Hell/Dunkel/System umschalten             |
| `jp-site-nav`          | einklappbare mobile Navigation            |
| `jp-language-switcher` | speichert eine explizite Sprachwahl       |
| `jp-blog-list`         | aktualisiert die Liste aus dem Manifest   |
| `jp-blog-article`      | rendert nachträglich hochgeladene Artikel |

## Der Blog auf statischem Hosting

Die interessante Einschränkung: Neue Artikel müssen ohne Rebuild
erscheinen. Der Vertrag ist ein Ordner mit Markdown-Dateien plus ein
generiertes Manifest:

```text
/content/blog/
  index.json
  de/rebuilding-josunlp-de.md
  en/rebuilding-josunlp-de.md
```

Zum Build-Zeitpunkt bekannte Artikel werden als statisches HTML mit
vollständigen Metadaten vorgerendert. Später hochgeladene Artikel werden
über `index.json` entdeckt und clientseitig von `jp-blog-article`
gerendert:

```ts
const manifest = await new BlogManifestService(fetch).load();
const entry = BlogManifestService.findPost(manifest, locale, slug);
const post = await new MarkdownArticleService(fetch).load(entry.path);
```

> Markdown wird als nicht vertrauenswürdige Eingabe behandelt, obwohl
> ich es selbst schreibe. Alles läuft durch einen
> Allow-List-Sanitizer; rohes HTML in Markdown wird als sichtbarer Text
> gerendert, nie als Markup.

Der ehrliche Kompromiss: Nachträglich hochgeladene Artikel sind nicht
vorgerendert, ihre SEO hängt also am clientseitigen Rendering. Für
maximale Sichtbarkeit kann ein Artikel jederzeit ins Repository wandern
und mit dem nächsten Build ausgeliefert werden.

## Was bewusst fehlt

- [x] Analytics — nichts, dem man widersprechen müsste
- [x] Cookie-Banner — es wird keine einwilligungspflichtige Technik ausgeliefert
- [x] Kontaktformular — ein `mailto:`-Link braucht kein Backend
- [ ] Kommentare — vielleicht irgendwann, falls datenschutzfreundlich machbar

---

Der Quellcode ist öffentlich: Das Repository ist im Footer verlinkt.
Wenn Sie ein Problem entdecken — besonders bei der Barrierefreiheit —
freue ich mich über ein Issue.
