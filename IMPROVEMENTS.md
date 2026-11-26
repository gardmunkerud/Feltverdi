# Feltverdi – improvement log

A scheduled cloud agent improves Feltverdi in small steps, one change every 3 hours. It reads this file first and adds one entry when it finishes. The newest entries go at the top of the log.

## Decisions the owner has made (do not undo)

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
- **Deal prices:** the deal price is the headline value at announcement. Use completion prices or price adjustments where they are public, and mark which one is used.
- **Deals paid in shares** (Aker BP–Lundin, Det norske–BP): the value moved with the share price. Note this in the deal text or the method.
- **Opex:** the model uses a generic $/boe by hydrocarbon type (60 % fixed). Consider field-specific levels for the largest old fields (Ekofisk, Heidrun, Statfjord, Oseberg) where public figures exist, with sources.
- **Decommissioning:** a flat $1/boe of original volumes is too low for large old platforms. Consider a size-based floor, with the method documented.
- **Tax:**
  - The model uses a flat 78 % from 2022.
  - The temporary 2020–22 package and the uplift before 2022 are not modelled in the historical values.
  - Tax balances taken over by the buyer are not valued.
  - Any of these could be explained better on the method page, or approximated.
- **Deal-year deck:** "Value at the prices then" uses a flat price deck from the deal year, not that year's forward curve. Explain this, or improve it with public forward data.
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

- 2026-11-26 – Log started. Recent changes:
  - deal analysis pages
  - plain-language Deals section
  - quality check for deals.json
  - Yggdrasil merge
  - key figures that fit their tiles
