# Shaikh Amir Hussain — Portfolio

A distinctive, animated, SEO-optimized personal portfolio for **Shaikh Amir Hussain**
(*mthedatawizard*) — Dubai-based Data Analyst & AI Builder.

**Live:** https://amir9078.github.io

---

## Design

A warm **editorial "data-almanac / broadsheet"** aesthetic — deliberately different from the
generic dark-neon AI portfolio. Bone-paper background, graph-paper grid + grain texture,
oversized Fraunces serif headlines, JetBrains Mono data labels, and a single signal-vermilion accent.

- **Type:** Fraunces (display) · Schibsted Grotesk (UI/body) · JetBrains Mono (data)
- **Motion:** self-drawing SVG career chart, count-up stats, staggered scroll reveals,
  kinetic headline, custom crosshair cursor, magnetic buttons, animated ticker — all
  gated behind `prefers-reduced-motion`.
- **Stack:** hand-written HTML/CSS/vanilla JS. **No build step, no frameworks, no dependencies.**

## Tech / SEO

- Semantic HTML5, correct heading hierarchy, skip link, ARIA labels, focus states.
- `<title>`, meta description/keywords, canonical, theme-color.
- Open Graph + Twitter Card tags with a 1200×630 social image.
- **JSON-LD structured data** (`schema.org`): `Person`, `WebSite`, and `SoftwareApplication` (Draftly).
- `sitemap.xml`, `robots.txt`, `site.webmanifest`, `.nojekyll`.
- Fast: preconnected fonts with `display=swap`, deferred JS, IntersectionObserver-driven animation.

## Files

```
index.html            # home — overview with summaries + "view full" links
about.html            # full bio, journey, philosophy
work.html             # detailed project case studies (#draftly #confidential-role #hsi #nexford)
experience.html       # every role, point-by-point: problem → solution → tools
tools.html            # full toolkit with how I use each + proficiency
assets/styles.css     # design system + all styles (shared across pages)
assets/main.js        # interactions (vanilla JS, shared)
assets/amir-logo.svg  # standalone AmiR wordmark
assets/favicon.svg    # monogram favicon
assets/og-image.svg   # 1200×630 social-share image
assets/gallery/       # drop photos here (see gallery/README.txt)
site.webmanifest robots.txt sitemap.xml .nojekyll
```

The site is multi-page: the **home page** carries animated summaries of each
section; the header links to dedicated **detail pages** (About / Work / Experience /
Tools) that expand each one fully. Header, footer, CSS and JS are shared across pages.

## Deploy (GitHub Pages)

This repo is named `amir9078.github.io`, so GitHub Pages serves it at the root domain:

1. Push to the `main` branch (already done).
2. **Settings → Pages → Build and deployment → Source: “Deploy from a branch”**, Branch: `main` / `root`.
3. Wait ~1 min — the site is live at **https://amir9078.github.io**.

## Customise

- **Email / phone:** search `shaikhamirhussain2000@gmail.com` and `971552991024` to change.
- **Domain:** if you add a custom domain, update the URLs in `index.html` (`canonical`, `og:url`,
  `og:image`, JSON-LD), `sitemap.xml`, and `robots.txt`, and add a `CNAME` file.
- **Profile photo:** the About section uses an `A·H` monogram. To use a photo, replace the
  `.portrait .frame` block in `index.html` with `<img src="assets/portrait.jpg" alt="Shaikh Amir Hussain">`.
- **Social image (optional, recommended):** LinkedIn/X render PNG most reliably. Open
  `assets/og-image.svg` in a browser, export/screenshot at **1200×630**, save as
  `assets/og-image.png`, and point the `og:image` / `twitter:image` tags at the `.png`.
- **Master's in AI:** add your institution name in the Credentials section once confirmed.

---

© Shaikh Amir Hussain. Built in Dubai.
