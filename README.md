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

**Merged assets:** fields that Sodir lists separately but that are developed and known as one asset are combined into a single field in [scripts/merge-fields.js](scripts/merge-fields.js). So far this covers **Yggdrasil**, which is Hugin, Munin, Fulla and Hugin Satellitter.
- Production, investments and reserves are added together.
- Owner shares are weighted by each part's recoverable volumes.
- The field page links to each part's Sodir page.
- The deal analysis converts stakes in a part into a stake in the merged field.

## History ("Historisk")

The history page calculates each field's value over its whole life. It combines actual production and investments (Sodir) from the first year with historical prices, exchange rates and inflation, plus the model forecast for the remaining years. Every figure is in real terms at the latest CPI year. The page shows three measures:
- **Value before tax:** undiscounted, in real terms.
- **Original value:** the after-tax present value at the year of first investment, using the prices that actually occurred.
- **Real return:** the real internal rate of return before tax.

Sources (fetched by `npm run build:data` into `public/data/history.json`):

| Data | Source |
|---|---|
| Brent (USD/bbl) and European gas (USD/MMBtu), annual nominal | World Bank Commodity Price Data ("Pink Sheet"), CMO-Historical-Data-Annual.xlsx |
| USD/NOK, annual average | Norges Bank, EXR A.USD.NOK.SP |
| Inflation (real terms) | US BLS CPI-U (CPIAUCSL) via FRED, Federal Reserve Bank of St. Louis |
| Production and investments per field | Sodir FactPages (NLOD) |

Simplifications:
- **Opex:** historical operating costs use the same model as the forecast.
- **Tax:** 78% throughout. Royalty and the older tax regimes before 1992 aren't modelled.
- **Investments:** pipelines and onshore facilities aren't included in the field investments, which matters for Snøhvit, Ormen Lange and Troll.
- **NGL:** priced at 60% of Brent.

## Deals

The list of deals lives in `public/data/deals.json`. Each deal has a date, type, parties, fields, value, a source link and a written assessment.

`node scripts/evaluate-deals.js` writes `public/data/deal-metrics.json`. For each deal with an identifiable Norwegian package, it calculates:
- the stakes that changed hands (from Sodir's licence history)
- production the year before and Sodir's reserves at the time
- price per flowing barrel and per barrel of reserves
- the **value in hindsight**: actual cash flow after the deal plus the Feltverdi forecast, discounted at 8% real

The value includes the tax deductions the buyer takes over and the **buyer's synergies**:
- **Announced synergies** (`synergies` in deals.json, with sources): the low end of any stated range is used. Three forms are supported: `postTaxNpv`, booked at the deal date; `preTaxAnnual`, which runs for 10 production years from the year after the deal, after 78 % tax; and `postTaxTotal`, an undiscounted after-tax sum "over time", spread evenly over `years` (default 10) from the year after the deal and then discounted. Examples: Vår–ConocoPhillips USD 0.7 bn (NPV), Vår–Neptune USD 300 m (total over time), Aker BP–Lundin USD 200 m a year, OKEA–Wintershall USD 4 m a year.
- **Otherwise a standard rule** (`SYN_RULE` in the script): opex on the acquired stakes falls by 15 % in fields the buyer operates, or by 10 % where the buyer already held a share on the deal date (read from Sodir's licensee history, `BUYERS` regex per deal). Corporate deals add +3 %. The saving starts the year after the deal and is taken after 78 % tax.
- The yearly after-tax amounts are stored in `deal-metrics.json` (`synergy.rows`) and added to the package cash flow on the deal pages. They therefore count in the value, ratio, verdict, IRR and 8 % break-even Brent, but not in the seller's side.

Price divided by value is compared with the median for all complete deals, and that comparison gives the verdict:

| Verdict | Price/value relative to the median |
|---|---|
| Low price | below 0.8× |
| Market-level | 0.8–1.1× |
| Fully priced | 1.1–1.4× |
| High price | above 1.4× |

Each deal with metrics also has an analysis page (`#/deal/<id>`, linked from the deal cards and the ticker). It is calculated live in the browser from the assumptions bar (`stakeCashflow()` in valuation.js):
- the buyer's side: price in real terms, value received, net present value, real after-tax return on the price, and present-value payback
- the seller's side: value given up, value at the prices that applied in the deal year (flat deck), the price effect since, and the cash flow given up
- a chart of after-tax cash flow per year (actual and forecast) with cumulative present value against the price
- value against Brent with the break-even price, scenarios (low, base, high and deal-year prices, plus upside where `upside` is set in deals.json), and a sensitivity table of price deck × discount rate
- the stakes, with each one's share of the value

Fields that grew out of the seller's discoveries after the deal (for example Breidablikk, a 2019 discovery that became a field in 2021) are included using a successor method:
- find the discovery-well licences in which the seller held a share on the deal date
- find the company that took over that share at completion
- attribute the buyer's field share when the field was formed, scaled by how much of the buyer's licence share came from the seller

The calculation uses Sodir's `licence_licensee_hst` and `discovery` tables, downloaded to data/raw.

The headline compares the price with the **typical market value**: model value × the median price/value. The model undervalues every deal in the same way, so the raw net present value is shown as a secondary figure.

**Each side's own valuation** shows the buyer's highest justifiable price against the seller's lowest acceptable price, and whether the price falls inside the bargaining range. It uses:
- the buyer's required return and opex synergies
- the seller's required return

Defaults are set per deal in deals.json under `views`, with a written rationale, and users can adjust them on the page.

Swaps are defined as `legs` in SPEC (what each party gives, plus cash), and each party's net is calculated. The legs come either from fixed shares or from the change in Sodir licence shares between two dates.

To add a new deal: add it to `deals.json` and add its seller in `SPEC` in the script, then run `node scripts/evaluate-deals.js` and write the assessment.

### Automatic deal updates

A cloud routine (Claude Code, "Daily NCS deals check") searches public news every morning for new deals on the Norwegian shelf. For each new deal it adds an entry to `public/data/deals.json`, with the source link, Norwegian and English text, and an assessment of `early` or `na`. It then runs the quality check, commits and pushes to `main`, and Vercel publishes the change.

**Quality check:** `npm run validate:deals`. It is also part of `npm test`, and the routine pushes only if every test passes. It checks:
- required fields, dates and statuses
- https sources
- Norwegian and English texts
- no HTML
- no duplicate deals (same parties within 45 days)
- that verdicts calculated from the model have metrics

Field names that are not in Sodir's data are reported as warnings.

The full numerical analysis of a new deal, done with `SPEC` and `scripts/evaluate-deals.js`, needs the raw Sodir data. That data is not in the repository, so the analysis is done locally.

## Hosting (Vercel)

`vercel.json` contains the setup:
- the build command `npm run build`
- the output folder `public`
- the security headers (CSP and others), plus caching for `/vendor` and `/data`

Every push to `main` deploys automatically once the repository is connected in Vercel.

To update the data: run `npm run build:data` locally, then commit and push the changed `public/data/*.json`.

## Model (short version)

- **Production:** starts from last year's production and declines exponentially. The decline rate is the field's own observed decline over the last five years, with two limits:
  - no faster than producing exactly Sodir's remaining reserves
  - no slower than producing reserves × *reserve growth* (default ×1.6, adjustable in the assumptions bar)

  Plateau and new fields use reserves × 1.3. New fields and fields approved for development get a three-year plateau first.

  The method was calibrated on Sodir history. Backtested from 2010 and 2015, actual production divided by the forecast was 1.14 and 1.06 with this method and the facility-based costs (1.26 and 1.16 with the earlier generic costs), against 1.45 and 1.35 when fitting to reserves alone. Setting reserve growth to ×1.0 reproduces the old method.

  For plateau fields the decline after the plateau is fitted so the total is reserves × 1.3 (at least one plateau year), so it can be steep when reserves are small next to the plateau rate (Johan Sverdrup: about 16 % a year from 2027).

  Shelf check (Nov 2026): the model gives 4.13 / 4.21 / 3.25 million boe/d in 2026 / 2027 / 2030, against Sodir's forecast of about 4.1 million in 2026 and just under 3.5 million in 2030. Sodir's figures include discoveries not yet approved, which the model leaves out.
- **Prices:** oil is Brent − $1, NGL is 60% of Brent, gas is €/MWh × 1.75 × EURUSD (159 Sm³ at ~11.0 kWh, Gassco's average for delivered gas) minus a USD 2/boe Gassco transport tariff (company production costs, which opex is calibrated to, exclude transport); the tariff is deducted in historical years too. Opex and decommissioning are NOK costs, calibrated at USD/NOK 10 and scaled by 10 / USD/NOK.
- **Costs:**
  - **Opex is field-specific.** It is calculated from each field's facilities ([scripts/facilities.js](scripts/facilities.js), using Sodir's facility register and development wells).
    - Fixed annual cost (USD million):
      - Condeep 60
      - large steel platform 40
      - small platform 14
      - floater/FPSO 52
      - onshore plant 100
      - subsea template 1
      - each open platform well 1.5, each open subsea well 2.5
    - Variable cost: $1 per boe (chemicals, power, CO₂ tax and allowances), plus a $4/boe processing tariff for tie-backs without their own platform.
    - The host field receives that tariff as taxable income (`TIEBACK_HOST` in `valuation.js`, from public field descriptions), in actual years and in the forecast. It is added after the decline is set, so it can extend the host's life but does not change its decline.
    - **Hard cap:** a field's total opex is never above NOK 5 bn a year (gross, 100 % of the field; `OPEX_CAP_NOK`), converted with the assumptions' USD/NOK in forecast years and at the model's NOK-10 cost basis (USD 500 m) in actual years. In 2026 it binds for Troll, Johan Sverdrup and Ekofisk.
    - **Age profile:** there is no separate age factor; old fields cost more per boe because they have more platforms and wells for less production. 2026 median: about $8/boe for fields under 15 years old, 13 for 15–30 years, 18 for older ones (tested). Total opex never rises over time, and the economic limit ends a field when revenue no longer covers opex and 30 % of capex. Old hubs are held by the hub ceiling below.
    - **Operator factors** (`OPEX_OPERATOR`): each operator's fields are scaled so the share-weighted 2026 unit cost matches the company's reported production cost – Aker BP 7.3, Vår Energi 11.1 (2025), Equinor 6 (Norway, 20-F 2025, excl. transport), OKEA 25 (Q3 2025) $/boe; factors 1.277 / 1.048 / 1.06 / 1.435, other operators 1. Shelf opex 2026 about NOK 99 bn net of tie-back tariffs (Norsk Petroleum about 94 for 2025). Re-solve the factors if the facility constants, the cap or the hub ceiling change.
    - **Hub ceiling** (`HUB_OPEX_MAX` = $32/boe at last full-year production) for fields with their own surface facilities: old hubs' well counts include idle wells and they process fields that pay no tariff in the model. Gullfaks, Statfjord, Norne and Ula land at about $33–39/boe in 2026.
    - Fields without a facility profile use the old default by field type.
  - Capex comes from Sodir's expected future investments per field (`field_investment_expected`, the operators' own plans), spread over the production the model expects (Sodir reserves × the middle of the reserve-growth range) and bounded to $1–20 per boe. New fields spend 80 % before first production, spread evenly over the years until start-up. Sodir's figure runs from 1 January of its year (2025), so the part that belongs to years before the forecast start is left out, and years Sodir has not reported yet get an estimate in the actual-year cash flows and the tax deductions. Fields Sodir lists as producing but without production last year are treated as starting this year. Fields without a Sodir figure use their own recent investment intensity, limited to $2–12 per boe.
  - **Decommissioning is per facility.**
    - Plugging each well that is not yet permanently plugged: $8 m on a platform, $18 m subsea.
    - Removing each facility: large steel platform $250 m, small $80 m, floater $120 m, Condeep topside $300 m, subsea template $8 m.
    - The minimum is $0.5 per boe of recoverable volume.
    - The total for fields in production or under development is about $55 bn, about 60 % of it well plugging. In present-value terms this is about 7 % below the licensees' booked decommissioning provisions (Petoro, Aker BP, Vår Energi, ConocoPhillips).
- **Deal prices:** an optional `priceAdjusted` in deals.json replaces the headline price in the analysis. It is used for shares valued at completion. Tax positions bought with a company go on the value side (`taxPosition`). The page shows both prices, with sources.
- **Tax (2022 rules):** 22% corporate tax plus 71.8% special tax with 12.4% uplift, about 78% at the margin.
  - Deductions from past investments that are not yet used are counted with the rules of the investment year (`investmentDeductions()` in valuation.js):
    - before 2022: six-year depreciation in both bases plus uplift (30% until 2012, then 22% falling to 20.8%)
    - investments in 2020–21: expensed immediately with 24% uplift
    - fields with a development plan approved 2020–23 (field `approved`, from Sodir's field status history): 17.69% uplift until production starts
  - The same deductions apply in the forecast, the history page and the deals.
  - Deductions still unused when a field stops producing (past investments, and the corporate-tax depreciation of the last years' capex) are counted in the years they fall due, at the 2022 values (71.8 % special tax, 6.2 % corporate tax): tax is paid per company, so the owners use them against other income on the shelf. They are shown in the decommissioning year.
  - In a deal they follow the stake, so the value the buyer receives includes them (`taxInh` in `stakeCashflow()`).
  - Company tax positions bought with a company (losses carried forward) can be set as `taxPosition` in deals.json, with sources (Aker BP–Hess).
- **Value:** net present value after tax in real terms, discounted from 2026 (mid-year). **Tax is paid half a year later** (`TAX_LAG` = 0.5, `pvCash` in `valuation.js`): petroleum tax is paid in six instalments, three in the income year's second half and three in the next year's first half. Tax saved by deductions, the decommissioning deduction and company tax positions follow the same timing. Used everywhere: fields, companies, the history page, the deal pages and `evaluate-deals.js`. It raised the shelf value about 12 % (129 → 146 bn USD at defaults) and the deal median from 1.09 to 1.02.

## Data and licences

- **Field data:** Sokkeldirektoratet (Sodir) FactPages, under the Norwegian Licence for Open Government Data (NLOD). It must be credited as the source.
- **Base map:** Natural Earth, which is public domain. No third-party map tiles are used, so there are no API keys or traffic limits.
- **Libraries:** Chart.js (MIT), Leaflet (BSD-2), Inter (OFL).

Feltverdi gives simplified estimates and is not investment advice.
