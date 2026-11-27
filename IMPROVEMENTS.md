# Feltverdi – improvement log

A scheduled cloud agent improves Feltverdi in small steps, one change every 3 hours. It reads this file first and adds one entry when it finishes. The newest entries go at the top of the log.

## Decisions the owner has made (do not undo)

- **Costs (2026-11-27):** operating costs and decommissioning come from each field's facilities (`scripts/facilities.js`; `OPEX_FAC` and `DECOM_FAC` in `valuation.js`), calibrated against reported company production costs. Do not change the calibration constants without re-running the calibration and the decline backtest.
- **Deal baseline:** deals marked "early" are excluded from the median price/value. Adjusted prices are used where public sources give them.
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
- **Tax:**
  - The model uses a flat 78 % from 2022.
  - The temporary 2020–22 package and the uplift before 2022 are not modelled in the historical values.
  - Tax balances taken over by the buyer are not valued.
  - Any of these could be explained better on the method page, or approximated.
- **Deal-year deck:** now explained in the scenario text; could still be improved with public forward data.
- **Bargaining-range defaults:** the per-deal views in `deals.json` (+2 percentage points on the seller's required return, 5–8 % synergies) are judgement calls. Review the wording and the reasoning.
- **NGL price:** NGL is priced at 60 % of Brent. Gas is priced from €/MWh with fixed conversion factors. Check that the factors are documented in the wiki and on the method page.

### Wording and explanations
- Review each page (front page, field, company, rankings, method, history, wiki, deals) for jargon a non-expert would not understand. Apply the Deals section's plain-language approach in small steps.
- Check that the English and Norwegian texts say the same thing.
- **Method page:** make sure it describes the current decline method, the typical-deal factor, the merged assets and the automatic deal updates.

### Data and correctness
- Fields with zero reserves but recent production.
- Fields where the observed decline is clamped. Is the explanation shown to the user clear?
- Company names: Sodir legal names such as "Equinor Energy AS" against brand names in deals ("Equinor").

## Log (newest first)

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
