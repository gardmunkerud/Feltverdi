# Feltverdi.no

Feltverdi.no estimates the after-tax value of every oil and gas field on the Norwegian Continental Shelf. You can look at a single field or switch to company mode, which adds up a company's shares across all its fields. The site is free and public, in Norwegian and English.

- **Overview:** the value of the whole shelf, a field map, the most valuable fields, and value by sea area, product and owner.
- **Valuation, field mode:** key figures, a production history and forecast chart, an after-tax cash flow chart, and the licensees with each one's share of the value. You can value any owner's share or enter your own, override the field's assumptions, see the cash flow year by year, and export it as CSV.
- **Valuation, company mode:** total value, net production and reserves, the largest value contributors, and every field share the company owns.
- **Rankings:** fields and companies in sortable, filterable tables.
- **Method:** how the model calculates, and its limitations.
- **Global assumptions** at the top of every page: Brent, gas price (€/MWh), USD/NOK and discount rate. Everything recalculates instantly in the browser. The assumptions, field overrides, language and currency are stored locally in the browser.

## Setup

```
npm.cmd install          # also copies Chart.js, Leaflet and the Inter font into public/vendor
npm.cmd run build:data   # downloads Sodir data and the base map into public/data
npm.cmd run dev          # http://localhost:3300
npm.cmd test             # tests for the valuation engine
```

`npm run build:data -- --cache` rebuilds from the downloaded raw files in `data/raw` without fetching again.

## Architecture

The site is static. `public/` can be hosted anywhere, for example Netlify, Cloudflare Pages or GitHub Pages, as long as `npm run build:vendor` and `npm run build:data` have been run first. `server.js` is only a local development server with security headers.

```
scripts/build-data.js   fetches Sodir FactPages (CSV) → public/data/fields.json, plus Natural Earth → public/data/coast.json
scripts/copy-vendor.js  copies browser libraries from node_modules into public/vendor
public/js/valuation.js  the valuation engine (works in both the browser and Node)
public/js/app.js        the front end (hash routes: #/, #/felt/<slug>, #/selskap/<slug>, #/rangering, #/metode)
public/js/i18n.js       Norwegian and English text, plus the method page
public/css/styles.css   design (dark theme, Inter font)
tests/                  node --test
```

## Hosting (Vercel)

`vercel.json` contains the setup:
- the build command `npm run build`
- the output folder `public`
- the security headers (CSP and others), plus caching for `/vendor` and `/data`

Every push to `main` deploys automatically once the repository is connected in Vercel.

To update the data: run `npm run build:data` locally, then commit and push the changed `public/data/*.json`.

## Model (short version)

- **Production:** starts from last year's production and declines exponentially. The decline rate is fitted so that cumulative production until the economic limit equals Sodir's remaining reserves. New fields and fields approved for development get a three-year plateau first.
- **Prices:** oil is Brent − $1, NGL is 60% of Brent, gas is €/MWh × 1.72 × EURUSD.
- **Costs:**
  - Opex is 60% fixed and 40% variable, at default levels by field type.
  - Capex uses the field's own investment intensity from Sodir, limited to $2–12 per boe.
  - Decommissioning is $1 per boe of original recoverable volume.
- **Tax (2022 rules):** 22% corporate tax plus 71.8% special tax, about 78% at the margin.
- **Value:** net present value after tax in real terms, discounted from 2026.

## Data and licences

- **Field data:** Sokkeldirektoratet (Sodir) FactPages, under the Norwegian Licence for Open Government Data (NLOD). It must be credited as the source.
- **Base map:** Natural Earth, which is public domain. No third-party map tiles are used, so there are no API keys or traffic limits.
- **Libraries:** Chart.js (MIT), Leaflet (BSD-2), Inter (OFL).

Feltverdi gives simplified estimates and is not investment advice.
