# Venture Notes — Victor Ade-Oduntan

A small, dependency-free static site: one home page plus per-write-up article
pages. Dark "Nocturne" look, live generative canvases, and seeded generative
artwork on every post card. No framework, no build step — the folder is served
as-is.

## Structure

```
index.html                                  home page
posts/emerging-data-layer-in-healthcare.html   article (Trends)
posts/wesabi-10-years-at-seed.html              article (Post-Mortem)
assets/styles.css                           one shared stylesheet
assets/site.js                              one shared script (card data + canvases)
assets/victor.jpg                           portrait
favicon.svg  robots.txt  sitemap.xml
```

## Adding a write-up

1. Copy an existing file in `posts/` and replace the eyebrow, `<h1>`, byline,
   and the paragraphs inside `.article-body`. (The first `<p>` is the lede —
   keep the `lede` class on it.) Give it a real `<title>` and meta description.
2. Add one object to the `POSTS` array at the top of
   [`assets/site.js`](assets/site.js):

   ```js
   { section: "trends", seed: 205, badge: "Trends",
     title: "…", meta: "Aug 2026 · …", byline: "Victor",
     href: "posts/your-file.html" },
   ```

   - `section` picks the grid (`trends`, `watchlist`, `postmortems`) and the
     card artwork motif.
   - `seed` is any integer — it keeps the card's generated art stable across
     reloads and unique per card.
   - `href: null` renders a non-clickable "Coming soon" card.
3. Add a `<url>` entry to `sitemap.xml`.

That's it — no build, no other edits.

## Design fidelity

Colors, type, spacing, and the four canvas routines (cover power-law bars,
whole-page cap-table orbits, and the seeded per-card radar / peak-and-fall /
market-curve motifs) are ported verbatim from the design handoff. Every word of
copy is intentional and reproduced exactly.

## Accessibility & motion

- Keyboard focus rings on every link and button; skip-to-content link.
- Decorative canvases are `aria-hidden`; the portrait carries alt text.
- `prefers-reduced-motion` pauses every canvas loop (rendering one static
  frame) and skips the scroll reveals.

## Local preview

Any static server works, e.g.:

```bash
npx serve .
```

Then open the printed URL. There is nothing to compile.

## Deploy

See [`DEPLOY.md`](DEPLOY.md) for the GitHub + Vercel steps.
