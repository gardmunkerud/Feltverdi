/* Feltverdi – texts in Norwegian (nb) and English (en) */
window.FV_I18N = {
  nb: {
    navHome: 'Oversikt', navValue: 'Verdsett', navRank: 'Rangering', navMethod: 'Metode',
    footData: 'Data:', footSnapshot: 'Datauttrekk',
    footDisclaimer: 'Forenklede anslag til informasjon og læring – ikke investeringsråd. Feltverdi er ikke tilknyttet Sodir eller rettighetshaverne.',
    assumptions: 'Forutsetninger', brent: 'Brent', gas: 'Gass', usdnok: 'USD/NOK', discount: 'Diskonto', reset: 'Tilbakestill',
    brentHint: 'Langsiktig oljepris i faste dollar (USD/fat).', gasHint: 'Europeisk gasspris (TTF/NBP) i faste euro per MWh.',
    gasConv: (fx, f, v, boe, mmbtu) => `<strong>Omregning:</strong> 1 fat o.e. gass ≈ 1,72 MWh (159 Sm³ à ~10,8 kWh). USD/fat o.e. = €/MWh × 1,72 × EURUSD (${fx}) = €/MWh × <strong>${f}</strong>.<br>€${v}/MWh ≈ <strong>$${boe}/fat o.e.</strong> ≈ $${mmbtu}/MMBtu.`,
    usdnokHint: 'Brukes for å vise verdier i kroner og regne om investeringer.', discountHint: 'Reelt avkastningskrav etter skatt.',
    loading: 'Laster feltdata …', loadError: 'Klarte ikke å laste feltdata.',
    heroEyebrow: 'Norsk kontinentalsokkel', heroTitle: 'Hva er sokkelen verdt?',
    heroSearchTitle: 'Finn et felt eller selskap', heroSearchSub: (f, c) => `Søk blant ${f} felt og ${c} rettighetshavere.`,
    heroSearchPh: 'F.eks. Ekofisk eller Vår Energi …', popular: 'Trender:',
    heroSub: (n, y) => `Anslått nåverdi etter skatt for ${n} felt i produksjon og under utbygging, basert på Sodirs reserver og produksjon per ${y}. Endre forutsetningene øverst – alt regnes om fortløpende.`,
    kpiNpv: 'Verdi etter skatt', kpiGross: 'Brutto reserveverdi', kpiGrossSub: 'gjenværende reserver × pris',
    kpiState: 'Skatt til staten', kpiStateSub: 'nåverdi, 78 % marginalskatt', kpiFields: 'Felt i produksjon', kpiFieldsSub: (n) => `av ${n} felt totalt`,
    kpiReserves: 'Gjenværende reserver', mapTitle: 'Feltkart', mapSub: 'Størrelse = verdi etter skatt',
    legOil: 'Olje', legGas: 'Gass', legMixed: 'Olje og gass', legShut: 'Nedstengt',
    topFields: 'Mest verdifulle felt', allRankings: 'Se hele rangeringen →', byArea: 'Verdi per havområde', byHc: 'Brutto verdi per produkt',
    topCompanies: 'Største eiere (verdi)', oil: 'Olje og kondensat', gasProd: 'Gass', ngl: 'NGL',
    modeField: 'Felt', modeCompany: 'Selskap', searchField: 'Søk etter felt …', searchCompany: 'Søk etter selskap …',
    valueFor: 'Vis verdi for', gross100: '100 % (hele feltet)', custom: 'Egen andel …', customPrompt: 'Andel i prosent (0–100):',
    fieldValue: 'Feltverdi', perBoe: 'per fat o.e.', remaining: 'Gjenværende', mmboe: 'mill. fat o.e.', production: (y) => `Produksjon ${y}`,
    kboed: 'tusen fat o.e./d', lifetime: 'Levetid til', lifetimeSub: 'økonomisk grense', taxState: 'Skatt til staten', taxSub: 'nåverdi',
    prodChart: 'Produksjon – historikk og prognose', prodChartSub: 'tusen fat o.e. per dag', forecast: 'Prognose',
    cfChart: 'Kontantstrøm etter skatt', cfChartSub: (c) => `mill. ${c} (faste priser)`, fcf: 'Kontantstrøm', cumPv: 'Akkumulert nåverdi', taxBar: 'Skatt',
    owners: 'Rettighetshavere', company: 'Selskap', share: 'Andel', value: 'Verdi', operator: 'Operatør',
    fieldAssumptions: 'Feltspesifikke forutsetninger', opexBoe: 'Driftskostnad (USD/fat)', capexBoe: 'Investering (USD/fat)', declineRate: 'Årlig fall (%)',
    decomBoe: 'Fjerning (USD/fat utvinnbart)', auto: 'Auto', autoFit: (d) => `Auto: ${d} % – tilpasset gjenværende reserver`, resetField: 'Tilbakestill felt',
    cashflowTable: 'Vis kontantstrøm år for år', exportCsv: 'Last ned CSV', year: 'År', prodCol: 'Prod. (mill. fat)', revenue: 'Inntekt', opex: 'Drift', capex: 'Investering', tax: 'Skatt', decom: 'Fjerning', pv: 'Nåverdi',
    noValue: 'Feltet har ingen gjenværende reserver i Sodirs siste estimat, eller er nedstengt. Verdi settes til null.',
    newField: 'Feltet er godkjent for utbygging. Modellen antar produksjonsstart neste år og tre år platå.',
    rampField: 'Feltet er nytt og i opptrapping. Modellen antar tre år platå før fall.',
    discovered: 'Funnet', sodirLink: 'Faktasider hos Sodir ↗',
    plateauTag: (y) => `Platå til ${y}`, plateauYearsLbl: 'Platå (år)', plateauAuto: (n) => `${n} år – fra Sodir-beskrivelse og reserver`,
    plateauNote: (rate, n, end, src, d) => `${src} Modellen holder produksjonen på ${rate} tusen fat o.e./d i ${n} år (til ${end}), og lar den deretter falle med ${d} % per år slik at samlet produksjon tilsvarer gjenværende reserver.`,
    plateauSrc_text: 'Sodir beskriver feltet som på platå.', plateauSrc_stable: 'Sodir beskriver stabil eller kapasitetsbegrenset produksjon.',
    plateauSrc_capacity: 'Gassproduksjonen er begrenset av kapasitet, ikke reservoar (vurdering basert på Sodirs beskrivelse av kapasitetsøkende tiltak).', plateauSrc_user: 'Du har satt platå for feltet.',
    offPlateauNote: 'Sodir beskriver at feltet har gått av platå og er i fall.', sodirStatus: 'Status fra Sodir (engelsk originaltekst)',
    companyValue: 'Selskapets verdi', nFields: 'Felt', operated: (n) => `${n} som operatør`, netProd: (y) => `Netto produksjon ${y}`, netRem: 'Netto gjenværende',
    perBoeNet: 'Verdi per fat o.e.', fieldsOwned: 'Feltandeler', topContrib: 'Største verdibidrag', net: 'netto',
    rankTitle: 'Rangering', rankFields: 'Felt', rankCompanies: 'Selskaper', filterArea: 'Alle havområder', filterStatus: 'Alle statuser', search: 'Søk …',
    colField: 'Felt', colArea: 'Område', colStatus: 'Status', colOperator: 'Operatør', colRem: 'Gjenv. (mill. fat)', colProd: (y) => `Prod. ${y} (kfat/d)`, colValue: 'Verdi', colPerBoe: 'Per fat', colFields: 'Felt', colEnd: 'Siste år',
    methodTitle: 'Slik regner Feltverdi',
    status: { 'Producing': 'I produksjon', 'Approved for production': 'Godkjent for utbygging', 'Shut down': 'Nedstengt' },
    area: { 'North sea': 'Nordsjøen', 'Norwegian sea': 'Norskehavet', 'Barents sea': 'Barentshavet' },
    hc: { 'OIL': 'Olje', 'GAS': 'Gass', 'OIL/GAS': 'Olje/gass', 'GAS/CONDENSATE': 'Gass/kondensat', 'OIL/CONDENSATE': 'Olje/kondensat' },
    bn: 'mrd.', mn: 'mill.', notFound: 'Fant ikke det du lette etter.',
  },
  en: {
    navHome: 'Overview', navValue: 'Value', navRank: 'Rankings', navMethod: 'Method',
    footData: 'Data:', footSnapshot: 'Snapshot',
    footDisclaimer: 'Simplified estimates for information and learning – not investment advice. Feltverdi is not affiliated with Sodir or the licensees.',
    assumptions: 'Assumptions', brent: 'Brent', gas: 'Gas', usdnok: 'USD/NOK', discount: 'Discount', reset: 'Reset',
    brentHint: 'Long-term oil price in real dollars (USD/bbl).', gasHint: 'European gas price (TTF/NBP) in real euros per MWh.',
    gasConv: (fx, f, v, boe, mmbtu) => `<strong>Conversion:</strong> 1 boe of gas ≈ 1.72 MWh (159 Sm³ at ~10.8 kWh). USD/boe = €/MWh × 1.72 × EURUSD (${fx}) = €/MWh × <strong>${f}</strong>.<br>€${v}/MWh ≈ <strong>$${boe}/boe</strong> ≈ $${mmbtu}/MMBtu.`,
    usdnokHint: 'Used to show values in NOK and convert investments.', discountHint: 'Real after-tax required return.',
    loading: 'Loading field data …', loadError: 'Could not load field data.',
    heroEyebrow: 'Norwegian Continental Shelf', heroTitle: 'What is the shelf worth?',
    heroSearchTitle: 'Find a field or company', heroSearchSub: (f, c) => `Search ${f} fields and ${c} licensees.`,
    heroSearchPh: 'E.g. Ekofisk or Vår Energi …', popular: 'Trending:',
    heroSub: (n, y) => `Estimated after-tax net present value of ${n} producing and approved fields, based on Sodir reserves and production as of ${y}. Change the assumptions above – everything recalculates instantly.`,
    kpiNpv: 'After-tax value', kpiGross: 'Gross reserve value', kpiGrossSub: 'remaining reserves × price',
    kpiState: 'Tax to the state', kpiStateSub: 'present value, 78 % marginal tax', kpiFields: 'Producing fields', kpiFieldsSub: (n) => `of ${n} fields in total`,
    kpiReserves: 'Remaining reserves', mapTitle: 'Field map', mapSub: 'Size = after-tax value',
    legOil: 'Oil', legGas: 'Gas', legMixed: 'Oil and gas', legShut: 'Shut down',
    topFields: 'Most valuable fields', allRankings: 'See full rankings →', byArea: 'Value by sea area', byHc: 'Gross value by product',
    topCompanies: 'Largest owners (value)', oil: 'Oil and condensate', gasProd: 'Gas', ngl: 'NGL',
    modeField: 'Field', modeCompany: 'Company', searchField: 'Search fields …', searchCompany: 'Search companies …',
    valueFor: 'Show value for', gross100: '100 % (whole field)', custom: 'Custom share …', customPrompt: 'Share in percent (0–100):',
    fieldValue: 'Field value', perBoe: 'per boe', remaining: 'Remaining', mmboe: 'MMboe', production: (y) => `Production ${y}`,
    kboed: 'kboe/d', lifetime: 'End of life', lifetimeSub: 'economic limit', taxState: 'Tax to the state', taxSub: 'present value',
    prodChart: 'Production – history and forecast', prodChartSub: 'thousand boe per day', forecast: 'Forecast',
    cfChart: 'After-tax cash flow', cfChartSub: (c) => `${c} million (real terms)`, fcf: 'Cash flow', cumPv: 'Cumulative PV', taxBar: 'Tax',
    owners: 'Licensees', company: 'Company', share: 'Share', value: 'Value', operator: 'Operator',
    fieldAssumptions: 'Field-specific assumptions', opexBoe: 'Opex (USD/bbl)', capexBoe: 'Capex (USD/bbl)', declineRate: 'Annual decline (%)',
    decomBoe: 'Decommissioning (USD/bbl recoverable)', auto: 'Auto', autoFit: (d) => `Auto: ${d} % – fitted to remaining reserves`, resetField: 'Reset field',
    cashflowTable: 'Show year-by-year cash flow', exportCsv: 'Download CSV', year: 'Year', prodCol: 'Prod. (MMboe)', revenue: 'Revenue', opex: 'Opex', capex: 'Capex', tax: 'Tax', decom: 'Decom.', pv: 'PV',
    noValue: 'The field has no remaining reserves in Sodir\'s latest estimate, or is shut down. Value is set to zero.',
    newField: 'The field is approved for development. The model assumes first production next year and a three-year plateau.',
    rampField: 'The field is new and ramping up. The model assumes a three-year plateau before decline.',
    discovered: 'Discovered', sodirLink: 'Sodir fact pages ↗',
    plateauTag: (y) => `Plateau to ${y}`, plateauYearsLbl: 'Plateau (years)', plateauAuto: (n) => `${n} years – from Sodir description and reserves`,
    plateauNote: (rate, n, end, src, d) => `${src} The model holds production at ${rate} kboe/d for ${n} years (to ${end}), then declines it by ${d} % per year so that cumulative production matches remaining reserves.`,
    plateauSrc_text: 'Sodir describes the field as on plateau.', plateauSrc_stable: 'Sodir describes stable or capacity-limited production.',
    plateauSrc_capacity: 'Gas production is limited by capacity rather than the reservoir (judgement based on Sodir\'s description of capacity-increasing measures).', plateauSrc_user: 'You have set a plateau for this field.',
    offPlateauNote: 'Sodir describes the field as off plateau and declining.', sodirStatus: 'Status from Sodir',
    companyValue: 'Company value', nFields: 'Fields', operated: (n) => `${n} as operator`, netProd: (y) => `Net production ${y}`, netRem: 'Net remaining',
    perBoeNet: 'Value per boe', fieldsOwned: 'Field interests', topContrib: 'Largest value contributors', net: 'net',
    rankTitle: 'Rankings', rankFields: 'Fields', rankCompanies: 'Companies', filterArea: 'All sea areas', filterStatus: 'All statuses', search: 'Search …',
    colField: 'Field', colArea: 'Area', colStatus: 'Status', colOperator: 'Operator', colRem: 'Rem. (MMboe)', colProd: (y) => `Prod. ${y} (kboe/d)`, colValue: 'Value', colPerBoe: 'Per boe', colFields: 'Fields', colEnd: 'Last year',
    methodTitle: 'How Feltverdi calculates',
    status: { 'Producing': 'Producing', 'Approved for production': 'Approved for production', 'Shut down': 'Shut down' },
    area: { 'North sea': 'North Sea', 'Norwegian sea': 'Norwegian Sea', 'Barents sea': 'Barents Sea' },
    hc: { 'OIL': 'Oil', 'GAS': 'Gas', 'OIL/GAS': 'Oil/gas', 'GAS/CONDENSATE': 'Gas/condensate', 'OIL/CONDENSATE': 'Oil/condensate' },
    bn: 'bn', mn: 'm', notFound: 'Could not find what you were looking for.',
  },
};

window.FV_METHOD = {
  nb: `
<h2>Data</h2>
<p>Alle tall kommer fra Sokkeldirektoratets (Sodir) åpne faktasider: felt, status, operatør, rettighetshavere, årlig produksjon, investeringer og reserver (siste estimat per 31.12). Dataene er lisensiert under <a href="https://data.norge.no/nlod/no/2.0" target="_blank" rel="noopener">Norsk lisens for offentlige data (NLOD)</a>. Feltverdi henter dem automatisk.</p>
<h2>Produksjonsprofil</h2>
<p>Prognosen starter på fjorårets produksjon og faller eksponentielt. Fallraten tilpasses slik at samlet produksjon fram til økonomisk grense tilsvarer Sodirs <em>gjenværende reserver</em>. Nye felt i opptrapping og felt godkjent for utbygging får tre år platå før fall.</p>
<p><strong>Platåfelt:</strong> Feltverdi leser Sodirs statusbeskrivelse for hvert felt. Der Sodir beskriver feltet som på platå, med stabil eller kapasitetsbegrenset produksjon (f.eks. Snøhvit og Johan Sverdrup), holdes produksjonen flat på nivået fra de siste årene (median av tre år). Det gjelder også Troll, der gassproduksjonen er begrenset av kapasitet. Antall platåår beregnes slik at platået pluss et normalt fall etterpå (10 % for gass, 12 % for olje) tilsvarer gjenværende reserver. Du kan overstyre platå og fallrate per felt.</p>
<h2>Priser og kostnader</h2>
<ul>
<li><strong>Olje og kondensat:</strong> Brent − 1 USD. <strong>NGL:</strong> 60 % av Brent. <strong>Gass:</strong> €/MWh × 1,72 MWh per fat o.e. × EURUSD.</li>
<li><strong>Drift:</strong> 60 % fast og 40 % variabelt, slik at enhetskostnaden stiger når produksjonen faller. Standardnivå etter felttype (gass 7–8, olje 11–12 USD/fat).</li>
<li><strong>Investeringer:</strong> feltets egen investeringsintensitet de siste tre rapporterte årene (USD per fat), begrenset til 2–12 USD/fat.</li>
<li><strong>Fjerning:</strong> 1 USD per fat av opprinnelig utvinnbart volum, to år etter nedstengning.</li>
</ul>
<h2>Skatt</h2>
<p>Petroleumsskatt etter 2022-reglene: 22 % selskapsskatt (investeringer avskrives over seks år) og 71,8 % særskatt (investeringer kostnadsføres umiddelbart, selskapsskatten er fradragsberettiget) – til sammen om lag 78 % marginalskatt. Vi antar at eieren kan utnytte fradrag og underskudd fullt ut.</p>
<h2>Verdi</h2>
<p>Nåverdi etter skatt i faste priser, diskontert midt i året fra 2026. Et selskaps verdi er summen av dets andel av hvert felt. Verdiene vises i kroner med valgt USD/NOK-kurs.</p>
<h2>Begrensninger</h2>
<ul>
<li>Feltspesifikke kostnader er ikke offentlige – modellen bruker standardnivåer. Endre dem per felt hvis du vet bedre.</li>
<li>Betingede ressurser (2C), funn og leteverdi er ikke med, heller ikke rørledninger, terminaler, gjeld, kontanter eller skatteposisjoner i selskapene.</li>
<li>Prisene er flate i faste priser; terminkurver og sikring er ikke med.</li>
</ul>
<p>Feltverdi gir forenklede anslag til informasjon og læring. Det er ikke investeringsrådgivning.</p>`,
  en: `
<h2>Data</h2>
<p>All figures come from the Norwegian Offshore Directorate's (Sodir) open fact pages: fields, status, operator, licensees, annual production, investments and reserves (latest estimate as of 31 December). The data is licensed under the <a href="https://data.norge.no/nlod/en/2.0" target="_blank" rel="noopener">Norwegian Licence for Open Government Data (NLOD)</a>. Feltverdi fetches it automatically.</p>
<h2>Production profile</h2>
<p>The forecast starts from last year's production and declines exponentially. The decline rate is fitted so that cumulative production until the economic limit equals Sodir's <em>remaining reserves</em>. New fields ramping up and fields approved for development get a three-year plateau first.</p>
<p><strong>Plateau fields:</strong> Feltverdi reads Sodir's status description for each field. Where Sodir describes the field as on plateau, with stable or capacity-limited production (e.g. Snøhvit and Johan Sverdrup), production is held flat at the recent level (median of three years). This also applies to Troll, where gas production is limited by capacity. The number of plateau years is set so that the plateau plus a normal decline afterwards (10 % for gas, 12 % for oil) equals the remaining reserves. You can override plateau and decline per field.</p>
<h2>Prices and costs</h2>
<ul>
<li><strong>Oil and condensate:</strong> Brent − USD 1. <strong>NGL:</strong> 60 % of Brent. <strong>Gas:</strong> €/MWh × 1.72 MWh per boe × EURUSD.</li>
<li><strong>Opex:</strong> 60 % fixed and 40 % variable, so unit cost rises as production falls. Default level by field type (gas 7–8, oil 11–12 USD/bbl).</li>
<li><strong>Capex:</strong> the field's own investment intensity over the last three reported years (USD per boe), clamped to 2–12 USD/boe.</li>
<li><strong>Decommissioning:</strong> USD 1 per boe of original recoverable volume, two years after shut-down.</li>
</ul>
<h2>Tax</h2>
<p>Norwegian petroleum tax under the 2022 rules: 22 % corporate tax (capex depreciated over six years) and 71.8 % special tax (capex expensed immediately, corporate tax deductible) – about 78 % marginal tax in total. We assume the owner can use all deductions and losses.</p>
<h2>Value</h2>
<p>After-tax net present value in real terms, mid-year discounting from 2026. A company's value is the sum of its share of each field. Values are shown in NOK at the selected USD/NOK rate.</p>
<h2>Limitations</h2>
<ul>
<li>Field-level costs are not public – the model uses default levels. Change them per field if you know better.</li>
<li>Contingent resources (2C), discoveries and exploration value are not included, nor are pipelines, terminals, debt, cash or tax positions of the companies.</li>
<li>Prices are flat in real terms; forward curves and hedging are not included.</li>
</ul>
<p>Feltverdi provides simplified estimates for information and learning. It is not investment advice.</p>`,
};
