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
- **Decommissioning:** per facility and well since 2026-11-27. Unit costs are rounded industry levels, checked on 2026-11-28 against the licensees' booked removal provisions (see run 4 in the overnight review). Timing is still one year, two years after shut-down.
- **Tax:** deductions are modelled by investment year (depreciation, uplift, the temporary package) since 2026-11-27, and deals include the deductions the buyer takes over. Remaining simplifications:
  - rules before 1992 (royalty, older rates) are not modelled
  - unused deductions when a field stops are counted in the years they fall due, as if the owner uses them elsewhere on the shelf (since 2026-11-28)
  - tax is paid in the same year as the cash flow; in reality instalments fall half in the income year and half in the next (see the run 6 proposal)
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

- **Run 6 – Tax** (78 % marginal, `investmentDeductions()`, refunds and losses, `taxInh` in deals, checked against current rules)
  - **Sources.** norskpetroleum.no, regjeringen.no, skatteetaten.no, lovdata and the company tax manuals cannot be fetched from this session. The figures below come from search-result text of these pages:
    - [Skatteetaten, tax returns and assessments for petroleum companies](https://www.skatteetaten.no/en/business-and-organisation/reporting-and-industries/industries-special-regulations/oil-and-gas-exploration-and-petroleum-tax/tax-returns-and-tax-assessments-for-petroleum-companies/)
    - [Skatteetaten, instalment tax 2026](https://www.skatteetaten.no/en/press/nyhetsrommet/press-release-instalment-tax-2026/)
    - [PwC tax summaries, Norway](https://taxsummaries.pwc.com/norway/corporate/taxes-on-corporate-income)
    - [Aker BP tax manual 2023](https://akerbp.com/wp-content/uploads/2023/03/aker-bp-tax-manual-2023.pdf)
    - [Vår Energi, overview of Norwegian petroleum taxation](https://varenergi.no/wp-content/uploads/2023/10/Overview-Norwegian-petroleum-taxation-Q3-2023.pdf)
    - [EY, 2021 proposal](https://taxnews.ey.com/news/2021-1621-norwegian-government-proposes-changes-in-petroleum-taxation)
    - [Thommessen, proposed changes](https://www.thommessen.no/en/news/proposed-changes-to-the-norwegian-petroleum-tax-regime)
    - [Prop. 3 LS (2026–2027), ch. 8, transitional rules](https://www.regjeringen.no/no/dokumenter/prop.-3-ls-20262027/id3178073/?ch=8)
    - [Stortinget, Innst. 440 L (2021–2022)](https://stortinget.no/no/Saker-og-publikasjoner/Publikasjoner/Innstillinger/Stortinget/2021-2022/inns-202122-440l/?all=true)
  - **Findings**
    - *The rates and rules in the code match the public descriptions. No change needed:*
      - 22 % corporate tax + 71.8 % special tax. The corporate tax is calculated first and deducted in the special-tax base, so a corporate-tax deduction is worth about 6.2 % (Aker BP's own figure) and the total is 78 %.
      - Six-year straight-line corporate-tax depreciation, unchanged in 2022.
      - From 2022, investments are expensed in the special-tax base with 12.4 % uplift.
      - Investments made in 2020–21 were expensed immediately with 24 % uplift. Fields covered by the temporary package get 17.69 % uplift from 2022 until production starts.
      - Investments before 2020 keep their remaining depreciation and uplift (2016–19 investments depreciate until 2024).
      - The corporate-tax rate path (28 → 27 → 25 → 24 → 23 → 22 %) and the uplift path (30 % → 22 % → 21.6/21.2/20.8 %) are right. Both taxes together are 78 % in every year since 1992.
      - Decommissioning is deductible at 78 %.
    - *Bug: deductions were lost when a field stopped.* Any depreciation or past-investment deduction falling after the last production year was dropped. Petroleum tax is assessed per company, not per field, so the owners use these against their other shelf income. Since 2022, special-tax losses are also paid out by the state at the tax assessment, and the corporate-tax part (6.2 %) is carried forward. This is the case the backlog wrongly listed as "lost (in reality refunded)". The synthetic test case lost 54 % of a last-year investment's deduction value.
    - *Tax timing (proposal 1, not changed).*
      - The model pays tax in the same year as the cash flow, at mid-year.
      - In reality, instalments fall half in the income year and half in the next. From 2025 that is ten instalments, 1 Aug–1 Dec and 1 Feb–1 Jun, which averages about half a year after mid-year.
      - Special-tax refunds of losses are paid at the assessment the following year.
    - *History only, no effect on forward values:*
      - Fields whose development plan was submitted before 5 May 2013 kept the 30 % uplift. The model gives 22 % to all 2013–15 investments.
      - Before 2002 the uplift was 5 % a year over six years, not 7.5 % over four.
      - That uplift was used up by 2022, so only history-page values move slightly.
  - **Changed**
    - `public/js/valuation.js`:
      - `simulate` counts the unused deductions after the last production year in the years they fall due, at the 2022 values (71.8 % special tax, 6.2 % corporate tax). These are the deductions from past investments (`histCit`/`histSpt`) and the six-year corporate depreciation of the last five years' capex. They are shown in the decommissioning row at the same present value.
      - `stakeCashflow` puts the inherited part of these deductions (`taxInh`) in that row too.
      - The header comment is updated.
    - `public/js/i18n.js` (nb + en): the method-page tax paragraph and the deal tax simplifications (`ddTaxSimpl`) now say that unused deductions are counted.
    - `README.md`: a new tax bullet.
    - `IMPROVEMENTS.md`: the backlog tax simplifications (the wrong "lost" line, and a new line on tax timing).
    - `tests/valuation.test.js`: a new test checks that a 2025 investment's full post-2025 deduction value reaches the NPV of a field with about one year left. It fails without the fix (19.0 vs 41.4).
  - **Shelf value at defaults:** 128.14 → 128.21 bn USD (+0.06 %).
    - 21 fields changed by more than USD 0.5 m: Statfjord +32.9 m, Gullfaks +6.5, Ekofisk +5.5, Sleipner Øst +3.0, Valhall +3.0, Brage +2.0 …
    - Tax PV 429.41 → 429.33 bn.
  - **Deal verdicts:** none changed.
    - Eight deals touch affected fields: Vår–ConocoPhillips, Equinor–Petoro, OKEA–Wintershall Dea, Aker BP–Lundin, Vår–ExxonMobil, OKEA–Shell, Aker BP–Hess and the Aker BP merger.
    - The largest effect is about USD 7 m (Statfjord in Vår–ExxonMobil) on multi-billion deal values, so less than 0.5 %.
    - deal-metrics still needs regenerating: factpages.sodir.no is blocked, and runs 2–4 also changed the model.
  - **Checks:**
    - `npm test`: 20/20 pass
    - `npm run validate:deals`: OK
    - `npm run stamp`
    - i18n: 564 keys in both nb and en
    - valuation.js loads
    - `node --check` on app.js and i18n.js
    - `stakeCashflow` spot checks (Statfjord 2019, Valhall 2017, Brage 2022)
  - **Proposals for the owner**
    1. *Tax payment lag.* Discount tax (and refunds) half a year later than the cash flow, to match the instalment schedule: `df` × (1 + r)^−0.5 on the tax line only. Shelf value about +12.6 % (tax PV 429 bn × 3.8 % ≈ +16 bn, 128 → about 144 bn USD). That is over this run's ±10 % limit, and it also lifts every deal value and the typical-deal factor. Analysts and company models normally include this lag. Special-tax refunds for development-phase losses come about a year later still, which slightly lowers new developments; a full model would treat refunds separately.
    2. *Single-asset owners.* Since 2022 the corporate-tax part of a loss (6.2 %) is only carried forward, with no refund at cessation. The model assumes every owner has other taxable income. That fits the large companies, but a small owner of one late-life field could lose that part. Its value is small; it could become a deal-level option.
    3. *History-page detail.* Add the 2013 uplift grandfathering (development plan submitted before 5 May 2013 keeps 30 %) and the pre-2002 uplift of 5 % × 6 years. This changes only historical whole-life values, slightly.

- **Run 5 – Volumes** (decline method, economic limit, backtests, shelf forecast vs Sodir)
  - **Findings**
    - *The shelf forecast follows Sodir's.* Sodir expects about 4.1 Mboe/d in 2026 and just under 3.5 Mboe/d in 2030, with a plateau until 2027. It expects liquids of about 2.0 Mb/d and gas of 123.1 bcm in 2026 ([Reuters via EnergyNow, Jan 2026](https://energynow.com/2026/01/norways-oil-and-gas-output-will-fall-towards-2030-regulator-says/), [Hellenic Shipping News](https://www.hellenicshippingnews.com/norways-oil-and-gas-output-will-fall-towards-2030-regulator-says/), [Sodir, The Shelf in 2025](https://www.sodir.no/en/whats-new/publications/reports/the-shelf/the-shelf-in-2025/production-operating-fields-and-investments/)). sodir.no is not reachable from this session; the figures come from search snippets.
      - The model gives 4.13 / 4.21 / 3.91 / 3.25 Mboe/d in 2026 / 27 / 28 / 30, and 2.14 Mboe/d in 2035. Actual 2025 was 240.5 MSm³ o.e. (4.14 Mboe/d).
      - In 2026 the model's liquids are 2.11 Mb/d and its gas 117.7 bcm. Gas is about 4 % below Sodir, liquids about 5 % above.
      - Sodir's 2030 figure includes discoveries not yet approved for development, which the model leaves out, so being 6 % low in 2030 is expected. The model's implied reserve growth over all fields is ×1.32 (18.0 bn boe against Sodir's 13.6 bn).
    - *Decline persistence backtest (new, from Sodir production data only).* I took fields producing for at least 5 years at 2010, 2015 and 2020 and projected each field's observed 5-year decline 5 years ahead. Actual production divided by that projection:

      | Observed decline | From 2010 | From 2015 | From 2020 |
      |---|---|---|---|
      | Rising output (vs flat) | 0.81 | 0.93 | 0.93 |
      | 0–6 % a year | 0.88 | 0.96 | 1.02 |
      | ≥ 6 % a year | 1.18 | 1.18 | 1.21 |

      - This is mean reversion: fields with slow or no decline fall somewhat faster, and fast decliners slow down. The model's two bounds push in the same directions, so the method is supported.
      - The model's push on slow fields is stronger than history shows. For the 13 fields with an observed decline of 0–6 % that hit the ×1.6 cap, the model's 2026–30 production is 0.78 of the projection, against about 0.95 in history. Examples: Aasta Hansteen 5.2 % observed, 19.6 % used; Gullfaks Sør 2.5 → 14.9 %; Tyrihans 2.3 → 10.1 %; Skarv (output rising 1.5 %/yr) → 17.5 %. These fields have small Sodir reserves next to their current rate, so even ×1.6 forces a steep exponential. Fast decliners slowed by the reserves bound get 1.12, against about 1.19 in history, which is close.
    - *A two-stage profile was tested, not adopted.* It keeps each field's observed decline (+1.5–2 points, at least 3–4 %) for up to five years, then fits a steeper decline so the total stays at reserves × 1.6.
      - It moves the shelf value from 128.1 to 129.5–130.3 bn USD (+1.1–1.7 %).
      - It gives 4.22–4.24 Mboe/d in 2026, 4.31–4.37 in 2027 and 3.30–3.34 in 2030.
      - It fits the persistence backtest better, but it overshoots Sodir's operator-based forecast in 2026–27, where the current method fits well. The evidence points both ways, so it is left as proposal 1.
    - *Economic limit.* Production stops when revenue (plus tariffs) − opex − 0.3 × capex ≤ 0. This is consistent across `simulate` and `fitDecline`, and decommissioning comes after the limit. No change.
    - *Data edge cases are negligible.* Only Ærfugl Nord (0.37 MMboe in 2025, zero Sodir reserves, probably reported under Ærfugl) and Veslefrikk (shut down) produced in 2025 without reserves.
    - *Text issues (fixed):*
      - The decline note for the 19 capped fields with rising output said "declined only −1.5 % per year".
      - The method page said plateau fields decline at a "normal 10/12 %" after the plateau. In the code that rate only counts the plateau years; the actual tail is fitted to reserves × 1.3. Johan Sverdrup gets one plateau year and then 16.3 % a year (1,262 MMboe of reserves against 274 MMboe/yr).
      - The method page's backtest still showed the pre-facility-cost numbers.
  - **Changed** (no model change)
    - `public/js/app.js`: `declineNote` uses the new key `declNote_capLowRise` when the observed decline is negative.
    - `public/js/i18n.js` (nb + en):
      - the new decline note
      - the plateau text, now describing the fitted tail, with the Johan Sverdrup example
      - the latest backtest (1.14 / 1.06), from the 27 Nov log entry
      - a new paragraph comparing the forecast with Sodir's
      - 18.1 → 18.0 bn boe
    - `README.md`: the plateau tail and the Sodir check.
  - **Shelf value at defaults:** 128.14 → 128.14 bn USD (unchanged).
  - **Deal verdicts:** none changed (no model change). deal-metrics still needs regenerating from runs 2–4 (factpages.sodir.no is still blocked).
  - **Checks:**
    - `npm test`: 19/19 pass
    - `npm run validate:deals`: OK
    - `npm run stamp`
    - i18n: 564 keys in both nb and en
    - valuation.js loads
    - `node --check` on app.js and i18n.js
    - Headless browser: Skarv (new note), Aasta Hansteen and the method page render with no JS errors.
  - **Proposals for the owner**
    1. *Two-stage decline for fields at the reserve-growth cap.* Hold the observed decline (+2 points, at least 3.5 %) for up to five years, limited to half of the field's capped total, then fit the tail so the total is unchanged. The bounds and the ×1.6 cap stay as they are. Shelf value +1.5 %, and the 2030 production moves closer to Sodir. The risk is that 2026–27 overshoot Sodir by 3–6 %. The prototype was a `simulate` change of about 10 lines. It needs your call because it changes the shape of the approved method. Re-run the original 2010/2015 backtest with it (it needs Sodir's historical reserves, which are not in this repo).
    2. *Ramp-up plateau with small reserves.* A ramp field holds max(q0, reserves/9) for three years whatever its reserves. Tyrving (25 MMboe, 8.9 MMboe/yr) then has to fall 59 % a year to stay within reserves × 1.3. Capping the ramp plateau at about half of the target would give a smoother profile. The value effect is tiny.
    3. *Commit the backtest script.* The 2010/2015 backtest behind the method page cannot be re-run from the repo. Committing it, together with the snapshot of Sodir's historical reserves it uses, would let later runs check changes to costs and volumes.

- **Run 4 – Decommissioning** (`DECOM_FAC`, the $0.5/boe floor, timing, shelf totals vs official and company figures)
  - **Findings**
    - *No official shelf total is public.* Sodir and Norsk Petroleum give no current total for future removal costs. Public facts used:
      - about 2,900 wellbores still to be plugged, and well plugging is more than half of all cessation cost ([Sodir, Nov 2025](https://www.sodir.no/en/whats-new/news/general-news/2025/new-technology-is-profitable-when-shutting-down-wells/)); the model has 2,573 open development wells on fields in production or under development
      - per well "just under NOK 50 million [the simplest] to several hundred million", over NOK 1 billion for the most complex ([Sodir resource report 2017](https://www.sodir.no/en/facts/publications/reports/resource-report/resource-report-2017/cessation/decommissioning-costs))
      - spend 2012–16 was NOK 41 bn (about 8 bn a year); NOK 35 bn was forecast for 2017–21 (same source). The model has USD 4.9 bn (NOK 49 bn) for 2026–30, about NOK 10 bn a year, which is in line. Petoro expects the state's (SDFI) share to be NOK 2.8 bn in 2026.
      - The headline "NOK 800 bn for 3,000+ wells" ([World Oil, 2020](https://worldoil.com/news/2020/7/8/norway-to-tackle-100-billion-p-a-liabilities-with-new-oilfield-tech/)) has no stated basis (it is probably nominal and includes wells not yet drilled), so it is not used.
      - norskpetroleum.no, sodir.no, petoro.no, akerbp.com, equinor.com and cision are not reachable from this session; the figures come from search snippets.
    - *Company check (the best benchmark).* The licensees' booked removal provisions are present values at a nominal risk-free rate of about 3.5–4.8 % with 2 % inflation, i.e. about 2 % real. I compared them with the model's share-weighted decommissioning, discounted at 2 % real from the model's decommissioning year:

      | Licensee | Booked provision | Model, before | Model, after |
      |---|---|---|---|
      | Petoro/SDFI, end-2025 | NOK 76 bn ([Petoro directors' report 2025](https://aarsrapport2025.petoro.no/en/directors-report/)) | USD 6.5 bn | USD 6.7 bn |
      | Aker BP, end-2025 | USD 4.67 bn ([Q4 2025](https://akerbp.com/wp-content/uploads/2026/02/aker-bp-2025-q4-report.pdf)) | 3.4 bn (incl. 0.25 bn on shut-down fields) | 3.65 bn |
      | Vår Energi, end-2025 | USD 3.83 bn ([Q4 2025](https://mb.cision.com/Public/21086/4305025/bd1a0561bff4ea5b.pdf)) | 3.9 bn | 4.0 bn |
      | ConocoPhillips Skandinavia, end-2024 | NOK 16.3 bn (wiki example) | 1.9 bn | 2.1 bn |
      | **Total** | | **−14 %** | **−7 %** |

      - Equinor's USD 13.6 bn ([20-F 2025](https://www.sec.gov/Archives/edgar/data/1140625/000114062526000013/eqnr-20251231.htm)) is for the whole group with no Norway split, so it is not used. The model has 10.6 bn for Norway, which is plausible.
      - Part of the gap is timing: with reserve growth the model's fields live longer than the operators' plans, which lowers the present value. The provisions also include onshore plants and fields already shut down.
    - *Platform wells were at Sodir's floor.* USD 6 m (NOK 60 m) per platform well is only just above the simplest case Sodir gives. Aker BP's portfolio, which has many platform wells (Valhall, Ula, Ivar Aasen, Edvard Grieg), was the most under-provisioned. ConocoPhillips, which also has many platform wells (Ekofisk, Eldfisk), points the other way, so the evidence is mixed. A modest rise to USD 8 m was chosen. Subsea wells (USD 18 m, rig-based plugging) and the facility removal costs were kept.
    - *Floor and timing kept.* The $0.5/boe floor applies to 16 fields (Troll, Statfjord, Ormen Lange, Snøhvit, Oseberg, Sleipner Vest, Kvitebjørn and others) and covers wells still to be drilled and the onshore plants. A single payment two years after shut-down has about the same present value as a realistic spread (plugging from the last year, removal 2–5 years later). Not changed.
    - Decommissioning does not affect the economic limit (it comes after the production loop), so the decline backtest and the opex calibration are unaffected.
  - **Changed**
    - `public/js/valuation.js`: `DECOM_FAC.wellPlatform` 6 → 8, with the sources and the company check in the comment
    - `public/js/i18n.js` (nb + en): the cost tooltip and the method page. The shelf total, which said "about USD 48 bn", now says "about USD 55 bn for fields in production or under development, about 60 % well plugging", plus the company check.
    - `README.md`
    - This file: the backlog line
  - **Shelf value at defaults:** 128.27 → 128.14 bn USD (−0.1 %). Brent 60 / 90: 113.98 / 142.47 bn (was 114.14 / 142.60).
    - Total decommissioning for fields in production or under development: USD 52.3 → 54.5 bn (undiscounted, real)
    - Largest field changes (USD m): Ekofisk 189 → 153, Gullfaks 18 → 1, Sleipner Øst −126 → −136, Brage 106 → 98, Valhall 547 → 540, Ula −41 → −47
  - **Deal verdicts:** **deal-metrics needs regenerating** (factpages.sodir.no is still blocked). Rough check: `stakeCashflow` at 8 % from the deal year, before vs after. Every deal moves 0 to −0.4 % (Aker BP–Hess −0.39 %, OKEA–Wintershall Dea −0.35 %, Vår–ConocoPhillips −0.11 %). No verdict is expected to change.
  - **Checks:**
    - `npm test`: 19/19 pass (no expected value changed)
    - `npm run validate:deals`: OK
    - `npm run stamp`
    - i18n: 563 keys in both nb and en
    - valuation.js loads
    - `node --check` on wiki.js
  - **Proposals for the owner**
    1. *Shut-down fields with decommissioning still ongoing are valued at zero.* Heimdal, Veslefrikk, Atla, Skirne, Gaupe, Vale, Knarr and Yttergryta still have removal work to do: about USD 0.7 bn by the crude $1/boe default, and about 3.1 bn for all shut-down fields. The owners carry this cost (in company mode it is about USD 0.25 bn for Aker BP). Booking the remaining cost after tax as a negative field value needs the remaining scope per field. Sodir's facility and well data have it, but the data is not reachable here.
    2. *Shut-down facilities on producing fields are charged only at the field's end.* Examples are Valhall's old platforms and Ekofisk's remaining old structures. Operators remove these now, so the model defers real near-term costs by 10–20 years. This likely explains much of Aker BP's gap. `scripts/facilities.js` could count facilities in phase "SHUT DOWN" separately and charge them within 2–3 years.
    3. *Open-well count.* `facilities.js` treats every development well whose status is not P&A, junked or "will never be drilled" as open. If Sodir's "PLUGGED" status (plugged, but the wellhead is still in place) is common on old fields, this overstates both wells to plug and the opex per well (Gyda, removed in 2022, still shows 16 open wells). Check the status values in `wellbore_development_all` when the data is reachable. If it changes, opex needs re-calibrating.
    4. *Enoch* (UK cross-border, 2 MMboe) owns a large steel jacket in the model (USD 250 m removal, value −49 m). This is probably the UK host's platform registered against the field. Check it in the facility register.
    5. *Host and tie-back timing.* A host's removal can come before its tie-backs stop (for example Statfjord and Sleipner Øst, which the model shuts in 2026 with removal in 2027). This is the same issue as run 2's proposal 4, a coupled shut-down.

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
