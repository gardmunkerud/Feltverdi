/* Feltverdi – texts in Norwegian (nb) and English (en) */
window.FV_I18N = {
  nb: {
    navHome: 'Oversikt', navValue: 'Verdsett', navRank: 'Rangering', navMethod: 'Metode', navHist: 'Historisk', navWiki: 'Wiki', navDeals: 'Deals',
    tickerLabel: 'Siste deals', dealType_merger: 'Fusjon', dealType_corporate: 'Selskapskjøp', dealType_asset: 'Kjøp av andeler', dealType_swap: 'Bytte',
    dealStatus_completed: 'Gjennomført', dealStatus_pending: 'Venter på godkjenning',
    dealsEyebrow: 'Transaksjoner på norsk sokkel', dealsIntro: (n, a, b) => `${n} fusjoner, oppkjøp og bytter av eierandeler på norsk sokkel fra ${a} til ${b} – med verdi, felt og kilde for hver avtale.`,
    dealsKpiCount: 'Avtaler', dealsKpiValue: 'Oppgitt verdi', dealsKpiValueSub: (n) => `sum av ${n} avtaler med oppgitt verdi`, dealsKpiLargest: 'Største avtale',
    dealsKpiPending: 'Venter på godkjenning', dealsKpiPendingSub: 'annonsert, ikke gjennomført', dealsChart: 'Avtaler per år', dealsChartSub: 'oppgitt verdi (USD) og antall',
    dealsChartValue: 'Oppgitt verdi', dealsChartCount: 'Antall avtaler', dealsSearch: 'Søk etter selskap, felt …', dealsTypeLabel: 'Avtaletype', dealsAllStatus: 'Alle statuser',
    dealsParties: 'Parter', dealsFields: 'Felt',
    verdict_cheap: 'Lav pris', verdict_fair: 'Markedsmessig', verdict_full: 'Fullt priset', verdict_expensive: 'Høy pris', verdict_early: 'For tidlig å si', verdict_na: 'Kan ikke vurderes',
    verdictRule_cheap: 'under 0,8× medianen', verdictRule_fair: '0,8–1,1×', verdictRule_full: '1,1–1,4×', verdictRule_expensive: 'over 1,4×',
    conf_high: 'høy', conf_medium: 'middels', conf_low: 'lav', dealsConfidence: 'Sikkerhet', dealsVerdictLabel: 'Vurdering', dealsAllVerdicts: 'Alle vurderinger',
    dmProd: 'Produksjon året før', dmRem: 'Reserver (Sodir)', dmFlowing: 'Per flytende fat', dmPerBoe: 'Per fat reserver', dmOfBrent: 'av Brent',
    dmHindsight: (y) => `Verdi i ettertid (${y}-USD)`, dmRatio: 'Pris / verdi', dmMedian: 'medianen', dmGrowth: 'Reservevekst siden', dmStakes: 'Andeler som skiftet eier (Sodir)',
    dealsMethodTitle: 'Slik vurderes avtalene',
    dealsMethod: (b, n, r) => `<p>For hver avtale finner vi hvilke feltandeler som skiftet eier (Sodirs lisenshistorikk) og beregner <strong>verdien i ettertid</strong>: faktisk produksjon og investeringer etter avtalen med historiske priser, pluss Feltverdis prognose for resten – etter 78 % skatt, i faste priser og diskontert til avtaleåret med ${r} realrente.</p><p>Kjøpesummen i faste priser delt på denne verdien gir <strong>pris / verdi</strong>. En typisk avtale på sokkelen (medianen av ${n} avtaler) ligger på <strong>${b}×</strong>, fordi modellen ikke fanger opp skatteposisjoner, oppside og kjøpernes egne forutsetninger. Hver avtale vurderes derfor mot medianen:</p>`, dealsNoValue: 'Verdi ikke oppgitt', dealsSource: 'Kilde ↗', dealsNoHits: 'Ingen avtaler passer filteret.',
    ddBack: '← Alle deals', ddOpen: 'Full analyse →', ddLive: 'Regnes live med forutsetningene øverst på siden.',
    ddKpiPaid: 'Kjøpesum', ddKpiPaidSub: (n, y) => `${n} nominelt (${y})`, ddKpiValue: 'Verdi av andelene', ddKpiValueSub: (y, r) => `diskontert til ${y} med ${r}`,
    ddKpiGain: 'Netto nåverdi for kjøper', ddKpiGainSub: (p) => `${p} av kjøpesummen`, ddKpiRatio: 'Pris / verdi', ddKpiRatioSub: (m, rel) => `median ${m}× → ${rel}× medianen`,
    ddKpiIrr: 'Kjøpers realavkastning', ddKpiIrrSub: 'etter skatt, på kjøpesummen; under 0 % betyr at kontantstrømmen ikke dekker prisen', ddKpiPayback: 'Tilbakebetalt (nåverdi)', ddKpiPaybackSub: 'år akkumulert nåverdi passerer prisen', ddNotWithin: 'aldri',
    ddKpiModel: 'Modellverdi', ddKpiTypical: 'Typisk markedsverdi', ddKpiTypicalSub: (b) => `modellverdi × ${b} (median pris/verdi)`,
    ddKpiVsTyp: 'Pris mot typisk avtale', ddKpiVsTypSub: (r, b) => `pris/verdi ${r}× mot median ${b}×`, ddAbove: 'over', ddBelow: 'under',
    ddVsTypRow: 'Gevinst mot typisk prising', ddColRel: 'Mot median',
    ddSensT: 'Følsomhet: kjøpers gevinst mot typisk prising', ddSensSubT: (b) => `modellverdi × ${b} − pris · prisbane × diskonteringsrente`,
    ddViews: 'Partenes egne verdier', ddViewsSub: 'synergier og avkastningskrav – juster selv',
    ddInBuyerRate: (n) => `${n}: avkastningskrav (real)`, ddInSyn: (n) => `${n}: driftssynergier (% av opex)`, ddInSellerRate: (n) => `${n}: avkastningskrav (real)`,
    ddBuyerMax: (n) => `Høyeste pris ${n} kan forsvare`, ddSellerMin: (n) => `Laveste pris ${n} bør akseptere`,
    ddSurplusB: (n) => `Gevinst for ${n}`, ddSurplusS: (n) => `Gevinst for ${n}`, ddSurplusTot: 'Samlet verdiskaping (synergier + ulike avkastningskrav)',
    ddOutBoth: 'Prisen ligger i forhandlingsrommet: begge parter tjener på avtalen.', ddOutSeller: 'Prisen er over det kjøper kan forsvare med disse forutsetningene – selger tar hele gevinsten.',
    ddOutBuyer: 'Prisen er under selgers minstepris med disse forutsetningene – kjøper tar hele gevinsten.', ddOutNone: 'Ingen pris gir gevinst for begge: kjøpers høyeste pris er lavere enn selgers laveste.',
    ddViewsNote: 'Begge verdier er skalert med typisk-avtale-faktoren (median pris/verdi), slik at de kan sammenlignes med faktiske priser. Synergier er reduserte driftskostnader etter 78 % skatt. Skattekapasitet (at en kjøper med skattbar inntekt får fradragene raskere) er ikke modellert.',
    ddViewsDefault: 'Feltverdis antakelse for denne avtalen:', ddReset: 'Tilbakestill', ddRangePrice: 'Pris', ddRangeBuyer: 'Kjøpers maks', ddRangeSeller: 'Selgers min',
    ddLater: 'senere felt', ddLaterTip: 'Funn i selgers lisenser på avtaletidspunktet som senere ble eget felt. Andelen er kjøpers andel ved feltopprettelsen, skalert med hvor mye av kjøpers lisensandel som kom fra selger (Sodir).', ddLegNote: 'Merk', ddSensSwap: 'Følsomhet: netto verdi av byttet', ddIrrNone: 'under 0 %',
    ddBuyer: (n) => `Kjøpers side · ${n}`, ddSeller: (n) => `Selgers side · ${n}`,
    ddPaid: 'Betalt (faste priser)', ddGot: 'Verdi mottatt (ettertid + prognose)', ddRealised: (a, b) => `… herav allerede realisert ${a}–${b}`, ddGain: 'Netto nåverdi', ddIrr: 'Realavkastning etter skatt', ddPayback: 'Nåverdi-tilbakebetaling',
    ddUpsideRow: 'Med oppside', ddReceived: 'Mottatt', ddGaveUp: 'Verdi gitt fra seg', ddSellerGain: 'Gevinst for selger', ddThenValue: (b) => `Verdi med prisene da (Brent ${b} USD, flatt)`,
    ddThenGain: 'Selgers gevinst med prisene da', ddPriceLuck: 'Priseffekt etter avtalen', ddForgone: (a, b) => `Kontantstrøm selger ga fra seg ${a}–${b}`,
    ddBuyerText: (paid, val, gain, pctv, irr, r) => `Kjøper betaler ${paid} for andeler Feltverdi verdsetter til ${val}. Det gir en netto nåverdi på ${gain} (${pctv} av prisen) og en realavkastning etter skatt på ${irr}, mot et avkastningskrav på ${r}.`,
    ddSellerTextUp: (rec, val, then, g) => `Selger får ${rec} for andeler som er verdt ${val} med dagens forutsetninger. Med prisene som gjaldt da avtalen ble inngått, var de verdt ${then} – selgeren fikk altså ${g} mer enn verdien slik den så ut da.`,
    ddSellerTextDown: (rec, val, then, g) => `Selger får ${rec} for andeler som er verdt ${val} med dagens forutsetninger. Med prisene som gjaldt da avtalen ble inngått, var de verdt ${then} – selgeren fikk altså ${g} mindre enn verdien slik den så ut da.`,
    ddTaxNote: 'Skatt ved salg: på norsk sokkel er salg av andeler skattenøytrale (petroleumsskatteloven § 10). Kjøper betaler en pris etter skatt, overtar selgers skattemessige avskrivningsgrunnlag og underskudd, og selger betaler ikke skatt på gevinsten. Verdien av overtatte skatteposisjoner er ikke med i modellen, så kjøpers verdi er her undervurdert – en av grunnene til at typiske avtaler ligger over 1× pris/verdi.',
    ddPaidShares: 'Betalt med aksjer: selger beholder eksponering mot andelene gjennom eierskap i det sammenslåtte selskapet, og deler synergiene.',
    ddPartial: 'Delvis vurdering: prisen dekker mer enn andelene Feltverdi kan verdsette (andre land, leteportefølje eller felt som ikke er i Sodirs data). Pris/verdi er derfor ikke sammenlignbar.',
    ddDcf: 'Kontantstrøm etter skatt og akkumulert nåverdi', ddDcfSub: (y, r) => `andelene som skiftet eier · faste priser · diskontert til ${y} med ${r}`,
    ddHist: 'Faktisk', ddFc: 'Prognose', ddCumPv: 'Akkumulert nåverdi', ddPriceLine: 'Kjøpesum (faste priser)', ddCumPvUp: 'Akkumulert nåverdi med oppside',
    ddBrent: 'Verdi mot oljepris', ddBrentSub: 'gassprisen følger Brent forholdsmessig; faktiske år uendret', ddBreakeven: (b) => `Kjøper går i null ved Brent ≈ ${b} USD (faste priser).`, ddBreakevenNone: (lo, hi) => `Ingen nullpunkt mellom ${lo} og ${hi} USD.`,
    ddScen: 'Scenarioer', ddScenSub: 'diskonteringsrenten fra forutsetningene', ddDeck: 'Prisbane', ddColValue: 'Verdi', ddColBuyer: 'Kjøper', ddColSeller: 'Selger', ddColRatio: 'Pris / verdi',
    ddDeckLow: 'Lav', ddDeckBase: 'Basis (dine forutsetninger)', ddDeckHigh: 'Høy', ddDeckThen: (y) => `Prisene i ${y}`, ddDeckUp: 'Basis med oppside',
    ddSens: 'Følsomhet: kjøpers netto nåverdi', ddSensSub: 'prisbane × diskonteringsrente (realrente)', ddSensSubSwap: (p) => `netto for ${p} · prisbane × diskonteringsrente`,
    ddStakes: 'Andeler som skiftet eier', ddStakesSub: (y) => `Sodirs lisenshistorikk; produksjon ${y - 1}, reserver ved inngangen til ${y}`,
    ddColField: 'Felt', ddColShare: 'Andel', ddColProd: 'Prod. året før', ddColRes: 'Reserver da', ddColPct: 'Andel av verdi', ddTotal: 'Sum',
    ddConclusion: 'Konklusjon', ddMultiples: 'Multipler', ddPerFlowing: 'per flytende fat o.e./d', ddPerBoe: 'per fat o.e. i reserver',
    ddCaveats: 'Forbehold: Modellen verdsetter bare produserende og godkjente felt i Sodirs data med Feltverdis standardkostnader. Letearealer, funn, infrastruktur, skatteposisjoner, gjeld og selskapets organisasjon er ikke med. Kjøpesummen er oppgitt verdi ved kunngjøring (ofte selskapsverdi, før justeringer).',
    ddNoModel: 'Denne avtalen kan ikke modelleres felt for felt: verdien er ikke oppgitt, eller pakken består hovedsakelig av selskaper, funn eller eiendeler utenfor Sodirs feltdata. Vurderingen under er kvalitativ.',
    ddNoHist: 'Historiske priser mangler – detaljanalysen er ikke tilgjengelig.',
    ddSwapGives: (p) => `${p} gir`, ddCash: 'Kontant mellomlegg', ddNet: (p) => `Netto for ${p}`,
    ddSwapKpiSub: 'mottatt − gitt, inkl. kontanter', ddSwapText: (a, net, winner) => `Med dine forutsetninger får ${a} ${net} mer i verdi enn selskapet gir fra seg. ${winner} kommer best ut av byttet.`,
    ddSwapEven: 'Byttet er tilnærmet verdinøytralt med dine forutsetninger.', ddSwapDcf: 'Kontantstrøm for hver side av byttet', ddSwapDcfSub: (y, r) => `etter skatt, faste priser · akkumulert nåverdi diskontert til ${y} med ${r}`,
    ddSwapLegCum: (p) => `Akk. nåverdi, ${p} gir`, ddSwapTax: 'Bytter av andeler er også skattenøytrale (§ 10): hver part overtar den andres skatteverdier for andelene den får. Et kontant mellomlegg betales etter skatt.',
    dealsNote: (u) => `Kuratert oversikt over annonserte avtaler, sist oppdatert ${u}. Verdier er nominelle dollar ved kunngjøring som oppgitt av partene eller i pressen – se merknaden ved hver avtale. Globale transaksjoner er tatt med når de omfatter vesentlige eiendeler på norsk sokkel.`,
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
    cumChart: 'Akkumulert produksjon – hele levetiden', cumChartSub: 'mill. fat o.e. (venstre) · tusen fat o.e./d (høyre)',
    cumHist: 'Akkumulert, historisk', cumFc: 'Akkumulert, prognose', cumRateHist: 'Produksjonsrate, historisk', cumRateFc: 'Produksjonsrate, prognose', cumSodir: 'Sodir: utvinnbart totalt',
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
    navHome: 'Overview', navValue: 'Value', navRank: 'Rankings', navMethod: 'Method', navHist: 'History', navWiki: 'Wiki', navDeals: 'Deals',
    tickerLabel: 'Latest deals', dealType_merger: 'Merger', dealType_corporate: 'Corporate acquisition', dealType_asset: 'Asset deal', dealType_swap: 'Swap',
    dealStatus_completed: 'Completed', dealStatus_pending: 'Pending approval',
    dealsEyebrow: 'Transactions on the Norwegian shelf', dealsIntro: (n, a, b) => `${n} mergers, acquisitions and asset swaps on the Norwegian Continental Shelf from ${a} to ${b} – with value, fields and source for every deal.`,
    dealsKpiCount: 'Deals', dealsKpiValue: 'Disclosed value', dealsKpiValueSub: (n) => `sum of ${n} deals with a disclosed value`, dealsKpiLargest: 'Largest deal',
    dealsKpiPending: 'Pending approval', dealsKpiPendingSub: 'announced, not completed', dealsChart: 'Deals per year', dealsChartSub: 'disclosed value (USD) and count',
    dealsChartValue: 'Disclosed value', dealsChartCount: 'Number of deals', dealsSearch: 'Search companies, fields …', dealsTypeLabel: 'Deal type', dealsAllStatus: 'All statuses',
    dealsParties: 'Parties', dealsFields: 'Fields',
    verdict_cheap: 'Low price', verdict_fair: 'Market-level', verdict_full: 'Fully priced', verdict_expensive: 'High price', verdict_early: 'Too early to say', verdict_na: 'Cannot be assessed',
    verdictRule_cheap: 'below 0.8× the median', verdictRule_fair: '0.8–1.1×', verdictRule_full: '1.1–1.4×', verdictRule_expensive: 'above 1.4×',
    conf_high: 'high', conf_medium: 'medium', conf_low: 'low', dealsConfidence: 'Confidence', dealsVerdictLabel: 'Assessment', dealsAllVerdicts: 'All assessments',
    dmProd: 'Production the year before', dmRem: 'Reserves (Sodir)', dmFlowing: 'Per flowing barrel', dmPerBoe: 'Per barrel of reserves', dmOfBrent: 'of Brent',
    dmHindsight: (y) => `Value in hindsight (${y} USD)`, dmRatio: 'Price / value', dmMedian: 'the median', dmGrowth: 'Reserve growth since', dmStakes: 'Stakes that changed hands (Sodir)',
    dealsMethodTitle: 'How deals are assessed',
    dealsMethod: (b, n, r) => `<p>For each deal we find which field stakes changed hands (Sodir licence history) and calculate the <strong>value in hindsight</strong>: actual production and investments after the deal at historical prices, plus Feltverdi's forecast for the rest – after 78 % tax, in real terms and discounted to the deal year at ${r} real.</p><p>The purchase price in real terms divided by this value gives <strong>price / value</strong>. A typical deal on the shelf (the median of ${n} deals) is at <strong>${b}×</strong>, because the model does not capture tax positions, upside and the buyers' own assumptions. Each deal is therefore judged against the median:</p>`, dealsNoValue: 'Value not disclosed', dealsSource: 'Source ↗', dealsNoHits: 'No deals match the filter.',
    ddBack: '← All deals', ddOpen: 'Full analysis →', ddLive: 'Calculated live from the assumptions at the top of the page.',
    ddKpiPaid: 'Price paid', ddKpiPaidSub: (n, y) => `${n} nominal (${y})`, ddKpiValue: 'Value of the stakes', ddKpiValueSub: (y, r) => `discounted to ${y} at ${r}`,
    ddKpiGain: 'Buyer NPV', ddKpiGainSub: (p) => `${p} of the price`, ddKpiRatio: 'Price / value', ddKpiRatioSub: (m, rel) => `median ${m}× → ${rel}× the median`,
    ddKpiIrr: 'Buyer real return', ddKpiIrrSub: 'after tax, on the price paid; below 0 % means the cash flow does not cover the price', ddKpiPayback: 'Payback (present value)', ddKpiPaybackSub: 'year cumulative PV passes the price', ddNotWithin: 'never',
    ddKpiModel: 'Model value', ddKpiTypical: 'Typical market value', ddKpiTypicalSub: (b) => `model value × ${b} (median price/value)`,
    ddKpiVsTyp: 'Price vs typical deal', ddKpiVsTypSub: (r, b) => `price/value ${r}× vs median ${b}×`, ddAbove: 'above', ddBelow: 'below',
    ddVsTypRow: 'Gain vs typical pricing', ddColRel: 'Vs median',
    ddSensT: 'Sensitivity: buyer gain vs typical pricing', ddSensSubT: (b) => `model value × ${b} − price · price deck × discount rate`,
    ddViews: 'Each side\'s own valuation', ddViewsSub: 'synergies and required returns – adjust them yourself',
    ddInBuyerRate: (n) => `${n}: required return (real)`, ddInSyn: (n) => `${n}: opex synergies (% of opex)`, ddInSellerRate: (n) => `${n}: required return (real)`,
    ddBuyerMax: (n) => `Highest price ${n} can justify`, ddSellerMin: (n) => `Lowest price ${n} should accept`,
    ddSurplusB: (n) => `Gain for ${n}`, ddSurplusS: (n) => `Gain for ${n}`, ddSurplusTot: 'Total value created (synergies + different required returns)',
    ddOutBoth: 'The price is inside the bargaining range: both sides gain from the deal.', ddOutSeller: 'The price is above what the buyer can justify on these assumptions – the seller takes all the gain.',
    ddOutBuyer: 'The price is below the seller\'s minimum on these assumptions – the buyer takes all the gain.', ddOutNone: 'No price gives both sides a gain: the buyer\'s highest price is below the seller\'s lowest.',
    ddViewsNote: 'Both values are scaled by the typical-deal factor (median price/value) so they can be compared with actual prices. Synergies are lower operating costs after 78 % tax. Tax capacity (a buyer with taxable income using deductions sooner) is not modelled.',
    ddViewsDefault: 'Feltverdi\'s assumption for this deal:', ddReset: 'Reset', ddRangePrice: 'Price', ddRangeBuyer: 'Buyer max', ddRangeSeller: 'Seller min',
    ddLater: 'later field', ddLaterTip: 'A discovery in the seller\'s licences at the deal date that later became a field. The share is the buyer\'s share when the field was formed, scaled by how much of the buyer\'s licence share came from the seller (Sodir).', ddLegNote: 'Note', ddSensSwap: 'Sensitivity: net value of the swap', ddIrrNone: 'below 0 %',
    ddBuyer: (n) => `Buyer's side · ${n}`, ddSeller: (n) => `Seller's side · ${n}`,
    ddPaid: 'Paid (real terms)', ddGot: 'Value received (hindsight + forecast)', ddRealised: (a, b) => `… of which already realised ${a}–${b}`, ddGain: 'Net present value', ddIrr: 'Real return after tax', ddPayback: 'Present-value payback',
    ddUpsideRow: 'With upside', ddReceived: 'Received', ddGaveUp: 'Value given up', ddSellerGain: 'Seller gain', ddThenValue: (b) => `Value at the prices then (Brent ${b} USD, flat)`,
    ddThenGain: 'Seller gain at the prices then', ddPriceLuck: 'Price effect after the deal', ddForgone: (a, b) => `Cash flow the seller gave up ${a}–${b}`,
    ddBuyerText: (paid, val, gain, pctv, irr, r) => `The buyer pays ${paid} for stakes Feltverdi values at ${val}. That is a net present value of ${gain} (${pctv} of the price) and a real after-tax return of ${irr}, against a required return of ${r}.`,
    ddSellerTextUp: (rec, val, then, g) => `The seller receives ${rec} for stakes worth ${val} at today's assumptions. At the prices that applied when the deal was struck, they were worth ${then} – so the seller got ${g} more than their value as it looked then.`,
    ddSellerTextDown: (rec, val, then, g) => `The seller receives ${rec} for stakes worth ${val} at today's assumptions. At the prices that applied when the deal was struck, they were worth ${then} – so the seller got ${g} less than their value as it looked then.`,
    ddTaxNote: 'Tax on sales: on the Norwegian shelf, sales of stakes are tax-neutral (Petroleum Tax Act section 10). The buyer pays an after-tax price, takes over the seller\'s tax depreciation balances and losses, and the seller pays no tax on the gain. The value of inherited tax positions is not in the model, so the buyer\'s value is understated here – one reason typical deals sit above 1× price/value.',
    ddPaidShares: 'Paid in shares: the seller keeps exposure to the stakes through ownership of the combined company, and shares in the synergies.',
    ddPartial: 'Partial assessment: the price covers more than the stakes Feltverdi can value (other countries, an exploration portfolio, or fields not in Sodir data). Price/value is therefore not comparable.',
    ddDcf: 'After-tax cash flow and cumulative present value', ddDcfSub: (y, r) => `stakes that changed hands · real terms · discounted to ${y} at ${r}`,
    ddHist: 'Actual', ddFc: 'Forecast', ddCumPv: 'Cumulative present value', ddPriceLine: 'Price paid (real terms)', ddCumPvUp: 'Cumulative PV with upside',
    ddBrent: 'Value against oil price', ddBrentSub: 'gas price moves in proportion to Brent; actual years unchanged', ddBreakeven: (b) => `The buyer breaks even at Brent ≈ ${b} USD (real terms).`, ddBreakevenNone: (lo, hi) => `No break-even between ${lo} and ${hi} USD.`,
    ddScen: 'Scenarios', ddScenSub: 'discount rate from the assumptions', ddDeck: 'Price deck', ddColValue: 'Value', ddColBuyer: 'Buyer', ddColSeller: 'Seller', ddColRatio: 'Price / value',
    ddDeckLow: 'Low', ddDeckBase: 'Base (your assumptions)', ddDeckHigh: 'High', ddDeckThen: (y) => `Prices in ${y}`, ddDeckUp: 'Base with upside',
    ddSens: 'Sensitivity: buyer NPV', ddSensSub: 'price deck × discount rate (real)', ddSensSubSwap: (p) => `net for ${p} · price deck × discount rate`,
    ddStakes: 'Stakes that changed hands', ddStakesSub: (y) => `Sodir licence history; production ${y - 1}, reserves at the start of ${y}`,
    ddColField: 'Field', ddColShare: 'Share', ddColProd: 'Prod. year before', ddColRes: 'Reserves then', ddColPct: 'Share of value', ddTotal: 'Total',
    ddConclusion: 'Conclusion', ddMultiples: 'Multiples', ddPerFlowing: 'per flowing boe/d', ddPerBoe: 'per boe of reserves',
    ddCaveats: 'Caveats: the model values only producing and approved fields in Sodir data, with Feltverdi\'s standard costs. Exploration acreage, discoveries, infrastructure, tax positions, debt and the company organisation are not included. The price is the value stated at announcement (often enterprise value, before adjustments).',
    ddNoModel: 'This deal cannot be modelled field by field: the value is not disclosed, or the package consists mainly of companies, discoveries or assets outside Sodir field data. The assessment below is qualitative.',
    ddNoHist: 'Historical prices are missing – the detailed analysis is not available.',
    ddSwapGives: (p) => `${p} gives`, ddCash: 'Cash balancing payment', ddNet: (p) => `Net for ${p}`,
    ddSwapKpiSub: 'received − given, incl. cash', ddSwapText: (a, net, winner) => `At your assumptions ${a} receives ${net} more in value than it gives up. ${winner} comes out ahead in the swap.`,
    ddSwapEven: 'The swap is close to value-neutral at your assumptions.', ddSwapDcf: 'Cash flow for each side of the swap', ddSwapDcfSub: (y, r) => `after tax, real terms · cumulative PV discounted to ${y} at ${r}`,
    ddSwapLegCum: (p) => `Cum. PV, ${p} gives`, ddSwapTax: 'Swaps of stakes are also tax-neutral (section 10): each party takes over the other\'s tax values for the stakes it receives. A cash balancing payment is paid after tax.',
    dealsNote: (u) => `Curated overview of announced deals, last updated ${u}. Values are nominal dollars at announcement as stated by the parties or the press – see the note for each deal. Global transactions are included when they cover significant assets on the Norwegian shelf.`,
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
    cumChart: 'Cumulative production – whole field life', cumChartSub: 'MMboe (left) · kboe/d (right)',
    cumHist: 'Cumulative, historical', cumFc: 'Cumulative, forecast', cumRateHist: 'Production rate, historical', cumRateFc: 'Production rate, forecast', cumSodir: 'Sodir: total recoverable',
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
