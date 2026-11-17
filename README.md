# Firearm Reference Catalog

A Next.js site that shows a searchable catalog of firearms, built from data collected by scraper scripts.

## Pages

- **Home:** hero section and introduction
- **Firearms:** the full catalog with search and filters
- **Category:** firearms grouped by category
- **Firearm detail:** one page per firearm

## Data

- `data/guns.json` holds the catalog data used by the site.
- `scripts/` contains the scrapers. Each scraper in `scripts/scrapers/` collects listings from one source, and `scripts/scrape.mjs` runs them.

Check each source's terms of use before running a scraper, and keep request rates low.

## Tech stack

- Next.js (App Router) and React
- GSAP for animations

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run scrape` | Run the data scrapers |
