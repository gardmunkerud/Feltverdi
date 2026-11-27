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
  - tariff income for host fields, which is not modelled
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
