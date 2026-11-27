# Feltverdi – improvement log

Scheduled cloud agents improve Feltverdi in small, focused steps (one topic per run). Each run reads this file first and adds one entry when it finishes. The newest entries go at the top of the log.

## Decisions the owner has made (do not undo)

- **Costs (2026-11-27):** operating costs and decommissioning come from each field's facilities (`scripts/facilities.js`; `OPEX_FAC` and `DECOM_FAC` in `valuation.js`), calibrated against reported company production costs. Do not change the calibration constants without re-running the calibration and the decline backtest.
- **Deal baseline:** deals marked "early" are excluded from the median price/value. Adjusted prices are used where public sources give them.
- **Tax benefits in deals (2026-11-27):** the deal value includes the unused tax deductions the buyer takes over, plus company tax positions (`taxPosition`) where public. The Hess tax loss is on the value side, not taken off the price.
- **Look:** Apple.com-inspired light/dark theme, Inter font, key figures that shrink to fit their tiles.
- **Language:**
  - Norwegian bokmål and English must always be updated together (`public/js/i18n.js`).
  - The Deals section is written for non-experts: plain language first, with the proper terms kept and explained (ⓘ tooltips, the "Ord og uttrykk" glossary).
- **Decline method (approved):**
  - Each field uses its observed 5-year decline.
  - The decline is limited at one end by a fit to Sodir reserves (×1.0) and at the other by reserves × reserveGrowth (default 1.6).
  - Fields on plateau, ramping up or new use ×1.3.
  - Do not replace this method; refinements must be small and backtested.
- **Deal verdicts:** judged relative to the median price/value of comparable deals (the "typical market value"). Verdicts that need calculated metrics may only be set where `scripts/evaluate-deals.js` has produced metrics.
- **Deal pages:** each starts with "Kort fortalt" / "In short". The "Sikkerhet" (confidence) label was removed on purpose.
- **Merged asset:** Yggdrasil = Hugin + Munin + Fulla + Hugin Satellitter (`scripts/merge-fields.js`).
- **Data ownership:** `public/data/deals.json` is maintained by a separate daily deal job. Only fix clear errors in it, and always run `npm run validate:deals`.
- **Do not touch:** security headers and the content security policy (`vercel.json`, `server.js`). Do not add npm dependencies.

## Backlog: known weaknesses and ideas (pick one, keep it small)

### Financial analysis
- **Deal prices:** adjusted prices (`priceAdjusted`) exist for Aker BP–Lundin, Det norske–BP and Aker BP–Hess. Others still use the headline price; add more only with public sources.
- **Opex:** facility-based and calibrated since 2026-11-27. Possible refinements:
  - separate gas transport tariffs (Gassled)
  - tariff income for host fields: modelled since 2026-11-27 (run 2, `TIEBACK_HOST`); the $4/boe level itself is a rounded assumption
  - onshore plants that Sodir does not link to a field (Hammerfest LNG, Nyhamna)
- **Decommissioning:** per facility and well since 2026-11-27. Unit costs are rounded industry levels; refine them if Sodir or the operators publish newer figures. Timing is still one year, two years after shut-down.
- **Tax:** deductions are modelled by investment year (depreciation, uplift, the temporary package) since 2026-11-27, and deals include the deductions the buyer takes over. Remaining simplifications:
  - rules before 1992 (royalty, older rates) are not modelled
  - unused deductions are lost if a field stops before using them (in reality refunded)
  - exploration costs and company-level tax positions are only included where a deal sets `taxPosition`
- **Deal-year deck:** now explained in the scenario text; could still be improved with public forward data.
- **Bargaining-range defaults:** buyer and seller always use the same required return as the assumptions bar (8 % by default) – no per-deal rate differences (enforced by `validate-deals.js`). Extra synergies in the bargaining range default to 0; synergies in the deal value follow the announced low end or the standard rule. Review the wording and the reasoning.
- **NGL price:** NGL is priced at 60 % of Brent. Gas is priced from €/MWh with fixed conversion factors. Check that the factors are documented in the wiki and on the method page.

### Wording and explanations
- Review each page (front page, field, company, rankings, method, history, wiki, deals) for jargon a non-expert would not understand. Apply the Deals section's plain-language approach in small steps.
- Check that the English and Norwegian texts say the same thing.
- **Method page:** make sure it describes the current decline method, the typical-deal factor, the merged assets and the automatic deal updates.

### Data and correctness
- Fields with zero reserves but recent production.
- Fields where the observed decline is clamped. Is the explanation shown to the user clear?
- Company names: Sodir legal names such as "Equinor Energy AS" against brand names in deals ("Equinor").

## Overnight assumptions review (2026-11-27/28)

Ten hourly runs, one topic each, on branch `review/assumptions` (never main). Newest entry first.

- **Run 3 – Capex** (Sodir expected investments, spreading, bounds, the pre-start-up share, totals vs official forecasts)
  - **Findings**
    - *Sodir's expected investments were partly counted twice in time (bug).* Sodir's factpage gives the figure as future investments "from 2025, in 2025 NOK" (Johan Castberg: NOK 17,838 m; [Sodir factpage](https://factpages.sodir.no/en/field/PageView/All/32017325), [Norsk Petroleum](https://www.norskpetroleum.no/en/facts/field/johan-castberg/)). The yearly investment series stops at 2024 for 97 of 139 fields, and the forecast starts in 2026. So the 2025 part of the figure was charged to 2026 and later, and 2025 got no investment at all in lifetime values, deal cash flows and tax deductions.
    - *New fields put all development spend into 2026.* Yggdrasil's 80 % development share (NOK 85.6 bn) all fell in 2026, although Sodir's figure starts in 2025 (NOK 46.6 bn already reported for 2023–24).
    - *Fields that started in 2026 were delayed a year.* Symra, Ørn, Alve Nord, Eirin, Idun Nord (plus Tambar Øst and Visund Sør) are "Producing" in Sodir but had no 2025 output, so the model started them in 2027.
    - *Totals vs official figures.* Sum of Sodir's expected investments: NOK 840 bn (from 2025). Norsk Petroleum: total investments excl. exploration NOK 243 bn in 2025, estimated 230 bn in 2026 and 212 bn in 2027; this includes pipelines, onshore plants and projects not yet approved ([Norsk Petroleum, investments and costs](https://www.norskpetroleum.no/en/economy/investments-operating-costs/), [Sodir Resource Report 2026](https://www.sodir.no/en/whats-new/publications/reports/resource-report/resource-report-2026/summary/), [SSB investment survey](https://www.ssb.no/en/energi-og-industri/industri-og-bergverksdrift/statistikk/investeringer-i-olje-og-gass-industri-bergverk-og-kraftforsyning/articles/oil-investment-estimate-for-2026-upward-adjusted)). Sodir's sites are not reachable from this session; the figures come from search snippets.
    - Model capex is now NOK 111 bn in 2026 and 55 bn in 2027 (before: 189 and 60). That is well below the official 230 and 212 bn, because spreading per boe pushes most of each field's figure into later years, while the operators' real profiles are front-loaded. Estimated 2025 field spend is NOK 130 bn, against about 230 bn actual. See proposal 1.
    - Bounds kept: 6 fields at the $20/boe cap (old, small remaining volumes such as Gullfaks, Valhall, Vigdis), Troll and Ormen Lange at the $1 floor. Both look plausible.
  - **Changed**
    - `public/js/valuation.js`:
      - new `capexPlan()`: producing fields spread Sodir's figure over production from 2025 (2025 output + reserves × growth), so the 2025 part is not charged again
      - new fields spread the 80 % development share evenly from 2025 to start-up (approved fields: half in 2025, half in 2026)
      - unreported past years (2025) get that estimate in `valueHistory`, `stakeCashflow` and the tax-deduction schedule; reported years are used as they are (new `investmentsWithGap`, exported)
      - fields Sodir lists as producing but with no production last year start in the start year
    - `public/js/i18n.js` (nb + en): the method page capex bullet and the capex tooltip
    - `public/js/wiki.js` (nb + en): the capex entry, which still described the old three-year intensity method
    - `README.md`
    - `tests/valuation.test.js`: a new test covers the spread, the 2025 estimate, that a reported 2025 figure is kept, the new-field split and the start year. No existing expected value changed.
  - **Shelf value at defaults:** 126.35 → 128.27 bn USD (+1.5 %). Brent 60 / 90: 114.1 / 142.6 bn (was 112.2 / 140.7).
    - Largest field changes (USD m):
      - Yggdrasil 6843 → 7455
      - Symra 664 → 797
      - Ørn 598 → 701
      - Alve Nord 419 → 502
      - Johan Sverdrup 17285 → 17376
  - **Deal verdicts:** **deal-metrics needs regenerating.** factpages.sodir.no is still blocked. Rough check, `stakeCashflow` at 8 % from the deal year, before vs after:
    - every deal moves −1.9 % … +1.1 %
    - Aker BP–Hess −1.9 %, Vår–ConocoPhillips +1.1 %, DNO–Sval +0.5 %, Aker BP–Lundin −0.1 %
    - No verdict is expected to change.
  - **Checks:**
    - `npm test`: 19/19 pass
    - `npm run validate:deals`: OK
    - `npm run stamp`
    - i18n: 563 keys in both nb and en
    - valuation.js loads
    - `node --check` on app.js and evaluate-deals.js
    - Headless browser: front page, Yggdrasil, Symra, History, Aker BP and Deals render with no JS errors.
  - **Proposals for the owner**
    1. *Front-load producing fields' capex.* The model spends Sodir's figure evenly per boe, so near-term capex is about half the official forecast. If instead most of Sodir's figure were spent over the next 3–5 years, with a small per-boe sustaining rate after that, the shelf would fall by roughly 2–4 %. After tax a krone of capex costs only about 15–20 øre, so the effect is small. The per-field profiles behind Sodir's figure (RNB) are not public, so this needs your judgement on the shape.
    2. *Reserve growth has no capex of its own.* Sodir's figure covers the reserves. The model spreads it over reserves × 1.3, so the extra volumes from reserve growth come at no extra cost in total. Real reserve growth needs new wells. A separate rate for growth volumes, for example $5–8/boe, would cut the shelf value by a few per cent. This touches the approved capex method, so it is your decision.
    3. When Sodir publishes 2025 investments, the estimate is replaced automatically (reported years take precedence); nothing needs to be done.

- **Run 2 – Opex** (facility model vs reported company production costs and the shelf total)
  - **Findings**
    - *Company unit costs match reasonably.* Model 2025 share-weighted unit opex vs reported:
      - Aker BP 6.9 vs 7.3 $/boe ([Q4 2025 report](https://akerbp.com/wp-content/uploads/2026/02/aker-bp-2025-q4-transcript.pdf))
      - Vår Energi 12.2 vs 11.1 ([Q4 2025](https://live.euronext.com/en/products/equities/company-news/2026-02-10-var-energi-delivering-higher-production-and-more-value))
      - OKEA 25.2 vs 24.5 in Q3 and 28.8 in Q4 2025 ([OKEA Q4 2025](https://okea.no/2026/02/okea-asa-fourth-quarter-2025-financial-results/))
      - Equinor E&P Norway 6.7 vs at most 7.45. That ceiling is opex + SG&A of $3,834 m ÷ 1,410 kboe/d, which also includes some transport and overhead ([20-F 2025](https://www.sec.gov/Archives/edgar/data/1140625/000114062526000013/eqnr-20251231.htm)). Model production for Equinor (514.5 MMboe) matches the reported 1,410 kboe/d.
      - ConocoPhillips 15.4, vs about 11.7 for the EMENA segment ($962 m / 82 MMboe), which also includes low-cost Libya ([10-K 2025](https://www.sec.gov/Archives/edgar/data/0001163165/000116316526000009/cop-20251231.htm)). Inconclusive.
      - DNO 11.9, vs 9.6 group lifting cost incl. Kurdistan. Harbour group 12.8; there is no public Norway split for either.
      - Calibration kept.
    - *Shelf total is high.* Model 2025 opex is $12.0 bn, i.e. NOK 120 bn on the model's NOK-10 basis. Norsk Petroleum gives close to NOK 94 bn for 2025, excluding transport and tax ([Norsk Petroleum, investments and costs](https://www.norskpetroleum.no/en/economy/investments-operating-costs/); [Sodir Resource Report 2024](https://www.sodir.no/4969b7/globalassets/1-sodir/publikasjoner/rapporter/ressursrapporter/2024/en/resource-report-2024.pdf): opex excludes transport and tax). norskpetroleum.no is not reachable from this session; the figures come from search snippets.
    - *Tie-back tariffs were counted twice (bug).* $1.42 bn of that $12.0 bn is the $4/boe tariff that 356 MMboe of tie-back production pays to hosts. The hosts already carry their full facility cost and never received the tariff, so a cost was booked that nobody earned. At the shelf level it is an internal transfer.
    - Net of the transfers, model opex is $10.6 bn ≈ NOK 106 bn vs 94 bn (+13 %). The rest is plausibly SG&A, insurance and similar items in company production cost that Sodir leaves out. Wells are 52 % of model opex (2,470 open wells × $2.5 m); see proposal 1.
    - *Snøhvit and Ormen Lange* are flagged as tie-backs because Sodir does not link Hammerfest LNG and Nyhamna to them. Their $4/boe "tariff" stands in for their own onshore plants, so they are left out of the host list. Their opex (6.3 and 5.9 $/boe) may be low; see proposal 2.
  - **Changed**
    - `public/js/valuation.js`:
      - `TIEBACK_HOST`: 60 tie-back → host pairs, from public field descriptions (operators, Norsk Petroleum). Tie-backs to UK/Danish hosts (Rev, Trym) and Snøhvit/Ormen Lange are left out.
      - `tiebacksOf()`.
      - Hosts book the tariff as revenue, taxed at 78 %, in `valueAll` (from the tie-backs' modelled production), in `valueField` via `ov.tiebacks`, and in actual years in `valueHistory`/`stakeCashflow`.
      - The tariff is added after the decline fit, so the decline method is untouched. It can keep a host running longer: Norne 2028 → 2033, Gullfaks 2034 → 2039, both in line with the operators' life-extension plans.
      - New `tariffPv` in results; `tariff` in yearly rows, included in `rev`.
    - `public/js/app.js`: the lifetime and deal cash flows pass the tie-backs.
    - `scripts/evaluate-deals.js`: same.
    - `public/js/i18n.js`: opex tooltip and method page, nb + en.
    - `public/js/wiki.js`: opex entry, nb + en.
    - `README.md`.
    - `tests/valuation.test.js`: a new test checks that every map entry exists, that the host income equals tie-back production × tariff, that the decline is unchanged, and that `valueAll` and `valueField` agree.
    - Backlog line in this file updated.
  - **Shelf value at defaults:** 124.94 → 126.35 bn USD (+1.1 %). Brent 60 / 90: 112.2 / 140.7 bn.
    - Largest field changes (USD m):
      - Gullfaks −212 → 11
      - Kristin 672 → 821
      - Grane 418 → 545
      - Åsgard 2129 → 2235
      - Aasta Hansteen 1839 → 1940
      - Gjøa 161 → 240
      - Ekofisk 99 → 172
      - Norne −104 → −31
  - **Deal verdicts:** **deal-metrics needs regenerating.** factpages.sodir.no is still blocked, so `data/raw` is missing and `evaluate-deals.js` cannot run. Rough check: `stakeCashflow` value at 8 % from the deal year, with vs without host tariffs:
    - most deals change 0–3 %: Vår–ConocoPhillips +2.9 %, Vår–Neptune +2.5 %, Vår–ExxonMobil +1.7 %, Aker BP–Lundin +0.5 %, OKEA–Shell +2.5 %
    - Vår–DNO swap +14 %, on a small base
    - Because almost all deals move up a little together, the median baseline moves with them. No verdict is expected to change, but this is not verified.
  - **Checks:**
    - `npm test`: 18/18 pass
    - `npm run validate:deals`: OK
    - `npm run stamp`
    - i18n: 563 keys in both nb and en
    - valuation.js loads
    - `node --check` on app.js, wiki.js and evaluate-deals.js
    - Headless browser: the Gullfaks field page, the Equinor company page and two deal pages render with no JS errors.
  - **Proposals for the owner**
    1. Net of transfers, the shelf opex is still about 13 % above Norsk Petroleum's NOK 94 bn. The largest single term is $2.5 m per open well (52 % of opex). Lowering it to about $2.0 m and raising the platform constants to keep the company calibration would cut the shelf total towards NOK 95–100 bn. This changes the calibration, so re-run the calibration and the backtest. Together with run 1's proposal (`FX_COST_REF` 10.39), check both against company production costs in one go.
    2. Snøhvit (Hammerfest LNG) and Ormen Lange (Nyhamna) carry only $4/boe for their onshore plants. Hammerfest LNG is a large, power-intensive plant. Consider linking the onshore plants (an `onshore` facility, $100 m/yr) to these fields in `build-data.js` once Sodir data is reachable.
    3. The $4/boe processing tariff is a rounded level for all hosts. NCS processing tariffs are negotiated per host and are not public, so keep it unless a public source appears.
    4. A tie-back can outlive its host in the model, while in reality the host's shut-down ends both. Coupling the shut-down dates would need a joint simulation; not done.

- **Run 1 – Prices** (oil, NGL, gas conversion and tariff, USD/NOK, real terms, CPI)
  - **Findings**
    - *US CPI 2025 was wrong (bug).* `history.json` had 2025 = 295.1, below 2024 (313.7). BLS never published October 2025 (government shutdown) and says the 2025 average is the mean of the 11 published months ([BLS FAQ](https://www.bls.gov/cpi/additional-resources/2025-federal-government-shutdown-impact-cpi-faq.htm)). `build-data.js` read the empty FRED value as 0 and divided by 12. Correct value 295.132 × 12/11 = 321.96. Effect: every actual-year 2025 amount (lifetime values, deal cash flows) was inflated by about 9 % in real terms.
    - *Gas energy factor slightly low.* Gassco delivered 1,295 TWh from 117.6 bn Sm³ in 2024 and 1,207 TWh from 109.1 bn Sm³ in 2023, about 11.0 kWh/Sm³ ([Gassco](https://gassco.eu/en/record-delivery-of-natural-gas-through-the-gas-transport-system-to-europe-in-2024/)). Sodir/Norsk Petroleum use 40 MJ ≈ 11.1 kWh/Sm³ as standard ([Norsk Petroleum energy calculator](https://norskpetroleum.no/en/calculator/about-energy-calculator)). 1 boe = 159 Sm³ → 1.75 MWh (was 1.72, i.e. 10.8 kWh). Check against Aker BP's realised gas price ([Q4 2025 report](https://akerbp.com/borsmelding/fourth-quarter-2025-results-and-strategy-update/)): 2025 69.4 $/boe vs World Bank Europe gas 11.96 $/MMBtu × 5.97 − 2 = 69.4 (old factor 68.2); 2024 62.9 vs 63.4 (old 62.3).
    - *Tariff missing in history.* The forecast deducts the $2/boe Gassco tariff, but historical years (`valueHistory`, `stakeCashflow`) priced gas at the hub price. Inconsistent and slightly too high for gas fields.
    - *USD/NOK only moved capex.* Opex and decommissioning were fixed in USD, so a weaker krone made investments cheaper but not operations. NCS operating and removal costs are mostly NOK. At NOK 9 vs 11 the shelf value moved only 123.1 → 124.0 bn USD.
    - *Real terms.* Prices, opex, capex and discount rate are real; past-investment deductions are deflated at 2 %. But the 6-year corporate-tax depreciation of future capex was not deflated, although it is fixed in nominal NOK. Small effect.
    - *Oil and NGL rules kept.* Aker BP's liquids (incl. NGL) 2025: 68.9 $/boe vs Brent 69.0; 2024: 80.1 vs 80.7. Equinor group liquids Q4 2025: 58.6 $/bbl vs Brent about 63 ([Equinor Q4 2025](https://equinor.com/news/equinor-fourth-quarter-and-full-year-2025-results)), lower because of Johan Sverdrup's sour crude, NGL and international barrels. Brent − 1 with NGL at 60 % lies between the two, so no change.
    - *Defaults kept.* Brent 75, gas €35, EURUSD 1.15 and USD/NOK 10 are plausible central values. Not changed.
  - **Changed**
    - `public/js/valuation.js`:
      - `MWH_PER_BOE_GAS` 1.75 and `MMBTU_PER_BOE_GAS` 5.97 (both exported)
      - the gas tariff is deducted in historical years
      - opex, the opex fallback by type and facility decommissioning scale by 10 / USD/NOK (`FX_COST_REF` = 10, so default results are unchanged; user overrides in $/boe are not scaled)
      - future-capex depreciation is deflated
    - `scripts/build-data.js`: skips missing CPI months.
    - `public/data/history.json`: CPI 2025 = 321.962. The only value changed; verified byte-identical otherwise.
    - `public/js/app.js`: the gas-conversion note and the deal-year deck use `V.MWH_PER_BOE_GAS` instead of a hard-coded 1.72.
    - `public/js/i18n.js` (nb + en):
      - gas conversion note
      - method page: gas factor source, tariff in history, a new "Valuta/Currency" bullet, depreciation in real terms
      - USD/NOK hint
    - `public/js/wiki.js` (nb + en): factors and worked example.
    - `README.md`.
    - `tests/valuation.test.js`: the expected gas price is updated to 1.75 (a deliberate change). New tests cover NOK cost scaling, the historical tariff and a CPI sanity check.
    - This file: removed the outdated "every 3 hours" and "+2 percentage points on the seller's required return" wording.
  - **Shelf value at defaults:** 123.60 → 124.94 bn USD (+1.1 %).
    - The gas factor gives +1.45 bn; deflated depreciation −0.11 bn.
    - Sum of lifetime values 177.6 → 176.3 bn USD (CPI fix and historical tariff).
    - Sensitivity: USD/NOK 9 / 11 now gives 121.9 / 127.5 bn (was 123.1 / 124.0).
  - **Deal verdicts:** not recalculated. **deal-metrics needs regenerating.** `npm run build:data` fails because factpages.sodir.no is not reachable from this session, so the Sodir CSVs in `data/raw/` are missing. The CPI fix lowers every deal's 2025 actual-year amounts by about 8.5 %, and the tariff lowers gas revenue in actual years. Deals from 2025 and gas-heavy deals are most affected. `deal-metrics.json` was not hand-edited.
  - **Checks:**
    - `npm test`: 17/17 pass
    - `npm run validate:deals`: OK
    - `npm run stamp`
    - i18n: 563 keys in both nb and en
    - valuation.js loads
    - `node --check` on app.js and wiki.js
  - **Proposals for the owner**
    1. The opex constants were calibrated to 2025 costs reported in USD, when USD/NOK averaged 10.39 (Norges Bank). Strictly, `FX_COST_REF` should be 10.39, which raises opex by about 4 % at the default 10. That changes the calibration, so it is left for you (re-run the calibration and backtest).
    2. The historical gas tariff is a flat $2/boe real. Gassled tariffs were higher before the 2016 cut, so this is slightly generous for early years. Acceptable for now.
    3. The CPI base year 2026 is a partial-year average (January–October). Consider fixing the base to the last full year, or note it on the history page.
    4. The oil differential could be field-specific, for example a sour-crude discount for Johan Sverdrup and a premium for light crude. This needs public realised prices per field, which are not available. Keep Brent − 1.

## Log (newest first)

- 2026-11-27 – Tax (with the owner):
  - investment deductions follow the rules of each year: depreciation, uplift, the temporary 2020–22 package, the cash-flow tax from 2022
  - deals include the tax benefits the buyer takes over; the Hess tax loss moved to the value side

  Shelf value went from 116 to 124 bn USD. The deal median went from 1.45 to 1.18. Verdict changes:
  - Lundin and DNO–Sval became more expensive
  - Hess and OKEA–Shell became cheaper

- 2026-11-27 – Financial analysis (with the owner):
  - facility-based operating costs and decommissioning
  - adjusted deal prices (Lundin, Det norske–BP, Hess)
  - the deal baseline excludes early deals (now 1.45)
  - deal verdicts and texts rewritten

  Shelf value went from 107 to 116 bn USD. The backtest (actual/forecast) is now 1.14 from 2010 and 1.06 from 2015, against 1.26 and 1.16 before.

- 2026-11-27 – Assumptions/wording: the method page (nb + en) now explains what NGL is and that the 60 %-of-Brent price is a simplified rule of thumb.
- 2026-11-27 – Wording: the deal scenario intro (nb + en) now explains that "Prices in year X" is a flat price from the deal year, not the forward curve then.
- 2026-11-26 – Wording/financial analysis: the deals method text (nb + en) now says the price is the value at announcement and moves with the share price for deals paid in shares.
- 2026-11-26 – Log started. Recent changes:
  - deal analysis pages
  - plain-language Deals section
  - quality check for deals.json
  - Yggdrasil merge
  - key figures that fit their tiles
