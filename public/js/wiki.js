/* Feltverdi Wiki – petroleum economics terms (original text, NO/EN).
 * Body text may link to other entries with [[slug]] or [[slug|link text]].
 * Formula: { expr: HTML, vars: [[symbol, nb, en], ...] }. Use <span class="frac"><span>num</span><span>den</span></span> for fractions. */
window.FV_WIKI_CATS = {
  valuation: { nb: 'Verdsettelse', en: 'Valuation' },
  reserves: { nb: 'Reserver og produksjon', en: 'Reserves & production' },
  costs: { nb: 'Kostnader', en: 'Costs' },
  tax: { nb: 'Skatt og statens andel', en: 'Tax & government take' },
  markets: { nb: 'Priser og marked', en: 'Prices & markets' },
  deals: { nb: 'Transaksjoner og finansiering', en: 'Transactions & financing' },
};

const F = (n, d) => `<span class="frac"><span>${n}</span><span>${d}</span></span>`;

window.FV_WIKI = [
  // ---------------- Valuation ----------------
  {
    slug: 'npv', cat: 'valuation', featured: true,
    title: { nb: 'Nåverdi (NPV)', en: 'Net present value (NPV)' },
    short: { nb: 'Summen av alle framtidige kontantstrømmer, omregnet til dagens verdi med en diskonteringsrente.', en: 'The sum of all future cash flows, converted to today\'s value using a discount rate.' },
    keys: {
      nb: ['En krone i dag er mer verdt enn en krone om ti år – nåverdien tar hensyn til det.', 'Positiv nåverdi betyr at prosjektet gir mer enn avkastningskravet.', 'Nåverdi er hovedmålet i Feltverdi: verdien av hvert felt etter skatt.'],
      en: ['A krone today is worth more than a krone in ten years – NPV accounts for that.', 'A positive NPV means the project earns more than the required return.', 'NPV is the main measure in Feltverdi: the after-tax value of each field.'],
    },
    body: {
      nb: '<p>Nåverdi (Net Present Value) er den vanligste måten å verdsette olje- og gassfelt på. Alle forventede kontantstrømmer – inntekter minus driftskostnader, investeringer og skatt – diskonteres tilbake til et felles tidspunkt med en [[discount-rate|diskonteringsrente]] som gjenspeiler tidsverdi og risiko.</p><p>Siden felt på sokkelen produserer i flere tiår, betyr diskonteringen mye: fat som produseres om 20 år er langt mindre verdt i dag enn fat som produseres neste år. Derfor er et felt på [[plateau|platå]] med rask produksjon ofte mer verdifullt per fat enn et felt med lang og langsom haleproduksjon.</p>',
      en: '<p>Net present value is the most common way to value oil and gas fields. All expected cash flows – revenue minus operating costs, investments and tax – are discounted back to a common point in time using a [[discount-rate|discount rate]] that reflects the time value of money and risk.</p><p>Because fields on the shelf produce for decades, discounting matters a lot: barrels produced in 20 years are worth far less today than barrels produced next year. That is why a field on [[plateau|plateau]] with fast production is often worth more per barrel than a field with a long, slow tail.</p>',
    },
    formula: {
      expr: `NPV = &sum;<sub>t=0</sub><sup>T</sup> ${F('CF<sub>t</sub>', '(1 + r)<sup>t</sup>')}`,
      vars: [['CF<sub>t</sub>', 'Kontantstrøm i år t (etter skatt)', 'Cash flow in year t (after tax)'], ['r', 'Diskonteringsrente per år', 'Discount rate per year'], ['T', 'Siste år med kontantstrøm (inkl. fjerning)', 'Last year with cash flow (incl. decommissioning)']],
    },
    example: {
      nb: '<p>Et prosjekt koster 1 000 i dag og gir 300 per år i fem år. Med 8 % diskonteringsrente er nåverdien av innbetalingene 300 × 3,993 = 1 198. Nåverdien blir 1 198 − 1 000 = <strong>198</strong>. Prosjektet er lønnsomt.</p>',
      en: '<p>A project costs 1,000 today and returns 300 per year for five years. At an 8 % discount rate the present value of the inflows is 300 × 3.993 = 1,198. The NPV is 1,198 − 1,000 = <strong>198</strong>. The project is profitable.</p>',
    },
    related: ['discount-rate', 'irr', 'real-nominal', 'free-cash-flow', 'breakeven-price'],
    feltverdi: '#/',
  },
  {
    slug: 'discount-rate', cat: 'valuation',
    title: { nb: 'Diskonteringsrente og WACC', en: 'Discount rate and WACC' },
    short: { nb: 'Avkastningskravet som brukes for å omregne framtidige kontantstrømmer til nåverdi.', en: 'The required return used to convert future cash flows into present value.' },
    keys: {
      nb: ['Høyere rente gir lavere verdi – særlig for felt med lang levetid.', 'Selskaper bruker ofte vektet kapitalkostnad (WACC) som utgangspunkt.', 'Reell rente (faste priser) og nominell rente må ikke blandes.'],
      en: ['A higher rate gives a lower value – especially for long-lived fields.', 'Companies often start from the weighted average cost of capital (WACC).', 'Real rates (constant prices) and nominal rates must not be mixed.'],
    },
    body: {
      nb: '<p>Diskonteringsrenten uttrykker hva investorene krever i avkastning for å binde kapital i prosjektet. I oljebransjen brukes ofte 7–10 % [[real-nominal|nominelt]] etter skatt for produserende felt, og høyere satser for prosjekter med teknisk eller kommersiell risiko.</p><p>På norsk sokkel bærer staten 78 % av både inntekter og kostnader gjennom [[ncs-petroleum-tax|petroleumsskatten]]. Det reduserer risikoen for eieren og er en grunn til at avkastningskravet etter skatt kan være moderat.</p>',
      en: '<p>The discount rate expresses the return investors require for tying up capital in the project. The oil industry often uses 7–10 % [[real-nominal|nominal]] after tax for producing fields, and higher rates for projects with technical or commercial risk.</p><p>On the Norwegian shelf the state carries 78 % of both revenue and costs through the [[ncs-petroleum-tax|petroleum tax]]. That reduces the owner\'s risk and is one reason why the after-tax required return can be moderate.</p>',
    },
    formula: {
      expr: `WACC = ${F('E', 'V')} &middot; R<sub>E</sub> + ${F('D', 'V')} &middot; R<sub>D</sub> &middot; (1 &minus; T<sub>c</sub>)`,
      vars: [['E, D', 'Markedsverdi av egenkapital og gjeld', 'Market value of equity and debt'], ['V', 'E + D', 'E + D'], ['R<sub>E</sub>, R<sub>D</sub>', 'Avkastningskrav til egenkapital og gjeld', 'Cost of equity and cost of debt'], ['T<sub>c</sub>', 'Skattesats for rentefradrag', 'Tax rate for interest deductions']],
    },
    example: {
      nb: '<p>Et selskap har 70 % egenkapital som krever 10 % og 30 % gjeld til 6 %. Med 22 % skattefradrag på renter: WACC = 0,7 × 10 % + 0,3 × 6 % × 0,78 = <strong>8,4 %</strong>.</p>',
      en: '<p>A company has 70 % equity requiring 10 % and 30 % debt at 6 %. With a 22 % tax deduction on interest: WACC = 0.7 × 10 % + 0.3 × 6 % × 0.78 = <strong>8.4 %</strong>.</p>',
    },
    related: ['npv', 'real-nominal', 'irr'],
  },
  {
    slug: 'irr', cat: 'valuation', featured: true,
    title: { nb: 'Internrente (IRR)', en: 'Internal rate of return (IRR)' },
    short: { nb: 'Den diskonteringsrenten som gir en nåverdi på null – prosjektets egen avkastning.', en: 'The discount rate at which NPV is zero – the project\'s own rate of return.' },
    keys: {
      nb: ['Prosjektet er lønnsomt hvis internrenten er høyere enn avkastningskravet.', 'Internrenten sier ingenting om hvor stor verdien er i kroner.', 'Kan være udefinert eller ha flere løsninger når kontantstrømmen skifter fortegn flere ganger (f.eks. ved fjerning).'],
      en: ['The project is profitable if the IRR exceeds the required return.', 'The IRR says nothing about how large the value is in money terms.', 'It can be undefined or have several solutions when cash flow changes sign more than once (e.g. decommissioning).'],
    },
    body: {
      nb: '<p>Internrenten finnes ved å prøve seg fram til den renten der [[npv|nåverdien]] blir null. Den er populær fordi den kan sammenlignes direkte med avkastningskravet og med andre prosjekter.</p><p>For felt med store fjerningskostnader til slutt skifter kontantstrømmen fortegn to ganger. Da bør internrenten brukes med forsiktighet. Feltverdi viser «realavkastning» – internrente før skatt i faste priser – i den historiske visningen.</p>',
      en: '<p>The IRR is found by trial and error as the rate at which the [[npv|NPV]] becomes zero. It is popular because it can be compared directly with the required return and with other projects.</p><p>For fields with large decommissioning costs at the end, the cash flow changes sign twice, so the IRR should be used with care. Feltverdi shows "real return" – the pre-tax IRR in constant prices – in the historical view.</p>',
    },
    formula: { expr: `0 = &sum;<sub>t=0</sub><sup>T</sup> ${F('CF<sub>t</sub>', '(1 + IRR)<sup>t</sup>')}`, vars: [['CF<sub>t</sub>', 'Kontantstrøm i år t', 'Cash flow in year t'], ['IRR', 'Renten som løser likningen', 'The rate that solves the equation']] },
    example: {
      nb: '<p>Investering 1 000, deretter 300 per år i fem år. Nåverdien er null ved om lag <strong>15,2 %</strong>. Med avkastningskrav på 8 % er prosjektet lønnsomt.</p>',
      en: '<p>Investment of 1,000, then 300 per year for five years. NPV is zero at about <strong>15.2 %</strong>. With an 8 % required return the project is profitable.</p>',
    },
    related: ['npv', 'payback', 'discount-rate'],
    feltverdi: '#/historisk',
  },
  {
    slug: 'real-nominal', cat: 'valuation',
    title: { nb: 'Reelle og nominelle priser', en: 'Real and nominal terms' },
    short: { nb: 'Nominelle tall er i løpende kroner; reelle tall er justert for inflasjon til et fast prisnivå.', en: 'Nominal figures are in money of the day; real figures are adjusted for inflation to a fixed price level.' },
    keys: {
      nb: ['Reelle kontantstrømmer diskonteres med reell rente, nominelle med nominell rente.', 'Historiske priser må justeres for inflasjon før de sammenlignes.', 'Feltverdi regner i faste priser (reelle dollar).'],
      en: ['Real cash flows are discounted at a real rate, nominal cash flows at a nominal rate.', 'Historical prices must be adjusted for inflation before they are compared.', 'Feltverdi works in constant prices (real dollars).'],
    },
    body: {
      nb: '<p>En oljepris på 40 dollar i 1980 tilsvarer langt mer enn 40 dollar i dag. For å sammenligne over tid omregnes beløp til faste priser med en prisindeks, for eksempel amerikansk KPI.</p><p>Det viktigste er konsistens: bruker du priser og kostnader i faste priser, må [[discount-rate|diskonteringsrenten]] også være reell. Fisher-likningen kobler de to.</p>',
      en: '<p>An oil price of 40 dollars in 1980 is worth far more than 40 dollars today. To compare over time, amounts are converted to constant prices using a price index such as US CPI.</p><p>The key is consistency: if prices and costs are in real terms, the [[discount-rate|discount rate]] must also be real. The Fisher equation links the two.</p>',
    },
    formula: { expr: '(1 + r<sub>nom</sub>) = (1 + r<sub>real</sub>) &middot; (1 + i)', vars: [['r<sub>nom</sub>', 'Nominell rente', 'Nominal rate'], ['r<sub>real</sub>', 'Reell rente', 'Real rate'], ['i', 'Inflasjon', 'Inflation']] },
    example: {
      nb: '<p>Nominelt avkastningskrav 10 % og inflasjon 2,5 % gir reell rente 1,10 / 1,025 − 1 = <strong>7,3 %</strong>.</p>',
      en: '<p>A 10 % nominal required return and 2.5 % inflation give a real rate of 1.10 / 1.025 − 1 = <strong>7.3 %</strong>.</p>',
    },
    related: ['discount-rate', 'npv', 'brent'],
  },
  {
    slug: 'payback', cat: 'valuation',
    title: { nb: 'Tilbakebetalingstid', en: 'Payback period' },
    short: { nb: 'Tiden det tar før de akkumulerte kontantstrømmene dekker investeringen.', en: 'The time it takes for accumulated cash flows to cover the investment.' },
    keys: {
      nb: ['Enkelt mål på risiko og likviditet.', 'Tar ikke hensyn til kontantstrømmer etter tilbakebetaling.', 'Kort tilbakebetalingstid er viktig i perioder med usikre priser.'],
      en: ['A simple measure of risk and liquidity.', 'Ignores cash flows after payback.', 'Short payback matters in periods of uncertain prices.'],
    },
    body: {
      nb: '<p>Tilbakebetalingstid brukes ofte sammen med [[npv|nåverdi]] og [[irr|internrente]]. Havbunnsutbygginger knyttet til eksisterende infrastruktur har gjerne kort tilbakebetalingstid fordi investeringene er små og produksjonen starter raskt.</p>',
      en: '<p>Payback is often used together with [[npv|NPV]] and [[irr|IRR]]. Subsea tie-backs to existing infrastructure often have short payback because investments are small and production starts quickly.</p>',
    },
    formula: { expr: `Payback = n + ${F('|CCF<sub>n</sub>|', 'CF<sub>n+1</sub>')}`, vars: [['n', 'Siste år med negativ akkumulert kontantstrøm', 'Last year with negative cumulative cash flow'], ['CCF<sub>n</sub>', 'Akkumulert kontantstrøm i år n', 'Cumulative cash flow in year n'], ['CF<sub>n+1</sub>', 'Kontantstrøm året etter', 'Cash flow in the following year']] },
    example: { nb: '<p>Investering 1 000 og 300 per år: etter tre år er 900 tilbakebetalt, og de siste 100 kommer etter 100/300 år. Tilbakebetalingstid: <strong>3,3 år</strong>.</p>', en: '<p>Investment of 1,000 and 300 per year: after three years 900 is repaid, and the last 100 arrive after 100/300 of a year. Payback: <strong>3.3 years</strong>.</p>' },
    related: ['npv', 'irr', 'breakeven-price'],
  },
  {
    slug: 'breakeven-price', cat: 'valuation', featured: true,
    title: { nb: 'Balansepris (breakeven)', en: 'Breakeven price' },
    short: { nb: 'Oljeprisen som gir en nåverdi på null for et prosjekt med et gitt avkastningskrav.', en: 'The oil price at which a project has zero NPV at a given required return.' },
    keys: {
      nb: ['Brukes til å rangere prosjekter etter robusthet mot lave priser.', 'Avhenger av avkastningskravet – oppgi alltid hvilken rente som er brukt.', 'Nye utbygginger på sokkelen har ofte balansepriser på 30–50 dollar per fat.'],
      en: ['Used to rank projects by robustness to low prices.', 'Depends on the required return – always state the rate used.', 'New developments on the shelf often have breakeven prices of 30–50 dollars per barrel.'],
    },
    body: {
      nb: '<p>Balanseprisen finnes ved å senke prisforutsetningen til [[npv|nåverdien]] blir null. Den samler kostnader, produksjonsprofil, skatt og tidsverdi i ett tall som er lett å sammenligne.</p><p>Det finnes flere varianter: «full-cycle» inkluderer leting og utbygging, mens «half-cycle» bare tar med gjenstående kostnader. For et produserende felt er gjenstående balansepris ofte lav fordi investeringene allerede er gjort.</p>',
      en: '<p>The breakeven price is found by lowering the price assumption until the [[npv|NPV]] is zero. It combines costs, production profile, tax and time value into one easily comparable number.</p><p>There are several variants: "full-cycle" includes exploration and development, while "half-cycle" includes only remaining costs. For a producing field the remaining breakeven is often low because the investments are already made.</p>',
    },
    formula: { expr: `&sum;<sub>t</sub> ${F('(P<sub>BE</sub> &middot; Q<sub>t</sub> &minus; C<sub>t</sub>) &middot; (1 &minus; tax)', '(1 + r)<sup>t</sup>')} = 0`, vars: [['P<sub>BE</sub>', 'Balanseprisen', 'Breakeven price'], ['Q<sub>t</sub>', 'Produksjon i år t', 'Production in year t'], ['C<sub>t</sub>', 'Drifts- og investeringskostnader i år t', 'Operating and capital costs in year t']] },
    example: { nb: '<p>I Feltverdi kan du senke Brent-prisen i forutsetningslinjen øverst til et felts verdi blir null – det er feltets gjenstående balansepris med valgt rente.</p>', en: '<p>In Feltverdi you can lower the Brent price in the assumptions bar until a field\'s value reaches zero – that is the field\'s remaining breakeven at the chosen rate.</p>' },
    related: ['npv', 'opex', 'capex', 'brent'],
  },
  {
    slug: 'free-cash-flow', cat: 'valuation',
    title: { nb: 'Fri kontantstrøm', en: 'Free cash flow' },
    short: { nb: 'Kontantstrømmen som er igjen etter driftskostnader, skatt og investeringer.', en: 'The cash left after operating costs, tax and investments.' },
    keys: {
      nb: ['Grunnlaget for utbytte, nedbetaling av gjeld og nye oppkjøp.', 'På sokkelen er skatten den største enkeltposten.', 'Svinger mye med olje- og gasspriser.'],
      en: ['The basis for dividends, debt repayment and acquisitions.', 'On the shelf, tax is the largest single item.', 'Swings strongly with oil and gas prices.'],
    },
    body: { nb: '<p>Fri kontantstrøm er det som faktisk kan deles ut eller brukes på vekst. I verdsettelse er det de frie kontantstrømmene som diskonteres for å finne [[npv|nåverdien]].</p>', en: '<p>Free cash flow is what can actually be distributed or spent on growth. In valuation, it is the free cash flows that are discounted to find the [[npv|NPV]].</p>' },
    formula: { expr: 'FCF = Inntekter &minus; Opex &minus; Capex &minus; Skatt', vars: [['Opex', 'Driftskostnader', 'Operating costs'], ['Capex', 'Investeringer', 'Capital expenditure']] },
    example: { nb: '<p>Inntekter 100, drift 20, investeringer 30 og skatt 41: fri kontantstrøm = <strong>9</strong>.</p>', en: '<p>Revenue 100, opex 20, capex 30 and tax 41: free cash flow = <strong>9</strong>.</p>' },
    related: ['ebitdax', 'npv', 'ncs-petroleum-tax'],
  },
  {
    slug: 'ebitdax', cat: 'valuation',
    title: { nb: 'EBITDAX', en: 'EBITDAX' },
    short: { nb: 'Driftsresultat før renter, skatt, avskrivninger og letekostnader – et vanlig mål på inntjening i oljeselskaper.', en: 'Earnings before interest, tax, depreciation, amortisation and exploration expense – a common earnings measure for oil companies.' },
    keys: {
      nb: ['Fjerner effekten av ulike regnskapsprinsipper for leting.', 'Brukes i gjeldsgrad: netto rentebærende gjeld / EBITDAX.', 'Sier lite om kontantstrøm etter skatt på sokkelen, der skatten er 78 %.'],
      en: ['Removes the effect of different accounting policies for exploration.', 'Used in leverage: net interest-bearing debt / EBITDAX.', 'Says little about after-tax cash flow on the shelf, where tax is 78 %.'],
    },
    body: { nb: '<p>EBITDAX er nyttig for å sammenligne selskaper, og bankene bruker det i lånebetingelser. Men på norsk sokkel går mer enn tre firedeler av overskuddet til staten, så netto gjeld delt på kontantstrøm etter skatt er ofte et bedre mål på betjeningsevne.</p>', en: '<p>EBITDAX is useful for comparing companies, and banks use it in loan covenants. But on the Norwegian shelf more than three quarters of profit goes to the state, so net debt divided by after-tax cash flow is often a better measure of debt capacity.</p>' },
    formula: { expr: 'EBITDAX = EBITDA + Letekostnader', vars: [['EBITDA', 'Driftsresultat før avskrivninger', 'Earnings before depreciation and amortisation']] },
    example: { nb: '<p>Netto gjeld 7 mrd. dollar og EBITDAX 10 mrd. dollar gir gjeldsgrad <strong>0,7×</strong>.</p>', en: '<p>Net debt of 7 bn dollars and EBITDAX of 10 bn dollars give leverage of <strong>0.7×</strong>.</p>' },
    related: ['free-cash-flow', 'rbl', 'ncs-petroleum-tax'],
  },
  {
    slug: 'value-per-barrel', cat: 'valuation', featured: true,
    title: { nb: 'Verdi per fat og per flytende fat', en: 'Value per barrel and per flowing barrel' },
    short: { nb: 'Nøkkeltall for å sammenligne transaksjoner: pris delt på reserver eller på daglig produksjon.', en: 'Key metrics for comparing transactions: price divided by reserves or by daily production.' },
    keys: {
      nb: ['EV/2P viser hva kjøperen betaler per fat i bakken.', 'EV per flytende fat viser hva kjøperen betaler per fat daglig produksjon.', 'Må justeres for skatteregime – et fat i Danmark (64 %) er verdt mer etter skatt enn i Norge (78 %).'],
      en: ['EV/2P shows what the buyer pays per barrel in the ground.', 'EV per flowing barrel shows what the buyer pays per barrel of daily production.', 'Must be adjusted for the tax regime – a barrel in Denmark (64 %) is worth more after tax than in Norway (78 %).'],
    },
    body: { nb: '<p>Når selskaper kjøpes og selges, sammenlignes prisen ofte med [[reserves|reservene]] og produksjonen. Tallene er enkle, men grove: de tar ikke hensyn til hvor raskt reservene produseres, gassandel, kostnader eller fjerningsforpliktelser.</p>', en: '<p>When companies are bought and sold, the price is often compared with the [[reserves|reserves]] and production. The numbers are simple but crude: they ignore how fast the reserves are produced, gas share, costs or decommissioning liabilities.</p>' },
    formula: { expr: `EV/2P = ${F('EV', '2P-reserver')} &nbsp;&nbsp; EV per flytende fat = ${F('EV', 'Produksjon (fat o.e./d)')}`, vars: [['EV', 'Virksomhetsverdi (egenkapital + netto gjeld)', 'Enterprise value (equity + net debt)']] },
    example: { nb: '<p>Vår Energis kjøp av ConocoPhillips Norge (2026): 4,425 mrd. dollar for 414 mill. fat 2P og 120 000 fat o.e./d gir <strong>10,7 dollar per fat</strong> og <strong>om lag 37 000 dollar per flytende fat</strong>.</p>', en: '<p>Vår Energi\'s purchase of ConocoPhillips Norway (2026): 4.425 bn dollars for 414 MMboe of 2P and 120,000 boe/d gives <strong>10.7 dollars per barrel</strong> and <strong>about 37,000 dollars per flowing barrel</strong>.</p>' },
    related: ['reserves', 'npv', 'synergies', 'farm-down'],
  },
  {
    slug: 'standardized-measure', cat: 'valuation',
    title: { nb: 'Standardized measure (PV-10)', en: 'Standardized measure (PV-10)' },
    short: { nb: 'Den amerikanske børstilsynets (SEC) standardiserte nåverdi av sikre reserver, diskontert med 10 %.', en: 'The US SEC\'s standardised present value of proved reserves, discounted at 10 %.' },
    keys: {
      nb: ['Bruker gjennomsnittspris de siste tolv månedene og dagens kostnader.', 'Bare sikre (1P) reserver er med – ofte konservativt.', 'PV-10 er før skatt; standardized measure er etter skatt.'],
      en: ['Uses the average price of the last twelve months and current costs.', 'Only proved (1P) reserves are included – often conservative.', 'PV-10 is pre-tax; the standardized measure is after tax.'],
    },
    body: { nb: '<p>Amerikansk børsnoterte selskaper som ConocoPhillips må rapportere en standardisert nåverdi av sine [[reserves|sikre reserver]]. Fordi metoden er lik for alle, er den nyttig for sammenligning – men den er ikke en markedsverdi.</p>', en: '<p>US-listed companies such as ConocoPhillips must report a standardised present value of their [[reserves|proved reserves]]. Because the method is the same for everyone it is useful for comparison – but it is not a market value.</p>' },
    formula: { expr: `SM = &sum;<sub>t</sub> ${F('(P<sub>12m</sub> &middot; Q<sub>t</sub> &minus; Opex<sub>t</sub> &minus; Capex<sub>t</sub> &minus; Skatt<sub>t</sub>)', '1.10<sup>t</sup>')}`, vars: [['P<sub>12m</sub>', 'Snittpris første dag i hver av de siste tolv månedene', 'Average first-day-of-month price over the last twelve months'], ['Q<sub>t</sub>', 'Produksjon av sikre reserver', 'Production of proved reserves']] },
    example: { nb: '<p>ConocoPhillips oppga en standardized measure på 1,37 mrd. dollar for Norge ved utgangen av 2025, mot 2,62 mrd. dollar i 2023.</p>', en: '<p>ConocoPhillips reported a standardized measure of 1.37 bn dollars for Norway at the end of 2025, against 2.62 bn dollars in 2023.</p>' },
    related: ['reserves', 'npv', 'discount-rate'],
  },
  // ---------------- Reserves & production ----------------
  {
    slug: 'boe', cat: 'reserves', featured: true,
    title: { nb: 'Fat oljeekvivalenter (fat o.e.)', en: 'Barrel of oil equivalent (boe)' },
    short: { nb: 'Felles enhet som gjør olje, gass og NGL sammenlignbare.', en: 'A common unit that makes oil, gas and NGL comparable.' },
    keys: {
      nb: ['1 standard kubikkmeter (Sm³) olje = 6,29 fat.', 'Sodir regner 1 000 Sm³ gass som 1 Sm³ o.e.; mange børsselskaper bruker 6 000 kubikkfot gass per fat o.e.', 'Fat o.e. sier noe om energi, ikke om verdi – gass og olje prises ulikt.'],
      en: ['1 standard cubic metre (Sm³) of oil = 6.29 barrels.', 'Sodir counts 1,000 Sm³ of gas as 1 Sm³ oe; many listed companies use 6,000 cubic feet of gas per boe.', 'Boe says something about energy, not value – gas and oil are priced differently.'],
    },
    body: { nb: '<p>Fordi felt produserer en blanding av olje, gass, kondensat og NGL, trengs en felles enhet. Omregningen bygger på energiinnhold. Når verdien skal beregnes, må hvert produkt likevel prises for seg – se [[gas-units|energienheter for gass]].</p>', en: '<p>Because fields produce a mix of oil, gas, condensate and NGL, a common unit is needed. The conversion is based on energy content. When value is calculated, each product must still be priced separately – see [[gas-units|energy units for gas]].</p>' },
    formula: { expr: '1 Sm³ o.e. = 6,29 fat o.e. &nbsp;&nbsp; 1 mrd. Sm³ gass &asymp; 6,29 mill. fat o.e.', vars: [['Sm³', 'Standard kubikkmeter (15 °C, 1 atm)', 'Standard cubic metre (15 °C, 1 atm)']] },
    example: { nb: '<p>Johan Sverdrup produserte 42,2 mill. Sm³ o.e. i 2025: 42,2 × 6,29 / 365 = <strong>727 000 fat o.e. per dag</strong>.</p>', en: '<p>Johan Sverdrup produced 42.2 million Sm³ oe in 2025: 42.2 × 6.29 / 365 = <strong>727,000 boe per day</strong>.</p>' },
    related: ['gas-units', 'reserves', 'netback'],
  },
  {
    slug: 'reserves', cat: 'reserves', featured: true,
    title: { nb: 'Reserver (1P, 2P, 3P)', en: 'Reserves (1P, 2P, 3P)' },
    short: { nb: 'Oppdagede volumer som er kommersielle og forventes produsert under godkjente planer.', en: 'Discovered volumes that are commercial and expected to be produced under approved plans.' },
    keys: {
      nb: ['1P = sikre, 2P = sikre + sannsynlige, 3P = sikre + sannsynlige + mulige.', '2P er det vanligste grunnlaget for verdsettelse i Europa.', 'Reserver vokser ofte over tid når nye prosjekter modnes.'],
      en: ['1P = proved, 2P = proved + probable, 3P = proved + probable + possible.', '2P is the most common basis for valuation in Europe.', 'Reserves often grow over time as new projects mature.'],
    },
    body: { nb: '<p>Reserver klassifiseres etter rammeverket [[prms|PRMS]]. Sikre reserver (1P) har minst 90 % sannsynlighet for å bli produsert, 2P er beste anslag (P50) og 3P et høyt anslag. Sodirs «gjenværende reserver» tilsvarer omtrent forventningsverdien for godkjente prosjekter.</p><p>Historisk har reservene på sokkelen vokst: fra 2010 til 2025 ble det produsert og gjenstår til sammen om lag 1,3–1,4 ganger det Sodir oppga som gjenværende i 2010. Feltverdi tar hensyn til dette gjennom innstillingen [[decline-curve|reservevekst]].</p>', en: '<p>Reserves are classified under the [[prms|PRMS]] framework. Proved reserves (1P) have at least a 90 % probability of being produced, 2P is the best estimate (P50) and 3P a high estimate. Sodir\'s "remaining reserves" roughly correspond to the expected value for approved projects.</p><p>Historically, reserves on the shelf have grown: from 2010 to 2025 the volumes produced plus those remaining add up to about 1.3–1.4 times what Sodir reported as remaining in 2010. Feltverdi accounts for this through the [[decline-curve|reserve growth]] setting.</p>' },
    formula: null,
    example: { nb: '<p>ConocoPhillips oppga 221 mill. fat o.e. sikre reserver i Norge (1P) ved utgangen av 2025, mens Vår Energi anslo 414 mill. fat o.e. 2P for de samme eiendelene.</p>', en: '<p>ConocoPhillips reported 221 MMboe of proved reserves in Norway (1P) at the end of 2025, while Vår Energi estimated 414 MMboe of 2P for the same assets.</p>' },
    related: ['prms', 'contingent-resources', 'reserve-replacement', 'reserve-life'],
  },
  {
    slug: 'prms', cat: 'reserves',
    title: { nb: 'PRMS – klassifisering av ressurser', en: 'PRMS – resource classification' },
    short: { nb: 'Bransjens felles rammeverk for å klassifisere petroleumsressurser etter modenhet og usikkerhet.', en: 'The industry\'s common framework for classifying petroleum resources by maturity and uncertainty.' },
    keys: {
      nb: ['Skiller mellom reserver, betingede ressurser og prospektive ressurser.', 'Usikkerhet uttrykkes som lavt, beste og høyt anslag (1/2/3).', 'Sodir bruker et tilsvarende norsk klassifikasjonssystem.'],
      en: ['Distinguishes between reserves, contingent resources and prospective resources.', 'Uncertainty is expressed as low, best and high estimates (1/2/3).', 'Sodir uses a similar Norwegian classification system.'],
    },
    body: { nb: '<p>Petroleum Resources Management System (PRMS) er utarbeidet av blant andre Society of Petroleum Engineers. [[reserves|Reserver]] er kommersielle og besluttet. [[contingent-resources|Betingede ressurser]] er oppdaget, men ennå ikke kommersielle. Prospektive ressurser er ikke oppdaget.</p>', en: '<p>The Petroleum Resources Management System (PRMS) was developed by, among others, the Society of Petroleum Engineers. [[reserves|Reserves]] are commercial and sanctioned. [[contingent-resources|Contingent resources]] are discovered but not yet commercial. Prospective resources are undiscovered.</p>' },
    formula: null,
    example: { nb: '<p>Et funn som venter på utbyggingsbeslutning klassifiseres som betinget ressurs (2C). Når planen for utbygging og drift godkjennes, flyttes volumene til reserver (2P).</p>', en: '<p>A discovery awaiting a development decision is classified as a contingent resource (2C). When the plan for development and operation is approved, the volumes move to reserves (2P).</p>' },
    related: ['reserves', 'contingent-resources'],
  },
  {
    slug: 'contingent-resources', cat: 'reserves',
    title: { nb: 'Betingede ressurser (2C)', en: 'Contingent resources (2C)' },
    short: { nb: 'Oppdagede volumer som ennå ikke er kommersielle eller besluttet utbygd.', en: 'Discovered volumes that are not yet commercial or sanctioned for development.' },
    keys: {
      nb: ['Kilden til framtidig reservevekst.', 'Verdsettes vanligvis med en risikofaktor for sannsynlighet for utbygging.', 'Ikke med i Feltverdis feltverdier, men delvis fanget opp gjennom reservevekst.'],
      en: ['The source of future reserve growth.', 'Usually valued with a risk factor for the probability of development.', 'Not included in Feltverdi\'s field values, but partly captured through reserve growth.'],
    },
    body: { nb: '<p>Betingede ressurser omfatter nye brønnmål, tiltak for økt utvinning og små funn som kan knyttes til eksisterende felt. Når de modnes, blir de [[reserves|reserver]], og det forklarer mye av den historiske reserveveksten på sokkelen.</p>', en: '<p>Contingent resources include new well targets, improved recovery measures and small discoveries that can be tied back to existing fields. As they mature they become [[reserves|reserves]], which explains much of the historical reserve growth on the shelf.</p>' },
    formula: { expr: 'Risikojustert verdi = Verdi<sub>2C</sub> &times; P<sub>utbygging</sub>', vars: [['P<sub>utbygging</sub>', 'Sannsynlighet for at ressursen bygges ut', 'Probability that the resource is developed']] },
    example: { nb: '<p>Vår Energi oppga 101 mill. fat o.e. 2C i tillegg til 414 mill. fat o.e. 2P i ConocoPhillips-oppkjøpet.</p>', en: '<p>Vår Energi reported 101 MMboe of 2C in addition to 414 MMboe of 2P in the ConocoPhillips acquisition.</p>' },
    related: ['reserves', 'prms', 'reserve-replacement'],
  },
  {
    slug: 'reserve-replacement', cat: 'reserves',
    title: { nb: 'Reserveerstatningsgrad (RRR)', en: 'Reserve replacement ratio (RRR)' },
    short: { nb: 'Hvor mye nye reserver et selskap legger til, sammenlignet med hvor mye det produserer.', en: 'How much new reserves a company adds, compared with how much it produces.' },
    keys: {
      nb: ['Over 100 % betyr at reservebasen vokser.', 'Under 100 % over tid betyr at selskapet krymper.', 'Bør vurderes over flere år fordi enkeltår svinger mye.'],
      en: ['Above 100 % means the reserve base is growing.', 'Below 100 % over time means the company is shrinking.', 'Should be judged over several years because single years swing a lot.'],
    },
    body: { nb: '<p>Reserveerstatning skjer gjennom nye funn, revisjoner, økt utvinning og oppkjøp. Investorer følger tallet nøye fordi det sier om dagens produksjon kan opprettholdes.</p>', en: '<p>Reserves are replaced through discoveries, revisions, improved recovery and acquisitions. Investors follow the ratio closely because it shows whether today\'s production can be sustained.</p>' },
    formula: { expr: `RRR = ${F('Reservetilvekst', 'Produksjon')} &times; 100 %`, vars: [['Reservetilvekst', 'Nye funn + revisjoner + økt utvinning (+ oppkjøp)', 'Discoveries + revisions + improved recovery (+ acquisitions)']] },
    example: { nb: '<p>ConocoPhillips Norge la til 26 mill. fat o.e. i 2023–2025 og produserte om lag 136 mill. fat o.e.: RRR = <strong>19 %</strong>.</p>', en: '<p>ConocoPhillips Norway added 26 MMboe in 2023–2025 and produced about 136 MMboe: RRR = <strong>19 %</strong>.</p>' },
    related: ['reserves', 'reserve-life', 'fd-cost'],
  },
  {
    slug: 'reserve-life', cat: 'reserves',
    title: { nb: 'Reservelevetid (R/P)', en: 'Reserve life (R/P ratio)' },
    short: { nb: 'Antall år reservene varer med dagens produksjonstakt.', en: 'The number of years reserves would last at the current production rate.' },
    keys: {
      nb: ['Enkelt mål på hvor lenge et felt eller selskap kan produsere.', 'Produksjonen faller i praksis, så faktisk levetid er lengre enn R/P.', 'Høy R/P gir lavere verdi per fat fordi produksjonen kommer senere.'],
      en: ['A simple measure of how long a field or company can produce.', 'Production declines in practice, so actual life is longer than R/P.', 'A high R/P gives a lower value per barrel because production comes later.'],
    },
    body: { nb: '<p>Reservelevetid sier noe om robusthet, men også om verdi: et felt med R/P på 25 år, som Snøhvit, har lav verdi per fat fordi mange fat produseres langt fram i tid og diskonteres hardt.</p>', en: '<p>Reserve life says something about robustness, but also about value: a field with an R/P of 25 years, such as Snøhvit, has a low value per barrel because many barrels are produced far in the future and discounted heavily.</p>' },
    formula: { expr: `R/P = ${F('Gjenværende reserver', 'Årlig produksjon')}`, vars: [] },
    example: { nb: '<p>ConocoPhillips Norge: 221 mill. fat o.e. sikre reserver / 44 mill. fat o.e. per år = <strong>5 år</strong>.</p>', en: '<p>ConocoPhillips Norway: 221 MMboe proved reserves / 44 MMboe per year = <strong>5 years</strong>.</p>' },
    related: ['reserves', 'decline-curve', 'reserve-replacement'],
  },
  {
    slug: 'decline-curve', cat: 'reserves', featured: true,
    title: { nb: 'Fallkurve og fallrate', en: 'Decline curve and decline rate' },
    short: { nb: 'Hvor raskt produksjonen fra et felt faller over tid etter platå.', en: 'How fast production from a field falls over time after plateau.' },
    keys: {
      nb: ['Eksponentielt fall: produksjonen faller med en fast prosent hvert år.', 'Arps-likningen gir også hyperbolsk fall, som flater ut over tid.', 'Fallraten er en av de viktigste driverne for verdien av modne felt.'],
      en: ['Exponential decline: production falls by a fixed percentage every year.', 'The Arps equation also gives hyperbolic decline, which flattens over time.', 'The decline rate is one of the most important value drivers for mature fields.'],
    },
    body: { nb: '<p>Etter [[plateau|platå]] faller produksjonen når trykket synker og vannandelen øker. Nye brønner, vanninjeksjon og brønnintervensjoner bremser fallet. Modne felt på sokkelen har i praksis falt om lag 5–6 % per år de siste årene.</p><p>Feltverdi bruker feltets faktiske fall de siste fem årene, begrenset av Sodirs reserver og en antatt [[reserves|reservevekst]]. En tilbaketest fra 2010 og 2015 viste at en ren tilpasning til reservene undervurderte produksjonen med 35–45 %.</p>', en: '<p>After [[plateau|plateau]], production falls as pressure drops and the water cut rises. New wells, water injection and well interventions slow the decline. Mature fields on the shelf have in practice declined about 5–6 % per year in recent years.</p><p>Feltverdi uses each field\'s actual decline over the last five years, bounded by Sodir\'s reserves and an assumed [[reserves|reserve growth]]. A backtest from 2010 and 2015 showed that fitting purely to reserves underestimated production by 35–45 %.</p>' },
    formula: { expr: `q<sub>t</sub> = q<sub>0</sub> &middot; (1 &minus; D)<sup>t</sup> &nbsp;&nbsp;&nbsp; Arps: q<sub>t</sub> = ${F('q<sub>i</sub>', '(1 + b &middot; D<sub>i</sub> &middot; t)<sup>1/b</sup>')}`, vars: [['q<sub>0</sub>, q<sub>i</sub>', 'Startproduksjon', 'Initial production rate'], ['D, D<sub>i</sub>', 'Fallrate per år (initial)', 'Decline rate per year (initial)'], ['b', 'Hyperbolsk eksponent (0 = eksponentielt)', 'Hyperbolic exponent (0 = exponential)']] },
    example: { nb: '<p>Et felt som produserer 100 000 fat o.e./d og faller 10 % per år, produserer 100 000 × 0,9<sup>5</sup> = <strong>59 000 fat o.e./d</strong> om fem år.</p>', en: '<p>A field producing 100,000 boe/d and declining 10 % per year produces 100,000 × 0.9<sup>5</sup> = <strong>59,000 boe/d</strong> in five years.</p>' },
    related: ['plateau', 'reserves', 'reserve-life', 'recovery-factor'],
    feltverdi: '#/metode',
  },
  {
    slug: 'plateau', cat: 'reserves',
    title: { nb: 'Platåproduksjon', en: 'Plateau production' },
    short: { nb: 'Perioden der et felt produserer på et stabilt, høyt nivå – ofte begrenset av anleggskapasitet.', en: 'The period in which a field produces at a stable, high rate – often limited by facility capacity.' },
    keys: {
      nb: ['Platået bestemmes ofte av prosesskapasitet, ikke reservoaret.', 'Langt platå gir høy verdi fordi mange fat produseres tidlig.', 'Etter platå følger en fallperiode.'],
      en: ['The plateau is often set by processing capacity, not the reservoir.', 'A long plateau gives high value because many barrels are produced early.', 'A decline period follows the plateau.'],
    },
    body: { nb: '<p>Store gassfelt som Troll og Snøhvit holdes på platå fordi gassen må gjennom eksportrør eller LNG-anlegg med begrenset kapasitet. Johan Sverdrup produserer på platå nær oljebehandlingskapasiteten. Feltverdi leser Sodirs statusbeskrivelser for å finne felt på platå.</p>', en: '<p>Large gas fields such as Troll and Snøhvit are held on plateau because the gas must pass through export pipelines or LNG plants with limited capacity. Johan Sverdrup produces on plateau close to its oil handling capacity. Feltverdi reads Sodir\'s status descriptions to identify fields on plateau.</p>' },
    formula: { expr: 'Platåår &asymp; ' + F('Reserver &minus; q<sub>p</sub> &middot; (1&minus;D)/D', 'q<sub>p</sub>'), vars: [['q<sub>p</sub>', 'Platåproduksjon per år', 'Plateau production per year'], ['D', 'Fallrate etter platå', 'Decline rate after plateau']] },
    example: { nb: '<p>Troll har om lag 3 600 mill. fat o.e. igjen og produserer om lag 274 mill. per år. Med 11 % fall etterpå gir det rundt seks år til platå.</p>', en: '<p>Troll has about 3,600 MMboe left and produces about 274 MMboe per year. With 11 % decline afterwards, that gives around six more years of plateau.</p>' },
    related: ['decline-curve', 'reserves', 'npv'],
  },
  {
    slug: 'recovery-factor', cat: 'reserves',
    title: { nb: 'Utvinningsgrad', en: 'Recovery factor' },
    short: { nb: 'Andelen av petroleum i reservoaret som faktisk kan produseres.', en: 'The share of the petroleum in place that can actually be produced.' },
    keys: {
      nb: ['Norsk sokkel har høy utvinningsgrad for olje sammenlignet med resten av verden.', 'Økes med vanninjeksjon, gassinjeksjon og nye brønner.', 'Høyere utvinningsgrad betyr større reserver fra samme reservoar.'],
      en: ['The Norwegian shelf has a high oil recovery factor compared with the rest of the world.', 'Increased by water injection, gas injection and new wells.', 'A higher recovery factor means larger reserves from the same reservoir.'],
    },
    body: { nb: '<p>Utvinningsgraden avhenger av reservoarkvalitet, væsketype og teknologi. Tiltak for økt utvinning (IOR/EOR) er en hovedårsak til [[reserves|reservevekst]] på modne felt.</p>', en: '<p>The recovery factor depends on reservoir quality, fluid type and technology. Improved and enhanced oil recovery (IOR/EOR) is a main reason for [[reserves|reserve growth]] on mature fields.</p>' },
    formula: { expr: `Utvinningsgrad = ${F('Utvinnbart volum', 'Tilstedeværende volum')}`, vars: [] },
    example: { nb: '<p>Et reservoar med 1 000 mill. fat olje på stedet og 450 mill. fat utvinnbart har en utvinningsgrad på <strong>45 %</strong>.</p>', en: '<p>A reservoir with 1,000 million barrels of oil in place and 450 million barrels recoverable has a recovery factor of <strong>45 %</strong>.</p>' },
    related: ['reserves', 'decline-curve', 'contingent-resources'],
  },
  // ---------------- Costs ----------------
  {
    slug: 'capex', cat: 'costs',
    title: { nb: 'Investeringer (capex)', en: 'Capital expenditure (capex)' },
    short: { nb: 'Utgifter til utbygging, brønner og anlegg som gir produksjon over flere år.', en: 'Spending on development, wells and facilities that produces over several years.' },
    keys: {
      nb: ['Omfatter både nye utbygginger og løpende boring på produserende felt.', 'Kostnadsføres umiddelbart i særskattegrunnlaget siden 2022.', 'Uttrykkes ofte per fat for å sammenligne felt.'],
      en: ['Includes both new developments and ongoing drilling on producing fields.', 'Expensed immediately in the special tax base since 2022.', 'Often expressed per barrel to compare fields.'],
    },
    body: { nb: '<p>Sodir publiserer investeringer per felt per år, og operatørenes forventede framtidige investeringer per felt. Feltverdi fordeler de forventede investeringene på produksjonen modellen venter, slik at summen blir om lag Sodirs tall. Sodirs forventede tall gjelder fra 1. januar i tallets år (nå 2025), mens prognosen starter i 2026. Den delen som hører til 2025, regnes derfor ikke med i prognosen. Så lenge Sodir ikke har publisert faktiske 2025-investeringer, er de anslått ut fra det samme tallet. Felt uten Sodir-tall bruker sin egen investeringsintensitet – investeringer delt på produksjon de siste tre årene.</p>', en: '<p>Sodir publishes investments per field per year, and the operators\' expected future investments per field. Feltverdi spreads the expected investments over the production the model expects, so the total is close to Sodir\'s figure. Sodir\'s expected figure runs from 1 January of its year (now 2025), while the forecast starts in 2026. The part that belongs to 2025 is therefore left out of the forecast. Until Sodir publishes the actual 2025 investments, they are estimated from the same figure. Fields without a Sodir figure use their own investment intensity – investments divided by production over the last three years.</p>' },
    formula: { expr: `Capex per fat = ${F('Investeringer', 'Produksjon (fat o.e.)')}`, vars: [] },
    example: { nb: '<p>Heidrun investerte om lag 2,9 mrd. kroner per år i 2022–2024. Med ConocoPhillips\' andel på 24 % og 5,6 mill. fat o.e. per år gir det om lag <strong>12 dollar per fat</strong>.</p>', en: '<p>Heidrun invested about NOK 2.9 bn per year in 2022–2024. With ConocoPhillips\' 24 % share and 5.6 MMboe per year, that is about <strong>12 dollars per barrel</strong>.</p>' },
    related: ['opex', 'fd-cost', 'ncs-petroleum-tax'],
  },
  {
    slug: 'opex', cat: 'costs',
    title: { nb: 'Driftskostnader (opex) og løftekostnad', en: 'Operating costs (opex) and lifting cost' },
    short: { nb: 'Løpende kostnader for å drive et felt, ofte målt per produsert fat.', en: 'Ongoing costs of running a field, often measured per barrel produced.' },
    keys: {
      nb: ['En stor del av kostnadene er faste og uavhengige av produksjonen.', 'Når produksjonen faller, stiger kostnaden per fat.', 'Norske selskaper ligger typisk på 7–14 dollar per fat.'],
      en: ['A large part of the costs are fixed and independent of production.', 'When production falls, the cost per barrel rises.', 'Norwegian companies typically range from 7 to 14 dollars per barrel.'],
    },
    body: { nb: '<p>Driftskostnader omfatter bemanning, vedlikehold, logistikk, forsikring, CO₂-avgift og tariffer. Fordi mye er fast, er økonomien i sene faser av feltets levetid følsom for fall i produksjonen. Feltverdi beregner driftskostnadene fra hvert felts innretninger – plattformer, flytere, havbunnsrammer og åpne brønner – kalibrert mot selskapenes rapporterte produksjonskostnad. Derfor er kostnaden per fat lav på store moderne felt (Johan Sverdrup under 2 dollar) og høy på gamle plattformfelt med lav produksjon. Havbunnsfelt betaler en prosesseringstariff til vertsplattformen, og vertsfeltet får den som inntekt.</p>', en: '<p>Operating costs include staffing, maintenance, logistics, insurance, CO₂ tax and tariffs. Because much is fixed, the economics of late field life are sensitive to falling production. Feltverdi calculates operating costs from each field’s facilities – platforms, floaters, subsea templates and open wells – calibrated against the companies’ reported production cost. That is why the cost per barrel is low on large modern fields (Johan Sverdrup below 2 dollars) and high on old platform fields with low production. Subsea fields pay a processing tariff to the host platform, and the host field receives it as income.</p>' },
    formula: { expr: `Opex per fat = ${F('Faste kostnader + variable kostnader', 'Produksjon')}`, vars: [] },
    example: { nb: '<p>Aker BP hadde en produksjonskostnad på 7,3 dollar per fat i 2025, Vår Energi 11,1 og ConocoPhillips Norge 13,9.</p>', en: '<p>Aker BP had a production cost of 7.3 dollars per barrel in 2025, Vår Energi 11.1 and ConocoPhillips Norway 13.9.</p>' },
    related: ['capex', 'breakeven-price', 'decline-curve'],
  },
  {
    slug: 'decommissioning', cat: 'costs',
    title: { nb: 'Fjerning og nedstengning (ARO)', en: 'Decommissioning (ARO)' },
    short: { nb: 'Kostnaden ved å plugge brønner og fjerne innretninger når feltet stenges ned.', en: 'The cost of plugging wells and removing installations when a field is shut down.' },
    keys: {
      nb: ['Regnskapsføres som en forpliktelse (Asset Retirement Obligation).', 'Fradragsberettiget med 78 % på norsk sokkel.', 'Selger av en lisensandel har subsidiært ansvar for fjerning.'],
      en: ['Recorded as a liability (Asset Retirement Obligation).', 'Deductible at 78 % on the Norwegian shelf.', 'The seller of a licence share remains secondarily liable for decommissioning.'],
    },
    body: { nb: '<p>Fjerning kommer sist i feltets levetid og er derfor sterkt diskontert, men beløpene er store. Mesteparten av kostnaden er plugging av brønner: Sokkeldirektoratet oppgir fra knapt 50 mill. til flere hundre millioner kroner per brønn, og havbunnsbrønner er klart dyrest. Feltverdi beregner fjerning for hvert felt fra antall åpne brønner og innretninger. Ved transaksjoner krever selgeren ofte sikkerhet fordi selgeren fortsatt kan bli holdt ansvarlig dersom kjøperen ikke betaler.</p>', en: '<p>Decommissioning comes at the end of field life and is therefore heavily discounted, but the amounts are large. Most of the cost is plugging wells: the Norwegian Offshore Directorate gives from just under NOK 50 million to several hundred million per well, and subsea wells are clearly the most expensive. Feltverdi calculates decommissioning for each field from its number of open wells and facilities. In transactions the seller often requires security because the seller can still be held liable if the buyer does not pay.</p>' },
    formula: { expr: `Nåverdi etter skatt = ${F('Kostnad &times; (1 &minus; 0,78)', '(1 + r)<sup>T</sup>')}`, vars: [['T', 'År til fjerning', 'Years until decommissioning']] },
    example: { nb: '<p>ConocoPhillips Skandinavia hadde avsatt 16,3 mrd. kroner til fjerning ved utgangen av 2024. Etter skatt bærer selskapet om lag 22 %, eller 3,6 mrd. kroner, før diskontering.</p>', en: '<p>ConocoPhillips Skandinavia had provisions of NOK 16.3 bn for decommissioning at the end of 2024. After tax the company bears about 22 %, or NOK 3.6 bn, before discounting.</p>' },
    related: ['ncs-petroleum-tax', 'npv', 'farm-down'],
  },
  {
    slug: 'fd-cost', cat: 'costs',
    title: { nb: 'Funn- og utbyggingskostnad (F&D)', en: 'Finding and development cost (F&D)' },
    short: { nb: 'Hva det koster å finne og bygge ut ett fat nye reserver.', en: 'What it costs to find and develop one barrel of new reserves.' },
    keys: {
      nb: ['Måler hvor effektivt et selskap erstatter reservene sine.', 'Sammenlignes med verdien per fat for å vurdere lønnsomhet.', 'Bør beregnes over tre til fem år.'],
      en: ['Measures how efficiently a company replaces its reserves.', 'Compared with the value per barrel to judge profitability.', 'Should be calculated over three to five years.'],
    },
    body: { nb: '<p>Hvis det koster mer å finne og bygge ut et fat enn fatet er verdt i bakken, ødelegges verdier selv om [[reserve-replacement|reserveerstatningen]] er høy.</p>', en: '<p>If it costs more to find and develop a barrel than the barrel is worth in the ground, value is destroyed even if [[reserve-replacement|reserve replacement]] is high.</p>' },
    formula: { expr: `F&amp;D = ${F('Lete- og utbyggingskostnader', 'Reservetilvekst')}`, vars: [] },
    example: { nb: '<p>Leting og utbygging for 2 000 mill. dollar som gir 200 mill. fat o.e. nye reserver: F&amp;D = <strong>10 dollar per fat</strong>.</p>', en: '<p>Exploration and development of 2,000 million dollars that adds 200 MMboe of new reserves: F&amp;D = <strong>10 dollars per barrel</strong>.</p>' },
    related: ['reserve-replacement', 'capex', 'value-per-barrel'],
  },
  // ---------------- Tax ----------------
  {
    slug: 'ncs-petroleum-tax', cat: 'tax', featured: true,
    title: { nb: 'Petroleumsskatt på norsk sokkel', en: 'Norwegian petroleum tax' },
    short: { nb: 'Selskapsskatt på 22 % og særskatt på 71,8 % som til sammen gir en marginalskatt på 78 %.', en: 'Corporate tax of 22 % and special tax of 71.8 %, giving a combined marginal tax rate of 78 %.' },
    keys: {
      nb: ['To skattegrunnlag: alminnelig inntekt (22 %) og særskattegrunnlaget (71,8 %). Betalt selskapsskatt trekkes fra i særskattegrunnlaget, slik at marginalskatten blir 78 %.', 'Investeringer avskrives over seks år i selskapsskatten, men kostnadsføres umiddelbart i særskatten (kontantstrømskatt fra 2022).', 'Skatteverdien av underskudd i særskatten utbetales året etter; underskudd i selskapsskatten fremføres.', 'Skatten betales forskuddsvis i ti terminer – fem i inntektsåret og fem året etter.'],
      en: ['Two tax bases: ordinary income (22 %) and the special tax base (71.8 %). Corporate tax paid is deducted in the special tax base, so the marginal rate becomes 78 %.', 'Investments are depreciated over six years in the corporate tax, but expensed immediately in the special tax (cash-flow tax from 2022).', 'The tax value of special tax losses is paid out the year after; corporate tax losses are carried forward.', 'The tax is paid in advance in ten instalments – five in the income year and five the year after.'],
    },
    body: {
      nb: `<p>Petroleumsskatten bygger på den vanlige selskapsskatten, men med en ekstra særskatt fordi utvinning av olje og gass gir en grunnrente – en avkastning ut over det som er normalt for kapital. Systemet er laget for å være <em>nøytralt</em>: et prosjekt som er lønnsomt før skatt, skal også være lønnsomt etter skatt.</p>
<h3>Slik beregnes skattegrunnlaget</h3>
<ul>
<li><strong>Inntekter:</strong> olje som selges til nærstående selskaper skattlegges til <a href="#/wiki/norm-price">normpris</a>, fastsatt av Petroleumsprisrådet. Gass skattlegges til faktisk salgspris.</li>
<li><strong>Fradrag:</strong> alle relevante kostnader – drift, leting, forskning og utvikling, fjerning og investeringer. Underskudd og letekostnader på ett felt kan trekkes fra mot inntekter fra andre felt på sokkelen.</li>
<li><strong>Finanskostnader</strong> (renter) er bare fradragsberettiget i selskapsskatten, ikke i særskattegrunnlaget.</li>
</ul>
<h3>To skattegrunnlag</h3>
<div class="tbl-wrap"><table><thead><tr><th></th><th>Selskapsskatt (alminnelig inntekt)</th><th>Særskatt</th></tr></thead><tbody>
<tr><td>Sats</td><td>22 %</td><td>71,8 %</td></tr>
<tr><td>Investeringer</td><td>Lineær avskrivning over 6 år fra investeringsåret</td><td>Kostnadsføres umiddelbart (fra 2022)</td></tr>
<tr><td>Renter</td><td>Fradrag</td><td>Ikke fradrag</td></tr>
<tr><td>Selskapsskatt</td><td>–</td><td>Betalt selskapsskatt trekkes fra</td></tr>
<tr><td>Underskudd</td><td>Fremføres</td><td>Skatteverdien utbetales året etter</td></tr>
</tbody></table></div>
<p>Fordi selskapsskatten trekkes fra i særskattegrunnlaget, blir den samlede marginalskatten 22 % + 71,8 % × (1 − 0,22) = 78 %. Les mer om <a href="#/wiki/tax-depreciation">avskrivninger</a>, <a href="#/wiki/tax-losses">underskudd</a> og <a href="#/wiki/tax-instalments">terminskatt</a>.</p>
<p>I tillegg kommer CO₂-avgift og arealavgift, og staten er direkte eier gjennom SDØE (Petoro). Feltverdi forenkler ved å regne skatten i samme år som inntekten og anta at alle fradrag kan brukes fullt ut.</p>`,
      en: `<p>The petroleum tax builds on the ordinary corporate tax, with an additional special tax because oil and gas production earns a resource rent – a return above what is normal for capital. The system is designed to be <em>neutral</em>: a project that is profitable before tax should also be profitable after tax.</p>
<h3>How the tax base is calculated</h3>
<ul>
<li><strong>Revenue:</strong> oil sold to affiliated companies is taxed at the <a href="#/wiki/norm-price">norm price</a> set by the Petroleum Price Council. Gas is taxed at the actual sales price.</li>
<li><strong>Deductions:</strong> all relevant costs – operations, exploration, research and development, decommissioning and investments. Losses and exploration costs on one field can be deducted against income from other fields on the shelf.</li>
<li><strong>Financial costs</strong> (interest) are deductible only in the corporate tax, not in the special tax base.</li>
</ul>
<h3>Two tax bases</h3>
<div class="tbl-wrap"><table><thead><tr><th></th><th>Corporate tax (ordinary income)</th><th>Special tax</th></tr></thead><tbody>
<tr><td>Rate</td><td>22 %</td><td>71.8 %</td></tr>
<tr><td>Investments</td><td>Straight-line depreciation over 6 years from the year incurred</td><td>Expensed immediately (from 2022)</td></tr>
<tr><td>Interest</td><td>Deductible</td><td>Not deductible</td></tr>
<tr><td>Corporate tax</td><td>–</td><td>Corporate tax paid is deducted</td></tr>
<tr><td>Losses</td><td>Carried forward</td><td>Tax value paid out the year after</td></tr>
</tbody></table></div>
<p>Because the corporate tax is deducted in the special tax base, the combined marginal rate is 22 % + 71.8 % × (1 − 0.22) = 78 %. Read more about <a href="#/wiki/tax-depreciation">depreciation</a>, <a href="#/wiki/tax-losses">losses</a> and <a href="#/wiki/tax-instalments">instalment tax</a>.</p>
<p>In addition there is a CO₂ tax and an area fee, and the state is a direct owner through the SDFI (Petoro). Feltverdi simplifies by taxing income in the same year and assuming all deductions can be used in full.</p>`,
    },
    formula: { expr: 'Skatt = 0,22 &middot; (I &minus; D &minus; R &minus; Avskr.) + 0,718 &middot; (I &minus; D &minus; Inv. &minus; Selskapsskatt)', vars: [['I', 'Inntekter (normpris for olje, faktisk pris for gass)', 'Revenue (norm price for oil, actual price for gas)'], ['D', 'Driftskostnader, letekostnader og fjerning', 'Operating, exploration and decommissioning costs'], ['R', 'Netto finanskostnader (bare i selskapsskatten)', 'Net financial costs (corporate tax only)'], ['Avskr.', 'Seksårig lineær avskrivning av investeringer', 'Six-year straight-line depreciation of investments'], ['Inv.', 'Årets investeringer (kostnadsføres umiddelbart)', 'This year\'s investments (expensed immediately)']] },
    example: { nb: '<p>Inntekter 100, drift 20, investeringer 30 (avskrivning 30/6 = 5), ingen renter: selskapsskatt 0,22 × (100 − 20 − 5) = 16,5; særskatt 0,718 × (100 − 20 − 30 − 16,5) = 24,1. Samlet skatt <strong>40,6</strong>. Over hele avskrivningsperioden blir skatten 78 % av overskuddet etter alle kostnader.</p>', en: '<p>Revenue 100, opex 20, investments 30 (depreciation 30/6 = 5), no interest: corporate tax 0.22 × (100 − 20 − 5) = 16.5; special tax 0.718 × (100 − 20 − 30 − 16.5) = 24.1. Total tax <strong>40.6</strong>. Over the whole depreciation period the tax becomes 78 % of profit after all costs.</p>' },
    related: ['tax-depreciation', 'tax-losses', 'tax-instalments', 'norm-price', 'government-take', 'synergies'],
  },
  {
    slug: 'tax-depreciation', cat: 'tax', featured: true,
    title: { nb: 'Avskrivning og kostnadsføring av investeringer', en: 'Depreciation and expensing of investments' },
    short: { nb: 'Hvordan investeringer trekkes fra i petroleumsskatten: over seks år i selskapsskatten og umiddelbart i særskatten.', en: 'How investments are deducted in the petroleum tax: over six years in the corporate tax and immediately in the special tax.' },
    keys: {
      nb: ['Selskapsskatt: lineær avskrivning over seks år, med start i året investeringen skjer.', 'Særskatt: full kostnadsføring samme år (kontantstrømskatt fra inntektsåret 2022).', 'Nesten hele skatteverdien (71,8 av 78 prosentpoeng) kommer i investeringsåret – staten finansierer i praksis 78 % av investeringen.', 'Tidligere fantes et friinntektsfradrag («uplift»); det er faset ut for nye investeringer.'],
      en: ['Corporate tax: straight-line depreciation over six years, starting in the year the investment is made.', 'Special tax: fully expensed in the same year (cash-flow tax from income year 2022).', 'Almost all of the tax value (71.8 of 78 percentage points) arrives in the investment year – the state effectively finances 78 % of the investment.', 'There used to be an extra deduction ("uplift"); it has been phased out for new investments.'],
    },
    body: {
      nb: `<p>Før 2022 ble investeringer avskrevet over seks år i begge skattegrunnlagene, og i særskatten fikk selskapene i tillegg et friinntektsfradrag («uplift») på 5,2 % per år i fire år. Fra inntektsåret 2022 ble særskatten lagt om til en <strong>kontantstrømskatt</strong>: investeringene trekkes fra i sin helhet samme år som de påløper.</p>
<p>I selskapsskatten gjelder fortsatt <strong>lineær avskrivning over seks år</strong>, med første avskrivning i investeringsåret. Fordi betalt selskapsskatt trekkes fra i særskattegrunnlaget, «lekker» en del av selskapsskatteffekten tilbake: hver avskrivningskrone gir netto 22 % × (1 − 0,718) = 6,2 øre i skatteverdi, fordelt over seks år.</p>
<h3>Overgangsregler (uplift)</h3>
<ul>
<li><strong>2020–2021</strong> (midlertidig skattepakke): umiddelbar avskrivning i særskatten pluss 24 % uplift.</li>
<li><strong>2022:</strong> uplift satt til 17,69 % da kontantstrømskatten ble innført.</li>
<li><strong>Fra 2023:</strong> redusert til 12,4 % for investeringer som omfattes av overgangsreglene (prosjekter med utbyggingsplan levert innen utgangen av 2022).</li>
</ul>
<p>Feltverdi bruker reglene for nye investeringer (ingen uplift).</p>`,
      en: `<p>Before 2022, investments were depreciated over six years in both tax bases, and in the special tax companies also received an extra deduction ("uplift") of 5.2 % per year for four years. From income year 2022 the special tax became a <strong>cash-flow tax</strong>: investments are deducted in full in the year they are incurred.</p>
<p>The corporate tax still uses <strong>straight-line depreciation over six years</strong>, with the first depreciation in the investment year. Because corporate tax paid is deducted in the special tax base, part of the corporate tax effect "leaks" back: each krone of depreciation gives a net tax value of 22 % × (1 − 0.718) = 6.2 øre, spread over six years.</p>
<h3>Transitional rules (uplift)</h3>
<ul>
<li><strong>2020–2021</strong> (temporary tax package): immediate depreciation in the special tax plus 24 % uplift.</li>
<li><strong>2022:</strong> uplift set at 17.69 % when the cash-flow tax was introduced.</li>
<li><strong>From 2023:</strong> reduced to 12.4 % for investments covered by the transitional rules (projects with a development plan submitted by the end of 2022).</li>
</ul>
<p>Feltverdi uses the rules for new investments (no uplift).</p>`,
    },
    formula: { expr: `Skatteverdi = 0,718 &middot; Inv. (år 0) + &sum;<sub>k=0</sub><sup>5</sup> 0,22 &middot; (1 &minus; 0,718) &middot; ${F('Inv.', '6')}`, vars: [['Inv.', 'Investering i år 0', 'Investment in year 0'], ['k', 'År 0–5 i avskrivningsperioden', 'Years 0–5 of the depreciation period']] },
    example: {
      nb: `<p>En investering på 100 i år 0 gir disse skattefradragene:</p>
<div class="tbl-wrap"><table><thead><tr><th>År</th><th class="r">Særskatt (71,8 %)</th><th class="r">Selskapsskatt netto (6,2 % / 6)</th><th class="r">Sum</th></tr></thead><tbody>
<tr><td>0</td><td class="r">71,8</td><td class="r">1,03</td><td class="r">72,8</td></tr>
<tr><td>1–5</td><td class="r">–</td><td class="r">1,03 per år</td><td class="r">5,2</td></tr>
<tr><td><strong>Totalt</strong></td><td class="r"><strong>71,8</strong></td><td class="r"><strong>6,2</strong></td><td class="r"><strong>78,0</strong></td></tr>
</tbody></table></div>
<p>Selskapet bærer altså bare 22 av 100 kroner selv, og 93 % av skattefradraget kommer i investeringsåret.</p>`,
      en: `<p>An investment of 100 in year 0 gives these tax deductions:</p>
<div class="tbl-wrap"><table><thead><tr><th>Year</th><th class="r">Special tax (71.8 %)</th><th class="r">Corporate tax net (6.2 % / 6)</th><th class="r">Total</th></tr></thead><tbody>
<tr><td>0</td><td class="r">71.8</td><td class="r">1.03</td><td class="r">72.8</td></tr>
<tr><td>1–5</td><td class="r">–</td><td class="r">1.03 per year</td><td class="r">5.2</td></tr>
<tr><td><strong>Total</strong></td><td class="r"><strong>71.8</strong></td><td class="r"><strong>6.2</strong></td><td class="r"><strong>78.0</strong></td></tr>
</tbody></table></div>
<p>The company bears only 22 of every 100 kroner itself, and 93 % of the tax deduction arrives in the investment year.</p>`,
    },
    related: ['ncs-petroleum-tax', 'tax-losses', 'capex', 'tax-instalments'],
  },
  {
    slug: 'tax-losses', cat: 'tax', featured: true,
    title: { nb: 'Underskudd og utbetaling av skatteverdi', en: 'Tax losses and refund of their tax value' },
    short: { nb: 'Underskudd i særskatten gir utbetaling av skatteverdien året etter; underskudd i selskapsskatten fremføres mot framtidige inntekter.', en: 'Losses in the special tax give a refund of the tax value the year after; losses in the corporate tax are carried forward against future income.' },
    keys: {
      nb: ['Skatteverdien av underskudd i særskattegrunnlaget (71,8 %) utbetales ved skatteoppgjøret året etter at underskuddet oppsto.', 'Underskudd i selskapsskatten fremføres og trekkes fra mot senere overskudd.', 'Den fremførte selskapsskattedelen er netto verdt 6,2 % fordi lavere selskapsskatt gir høyere særskatt senere.', 'Gjelder også letekostnader – derfor kan nye selskaper uten produksjon lete på sokkelen.'],
      en: ['The tax value of losses in the special tax base (71.8 %) is paid out at the tax settlement the year after the loss arose.', 'Losses in the corporate tax are carried forward and deducted against later profits.', 'The carried-forward corporate tax part is worth a net 6.2 % because lower corporate tax gives higher special tax later.', 'This also applies to exploration costs – which is why new companies without production can explore on the shelf.'],
    },
    body: {
      nb: `<p>Et selskap med større kostnader enn inntekter – for eksempel et nytt selskap som leter eller bygger ut et felt – går med underskudd. Hvordan underskuddet behandles, avgjør hvor mye av kostnadene staten faktisk bærer, og når.</p>
<h3>Særskatten: utbetaling</h3>
<p>Er særskattegrunnlaget negativt, beregnes en negativ skatt på 71,8 %. Denne skatteverdien <strong>utbetales ved skatteoppgjøret året etter</strong>. Ordningen gjelder alle kostnader, også leting og investeringer, og avløste den tidligere <a href="#/wiki/tax-refund">leterefusjonen</a>.</p>
<h3>Selskapsskatten: fremføring</h3>
<p>Underskudd i alminnelig inntekt <strong>fremføres</strong> og trekkes fra når selskapet senere får overskudd. Når selskapsskatten senere blir lavere, blir fradraget for betalt selskapsskatt i særskatten tilsvarende mindre. Netto er den fremførte delen derfor verdt 22 % × (1 − 0,718) = 6,2 % av underskuddet.</p>
<p>Underskudd og letekostnader på ett felt kan trekkes fra mot inntekter fra andre felt (ingen feltvis avgrensning). I 2020–2021 kunne selskaper også få utbetalt skatteverdien av underskudd etter midlertidige regler.</p>
<p>Feltverdi forenkler ved å anta at eieren har skattepliktig inntekt fra andre felt, slik at fradrag gir full skatteeffekt samme år.</p>`,
      en: `<p>A company with costs higher than its revenue – for example a new company that explores or develops a field – makes a loss. How the loss is treated decides how much of the costs the state actually carries, and when.</p>
<h3>Special tax: refund</h3>
<p>If the special tax base is negative, a negative tax of 71.8 % is calculated. This tax value is <strong>paid out at the tax settlement the year after</strong>. The scheme covers all costs, including exploration and investments, and replaced the former <a href="#/wiki/tax-refund">exploration refund</a>.</p>
<h3>Corporate tax: carry-forward</h3>
<p>Losses in ordinary income are <strong>carried forward</strong> and deducted when the company later makes a profit. When the corporate tax later becomes lower, the deduction for corporate tax paid in the special tax becomes correspondingly smaller. Net, the carried-forward part is therefore worth 22 % × (1 − 0.718) = 6.2 % of the loss.</p>
<p>Losses and exploration costs on one field can be deducted against income from other fields (no field-by-field ring-fence). In 2020–2021 companies could also have the tax value of losses paid out under temporary rules.</p>
<p>Feltverdi simplifies by assuming the owner has taxable income from other fields, so that deductions give full tax effect in the same year.</p>`,
    },
    formula: { expr: 'Utbetaling<sub>t+1</sub> = 0,718 &middot; |Særskattegrunnlag<sub>t</sub>| &nbsp;&nbsp;&nbsp; Fremført verdi &asymp; 0,22 &middot; (1 &minus; 0,718) &middot; |Underskudd<sub>t</sub>|', vars: [['t', 'Året underskuddet oppstår', 'The year the loss arises'], ['|·|', 'Underskuddets størrelse', 'The size of the loss']] },
    example: {
      nb: '<p>Et nytt selskap uten produksjon bruker 500 mill. kroner på leting i 2026. Ved skatteoppgjøret i 2027 får det utbetalt 0,718 × 500 = <strong>359 mill. kroner</strong>. Underskuddet på 500 i selskapsskatten fremføres; når selskapet senere får overskudd, er det netto verdt om lag <strong>31 mill. kroner</strong> (6,2 %). Selskapet bærer altså selv om lag 110 mill. kroner (22 %), og en del av fradraget kommer først når feltet produserer.</p>',
      en: '<p>A new company without production spends NOK 500 m on exploration in 2026. At the 2027 tax settlement it receives 0.718 × 500 = <strong>NOK 359 m</strong>. The loss of 500 in the corporate tax is carried forward; when the company later makes a profit it is worth a net <strong>NOK 31 m</strong> (6.2 %). The company itself therefore bears about NOK 110 m (22 %), and part of the deduction only arrives once the field produces.</p>',
    },
    related: ['ncs-petroleum-tax', 'tax-depreciation', 'tax-refund', 'tax-instalments', 'rbl'],
  },
  {
    slug: 'tax-instalments', cat: 'tax', featured: true,
    title: { nb: 'Terminskatt – forskuddsbetaling i ti terminer', en: 'Instalment tax – advance payment in ten instalments' },
    short: { nb: 'Oljeselskapene betaler petroleumsskatt forskuddsvis: fem terminer i inntektsåret og fem i året etter.', en: 'Oil companies pay petroleum tax in advance: five instalments in the income year and five the year after.' },
    keys: {
      nb: ['Fra inntektsåret 2025 betales skatten i ti terminer (tidligere seks).', 'Terminene forfaller 1. august–1. desember i inntektsåret og 1. februar–1. juni året etter.', 'Oljeskattekontoret fastsetter terminskatten om sommeren og kan revidere den i januar.', 'Endelig skatteoppgjør er klart senest 1. desember året etter, med avregning mot innbetalt terminskatt.'],
      en: ['From income year 2025 the tax is paid in ten instalments (previously six).', 'The instalments fall due 1 August–1 December in the income year and 1 February–1 June the year after.', 'The Petroleum Tax Office sets the instalment tax in the summer and can revise it in January.', 'The final tax settlement is ready by 1 December the year after, with a settlement against instalments paid.'],
    },
    body: {
      nb: `<p>Petroleumsskatt betales ikke etterskuddsvis som en vanlig restskatt, men som <strong>terminskatt</strong> mens inntekten opptjenes (petroleumsskatteloven § 7). Det gir staten jevne inntekter og reduserer risikoen for store etterbetalinger.</p>
<h3>Forfallsdatoer (fra inntektsåret 2025)</h3>
<div class="tbl-wrap"><table><thead><tr><th>Termin</th><th>Forfall</th><th>Termin</th><th>Forfall</th></tr></thead><tbody>
<tr><td>1</td><td>1. august (inntektsåret)</td><td>6</td><td>1. februar (året etter)</td></tr>
<tr><td>2</td><td>1. september</td><td>7</td><td>1. mars</td></tr>
<tr><td>3</td><td>1. oktober</td><td>8</td><td>1. april</td></tr>
<tr><td>4</td><td>1. november</td><td>9</td><td>2. mai</td></tr>
<tr><td>5</td><td>1. desember</td><td>10</td><td>1. juni</td></tr>
</tbody></table></div>
<h3>Slik fastsettes terminskatten</h3>
<ol>
<li><strong>Juni/juli i inntektsåret:</strong> Oljeskattekontoret fastsetter terminskatten basert på selskapenes faktiske tall for første halvår og anslag for resten av året.</li>
<li><strong>Underveis:</strong> selskapene kan betale inn mer enn fastsatt; ekstra innbetalinger fordeles på 2.–4. eller 7.–9. termin. Det beregnes rente når de fem første og fem siste terminene er ulike.</li>
<li><strong>Januar året etter:</strong> terminskatten kan revideres før 6. termin, hovedsakelig på grunnlag av faktiske tall.</li>
<li><strong>Senest 1. desember året etter:</strong> skatteoppgjøret er klart, og det gjøres en avregning mot innbetalt terminskatt.</li>
</ol>
<p>Fram til inntektsåret 2024 ble skatten betalt i seks terminer – tre i inntektsåret og tre året etter.</p>
<h3>Betydning for verdsettelse og regnskap</h3>
<p>Fordi halvparten av skatten for et år betales i første halvår året etter, har oljeselskapene alltid en stor <strong>betalbar skatt</strong> i balansen ved årsskiftet. Ved oppkjøp må dette tas med i kjøpesummen – se <a href="#/wiki/effective-date">virkningsdato</a>. Feltverdi forenkler ved å regne skatten i samme år som inntekten.</p>`,
      en: `<p>Petroleum tax is not paid in arrears like an ordinary tax bill, but as <strong>instalment tax</strong> while the income is earned (Petroleum Taxation Act section 7). This gives the state a steady income and reduces the risk of large back payments.</p>
<h3>Due dates (from income year 2025)</h3>
<div class="tbl-wrap"><table><thead><tr><th>Instalment</th><th>Due</th><th>Instalment</th><th>Due</th></tr></thead><tbody>
<tr><td>1</td><td>1 August (income year)</td><td>6</td><td>1 February (following year)</td></tr>
<tr><td>2</td><td>1 September</td><td>7</td><td>1 March</td></tr>
<tr><td>3</td><td>1 October</td><td>8</td><td>1 April</td></tr>
<tr><td>4</td><td>1 November</td><td>9</td><td>2 May</td></tr>
<tr><td>5</td><td>1 December</td><td>10</td><td>1 June</td></tr>
</tbody></table></div>
<h3>How the instalment tax is set</h3>
<ol>
<li><strong>June/July of the income year:</strong> the Petroleum Tax Office sets the instalment tax based on the companies' actual figures for the first half-year and estimates for the rest of the year.</li>
<li><strong>Along the way:</strong> companies may pay more than assessed; extra payments are spread over instalments 2–4 or 7–9. Interest is calculated when the first five and last five instalments differ.</li>
<li><strong>January of the following year:</strong> the instalment tax may be revised before the 6th instalment, mainly on the basis of actual figures.</li>
<li><strong>By 1 December of the following year:</strong> the tax settlement is ready, and the tax assessed is settled against the instalments paid.</li>
</ol>
<p>Up to income year 2024 the tax was paid in six instalments – three in the income year and three the year after.</p>
<h3>Why it matters for valuation and accounts</h3>
<p>Because half of a year's tax is paid in the first half of the following year, oil companies always carry a large <strong>tax payable</strong> on the balance sheet at year-end. In acquisitions this must be reflected in the price – see <a href="#/wiki/effective-date">effective date</a>. Feltverdi simplifies by taxing income in the same year.</p>`,
    },
    formula: { expr: `Termin<sub>i</sub> &asymp; ${F('Anslått skatt for inntektsåret', '10')} &nbsp;&nbsp; (avregnes mot endelig skatt året etter)`, vars: [['Termin<sub>i</sub>', 'Innbetaling i termin i = 1–10', 'Payment in instalment i = 1–10']] },
    example: {
      nb: '<p>Et selskap venter 12 mrd. kroner i petroleumsskatt for 2026. Det betaler 1,2 mrd. kroner hver måned fra august til desember 2026 (6 mrd.), og etter en revisjon i januar 2027 betaler det resten fordelt på februar–juni 2027. Ved årsskiftet 2026/27 står det derfor om lag <strong>6 mrd. kroner i betalbar skatt</strong> i balansen. Det forklarer også hvorfor Vår Energi skal betale om lag 1,4 mrd. dollar i 2026-skatt for ConocoPhillips Norge i første halvår 2027.</p>',
      en: '<p>A company expects NOK 12 bn of petroleum tax for 2026. It pays NOK 1.2 bn each month from August to December 2026 (NOK 6 bn), and after a revision in January 2027 it pays the rest over February–June 2027. At the turn of 2026/27 it therefore carries about <strong>NOK 6 bn of tax payable</strong> on the balance sheet. This also explains why Vår Energi will pay about 1.4 bn dollars of 2026 tax for ConocoPhillips Norway in the first half of 2027.</p>',
    },
    related: ['ncs-petroleum-tax', 'tax-losses', 'effective-date', 'free-cash-flow'],
  },
  {
    slug: 'norm-price', cat: 'tax',
    title: { nb: 'Normpris', en: 'Norm price' },
    short: { nb: 'Skattemessig oljepris fastsatt av Petroleumsprisrådet for salg mellom nærstående selskaper.', en: 'The oil price for tax purposes, set by the Petroleum Price Council for sales between affiliated companies.' },
    keys: {
      nb: ['Hindrer at selskaper flytter overskudd ut av Norge ved å selge olje billig til egne selskaper.', 'Fastsettes for hver oljekvalitet basert på markedspriser.', 'For gass brukes faktisk salgspris.'],
      en: ['Prevents companies from moving profit out of Norway by selling oil cheaply to their own affiliates.', 'Set for each crude quality based on market prices.', 'For gas the actual sales price is used.'],
    },
    body: { nb: '<p>Mye av oljen fra sokkelen selges internt i konsernene, for eksempel til egne handelsselskaper. For å sikre at skattegrunnlaget gjenspeiler markedsverdien, fastsetter Petroleumsprisrådet en normpris som skal brukes når skattepliktig inntekt beregnes. Normprisen følger i praksis markedsprisene for de ulike oljekvalitetene, som <a href="#/wiki/brent">Brent</a>.</p>', en: '<p>Much of the oil from the shelf is sold within corporate groups, for example to their own trading companies. To ensure the tax base reflects market value, the Petroleum Price Council sets a norm price that must be used when taxable income is calculated. In practice the norm price follows market prices for the different crude qualities, such as <a href="#/wiki/brent">Brent</a>.</p>' },
    formula: { expr: 'Skattepliktig inntekt (olje) = Normpris &times; Solgt volum', vars: [] },
    example: { nb: '<p>Selger et selskap olje til sitt eget handelsselskap for 70 dollar fatet, mens normprisen er 75 dollar, skattlegges salget som om prisen var 75 dollar.</p>', en: '<p>If a company sells oil to its own trading company at 70 dollars a barrel while the norm price is 75 dollars, the sale is taxed as if the price were 75 dollars.</p>' },
    related: ['ncs-petroleum-tax', 'brent', 'netback'],
  },
  {
    slug: 'government-take', cat: 'tax',
    title: { nb: 'Statens andel (government take)', en: 'Government take' },
    short: { nb: 'Andelen av verdiskapingen fra et felt som går til staten.', en: 'The share of the value created by a field that goes to the state.' },
    keys: {
      nb: ['På norsk sokkel består den av skatt, avgifter og statens direkte eierandeler (SDØE).', 'Marginalskatten er 78 %; i tillegg eier staten via Petoro store andeler.', 'Brukes til å sammenligne skatteregimer mellom land.'],
      en: ['On the Norwegian shelf it consists of tax, fees and the state\'s direct financial interest (SDFI).', 'The marginal tax is 78 %; in addition the state owns large shares through Petoro.', 'Used to compare tax regimes between countries.'],
    },
    body: { nb: '<p>Statens andel måles ofte som skatt delt på overskudd før skatt over hele levetiden. Feltverdi viser «skatt til staten» som nåverdien av skatten for hvert felt.</p>', en: '<p>Government take is often measured as tax divided by pre-tax profit over the whole field life. Feltverdi shows "tax to the state" as the present value of tax for each field.</p>' },
    formula: { expr: `Statens andel = ${F('Skatt + avgifter + statens kontantstrøm', 'Overskudd før skatt')}`, vars: [] },
    example: { nb: '<p>Over hele levetiden har feltene på sokkelen skapt om lag 2 800 mrd. dollar før skatt, hvorav om lag 78 % er skatt til staten (Feltverdis historiske visning, forenklet).</p>', en: '<p>Over their whole life the fields on the shelf have created about 2,800 bn dollars before tax, of which about 78 % is tax to the state (Feltverdi\'s historical view, simplified).</p>' },
    related: ['ncs-petroleum-tax', 'tax-losses'],
    feltverdi: '#/historisk',
  },
  {
    slug: 'tax-refund', cat: 'tax',
    title: { nb: 'Leterefusjon', en: 'Exploration refund' },
    short: { nb: 'Ordningen fra 2005 til 2021 der staten refunderte 78 % av letekostnadene til selskaper uten skattepliktig inntekt. Erstattet av utbetaling av underskudd i særskatten.', en: 'The 2005–2021 scheme in which the state refunded 78 % of exploration costs to companies without taxable income. Replaced by refunds of special tax losses.' },
    keys: {
      nb: ['Fra 2005 til 2021 fikk selskaper uten produksjon 78 % av letekostnadene refundert året etter.', 'Fra 2022 gjelder i stedet utbetaling av skatteverdien av alle underskudd i særskatten (71,8 %).', 'Begge ordningene senker terskelen for nye selskaper på sokkelen.'],
      en: ['From 2005 to 2021, companies without production had 78 % of exploration costs refunded the year after.', 'From 2022, the tax value of all special tax losses (71.8 %) is paid out instead.', 'Both schemes lower the barrier to entry for new companies on the shelf.'],
    },
    body: { nb: '<p>Leterefusjonen gjorde det mulig for mange nye selskaper å lete på sokkelen uten egen produksjon, og bankene lånte ut mot refusjonene. Med kontantstrømskatten fra 2022 ble ordningen erstattet av en generell regel: skatteverdien av underskudd i særskatten utbetales året etter, mens selskapsskattedelen fremføres. Se <a href="#/wiki/tax-losses">underskudd og utbetaling av skatteverdi</a>.</p>', en: '<p>The exploration refund made it possible for many new companies to explore on the shelf without their own production, and banks lent against the refunds. With the cash-flow tax from 2022 the scheme was replaced by a general rule: the tax value of special tax losses is paid out the year after, while the corporate tax part is carried forward. See <a href="#/wiki/tax-losses">tax losses and refund of their tax value</a>.</p>' },
    formula: { expr: 'Før 2022: Refusjon = 0,78 &times; Letekostnader &nbsp;&nbsp; Fra 2022: Utbetaling = 0,718 &times; Letekostnader (+ 6,2 % fremført)', vars: [] },
    example: { nb: '<p>En letebrønn til 400 mill. kroner ga før 2022 en refusjon på 312 mill. kroner. I dag gir den en utbetaling på 287 mill. kroner året etter, og et fremført underskudd i selskapsskatten verdt netto om lag 25 mill. kroner når selskapet får overskudd.</p>', en: '<p>An exploration well costing NOK 400 m gave a refund of NOK 312 m before 2022. Today it gives a payout of NOK 287 m the year after, plus a carried-forward corporate tax loss worth a net NOK 25 m or so once the company makes a profit.</p>' },
    related: ['tax-losses', 'ncs-petroleum-tax', 'carry', 'rbl'],
  },
  // ---------------- Markets ----------------
  {
    slug: 'brent', cat: 'markets', featured: true,
    title: { nb: 'Brent', en: 'Brent' },
    short: { nb: 'Referanseprisen for råolje fra Nordsjøen, brukt for om lag to tredjedeler av verdens oljehandel.', en: 'The benchmark price for North Sea crude, used for about two thirds of global oil trade.' },
    keys: {
      nb: ['Oppgis i dollar per fat.', 'Norsk olje selges med et påslag eller fradrag i forhold til Brent.', 'Har svingt mellom om lag 13 og 112 dollar som årssnitt siden 1986.'],
      en: ['Quoted in dollars per barrel.', 'Norwegian crude is sold at a premium or discount to Brent.', 'Has ranged between about 13 and 112 dollars as an annual average since 1986.'],
    },
    body: { nb: '<p>«Brent» betegner i dag en kurv av nordsjøoljer (Brent, Forties, Oseberg, Ekofisk, Troll og WTI Midland). Det finnes både fysisk pris (Dated Brent) og terminkontrakter på ICE. Feltverdi bruker Verdensbankens årssnitt for historiske priser.</p>', en: '<p>"Brent" today refers to a basket of North Sea crudes (Brent, Forties, Oseberg, Ekofisk, Troll and WTI Midland). There is both a physical price (Dated Brent) and futures contracts on ICE. Feltverdi uses World Bank annual averages for historical prices.</p>' },
    formula: null,
    example: { nb: '<p>Ifølge Verdensbanken var Brent i snitt 12,72 dollar i 1998, 111,97 dollar i 2012 og 69,04 dollar i 2025 (løpende priser).</p>', en: '<p>According to the World Bank, Brent averaged 12.72 dollars in 1998, 111.97 dollars in 2012 and 69.04 dollars in 2025 (nominal).</p>' },
    related: ['ttf', 'netback', 'forward-curve', 'real-nominal'],
  },
  {
    slug: 'ttf', cat: 'markets',
    title: { nb: 'TTF – europeisk gasspris', en: 'TTF – European gas price' },
    short: { nb: 'Den nederlandske handelsplassen for gass, som er referansepris for gass i Europa.', en: 'The Dutch gas trading hub, which is the benchmark price for gas in Europe.' },
    keys: {
      nb: ['Oppgis i euro per megawattime (€/MWh).', 'Norsk gass selges i stor grad til priser knyttet til TTF og britiske NBP.', 'Steg til rekordnivåer i 2022 etter krigen i Ukraina.'],
      en: ['Quoted in euros per megawatt hour (€/MWh).', 'Norwegian gas is largely sold at prices linked to TTF and the British NBP.', 'Rose to record levels in 2022 after the war in Ukraine.'],
    },
    body: { nb: '<p>Før om lag 2010 var mye av gassen i Europa solgt på langsiktige kontrakter med oljeindeksering. I dag prises den i hovedsak mot handelsplasser som TTF. For å sammenligne med olje må prisen regnes om – se [[gas-units|energienheter for gass]].</p>', en: '<p>Until around 2010 much of Europe\'s gas was sold on long-term contracts indexed to oil. Today it is mainly priced against hubs such as TTF. To compare with oil, the price must be converted – see [[gas-units|energy units for gas]].</p>' },
    formula: { expr: 'USD/fat o.e. = €/MWh &times; 1,75 &times; EURUSD', vars: [['1,75', 'MWh per fat oljeekvivalent gass', 'MWh per barrel of oil equivalent of gas']] },
    example: { nb: '<p>Verdensbankens europeiske gasspris var 40,34 dollar per MMBtu i 2022 – om lag 130 €/MWh, eller over 200 dollar per fat o.e.</p>', en: '<p>The World Bank European gas price was 40.34 dollars per MMBtu in 2022 – about €130/MWh, or more than 200 dollars per boe.</p>' },
    related: ['gas-units', 'brent', 'netback'],
  },
  {
    slug: 'gas-units', cat: 'markets',
    title: { nb: 'Energienheter for gass', en: 'Energy units for gas' },
    short: { nb: 'Omregning mellom Sm³, MMBtu, MWh og fat oljeekvivalenter.', en: 'Converting between Sm³, MMBtu, MWh and barrels of oil equivalent.' },
    keys: {
      nb: ['1 MWh = 3,412 MMBtu.', '1 fat o.e. gass ≈ 159 Sm³ ≈ 1,75 MWh ≈ 5,97 MMBtu (om lag 11,0 kWh per Sm³, snittet for norsk gass levert til Europa ifølge Gassco).', 'Brennverdien varierer litt fra felt til felt.'],
      en: ['1 MWh = 3.412 MMBtu.', '1 boe of gas ≈ 159 Sm³ ≈ 1.75 MWh ≈ 5.97 MMBtu (about 11.0 kWh per Sm³, the average for Norwegian gas delivered to Europe according to Gassco).', 'The calorific value varies slightly from field to field.'],
    },
    body: { nb: '<p>Gass handles i ulike enheter i ulike markeder: €/MWh i Europa, dollar per MMBtu i USA og Asia. For å sette gassverdien på linje med olje regnes den om til [[boe|fat oljeekvivalenter]].</p>', en: '<p>Gas is traded in different units in different markets: €/MWh in Europe, dollars per MMBtu in the US and Asia. To compare gas with oil, it is converted to [[boe|barrels of oil equivalent]].</p>' },
    formula: { expr: `USD/MMBtu = ${F('€/MWh &times; EURUSD', '3,412')} &nbsp;&nbsp; USD/fat o.e. = USD/MMBtu &times; 5,97`, vars: [] },
    example: { nb: '<p>35 €/MWh med EURUSD 1,15 gir 35 × 1,15 / 3,412 = <strong>11,8 dollar per MMBtu</strong>, eller 11,8 × 5,97 = <strong>70 dollar per fat o.e.</strong></p>', en: '<p>€35/MWh at EURUSD 1.15 gives 35 × 1.15 / 3.412 = <strong>11.8 dollars per MMBtu</strong>, or 11.8 × 5.97 = <strong>70 dollars per boe</strong>.</p>' },
    related: ['boe', 'ttf', 'netback'],
  },
  {
    slug: 'netback', cat: 'markets',
    title: { nb: 'Netback og realisert pris', en: 'Netback and realised price' },
    short: { nb: 'Prisen produsenten sitter igjen med etter transport, prosessering og andre fradrag.', en: 'The price the producer keeps after transport, processing and other deductions.' },
    keys: {
      nb: ['Realisert pris kan avvike fra Brent og TTF på grunn av kvalitet og kontrakter.', 'Tariffer i rør og terminaler trekkes fra.', 'Sikring (hedging) kan øke eller redusere realisert pris.'],
      en: ['The realised price can differ from Brent and TTF due to quality and contracts.', 'Tariffs in pipelines and terminals are deducted.', 'Hedging can raise or lower the realised price.'],
    },
    body: { nb: '<p>Netback er nyttig for å forstå hvorfor to felt med samme produkt kan ha ulik verdi. Et gassfelt langt fra markedet betaler mer i tariffer enn et felt nær en eksportrørledning.</p>', en: '<p>Netback helps explain why two fields with the same product can have different values. A gas field far from the market pays more in tariffs than a field close to an export pipeline.</p>' },
    formula: { expr: 'Netback = Markedspris &plusmn; kvalitetsjustering &minus; transport &minus; prosessering', vars: [] },
    example: { nb: '<p>Gass til 69 dollar per fat o.e. med 10 dollar i LNG-prosessering og transport gir en netback på <strong>59 dollar per fat o.e.</strong></p>', en: '<p>Gas at 69 dollars per boe with 10 dollars of LNG processing and transport gives a netback of <strong>59 dollars per boe</strong>.</p>' },
    related: ['brent', 'ttf', 'gas-units'],
  },
  {
    slug: 'forward-curve', cat: 'markets',
    title: { nb: 'Terminkurve (contango og backwardation)', en: 'Forward curve (contango and backwardation)' },
    short: { nb: 'Markedsprisene for levering av olje eller gass på ulike framtidige tidspunkt.', en: 'Market prices for delivery of oil or gas at different future dates.' },
    keys: {
      nb: ['Backwardation: framtidige priser er lavere enn dagens.', 'Contango: framtidige priser er høyere enn dagens.', 'Kjøpere og selgere bruker ofte terminkurven de første årene i verdsettelser.'],
      en: ['Backwardation: future prices are lower than today\'s.', 'Contango: future prices are higher than today\'s.', 'Buyers and sellers often use the forward curve for the first years of a valuation.'],
    },
    body: { nb: '<p>I perioder med stram tilgang – som høsten 2026 – er terminkurven i backwardation: prisene for de nærmeste månedene er høyere enn for 2027 og 2028. En verdsettelse med flat pris lik dagens pris blir da for optimistisk.</p>', en: '<p>In periods of tight supply – such as autumn 2026 – the forward curve is in backwardation: prices for the nearest months are higher than for 2027 and 2028. A valuation with a flat price equal to today\'s price is then too optimistic.</p>' },
    formula: { expr: `Helning = ${F('F<sub>T</sub> &minus; S', 'S')}`, vars: [['F<sub>T</sub>', 'Terminpris for levering om T år', 'Forward price for delivery in T years'], ['S', 'Spotpris i dag', 'Spot price today']] },
    example: { nb: '<p>Spot 96 dollar og termin for 2028 på 72 dollar gir en helning på −25 %: tydelig backwardation.</p>', en: '<p>Spot at 96 dollars and a 2028 forward at 72 dollars give a slope of −25 %: clear backwardation.</p>' },
    related: ['brent', 'npv', 'rbl'],
  },
  // ---------------- Deals ----------------
  {
    slug: 'farm-down', cat: 'deals',
    title: { nb: 'Farm-in og farm-down', en: 'Farm-in and farm-down' },
    short: { nb: 'Kjøp (farm-in) eller salg (farm-down) av en andel i en lisens.', en: 'Buying (farm-in) or selling (farm-down) a share in a licence.' },
    keys: {
      nb: ['Krever godkjenning fra Energidepartementet.', 'Skattenøytralt: kjøperen overtar selgerens skatteverdier.', 'Prisen settes derfor på verdien etter skatt.'],
      en: ['Requires approval from the Ministry of Energy.', 'Tax-neutral: the buyer takes over the seller\'s tax values.', 'The price is therefore set on after-tax value.'],
    },
    body: { nb: '<p>Selskaper justerer porteføljene sine ved å kjøpe og selge lisensandeler. Ofte betales deler av prisen som [[carry|carry]] – kjøperen dekker selgerens andel av framtidige kostnader. Ved salg av produserende felt avtales en [[effective-date|virkningsdato]].</p>', en: '<p>Companies adjust their portfolios by buying and selling licence shares. Part of the price is often paid as a [[carry|carry]] – the buyer covers the seller\'s share of future costs. When producing fields are sold, an [[effective-date|effective date]] is agreed.</p>' },
    formula: null,
    example: { nb: '<p>JAPEX kjøpte 8 % av Goliat og andeler i to letelisenser fra Equinor, mot at Equinor fikk 3,5 % av Verdande, 65 mill. dollar og en lete-carry (2026).</p>', en: '<p>JAPEX bought 8 % of Goliat and shares in two exploration licences from Equinor, in return for Equinor getting 3.5 % of Verdande, 65 million dollars and an exploration carry (2026).</p>' },
    related: ['asset-swap', 'carry', 'effective-date', 'value-per-barrel'],
  },
  {
    slug: 'asset-swap', cat: 'deals',
    title: { nb: 'Bytte av eiendeler (asset swap)', en: 'Asset swap' },
    short: { nb: 'To selskaper bytter lisensandeler med hverandre, ofte med en kontant mellomlegg.', en: 'Two companies exchange licence shares, often with a cash balancing payment.' },
    keys: {
      nb: ['Lar begge parter konsentrere seg om kjerneområder.', 'Verdiene må vurderes med samme forutsetninger for å se hvem som vinner.', 'Små andeler betyr ofte mer for et lite selskap enn for et stort.'],
      en: ['Lets both parties concentrate on core areas.', 'Values must be assessed with the same assumptions to see who wins.', 'Small shares often matter more to a small company than to a large one.'],
    },
    body: { nb: '<p>Et bytte vurderes ved å summere verdien av det hver part gir og får, inkludert kontant mellomlegg og [[carry|carry]]. Godkjente, men ikke produserende prosjekter – som Goliats gasseksport – kan endre konklusjonen helt.</p>', en: '<p>A swap is assessed by summing the value of what each party gives and receives, including cash and [[carry|carry]]. Approved but not yet producing projects – such as Goliat gas export – can completely change the conclusion.</p>' },
    formula: { expr: 'Netto gevinst = (Verdi mottatt + kontanter + carry) &minus; Verdi avgitt', vars: [] },
    example: { nb: '<p>Uten Goliats gasseksport fikk Equinor om lag 35–45 mill. dollar mer enn selskapet ga fra seg. Med gasseksporten snudde det: JAPEX fikk 10–20 mill. dollar mer.</p>', en: '<p>Without Goliat gas export, Equinor received about 35–45 million dollars more than it gave up. With gas export it flipped: JAPEX gained 10–20 million dollars.</p>' },
    related: ['farm-down', 'carry', 'npv'],
  },
  {
    slug: 'carry', cat: 'deals',
    title: { nb: 'Carry (kostnadsbærende avtale)', en: 'Carry' },
    short: { nb: 'En part betaler hele eller deler av en annen parts kostnader, ofte som del av kjøpesummen.', en: 'One party pays all or part of another party\'s costs, often as part of the purchase price.' },
    keys: {
      nb: ['Vanlig ved salg av leteandeler.', 'Har ofte et tak (maksimalt beløp).', 'Er bare verdt om lag 22 % etter skatt på norsk sokkel fordi kostnadene er fradragsberettiget.'],
      en: ['Common when selling exploration shares.', 'Often has a cap (maximum amount).', 'Is worth only about 22 % after tax on the Norwegian shelf because the costs are deductible.'],
    },
    body: { nb: '<p>En carry overfører risiko: kjøperen betaler for brønner som kanskje ikke finner noe. På sokkelen gjør [[tax-refund|leterefusjonen]] og den høye skattesatsen at verdien av en carry etter skatt er langt lavere enn pålydende.</p>', en: '<p>A carry transfers risk: the buyer pays for wells that may find nothing. On the shelf, the [[tax-refund|exploration refund]] and the high tax rate make the after-tax value of a carry far lower than its face value.</p>' },
    formula: { expr: 'Verdi etter skatt &asymp; Carry &times; (1 &minus; 0,78)', vars: [] },
    example: { nb: '<p>En carry på 20 mill. dollar er verdt om lag <strong>4,4 mill. dollar</strong> etter skatt for mottakeren.</p>', en: '<p>A carry of 20 million dollars is worth about <strong>4.4 million dollars</strong> after tax to the recipient.</p>' },
    related: ['farm-down', 'asset-swap', 'tax-refund'],
  },
  {
    slug: 'effective-date', cat: 'deals',
    title: { nb: 'Virkningsdato og «locked box»', en: 'Effective date and locked box' },
    short: { nb: 'Datoen fra når kjøperen økonomisk overtar eiendelen, selv om avtalen gjennomføres senere.', en: 'The date from which the buyer economically takes over the asset, even if the deal closes later.' },
    keys: {
      nb: ['Kontantstrøm etter virkningsdatoen tilfaller kjøperen.', 'Kjøpesummen justeres for kontantstrøm mellom virkningsdato og gjennomføring.', 'Gjør at prisen ikke påvirkes av hvor lang tid godkjenningen tar.'],
      en: ['Cash flow after the effective date belongs to the buyer.', 'The purchase price is adjusted for cash flow between the effective date and closing.', 'Means the price is not affected by how long approval takes.'],
    },
    body: { nb: '<p>Transaksjoner på sokkelen tar ofte flere måneder å gjennomføre. Med en virkningsdato tilbake i tid betaler kjøperen en lavere sum ved gjennomføring, fordi selgeren har mottatt kontantstrømmen i mellomtiden.</p>', en: '<p>Transactions on the shelf often take several months to close. With an effective date in the past, the buyer pays a lower amount at closing because the seller has received the cash flow in the meantime.</p>' },
    formula: { expr: 'Betaling ved gjennomføring = Pris &minus; netto kontantstrøm siden virkningsdato &plusmn; andre justeringer', vars: [] },
    example: { nb: '<p>ConocoPhillips Norge: virksomhetsverdi 4,425 mrd. dollar med virkningsdato 1. januar 2026, vederlag om lag 3,9 mrd. etter justeringer, og om lag 2,5 mrd. betalt ved gjennomføring.</p>', en: '<p>ConocoPhillips Norway: enterprise value 4.425 bn dollars with an effective date of 1 January 2026, consideration of about 3.9 bn after adjustments, and about 2.5 bn paid at closing.</p>' },
    related: ['farm-down', 'value-per-barrel', 'synergies'],
  },
  {
    slug: 'synergies', cat: 'deals',
    title: { nb: 'Synergier', en: 'Synergies' },
    short: { nb: 'Gevinster ved å kombinere virksomheter – lavere kostnader, bedre drift eller høyere inntekter.', en: 'Gains from combining businesses – lower costs, better operations or higher revenue.' },
    keys: {
      nb: ['Oppgis ofte før skatt; på sokkelen er bare 22 % igjen etter skatt.', 'Sjekk om tallet er nominelt og samlet over flere år, eller en nåverdi.', 'Kjøpere betaler ofte bort mye av synergiene i premie.'],
      en: ['Often stated before tax; on the shelf only 22 % remains after tax.', 'Check whether the figure is nominal and cumulative over several years, or a present value.', 'Buyers often pay away much of the synergies as a premium.'],
    },
    body: { nb: '<p>Synergier kan komme fra lavere administrasjonskostnader, felles logistikk, bedre boreprogrammer og billigere finansiering. Fordi kostnader er fradragsberettiget med 78 %, er besparelser verdt langt mindre etter skatt på norsk sokkel enn i andre land.</p>', en: '<p>Synergies can come from lower overhead, shared logistics, better drilling programmes and cheaper financing. Because costs are deductible at 78 %, savings are worth far less after tax on the Norwegian shelf than in other countries.</p>' },
    formula: { expr: 'Synergi etter skatt = Synergi før skatt &times; (1 &minus; 0,78)', vars: [] },
    example: { nb: '<p>100 mill. dollar i årlige kostnadsbesparelser gir <strong>22 mill. dollar</strong> etter skatt.</p>', en: '<p>100 million dollars of annual cost savings gives <strong>22 million dollars</strong> after tax.</p>' },
    related: ['ncs-petroleum-tax', 'value-per-barrel', 'farm-down'],
  },
  {
    slug: 'rbl', cat: 'deals',
    title: { nb: 'Reservebasert lån (RBL)', en: 'Reserve-based lending (RBL)' },
    short: { nb: 'Banklån der lånegrensen bestemmes av nåverdien av selskapets reserver.', en: 'A bank loan where the borrowing limit is set by the present value of the company\'s reserves.' },
    keys: {
      nb: ['Lånegrensen (borrowing base) beregnes på nytt to ganger i året.', 'Bankene bruker egne, forsiktige prisforutsetninger.', 'Vanlig finansiering for oppkjøp av produserende felt.'],
      en: ['The borrowing base is recalculated twice a year.', 'Banks use their own, conservative price assumptions.', 'Common financing for acquisitions of producing fields.'],
    },
    body: { nb: '<p>Ved et RBL-lån beregner bankene [[npv|nåverdien]] av reservene med sin egen pris- og kostnadsbane, og låner ut en andel av den. Faller oljeprisen, kan lånegrensen bli redusert, og selskapet må betale ned gjeld.</p>', en: '<p>With an RBL, the banks calculate the [[npv|NPV]] of the reserves using their own price and cost assumptions and lend a share of it. If the oil price falls, the borrowing base can be reduced and the company must repay debt.</p>' },
    formula: { expr: 'Lånegrense &asymp; NPV<sub>bankens prisbane</sub> &times; belåningsgrad', vars: [['belåningsgrad', 'Andel av nåverdien banken låner ut (ofte 50–70 %)', 'Share of the NPV the bank lends (often 50–70 %)']] },
    example: { nb: '<p>Reserver med nåverdi 1 000 mill. dollar etter skatt og belåningsgrad 60 % gir en lånegrense på om lag <strong>600 mill. dollar</strong>.</p>', en: '<p>Reserves with an after-tax NPV of 1,000 million dollars and a 60 % advance rate give a borrowing base of about <strong>600 million dollars</strong>.</p>' },
    related: ['npv', 'ebitdax', 'forward-curve'],
  },
];
