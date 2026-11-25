/* Feltverdi – texts in Norwegian (nb) and English (en) */
window.FV_I18N = {
  nb: {
    navHome: 'Oversikt', navValue: 'Verdsett', navRank: 'Rangering', navMethod: 'Metode', navHist: 'Historisk', navWiki: 'Wiki',
    wikiTitle: 'Petroøkonomi fra A til Å', wikiIntro: (n) => `${n} sentrale begreper innen olje- og gassøkonomi – forklart enkelt, med formler og eksempler fra norsk sokkel.`,
    wikiSearch: 'Søk etter begrep …', wikiCategories: 'Kategorier', wikiAll: 'Alle', wikiFeatured: 'Viktige begreper', wikiNoHits: 'Ingen begreper passer søket.',
    wikiWhat: (x) => `Hva er ${x}?`, wikiKeys: 'Viktige poenger', wikiUnderstand: (x) => `Forstå ${x}`, wikiFormula: 'Formel og beregning', wikiWhere: 'Der:',
    wikiExample: 'Eksempel', wikiRelated: 'Relaterte begreper', wikiContents: 'Innhold', wikiMoreIn: (c) => `Mer om ${c.toLowerCase()}`,
    wikiUse: 'Se det i bruk i Feltverdi →', wikiPrev: 'Forrige', wikiNext: 'Neste',
    histEyebrow: 'Hele levetiden', histTitle: 'Historisk verdi',
    histIntro: (y) => `Hva har feltene på sokkelen vært verdt fra første investering til nedstengning? Her kombineres faktisk produksjon og investeringer fra Sodir med historiske olje- og gasspriser, valutakurser og inflasjon – og modellens prognose for årene som gjenstår. Alle beløp er i faste ${y}-priser.`,
    histKpiPre: 'Verdiskaping før skatt', histKpiPreSub: (p) => `hele levetiden · ${p} allerede realisert`,
    histKpiTax: 'Skatt til staten', histKpiTaxSub: 'forenklet 78 % av overskuddet', histKpiCapex: 'Investeringer', histKpiCapexSub: 'i feltene (Sodir), faste priser',
    histKpiProd: 'Produksjon', histKpiProdSub: (p) => `mrd. fat o.e. · ${p} produsert`,
    histChart: 'Kontantstrøm før skatt – hele sokkelen', histChartSub: (c) => `mrd. ${c} per år, faste priser`, histRealised: 'Realisert', histForecast: 'Prognose', histBrent: 'Brent (faste USD/fat)',
    histTable: 'Felt gjennom hele levetiden', colStart: 'Start', colLifeProd: 'Prod. totalt (mill. fat)', colCapexReal: 'Investert', colPre: 'Verdi før skatt',
    colOrig: 'Opprinnelig verdi', colIrr: 'Realavkastning', colRealised: 'Realisert',
    histColNote: (d) => `«Opprinnelig verdi» er nåverdien etter skatt ved første investering (diskonteringsrente ${d}), beregnet med de prisene som faktisk ble. «Realavkastning» er internrente før skatt i faste priser.`,
    histTips: {
      name: () => 'Feltets navn slik det er registrert hos Sokkeldirektoratet (Sodir). Klikk på et felt for å åpne feltsiden.',
      area: () => 'Havområdet feltet ligger i: Nordsjøen, Norskehavet eller Barentshavet (Sodir).',
      start: () => 'Første år med investeringer eller produksjon i Sodirs data. Det er fra dette året opprinnelig verdi og realavkastning beregnes.',
      prodTotal: () => 'Samlet produksjon over hele levetiden i millioner fat oljeekvivalenter: faktisk produksjon fra Sodir fram til i fjor pluss modellens prognose for gjenværende reserver.',
      capex: (b) => `Sum investeringer i feltet over hele levetiden. Historiske tall er Sodirs feltinvesteringer i løpende kroner, omregnet til dollar med årets USD/NOK-kurs (Norges Bank) og til faste ${b}-priser med amerikansk KPI. Framtidige investeringer og fjerning er fra modellen. Rørledninger og landanlegg er ikke med.`,
      pre: (b) => `Verdiskaping før skatt: inntekter minus drifts- og investeringskostnader over hele levetiden, summert uten diskontering i faste ${b}-priser. Inntektene bruker historiske priser fra Verdensbanken (Brent og europeisk gass) og modellens priser for framtiden.`,
      orig: (b, d) => `Nåverdien etter skatt på tidspunktet for første investering, diskontert med ${d} per år – som om man hadde kjent prisene som faktisk ble. Skatt er forenklet til 78 % av overskuddet hvert år. Viser hva feltet egentlig var verdt da det ble startet.`,
      irr: () => 'Internrenten før skatt i faste priser: den årlige avkastningen som gjør at nåverdien av alle kontantstrømmer blir null. «< 0 %» betyr at feltet ikke har tjent inn investeringene.',
      realised: () => 'Andel av samlet produksjon over levetiden som allerede er produsert (historisk produksjon delt på historisk pluss prognose).',
    },
    infoLabel: 'Forklaring',
    histSources: 'Kilder og forutsetninger', histLimits: 'Forenklinger',
    histLimitList: [
      'Driftskostnader er ikke offentlige per felt. Historiske driftskostnader beregnes med samme modell som prognosen (fast + variabel kostnad per fat, i faste priser).',
      'Skatt er forenklet til 78 % av overskuddet hvert år. Tidligere skatteregimer (produksjonsavgift fram til 2006, andre satser og avskrivningsregler før 1992) er ikke modellert.',
      'Investeringene er Sodirs feltinvesteringer. Rørledninger, landanlegg og terminaler (f.eks. LNG-anlegget på Melkøya, Kollsnes, Nyhamna) er ikke med – det gir for høy avkastning for felt med store landanlegg, særlig Snøhvit.',
      'NGL prises til 60 % av Brent. Gass prises til Verdensbankens europeiske gasspris, som før 2015 var importpris ved grensen (i stor grad oljeindeksert) og deretter TTF.',
      'Beløp i dollar regnes om til faste priser med amerikansk KPI og vises i kroner med valgt USD/NOK-kurs.',
    ],
    lifeCard: 'Hele levetiden', lifeStart: 'Første investering', lifePre: 'Verdi før skatt', lifeOrig: 'Opprinnelig verdi', lifeIrr: 'Realavkastning', lifeMore: 'Se alle felt i historisk visning →',
    footData: 'Data:', footSnapshot: 'Datauttrekk',
    footDisclaimer: 'Forenklede anslag til informasjon og læring – ikke investeringsråd. Feltverdi er ikke tilknyttet Sodir eller rettighetshaverne.',
    assumptions: 'Forutsetninger', brent: 'Brent', gas: 'Gass', usdnok: 'USD/NOK', discount: 'Diskonto', reset: 'Tilbakestill',
    brentHint: 'Langsiktig oljepris i faste dollar (USD/fat).', gasHint: 'Europeisk gasspris (TTF/NBP) i faste euro per MWh.',
    gasConv: (fx, f, v, boe, mmbtu) => `<strong>Omregning:</strong> 1 fat o.e. gass ≈ 1,72 MWh (159 Sm³ à ~10,8 kWh). USD/fat o.e. = €/MWh × 1,72 × EURUSD (${fx}) = €/MWh × <strong>${f}</strong>.<br>€${v}/MWh ≈ <strong>$${boe}/fat o.e.</strong> ≈ $${mmbtu}/MMBtu.`,
    usdnokHint: 'Brukes for å vise verdier i kroner og regne om investeringer.', discountHint: 'Reelt avkastningskrav etter skatt.',
    growth: 'Reservevekst', growthHint: 'Hvor mye gjenværende reserver kan vokse utover Sodirs anslag (nye brønner, økt utvinning, levetidsforlengelse). ×1,6 er standard, kalibrert mot Sodirs historikk 2010–2025. ×1,0 bruker Sodirs reserver slik de er.',
    autoDecl: (d) => `Auto: ${d} % – faktisk fall siste fem år, begrenset av reservene`,
    modelProd: (v, g) => `modell ${v} (×${g})`,
    declNote_observed: (d, o, lo, hi, cap, g) => `Fallraten på ${d} % per år er feltets faktiske fall de siste fem årene. Den ligger innenfor det reservene tillater (${lo}–${hi} %), og gir samlet produksjon på ×${g} av Sodirs gjenværende reserver.`,
    declNote_capLow: (d, o, lo, hi, cap, g) => `Feltet har falt bare ${o} % per år de siste fem årene. Modellen bruker likevel minst ${d} % – det fallet som gir Sodirs reserver × ${cap} – for ikke å fremskrive en god periode for langt.`,
    declNote_capHigh: (d, o, lo, hi, cap, g) => `Feltet har falt ${o} % per år de siste fem årene. Modellen bruker høyst ${d} % – det fallet som akkurat gir Sodirs gjenværende reserver.`,
    declNote_growth: (d, o, lo, hi, cap, g) => `Feltet har for kort produksjonshistorikk til å måle fallet. Fallraten på ${d} % gir samlet produksjon på Sodirs reserver × ${g}.`,
    declNote_reserves: (d) => `Fallraten på ${d} % gir samlet produksjon lik Sodirs gjenværende reserver (reservevekst ×1,0).`,
    declNote_user: (d) => `Du har satt fallraten til ${d} % per år.`,
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
    plateauNote: (rate, n, end, src, d, g) => `${src} Modellen holder produksjonen på ${rate} tusen fat o.e./d i ${n} år (til ${end}), og lar den deretter falle med ${d} % per år slik at samlet produksjon blir Sodirs gjenværende reserver × ${g}.`,
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
    navHome: 'Overview', navValue: 'Value', navRank: 'Rankings', navMethod: 'Method', navHist: 'History', navWiki: 'Wiki',
    wikiTitle: 'Petroleum economics A–Z', wikiIntro: (n) => `${n} key terms in oil and gas economics – explained simply, with formulas and examples from the Norwegian shelf.`,
    wikiSearch: 'Search terms …', wikiCategories: 'Categories', wikiAll: 'All', wikiFeatured: 'Essential terms', wikiNoHits: 'No terms match your search.',
    wikiWhat: (x) => `What is ${x}?`, wikiKeys: 'Key takeaways', wikiUnderstand: (x) => `Understanding ${x}`, wikiFormula: 'Formula and calculation', wikiWhere: 'Where:',
    wikiExample: 'Example', wikiRelated: 'Related terms', wikiContents: 'Contents', wikiMoreIn: (c) => `More in ${c}`,
    wikiUse: 'See it in use in Feltverdi →', wikiPrev: 'Previous', wikiNext: 'Next',
    histEyebrow: 'The whole field life', histTitle: 'Historical value',
    histIntro: (y) => `What have the fields on the shelf been worth from first investment to shut-down? This combines actual production and investments from Sodir with historical oil and gas prices, exchange rates and inflation – plus the model forecast for the remaining years. All amounts are in real ${y} terms.`,
    histKpiPre: 'Value created before tax', histKpiPreSub: (p) => `whole life · ${p} already realised`,
    histKpiTax: 'Tax to the state', histKpiTaxSub: 'simplified 78 % of profit', histKpiCapex: 'Investments', histKpiCapexSub: 'in the fields (Sodir), real terms',
    histKpiProd: 'Production', histKpiProdSub: (p) => `bn boe · ${p} produced`,
    histChart: 'Pre-tax cash flow – the whole shelf', histChartSub: (c) => `${c} bn per year, real terms`, histRealised: 'Realised', histForecast: 'Forecast', histBrent: 'Brent (real USD/bbl)',
    histTable: 'Fields over their whole life', colStart: 'Start', colLifeProd: 'Total prod. (MMboe)', colCapexReal: 'Invested', colPre: 'Value before tax',
    colOrig: 'Original value', colIrr: 'Real return', colRealised: 'Realised',
    histColNote: (d) => `"Original value" is the after-tax present value at first investment (discount rate ${d}), using the prices that actually occurred. "Real return" is the pre-tax internal rate of return in real terms.`,
    histTips: {
      name: () => 'The field name as registered with the Norwegian Offshore Directorate (Sodir). Click a field to open its page.',
      area: () => 'The sea area the field lies in: North Sea, Norwegian Sea or Barents Sea (Sodir).',
      start: () => 'First year with investments or production in Sodir\'s data. Original value and real return are calculated from this year.',
      prodTotal: () => 'Total production over the whole field life in million barrels of oil equivalent: actual production from Sodir up to last year plus the model forecast for remaining reserves.',
      capex: (b) => `Total investments in the field over its whole life. Historical figures are Sodir field investments in nominal NOK, converted to dollars at that year's USD/NOK rate (Norges Bank) and to real ${b} terms with US CPI. Future investments and decommissioning come from the model. Pipelines and onshore plants are not included.`,
      pre: (b) => `Value created before tax: revenue minus operating and investment costs over the whole life, summed without discounting in real ${b} terms. Revenue uses historical World Bank prices (Brent and European gas) and the model prices for the future.`,
      orig: (b, d) => `The after-tax present value at the time of first investment, discounted at ${d} per year – as if the prices that actually occurred had been known. Tax is simplified to 78 % of profit every year. Shows what the field was really worth when it was started.`,
      irr: () => 'The pre-tax internal rate of return in real terms: the annual return at which the present value of all cash flows is zero. "< 0 %" means the field has not earned back its investments.',
      realised: () => 'Share of total lifetime production that has already been produced (historical production divided by historical plus forecast).',
    },
    infoLabel: 'Explanation',
    histSources: 'Sources and assumptions', histLimits: 'Simplifications',
    histLimitList: [
      'Operating costs are not public per field. Historical opex uses the same model as the forecast (fixed + variable cost per boe, in real terms).',
      'Tax is simplified to 78 % of profit every year. Earlier tax regimes (royalty until 2006, other rates and depreciation rules before 1992) are not modelled.',
      'Investments are Sodir field investments. Pipelines, onshore plants and terminals (e.g. Hammerfest LNG, Kollsnes, Nyhamna) are not included – this overstates returns for fields with large onshore facilities, especially Snøhvit.',
      'NGL is priced at 60 % of Brent. Gas is priced at the World Bank European gas price, which before 2015 was the import border price (largely oil-indexed) and thereafter TTF.',
      'Dollar amounts are converted to real terms with US CPI and shown in NOK at the selected USD/NOK rate.',
    ],
    lifeCard: 'Whole field life', lifeStart: 'First investment', lifePre: 'Value before tax', lifeOrig: 'Original value', lifeIrr: 'Real return', lifeMore: 'See all fields in the historical view →',
    footData: 'Data:', footSnapshot: 'Snapshot',
    footDisclaimer: 'Simplified estimates for information and learning – not investment advice. Feltverdi is not affiliated with Sodir or the licensees.',
    assumptions: 'Assumptions', brent: 'Brent', gas: 'Gas', usdnok: 'USD/NOK', discount: 'Discount', reset: 'Reset',
    brentHint: 'Long-term oil price in real dollars (USD/bbl).', gasHint: 'European gas price (TTF/NBP) in real euros per MWh.',
    gasConv: (fx, f, v, boe, mmbtu) => `<strong>Conversion:</strong> 1 boe of gas ≈ 1.72 MWh (159 Sm³ at ~10.8 kWh). USD/boe = €/MWh × 1.72 × EURUSD (${fx}) = €/MWh × <strong>${f}</strong>.<br>€${v}/MWh ≈ <strong>$${boe}/boe</strong> ≈ $${mmbtu}/MMBtu.`,
    usdnokHint: 'Used to show values in NOK and convert investments.', discountHint: 'Real after-tax required return.',
    growth: 'Reserve growth', growthHint: 'How much remaining reserves may grow beyond Sodir\'s estimate (new wells, improved recovery, life extension). ×1.6 is the default, calibrated on Sodir history 2010–2025. ×1.0 uses Sodir\'s reserves as they are.',
    autoDecl: (d) => `Auto: ${d} % – actual decline over the last five years, bounded by reserves`,
    modelProd: (v, g) => `model ${v} (×${g})`,
    declNote_observed: (d, o, lo, hi, cap, g) => `The decline of ${d} % per year is the field's actual decline over the last five years. It lies within what the reserves allow (${lo}–${hi} %) and gives total production of ×${g} Sodir's remaining reserves.`,
    declNote_capLow: (d, o, lo, hi, cap, g) => `The field has declined only ${o} % per year over the last five years. The model still uses at least ${d} % – the decline that gives Sodir's reserves × ${cap} – so as not to extrapolate a good period too far.`,
    declNote_capHigh: (d, o, lo, hi, cap, g) => `The field has declined ${o} % per year over the last five years. The model uses at most ${d} % – the decline that exactly gives Sodir's remaining reserves.`,
    declNote_growth: (d, o, lo, hi, cap, g) => `The field's production history is too short to measure its decline. The decline of ${d} % gives total production of Sodir's reserves × ${g}.`,
    declNote_reserves: (d) => `The decline of ${d} % gives total production equal to Sodir's remaining reserves (reserve growth ×1.0).`,
    declNote_user: (d) => `You have set the decline to ${d} % per year.`,
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
    plateauNote: (rate, n, end, src, d, g) => `${src} The model holds production at ${rate} kboe/d for ${n} years (to ${end}), then declines it by ${d} % per year so that cumulative production equals Sodir's remaining reserves × ${g}.`,
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
<p>Prognosen starter på fjorårets produksjon og faller eksponentielt. Nye felt i opptrapping og felt godkjent for utbygging får tre år platå før fall.</p>
<p><strong>Fallrate:</strong> Sodirs <em>gjenværende reserver</em> omfatter bare godkjente prosjekter. Historisk har reservene på sokkelen vokst etter hvert som nye brønner, økt utvinning og levetidsforlengelser er modnet fram. Feltverdi bruker derfor feltets <em>faktiske fall de siste fem årene</em> (log-lineær tilpasning), med to grenser:</p>
<ul>
<li><strong>Aldri raskere</strong> enn fallet som akkurat gir Sodirs gjenværende reserver.</li>
<li><strong>Aldri saktere</strong> enn fallet som gir reservene × <em>reservevekst</em> (standard ×1,6, justerbar øverst). Det hindrer at en god periode fremskrives for langt.</li>
<li>Felt uten brukbar historikk (nye felt og platåfelt) får reservene × 1,3 (halvveis mot taket).</li>
</ul>
<p><strong>Kalibrering mot historikken:</strong> Vi kjørte modellen som om vi sto i 2010 og 2015, med de reservene Sodir oppga da, og sammenlignet med faktisk produksjon fram til 2025. Faktisk produksjon delt på prognosen:</p>
<div class="tbl-wrap"><table><thead><tr><th>Metode</th><th class="r">Fra 2010 (15 år / 5 år)</th><th class="r">Fra 2015 (10 år / 5 år)</th><th class="r">Framtidig produksjon i dag</th></tr></thead><tbody>
<tr><td>Tilpasset Sodirs reserver (×1,0, tidligere standard)</td><td class="r">1,45 / 1,16</td><td class="r">1,35 / 1,23</td><td class="r">13,6 mrd. fat</td></tr>
<tr><td>Faktisk fall, tak ×1,6 (standard)</td><td class="r">1,26 / 1,07</td><td class="r">1,16 / 1,11</td><td class="r">18,1 mrd. fat</td></tr>
</tbody></table></div>
<p>Tall over 1 betyr at prognosen var for lav. Standarden er fortsatt noe forsiktig, men treffer langt bedre enn ren tilpasning til reservene. Den impliserte samlede reserveveksten (om lag ×1,33) tilsvarer det sokkelen faktisk har oppnådd siden 2010 (×1,28–1,39).</p>
<p><strong>Platåfelt:</strong> Feltverdi leser Sodirs statusbeskrivelse for hvert felt. Der Sodir beskriver feltet som på platå, med stabil eller kapasitetsbegrenset produksjon (f.eks. Snøhvit og Johan Sverdrup), holdes produksjonen flat på nivået fra de siste årene (median av tre år). Det gjelder også Troll, der gassproduksjonen er begrenset av kapasitet. Antall platåår beregnes slik at platået pluss et normalt fall etterpå (10 % for gass, 12 % for olje) tilsvarer gjenværende reserver × 1,3. Du kan overstyre platå og fallrate per felt.</p>
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
<p>The forecast starts from last year's production and declines exponentially. New fields ramping up and fields approved for development get a three-year plateau first.</p>
<p><strong>Decline rate:</strong> Sodir's <em>remaining reserves</em> only cover approved projects. Historically, reserves on the shelf have grown as new wells, improved recovery and life extensions mature. Feltverdi therefore uses the field's <em>actual decline over the last five years</em> (log-linear fit), with two bounds:</p>
<ul>
<li><strong>Never faster</strong> than the decline that exactly produces Sodir's remaining reserves.</li>
<li><strong>Never slower</strong> than the decline that produces reserves × <em>reserve growth</em> (default ×1.6, adjustable at the top). This prevents a good period from being extrapolated too far.</li>
<li>Fields without a usable history (new fields and plateau fields) get reserves × 1.3 (halfway to the cap).</li>
</ul>
<p><strong>Calibration against history:</strong> We ran the model as if standing in 2010 and 2015, with the reserves Sodir reported then, and compared with actual production up to 2025. Actual production divided by the forecast:</p>
<div class="tbl-wrap"><table><thead><tr><th>Method</th><th class="r">From 2010 (15 yrs / 5 yrs)</th><th class="r">From 2015 (10 yrs / 5 yrs)</th><th class="r">Future production today</th></tr></thead><tbody>
<tr><td>Fitted to Sodir reserves (×1.0, previous default)</td><td class="r">1.45 / 1.16</td><td class="r">1.35 / 1.23</td><td class="r">13.6 bn boe</td></tr>
<tr><td>Actual decline, cap ×1.6 (default)</td><td class="r">1.26 / 1.07</td><td class="r">1.16 / 1.11</td><td class="r">18.1 bn boe</td></tr>
</tbody></table></div>
<p>Values above 1 mean the forecast was too low. The default is still somewhat conservative, but much closer than fitting to reserves alone. The implied total reserve growth (about ×1.33) matches what the shelf has actually achieved since 2010 (×1.28–1.39).</p>
<p><strong>Plateau fields:</strong> Feltverdi reads Sodir's status description for each field. Where Sodir describes the field as on plateau, with stable or capacity-limited production (e.g. Snøhvit and Johan Sverdrup), production is held flat at the recent level (median of three years). This also applies to Troll, where gas production is limited by capacity. The number of plateau years is set so that the plateau plus a normal decline afterwards (10 % for gas, 12 % for oil) equals the remaining reserves × 1.3. You can override plateau and decline per field.</p>
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
