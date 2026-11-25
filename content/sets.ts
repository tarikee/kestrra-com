/**
 * The sets — the unit the whole site is organised around (DESIGN.md §8).
 *
 * Everything here is authored: titles, order, alt text, beats, credits.
 * Technical data (dims, thumbhash, EXIF, palettes) comes from
 * data/generated/*.json and is merged at render time in lib/work.ts.
 *
 * Titles named by Tarik 2026-08-11: Engagement, Cocktail Night, Graduation,
 * Portraits (matura-terrace + doa merged — same subject, same evening),
 * Night Protests. Still provisional: Riviera, Zagreb, Winter Case Tournament.
 */

export type SetMode = "grid" | "sequence";
export type SetKind = "commissioned" | "personal";

export interface FrameDef {
  id: string;
  alt: string;
  /** manifest pool override — defaults to the set's pool */
  pool?: string;
  /** narrative beat, sequence mode only */
  beat?: string;
  /** Serbian (Latin) alt text and beat for /sr pages; English is used when missing */
  altSr?: string;
  beatSr?: string;
  /** low-key breathing point (sequence pacing) */
  breathing?: boolean;
}

export interface ClientCredit {
  name: string;
  url?: string;
  /** luminance-only SVG in public/, §8b */
  mark?: string;
  markMinWidth?: number;
}

export interface SetDef {
  slug: string;
  /** manifest key — public/img/<pool>/ */
  pool: string;
  title: string;
  provisional?: boolean;
  kind: SetKind;
  discipline: string;
  /** display date, mono meta line */
  when: string;
  /** where the work was made — currently only the sequence threshold shows it,
      where the place is half the weight of the set */
  place?: string;
  mode: SetMode;
  /** one quiet line under the set header */
  blurb: string;
  client?: ClientCredit;
  /** focal frame for the index (windhover: this one holds still) */
  cover: string;
  /** the still landscape at the centre of its /sets row, when not the first one */
  lead?: string;
  /** frames that drift around the focal in the index */
  satellites: string[];
  frames: FrameDef[];
  /** Serbian (Latin) text for /sr pages; any field left out falls back to English */
  sr?: { title?: string; discipline?: string; when?: string; place?: string; blurb?: string };
  /** the 2Hot4Stage stop-motion loop, inline among the satellites */
  feature?: "orbit";
  /** override computed spill (Gora's fog teal is given in the analysis) */
  spillOverride?: string;
}

// ─────────────────────────────────────────────────────── commissioned

const engagement: SetDef = {
  slug: "engagement",
  pool: "laura",
  title: "Engagement",
  kind: "commissioned",
  discipline: "engagement",
  when: "Aug 2025",
  mode: "grid",
  blurb: "A village engagement, start to finish. The drums arrive first.",
  cover: "0027",
  satellites: ["0322", "0021", "0474", "0798", "0145"],
  frames: [
    { id: "0021", alt: "Procession musicians on the village road: two drummers with slung tapan drums and a zurna player leading the guests downhill", altSr: "Svirači u povorci na seoskom putu: dva dobošara sa tapanima o ramenu i zurlaš vode goste nizbrdo" },
    { id: "0107", alt: "Guests crowd the groom-to-be as a zurna is played straight at him, the green fringed shawl over his shoulders", altSr: "Gosti se guraju oko budućeg mladoženje dok mu zurlaš svira pravo u lice, zeleni šal sa resama preko ramena" },
    { id: "0027", alt: "The bride-to-be in white beaded traditional dress and gold coins beside her fiancé, guests gathered under the trees", altSr: "Buduća mlada u beloj tradicionalnoj nošnji sa perlama i zlatnim novčićima pored verenika, gosti okupljeni ispod drveća" },
    { id: "0048", alt: "The couple glimpsed between guests' shoulders, a patterned scarf crossing the foreground", altSr: "Par se nazire između ramena gostiju, šarena marama preko prvog plana" },
    { id: "0798", alt: "The groom-to-be in a pale suit with the green fringed ceremonial shawl, in the dressing room between hanging garments", altSr: "Budući mladoženja u svetlom odelu sa zelenim svečanim šalom sa resama, u garderobi među okačenom odećom" },
    { id: "0869", alt: "The green fringed shawl with its white beaded medallion hung beside dresses, an embroidered portrait of the couple below", altSr: "Zeleni šal sa resama i belim medaljonom od perli okačen pored haljina, ispod njega izvezeni portret para" },
    { id: "0322", alt: "Close view of her eye beneath the beaded bonnet, a red flower fixed at its edge", altSr: "Izbliza njeno oko ispod kape od perli, crveni cvet zakačen na ivici" },
    { id: "0244", alt: "The bride-to-be laughing in profile in a white room, beaded veil and layered coin necklaces", altSr: "Buduća mlada se smeje u profilu u beloj sobi, veo od perli i slojevi đerdana od novčića" },
    { id: "0474", alt: "The brooch bouquet of red and gold flowers resting against the beaded sleeve", altSr: "Buket od broševa, crvenog i zlatnog cveća, oslonjen na rukav od perli" },
    { id: "0628", alt: "The bride-to-be and her maid of honour before a backdrop of hearts, the bouquet held between them", altSr: "Buduća mlada i kuma ispred pozadine od srca, buket između njih" },
    { id: "0823", alt: "The couple side by side indoors, beaded whites against the gray suit and green shawl", altSr: "Par jedno pored drugog u zatvorenom, belina perli naspram sivog odela i zelenog šala" },
    { id: "0351", alt: "Woman in a gold coin headdress and green scarf beside a man in a blue suit, posed beneath the window", altSr: "Žena u zlatnoj kapi od novčića i zelenoj marami pored muškarca u plavom odelu, poziraju ispod prozora" },
    { id: "0172", alt: "Guests at the garden table, one standing mid-toast in a bright blue suit", altSr: "Gosti za baštenskim stolom, jedan stoji usred zdravice u jarkoplavom odelu" },
    { id: "0145", alt: "Gifts wrapped in tulle and cellophane crowding a low-lit table", altSr: "Pokloni upakovani u til i celofan natrpani na slabo osvetljenom stolu" },
    { id: "0155", alt: "Gift bags and wrapped hampers stacked in the half-dark of the gift room", altSr: "Kese sa poklonima i upakovane korpe složene u polumraku sobe za poklone" },
    { id: "1022", alt: "The brooch bouquet carried down the lane after the ceremony, the bride-to-be following in her beaded whites", altSr: "Buket od broševa nošen niz sokak posle ceremonije, buduća mlada ide za njim u belini sa perlama" },
  ],
  sr: { title: "Venčanje", discipline: "venčanje", when: "avgust 2025", blurb: "Seosko venčanje, od početka do kraja. Prvi stižu doboši." },
};

const hot4stage: SetDef = {
  slug: "dragons-mark",
  pool: "2hot4stage",
  title: "Dragon's Mark",
  kind: "commissioned",
  discipline: "clothing",
  when: "Mar 2026",
  mode: "grid",
  blurb: "Campaign frames for Dragon's Mark, the crew's clothing collection. Studio, showroom, light.",
  client: {
    name: "2Hot4Stage",
    url: "https://2hot4stage.com",
    mark: "/brand/2h4s-logo.svg",
    markMinWidth: 140,
  },
  cover: "04530-edit",
  lead: "04372",
  satellites: ["04421", "04525", "04332", "04319"],
  feature: "orbit",
  frames: [
    { id: "04525", alt: "Model centered in a ring of spun light, the 2H4S neon burning behind her", altSr: "Manekenka u središtu kruga od zavrtenog svetla, neon 2H4S gori iza nje" },
    { id: "04314", alt: "Studio pair: her direct gaze over the dragon-print tee on his back, warm key light", altSr: "Studio, par: njen direktan pogled preko majice sa zmajem na njegovim leđima, topla glavna svetlost" },
    { id: "04348", alt: "Back to back in the two dragon prints, white and red, on gray", altSr: "Leđa uz leđa u dva zmaj printa, belom i crvenom, na sivoj pozadini" },
    { id: "04372", alt: "Sleeve dragon and red kanji, her hand at the necklace", altSr: "Zmaj na rukavu i crveni kanji, njena ruka na ogrlici" },
    { id: "04319", alt: "Full lengths: cropped tee and chained jeans beside ochre carpenter pants", altSr: "Celi kadrovi: kratka majica i farmerke sa lancima pored oker radničkih pantalona" },
    { id: "04385", alt: "A hand with silver rings resting over the dark dragon back print", altSr: "Ruka sa srebrnim prstenjem počiva preko tamnog zmaj printa na leđima" },
    { id: "04421", alt: "White-set frame: off-shoulder tee with the red 24 embroidery, stacked silver bracelets", altSr: "Kadar na beloj podlozi: majica sa otkrivenim ramenima i crvenim vezom 24, nanizane srebrne narukvice" },
    { id: "04326", alt: "She looks at him instead of the lens. Same frame, different weather", altSr: "Ona gleda u njega, a ne u objektiv. Isti kadar, drugo vreme" },
    { id: "04472", alt: "Pink-lit room scene: seated at the bed's edge, the dragon back print turned away at right", altSr: "Scena u sobi sa ružičastim svetlom: sedi na ivici kreveta, zmaj print na leđima okrenut udesno" },
    { id: "04334", alt: "Head on his shoulder: the frayed-denim pair, the quiet pose of the shoot", altSr: "Glava na njegovom ramenu: par u iscepanom džinsu, najtiša poza sa snimanja" },
    { id: "04480", alt: "The back print burning red under red light, cigarette smoke at the window", altSr: "Print na leđima gori crveno pod crvenim svetlom, dim cigarete na prozoru" },
    { id: "04332", alt: "Detail: the dragon and kanji filling the frame", altSr: "Detalj: zmaj i kanji ispunjavaju kadar" },
    { id: "04498", alt: "Red-lit profile beside the white 2H4S neon", altSr: "Profil u crvenom svetlu pored belog neona 2H4S" },
    { id: "04530-edit", alt: "Long-exposure ribbons of light wrapping her as she lifts the tee", altSr: "Trake svetla u dugoj ekspoziciji obavijaju je dok podiže majicu" },
  ],
  sr: { discipline: "odeća", when: "mart 2026", blurb: "Kadrovi kampanje za Dragon's Mark, kolekciju odeće ekipe. Studio, šovrum, svetlo." },
};

const cyphercat: SetDef = {
  slug: "cyphercat",
  pool: "cyphercat",
  title: "Cyphercat",
  kind: "commissioned",
  discipline: "clothing",
  when: "Dec 2024",
  mode: "grid",
  blurb: "Campaign frames for Cyphercat, the crew's clothing collection. A graffiti alley, a freeze, the label up close.",
  client: {
    name: "2Hot4Stage",
    url: "https://2hot4stage.com",
    mark: "/brand/2h4s-logo.svg",
    markMinWidth: 140,
  },
  cover: "0627",
  lead: "0611",
  satellites: ["0442", "0627"],
  frames: [
    { id: "0611", alt: "Two people sitting on the ground in green sweatshirts, the cartoon cat print across one back, a sneaker in front", altSr: "Dvoje sede na tlu u zelenim duksevima, na jednim leđima print crtanog mačka, ispred njih patika" },
    { id: "0627", alt: "Two people in green sweatshirts in a dark alley, the cat print across one back, a sneaker sole close to the lens", altSr: "Dvoje u zelenim duksevima u mračnoj uličici, print mačka na jednim leđima, đon patike blizu objektiva" },
    { id: "0442", alt: "A breaker holding a one-hand freeze in a graffiti alley, legs straight up", altSr: "Breaker drži freeze na jednoj ruci u uličici punoj grafita, noge ravno uvis" },
    { id: "03535-2", alt: "A woman in a green sweatshirt standing in a graffiti-covered alley, looking to the side", altSr: "Žena u zelenom duksu stoji u uličici prekrivenoj grafitima i gleda u stranu" },
    { id: "0782", alt: "The sweatshirt's silver logo patch on green cotton, the cat print behind it", altSr: "Srebrna zakrpa sa logoom na zelenom pamuku duksa, iza nje print mačka" },
    { id: "0821", alt: "The black neck label inside the green sweatshirt", altSr: "Crna etiketa na vratu unutar zelenog duksa" },
    { id: "0832", alt: "The logo patch and the purple cat print on the green sweatshirt", altSr: "Zakrpa sa logoom i ljubičasti print mačka na zelenom duksu" },
  ],
  sr: { discipline: "odeća", when: "decembar 2024", blurb: "Kadrovi kampanje za Cyphercat, kolekciju odeće ekipe. Grafitima išarana uličica, freeze, etiketa izbliza." },
};

const cocktailNight: SetDef = {
  slug: "cocktail-night",
  pool: "karamba",
  title: "Cocktail Night",
  kind: "commissioned",
  discipline: "nightlife",
  when: "Jul 2026",
  mode: "grid",
  blurb: "A summer night at the bar. Since 1999.",
  client: { name: "Karamba" },
  cover: "00574",
  satellites: ["00733", "00509", "00670", "00517"],
  frames: [
    { id: "00509", alt: "The Karamba sign (gold on black, since 1999) on the stone wall", altSr: "Natpis Karamba (zlatno na crnom, od 1999) na kamenom zidu" },
    { id: "00733", alt: "Blue and red cocktails on crushed ice as a bottle pours at the bar", altSr: "Plavi i crveni kokteli na drobljenom ledu dok se sipa iz flaše za šankom" },
    { id: "00599", alt: "Bartender at work under the vine canopy, the terrace carrying on behind", altSr: "Barmen na poslu ispod loze, terasa nastavlja iza njega" },
    { id: "00574", alt: "Guests in silhouette against the amber lamplight of the corridor", altSr: "Gosti u silueti naspram ćilibarske svetlosti lampi u hodniku" },
    { id: "00670", alt: "Hands on the decks, a lit pint balanced above the mixer", altSr: "Ruke na mikseru, osvetljena krigla uravnotežena iznad miksera" },
    { id: "00472", alt: "Three friends posing on the terrace, club light grazing past", altSr: "Troje prijatelja pozira na terasi, svetlo kluba prelazi preko njih" },
    { id: "00503", alt: "A table of six against the brick wall, drinks in", altSr: "Sto za šestoro uz zid od cigle, pića su stigla" },
    { id: "00723", alt: "Two guests throwing peace signs across the terrace tables", altSr: "Dvoje gostiju pravi znak mira preko stolova na terasi" },
    { id: "00517", alt: "A kiss at the bar, cocktails untouched", altSr: "Poljubac za šankom, kokteli netaknuti" },
  ],
  sr: { title: "Koktel veče", discipline: "noćni život", when: "jul 2026", blurb: "Letnja noć za šankom. Od 1999." },
};

const graduation: SetDef = {
  slug: "graduation",
  pool: "matura",
  title: "Graduation",
  kind: "commissioned",
  discipline: "graduation",
  when: "Jun 2026",
  mode: "grid",
  blurb: "Graduation portraits in the family garden.",
  cover: "09172",
  lead: "09619",
  satellites: ["09428", "09284", "09619", "09358", "09165"],
  frames: [
    { id: "09172", alt: "Graduate in a brown satin off-shoulder dress looking down at her bouquet under the pergola", altSr: "Maturantkinja u braon satenskoj haljini otvorenih ramena gleda u buket ispod pergole" },
    { id: "09176", alt: "Leaning back toward family in the garden greenery, bouquet in her arms", altSr: "Nagnuta unazad ka porodici u zelenilu bašte, buket u naručju" },
    { id: "09224", alt: "Four women posed together with the bouquet between them", altSr: "Četiri žene poziraju zajedno, buket među njima" },
    { id: "09284", alt: "Two friends face to face in the garden doorway, laughing", altSr: "Dve drugarice licem u lice na vratima bašte, smeju se" },
    { id: "09358", alt: "Walking the garden path away from camera, looking back over her shoulder", altSr: "Ide stazom kroz baštu od kamere, osvrće se preko ramena" },
    { id: "09635", alt: "Full-length profile on the path between planted beds, wooden cabins behind", altSr: "Cela figura u profilu na stazi između gredica, iza nje drvene kolibe" },
    { id: "09619", alt: "Looking up from under the tree, one hand raised to the branch", altSr: "Gleda uvis ispod drveta, jedna ruka podignuta ka grani" },
    { id: "09428", alt: "The bouquet held close in its paper wrap, red against cream", altSr: "Buket čvrsto stisnut u papirnom omotu, crveno na krem boji" },
    { id: "09725", alt: "A selfie taken together beneath the climbing roses", altSr: "Zajednički selfi ispod puzavih ruža" },
    { id: "09165", alt: "Portrait in low light, the bouquet at her shoulder", altSr: "Portret pri slabom svetlu, buket uz rame" },
    { id: "09794", alt: "Night frame washed in red light, the white bouquet in her arms", altSr: "Noćni kadar zaliven crvenim svetlom, beli buket u naručju" },
  ],
  sr: { title: "Diplomiranje", discipline: "diplomiranje", when: "jun 2026", blurb: "Portreti sa mature u porodičnoj bašti." },
};

const fon: SetDef = {
  slug: "winter-case",
  pool: "fon",
  title: "Winter Case Tournament",
  provisional: true,
  kind: "commissioned",
  discipline: "corporate",
  when: "Jan 2026",
  mode: "grid",
  blurb: "Case tournament coverage: hall, screens, handshakes.",
  client: { name: "Studentska asocijacija FON-a" },
  cover: "2585",
  satellites: ["0627", "2571", "0591", "2669"],
  frames: [
    { id: "0502", alt: "Speaker addressing the full lecture hall, the tournament screen lit behind", altSr: "Govornik se obraća punoj sali, iza njega osvetljen ekran turnira" },
    { id: "0627", alt: "The three case tasks up on screen between two presenters", altSr: "Tri kejs zadatka na ekranu između dvoje izlagača" },
    { id: "0591", alt: "A handshake in front of the tournament screen", altSr: "Rukovanje ispred ekrana turnira" },
    { id: "2571", alt: "A presenter smiling at the lectern in a navy blazer", altSr: "Izlagač se smeši za govornicom u teget sakou" },
    { id: "2669", alt: "The Chaintrier Family Office crest on the hall screen as a presenter crosses the stage", altSr: "Grb Chaintrier Family Office na ekranu u sali dok izlagač prelazi preko scene" },
    { id: "2585", alt: "Rows of students following the presentation", altSr: "Redovi studenata prate prezentaciju" },
    { id: "0532", alt: "Applause moving across the middle rows", altSr: "Aplauz se prenosi kroz srednje redove" },
    { id: "0558", alt: "The hall from the side, every seat taken", altSr: "Sala sa strane, svako sedište zauzeto" },
    { id: "2636", alt: "Front rows listening, a videographer working the aisle", altSr: "Prednji redovi slušaju, snimatelj radi duž prolaza" },
    { id: "3011", alt: "Guests seated along the panel table", altSr: "Gosti za stolom žirija" },
  ],
  sr: { title: "Zimski kejs turnir", discipline: "korporativno", when: "jan 2026", blurb: "Sa kejs turnira: sala, ekrani, rukovanja." },
};

/**
 * One subject, one evening, two wardrobes — the terrace frames (matura pool,
 * DSC01xxx) and the plaza frames (doa pool) are the same person on the same
 * day, so they read as a single portrait session.
 */
const portraits: SetDef = {
  slug: "portraits",
  pool: "matura",
  title: "Portraits",
  kind: "commissioned",
  discipline: "portrait",
  when: "May 2026",
  mode: "grid",
  blurb: "One subject, one evening, from terrace dusk into blue hour on the plaza.",
  cover: "01218",
  lead: "00858",
  satellites: ["00805", "01246", "00919", "01134", "00930"],
  frames: [
    { id: "01134", alt: "Seated in a cream blazer with a glass, the hedge wall behind", altSr: "Sedi u krem sakou sa čašom, iza njega živa ograda" },
    { id: "01148", alt: "Leaning back on the terrace sofa, drink in hand", altSr: "Zavaljen na sofi na terasi, piće u ruci" },
    { id: "01119", alt: "The terrace at dusk, seated at the far end, city rising behind", altSr: "Terasa u sumrak, sedi na drugom kraju, grad se uzdiže iza" },
    { id: "01192", alt: "Checking his phone in the dark of the terrace, restaurant lights behind", altSr: "Proverava telefon u mraku terase, iza njega svetla restorana" },
    { id: "01218", alt: "Dusk portrait lowering his sunglasses, glass towers blurred behind", altSr: "Portret u sumrak, spušta naočare za sunce, staklene kule zamagljene iza" },
    { id: "01246", alt: "The table at dusk: iced drinks, an ashtray, a lit phone", altSr: "Sto u sumrak: ledena pića, pepeljara, upaljen telefon" },
    { id: "00805", pool: "doa", alt: "Full length in a beige puffer and cream joggers, adjusting sunglasses in the courtyard of the glass block", altSr: "Cela figura u bež perjanoj jakni i krem trenerci, namešta naočare za sunce u dvorištu staklenog bloka" },
    { id: "00781", pool: "doa", alt: "Seated on the granite planter edge, sunglasses in hand", altSr: "Sedi na ivici granitne žardinjere, naočare za sunce u ruci" },
    { id: "00821", pool: "doa", alt: "Mid-stride, looking back across the empty plaza", altSr: "U koraku, osvrće se preko praznog platoa" },
    { id: "00897", pool: "doa", alt: "Seated on a steel bench, low sun raking the facade", altSr: "Sedi na čeličnoj klupi, nisko sunce klizi po fasadi" },
    { id: "00858", pool: "doa", alt: "The plaza at dusk, reclined on the bench, small against the buildings", altSr: "Plato u sumrak, zavaljen na klupi, mali naspram zgrada" },
    { id: "00951", pool: "doa", alt: "Opening the jacket mid-walk, white tee underneath, last light", altSr: "Otvara jaknu u hodu, ispod bela majica, poslednja svetlost" },
    { id: "00930", pool: "doa", alt: "Detail: phone and a green leather wallet in hand, quilted sleeve behind", altSr: "Detalj: telefon i zeleni kožni novčanik u ruci, iza njih prošiveni rukav" },
    { id: "00919", pool: "doa", alt: "Night portrait zipping the collar, street light catching the quilting", altSr: "Noćni portret, zatvara kragnu, ulična svetiljka hvata prošivku" },
  ],
  sr: { title: "Portreti", discipline: "portret", when: "maj 2026", blurb: "Jedna osoba, jedno veče, od sumraka na terasi do plavog sata na platou." },
};

// ────────────────────────────────────────────────────────── personal

const riviera: SetDef = {
  slug: "riviera",
  pool: "riviera",
  title: "Riviera",
  provisional: true,
  kind: "personal",
  discipline: "travel",
  when: "Jul 2025",
  mode: "grid",
  blurb: "One stretch of coast: harbor, cars, and under the water.",
  cover: "8331",
  satellites: ["9868", "9493-2", "0024", "9206", "9741"],
  frames: [
    { id: "9772-pano", alt: "Wide sweep of the marina fronting the hillside city, mist on the ridge", altSr: "Širok pogled na marinu ispred grada na brdu, magla na grebenu" },
    { id: "9771", alt: "White yachts stacked in the harbor below the packed hillside", altSr: "Bele jahte složene u luci ispod nakrcanog brda" },
    { id: "9868", alt: "Varnished wooden sailboat moored among the plastic hulls", altSr: "Lakirani drveni jedrenjak vezan među plastičnim trupovima" },
    { id: "9794", alt: "The marina framed both sides by dark branches, cloud on the peak", altSr: "Marina uokvirena tamnim granama sa obe strane, oblak na vrhu" },
    { id: "0024", alt: "Black 911 cabriolet in the casino plaza, pedestrians under the marquee", altSr: "Crni 911 kabriolet na trgu ispred kazina, prolaznici ispod nadstrešnice" },
    { id: "9214", alt: "Dark red coupé nosed against a stone archway, hazy skyline behind", altSr: "Tamnocrveni kupe prislonjen uz kameni luk, magličasta silueta grada iza" },
    { id: "9217", alt: "Top-down on the red fender and round headlight beside a striped bollard", altSr: "Odozgo crveni blatobran i okrugli far pored prugastog stubića" },
    { id: "9206", alt: "Teal roadster, number 38, panned past the sunlit cliff", altSr: "Tirkizni roadster, broj 38, snimljen u prevlačenju pored sunčane litice" },
    { id: "9416", alt: "Yellow SUV between a curved glass tower and old stone, backlit by flare", altSr: "Žuti SUV između zakrivljene staklene kule i starog kamena, osvetljen odostrag, bljesak u kadru" },
    { id: "9741", alt: "Wood-paneled ballroom: chandeliers, tapestry, red chairs on sunlit parquet", altSr: "Balska sala obložena drvetom: lusteri, tapiserija, crvene stolice na osunčanom parketu" },
    { id: "9455", alt: "Stone path curving through dense green toward two distant figures", altSr: "Kamena staza vijuga kroz gusto zelenilo ka dvema dalekim figurama" },
    { id: "9493-2", alt: "A school of silver fish streaming through the dark cavern toward the light shaft", altSr: "Jato srebrnih riba struji kroz tamnu pećinu ka snopu svetla" },
    { id: "9495-2", alt: "Yellow-striped fish crossing the grotto's lit opening", altSr: "Ribe sa žutim prugama prelaze osvetljeni otvor pećine" },
    { id: "9679", alt: "Spotted cowfish in profile against black water", altSr: "Pegava kofer-riba u profilu na crnoj vodi" },
    { id: "8343", alt: "Three scooters strung down the coastal road past blue shutters", altSr: "Tri skutera nanizana niz obalski put pored plavih kapaka" },
    { id: "8331", alt: "Birds spaced along a sagging wire against the pink-orange dusk", altSr: "Ptice raspoređene duž opuštene žice naspram ružičasto-narandžastog sumraka" },
    { id: "8390", alt: "Town lights coming on around the curved bay under storm cloud", altSr: "Svetla grada se pale oko zakrivljenog zaliva pod olujnim oblacima" },
    { id: "8540", alt: "Profile silhouette at dusk, sunglasses in hand, the lit town below", altSr: "Profil u silueti u sumrak, naočare za sunce u ruci, osvetljen grad ispod" },
  ],
  sr: { discipline: "putovanja", when: "jul 2025", blurb: "Jedan deo obale: luka, automobili i ono ispod vode." },
};

const nightProtests: SetDef = {
  slug: "night-protests",
  pool: "night-assembly",
  title: "Night Protests",
  kind: "personal",
  discipline: "documentary",
  when: "Winter 2024–25",
  mode: "grid",
  blurb: "A winter night of protest: fog, floodlight, flare smoke.",
  cover: "2186",
  satellites: ["2144", "2019", "2805", "2052"],
  frames: [
    { id: "2121", alt: "The crowd filling the street before the floodlit Ethnographic Museum, one beam cutting the fog", altSr: "Gomila puni ulicu ispred osvetljenog Etnografskog muzeja, jedan snop seče maglu" },
    { id: "2052", alt: "Signs and a flag above the packed street, soap bubbles drifting through the light", altSr: "Transparenti i zastava iznad pune ulice, mehurovi od sapunice lebde kroz svetlo" },
    { id: "2144", alt: "Phone flashlights held overhead; a woman in a Santa suit fronts the crowd with a sign", altSr: "Baterije telefona podignute iznad glava; žena u odelu Deda Mraza stoji ispred gomile sa transparentom" },
    { id: "2173", alt: "The crowd beneath a lit bicycle-crossing sign, amber windows burning through the fog", altSr: "Gomila ispod osvetljenog znaka za biciklistički prelaz, ćilibarski prozori sijaju kroz maglu" },
    { id: "2186", alt: "Red flare smoke washing over the protest beside the museum, black balloons above", altSr: "Crveni dim baklje preliva protest pored muzeja, crni baloni iznad" },
    { id: "2192", alt: "An elderly woman in a white coat raises her hand amid the banner line", altSr: "Starija žena u belom kaputu podiže ruku usred reda sa transparentom" },
    { id: "2019", alt: "A hand holds a phone up over the crowd, its screen lit against the orange glow", altSr: "Ruka drži telefon iznad gomile, ekran svetli naspram narandžastog sjaja" },
    { id: "2805", alt: "A face caught inside swirling long-exposure light trails", altSr: "Lice uhvaćeno u vrtlogu tragova svetla iz duge ekspozicije" },
  ],
  sr: { title: "Noćni protesti", discipline: "dokumentarno", when: "zima 2024–25", blurb: "Jedna zimska noć protesta: magla, reflektori, dim baklji." },
};

const zagreb: SetDef = {
  slug: "zagreb",
  pool: "zagreb",
  title: "Zagreb",
  provisional: true,
  kind: "personal",
  discipline: "street",
  when: "Nov 2025",
  mode: "grid",
  blurb: "Streets between trams: ochre, teal, dusk.",
  cover: "0122-3",
  satellites: ["0238", "0097", "0500", "0086"],
  frames: [
    { id: "0122-3", alt: "Blue tram descending the converging cobbled street under a web of wires", altSr: "Plavi tramvaj se spušta kaldrmisanom ulicom koja se sužava, pod mrežom žica" },
    { id: "0238", alt: "A flat row of shopfronts, teal shutters and hand-painted signage", altSr: "Ravan niz izloga, tirkizni kapci i ručno oslikani natpisi" },
    { id: "0097", alt: "A passer-by blurred across the mustard KRZNARIJA shopfront", altSr: "Prolaznik razmazan preko senf-žutog izloga KRZNARIJA" },
    { id: "0246", alt: "Delivery cyclist threading the alley toward the distant glass tower", altSr: "Dostavljač na biciklu probija se kroz uličicu ka dalekoj staklenoj kuli" },
    { id: "0086", alt: "Gray 911 and a cyclist with red panniers held at the crosswalk, autumn trees over pastel facades", altSr: "Sivi 911 i biciklista sa crvenim torbama čekaju na pešačkom, jesenje drveće iznad pastelnih fasada" },
    { id: "0311-2", alt: "An elderly man in a bucket hat walking his small dog past arched shop windows, cobbles wet", altSr: "Stariji čovek u šeširu vodi malog psa pored lučnih izloga, kaldrma mokra" },
    { id: "0101", alt: "Dim shop window: boots, folded shirts, rope and burlap under a single bulb", altSr: "Mutan izlog: čizme, savijene košulje, kanap i džak pod jednom sijalicom" },
    { id: "0576", alt: "Green scalloped domes and a white minaret behind the parking lot's bare tree", altSr: "Zelene kupole sa ljuskama i beli minaret iza golog drveta na parkingu" },
    { id: "0427", alt: "Curved modernist block and a passing tram silhouetted against the orange-to-navy sunset", altSr: "Zakrivljen modernistički blok i tramvaj u prolazu u silueti naspram zalaska od narandžaste do teget" },
    { id: "0500", alt: "A guitarist alone in the lit bus shelter beside the glowing ad panel", altSr: "Gitarista sam u osvetljenoj autobuskoj stanici pored užarenog reklamnog panela" },
  ],
  sr: { discipline: "ulica", when: "novembar 2025", blurb: "Ulice između tramvaja: oker, tirkiz, sumrak." },
};

const gora: SetDef = {
  slug: "gora-polaroids",
  pool: "gora-polaroids",
  title: "Gora Polaroids",
  kind: "personal",
  discipline: "documentary",
  when: "Winter 2025",
  place: "Gora, near Dragash",
  mode: "sequence",
  blurb: "The drive up, the village, the mountains. In order.",
  cover: "2542",
  satellites: [],
  spillOverride: "#4a5f58",
  frames: [
    { id: "2350", beat: "departure", breathing: true, alt: "The driver from behind, one hand on the wheel, snow country blurred through the fogged windshield", altSr: "Vozač otpozadi, jedna ruka na volanu, snežni predeo razmazan kroz oroseno vetrobransko staklo", beatSr: "polazak" },
    { id: "2359", beat: "the road", alt: "The two-lane road curving past utility poles into the misty treeline", altSr: "Put sa dve trake krivuda pored banderi ka maglovitoj liniji drveća", beatSr: "put" },
    { id: "2362", beat: "nobody there", alt: "An empty frost-dusted roadside shelter beside the road, pines dissolving in fog", altSr: "Prazno sklonište pored puta, posuto injem, borovi se rastvaraju u magli", beatSr: "nikoga nema" },
    { id: "2356", beat: "looking back", breathing: true, alt: "Through the rear window past a silhouetted headrest, the shelter receding", altSr: "Kroz zadnje staklo, pored siluete naslona za glavu, sklonište se udaljava", beatSr: "osvrtanje" },
    { id: "2342", beat: "the place is named", alt: "Blue street sign reading RR. / UL. RAVENI, snow-capped on its pole, the village behind fog", altSr: "Plava tabla sa natpisom RR. / UL. RAVENI, sneg na stubu, selo iza magle", beatSr: "mesto dobija ime" },
    { id: "2538", beat: "the car has stopped", alt: "A parked car beside the snow-topped block wall, chimney and forested slopes above", altSr: "Parkiran automobil pored zida od blokova sa snegom na vrhu, dimnjak i šumovite padine iznad", beatSr: "auto je stao" },
    { id: "2386", beat: "weight", alt: "A barn roof collapsing under snow on the hillside above the village", altSr: "Krov štale se urušava pod snegom na padini iznad sela", beatSr: "teret" },
    { id: "2423", beat: "downward, quiet", breathing: true, alt: "Snowdrifts crossed by animal tracks, framed in thin bare branches", altSr: "Nanosi snega izukrštani tragovima životinja, uokvireni tankim golim granama", beatSr: "nadole, tiho" },
    { id: "2479", beat: "widening", alt: "Snowed rooftops stepping down into the wide valley, a hazy mountain closing it", altSr: "Snegom pokriveni krovovi spuštaju se u široku dolinu, maglovita planina je zatvara", beatSr: "širenje" },
    { id: "2431", beat: "light breaking", alt: "The forest path descending toward distant rooftops, sun flaring through cloud", altSr: "Šumska staza spušta se ka dalekim krovovima, sunce bljesne kroz oblak", beatSr: "svetlo probija" },
    { id: "2473", beat: "sky, distance", alt: "The snow-capped ridge framed by a bare branch under a diffused sky", altSr: "Greben sa snežnom kapom uokviren golom granom pod razlivenim nebom", beatSr: "nebo, daljina" },
    { id: "2542", beat: "resolution", alt: "The minaret's spire glinting above snow-covered rooftops against streaked cloud", altSr: "Šiljak minareta se presijava iznad snegom pokrivenih krovova naspram razvučenih oblaka", beatSr: "razrešenje" },
  ],
  sr: { discipline: "dokumentarno", when: "zima 2025", place: "Gora, kod Dragaša", blurb: "Vožnja uzbrdo, selo, planine. Redom." },
};

const studentsWalk: SetDef = {
  slug: "students-walk",
  pool: "students-walk",
  title: "Students' Walk",
  kind: "personal",
  discipline: "documentary",
  when: "Oct 2026",
  mode: "grid",
  blurb: "Students walking to the big protest, and the welcome when they arrived.",
  cover: "00998",
  satellites: ["00430", "00750", "00688", "00545"],
  frames: [
    { id: "00420", alt: "A man with both hands raised in front of a large Serbian flag, marchers in yellow vests behind him", altSr: "Čovek sa obe podignute ruke ispred velike srpske zastave, iza njega marširaju ljudi u žutim prslucima" },
    { id: "00411", alt: "Smiling students walking toward the camera, one with a megaphone, others in hi-vis vests", altSr: "Studenti se osmehuju idući ka kameri, jedan sa megafonom, ostali u reflektujućim prslucima" },
    { id: "00533", alt: "A crowd walking down a road at night in red smoke, a lit billboard above", altSr: "Gomila hoda putem noću u crvenom dimu, iznad osvetljen bilbord" },
    { id: "00572", alt: "A rider in a hi-vis vest on a motorbike at night, marchers with flags in the street behind", altSr: "Vozač u reflektujućem prsluku na motoru noću, iza njega u ulici marširaju ljudi sa zastavama" },
    { id: "00670", alt: "A crowd with flags and a burning flare, seen from the front at night", altSr: "Gomila sa zastavama i upaljenom bakljom, snimljena spreda noću" },
    { id: "00421", alt: "A dense crowd at night under many flags, people in yellow and red vests in front", altSr: "Gusta gomila noću ispod mnogo zastava, ispred ljudi u žutim i crvenim prslucima" },
    { id: "00545", alt: "A motorbike with its headlight on and a rider behind the windscreen, marchers and a lit billboard behind", altSr: "Motor sa upaljenim farom i vozač iza vetrobrana, iza njih ljudi u maršu i osvetljen bilbord" },
    { id: "00430", alt: "A drummer in a fur hat and a yellow vest playing a snare drum, a banner behind him", altSr: "Dobošar u krznenoj kapi i žutom prsluku svira na doboš, iza njega transparent" },
    { id: "00476", alt: "Two people smiling in a red car, one showing three fingers", altSr: "Dvoje se osmehuje u crvenom automobilu, jedno pokazuje tri prsta" },
    { id: "00448", alt: "A man with a lanyard holding a flare in one raised hand, a crowd behind him", altSr: "Čovek sa trakom oko vrata drži baklju u jednoj podignutoj ruci, iza njega gomila" },
    { id: "00590", alt: "A smiling young man with a lanyard and badges holding a plush toy in one raised hand", altSr: "Nasmejan mladić sa trakom oko vrata i bedževima drži plišanu igračku u podignutoj ruci" },
    { id: "docek-01", alt: "Poster card with the text SRCEM BEZ STRAHA DOK NE SVANE ZORA IZ PEPELA I PRAHA over a lit building and a person with a flag", altSr: "Kartica-poster sa tekstom SRCEM BEZ STRAHA DOK NE SVANE ZORA IZ PEPELA I PRAHA preko osvetljene zgrade i osobe sa zastavom" },
    { id: "00998", alt: "A young man standing high above the street waving a Serbian flag, a lit building behind him at night", altSr: "Mladić stoji visoko iznad ulice i maše srpskom zastavom, iza njega noću osvetljena zgrada" },
    { id: "00870-2", alt: "A crowd with flags and a burning flare at night, mostly in silhouette", altSr: "Gomila sa zastavama i upaljenom bakljom noću, uglavnom u silueti" },
    { id: "00688", alt: "A person walking toward the camera down a street lit red, people lining both sides", altSr: "Osoba ide ka kameri niz ulicu osvetljenu crvenim, ljudi se nižu sa obe strane" },
    { id: "00679", alt: "A street lit by red smoke, people along the sides and a camera on a stand", altSr: "Ulica osvetljena crvenim dimom, ljudi sa strane i kamera na stativu" },
    { id: "00612", alt: "A crowd in pink flare smoke with hands raised and one flare burning above", altSr: "Gomila u ružičastom dimu baklji sa podignutim rukama, jedna baklja gori iznad" },
    { id: "00750", alt: "A smiling man with badges on his jacket raising an arm in pink flare smoke, people behind him", altSr: "Nasmejan čovek sa bedževima na jakni podiže ruku u ružičastom dimu baklji, iza njega ljudi" },
    { id: "00731", alt: "A man with a lanyard and people with cameras in a street lit by flares", altSr: "Čovek sa trakom oko vrata i ljudi sa kamerama u ulici osvetljenoj bakljama" },
    { id: "00752", alt: "People walking toward the camera in pink flare smoke, some waving flags and raising their hands", altSr: "Ljudi idu ka kameri u ružičastom dimu baklji, neki mašu zastavama i podižu ruke" },
    { id: "00947", alt: "A person in a beanie holding a cardboard sign with handwritten letters", altSr: "Osoba u kapi drži kartonski natpis sa ručno ispisanim slovima" },
    { id: "00879", alt: "Flags and pink flare smoke over a crowd in silhouette at night", altSr: "Zastave i ružičasti dim baklji iznad gomile u silueti noću" },
  ],
  sr: { title: "Studentski marš", discipline: "dokumentarno", when: "oktobar 2026", blurb: "Studenti na putu do velikog protesta i doček kad su stigli." },
};

const slavija: SetDef = {
  slug: "slavija",
  pool: "slavija",
  title: "Slavija",
  kind: "personal",
  discipline: "documentary",
  when: "Oct 2026",
  mode: "grid",
  blurb: "The student protest at Slavija.",
  cover: "01013",
  satellites: ["01260", "01229", "01186", "01053"],
  frames: [
    { id: "slavija-01", alt: "Poster card with the word STUDENTI over a photo of people holding red flares, a person in silhouette in front", altSr: "Kartica-poster sa rečju STUDENTI preko fotografije ljudi sa crvenim bakljama, ispred njih osoba u silueti" },
    { id: "00854", alt: "People holding red flares at night, a person in silhouette in front on a red-lit street", altSr: "Ljudi drže crvene baklje noću, ispred osoba u silueti na ulici obasjanoj crvenim" },
    { id: "01260", alt: "An aerial view of a crowd filling a long straight street at night, city lights to the horizon", altSr: "Pogled iz vazduha na gomilu koja puni dugu pravu ulicu noću, svetla grada do horizonta" },
    { id: "01276", alt: "An aerial view of a crowd filling a wide street at night, a lit building wall in the distance", altSr: "Pogled iz vazduha na gomilu koja puni široku ulicu noću, u daljini osvetljen zid zgrade" },
    { id: "01291", alt: "A young woman with glasses standing above a crowded square at night, a lit tower behind her", altSr: "Mlada žena sa naočarima stoji iznad pune raskrsnice noću, iza nje osvetljena kula" },
    { id: "01005", alt: "A crowd holding phone lights at night under flags, scaffolding at left and lit buildings behind", altSr: "Gomila drži svetla telefona noću ispod zastava, levo skele, iza osvetljene zgrade" },
    { id: "01013", alt: "A white flag with a red 3 and the words СТУДЕНТИ ПОБЕЂУЈУ over a crowd holding phone lights, a Serbian flag and flare smoke behind", altSr: "Bela zastava sa crvenom trojkom i rečima СТУДЕНТИ ПОБЕЂУЈУ iznad gomile sa svetlima telefona, iza srpska zastava i dim baklji" },
    { id: "01105", alt: "A marshal in a yellow REDAR vest seen from behind, holding up a phone over a crowd", altSr: "Redar u žutom prsluku sa natpisom REDAR, snimljen otpozadi, drži telefon iznad gomile" },
    { id: "01385", alt: "A woman smiling and raising one hand, holding a small book, a crowd behind her", altSr: "Žena se smeši i podiže jednu ruku, drži malu knjigu, iza nje gomila" },
    { id: "01382", alt: "A woman looking up and holding a small book above her head, a crowd behind her at night", altSr: "Žena gleda uvis i drži malu knjigu iznad glave, iza nje gomila noću" },
    { id: "01167", alt: "A crowd of people and photographers at night, a young woman in the middle smiling and raising two fingers", altSr: "Gomila ljudi i fotografa noću, mlada žena u sredini se smeši i podiže dva prsta" },
    { id: "01176", alt: "A person in a black PRESS jacket seen from behind, facing a crowd with flags under a street light", altSr: "Osoba u crnoj jakni sa natpisom PRESS, snimljena otpozadi, okrenuta ka gomili sa zastavama ispod ulične svetiljke" },
    { id: "01186", alt: "A smiling young woman with glasses in an orange vest and a lanyard, a crowd and a street behind her at night", altSr: "Nasmejana mlada žena sa naočarima u narandžastom prsluku i sa trakom oko vrata, iza nje gomila i ulica noću" },
    { id: "01213", alt: "An aerial view of a crowded square and the streets leading into it at night, a lit tower at the back", altSr: "Pogled iz vazduha na pun trg i ulice koje vode ka njemu noću, u pozadini osvetljena kula" },
    { id: "01229", alt: "A man seen from behind in front of a city skyline at night with a firework in the sky", altSr: "Čovek snimljen otpozadi ispred noćne siluete grada sa vatrometom na nebu" },
    { id: "01245", alt: "An aerial view of a dark crowd with flares burning in several places", altSr: "Pogled iz vazduha na tamnu gomilu sa bakljama koje gore na više mesta" },
    { id: "slavija-07", alt: "Designed collage of three small photos of crowds, phone lights and flares over a night skyline", altSr: "Dizajniran kolaž tri male fotografije gomile, svetala telefona i baklji preko noćne siluete grada" },
    { id: "01019", alt: "Flags over a crowd holding phone lights at night, buildings behind", altSr: "Zastave iznad gomile sa svetlima telefona noću, iza zgrade" },
    { id: "01029", alt: "A young man with a camera standing on a scaffold above a crowd holding phone lights", altSr: "Mladić sa kamerom stoji na skeli iznad gomile sa svetlima telefona" },
    { id: "01325", alt: "An aerial view of a crowded square with flares and smoke, a lit tower behind", altSr: "Pogled iz vazduha na pun trg sa bakljama i dimom, iza osvetljena kula" },
    { id: "01031", alt: "Flares and red smoke over a crowd at night, a dark standing figure in the middle", altSr: "Baklje i crveni dim iznad gomile noću, tamna figura stoji u sredini" },
    { id: "01053", alt: "A dark silhouette of a man and a cut-out figure in front of buildings, flags and flares at night", altSr: "Tamna silueta čoveka i isečena figura ispred zgrada, zastave i baklje noću" },
    { id: "01067", alt: "A silhouetted figure with a flag in front of a crowd, flares, smoke and lit buildings at night", altSr: "Silueta figure sa zastavom ispred gomile, baklje, dim i osvetljene zgrade noću" },
  ],
  sr: { title: "Skup Slavija", discipline: "dokumentarno", when: "oktobar 2026", blurb: "Studentski protest na Slaviji." },
};

const urbanSportFest: SetDef = {
  slug: "urban-sport-fest",
  pool: "urban-sport-fest",
  title: "Urban Sport Fest",
  kind: "commissioned",
  discipline: "event",
  when: "Sep 2026",
  mode: "grid",
  blurb: "A breaking battle on a checkered floor, the crowd pressed in close.",
  cover: "09365",
  satellites: ["09274", "08478", "09623", "09541"],
  frames: [
    { id: "07895", alt: "A graffiti piece in pink, green and blue on an easel in a dark courtyard, a writer standing beside it", altSr: "Grafit u ružičastoj, zelenoj i plavoj boji na štafelaju u mračnom dvorištu, pored njega stoji pisac grafita" },
    { id: "08419", alt: "A dancer in a black tee stepping across the floor, one arm pointing out, the crowd packed behind him", altSr: "Plesač u crnoj majici prelazi preko poda, jedna ruka pokazuje u stranu, iza njega zbijena publika" },
    { id: "08478", alt: "A breaker inverted in a one-handed freeze on the checkered floor, spotlight flaring above", altSr: "Breaker naglavačke u freeze-u na jednoj ruci na podu poput šahovske table, reflektor bljesne iznad" },
    { id: "09274", alt: "A dancer in white trousers sweeping low across the floor, light beams cutting through haze", altSr: "Plesač u belim pantalonama nisko klizi preko poda, snopovi svetla seku izmaglicu" },
    { id: "08175", alt: "A phone raised in the foreground filming the floor, the checkerboard glowing pink and white", altSr: "Podignut telefon u prvom planu snima podijum, pod svetli ružičasto i belo" },
    { id: "09365", alt: "A breaker in a hooded top mid-flip, sneakers kicked high above the watching crowd", altSr: "Breaker u duksu sa kapuljačom usred okreta, patike zabačene visoko iznad publike koja gleda" },
    { id: "08991", alt: "The back of a black jacket with a red floral print, a spectator watching the circle", altSr: "Leđa crne jakne sa crvenim cvetnim printom, gledalac posmatra krug" },
    { id: "09623", alt: "A dancer upside down on one hand beneath the festival banner, long shadow across the tiles", altSr: "Plesač naglavačke na jednoj ruci ispod transparenta festivala, dugačka senka preko pločica" },
    { id: "08464", alt: "Judges and onlookers at the edge of the floor, one with a hand to his chin, one shouting", altSr: "Žiri i posmatrači na ivici podijuma, jedan sa rukom na bradi, jedan viče" },
    { id: "09541", alt: "A dancer balancing on one hand at a slant, his shadow stretched across the checkered floor", altSr: "Plesač balansira na jednoj ruci u nagibu, njegova senka se pruža preko poda poput šahovske table" },
    { id: "09814", alt: "A breaker inverted mid-move, an onlooker in a black tee standing calm at left", altSr: "Breaker naglavačke usred pokreta, posmatrač u crnoj majici stoji smireno levo" },
    { id: "09834", alt: "A dancer in a blue top with arms wide, teal spotlights over the banner behind", altSr: "Plesač u plavoj majici raširenih ruku, tirkizni reflektori iznad transparenta iza" },
  ],
  sr: { discipline: "događaj", when: "septembar 2026", blurb: "Breaking battle na patosu poput šahovske table, publika naslonjena na sam krug." },
};

const weddingDay: SetDef = {
  slug: "wedding-day",
  pool: "wedding-day",
  title: "Wedding · Day",
  kind: "commissioned",
  discipline: "documentary",
  when: "Aug 2026",
  mode: "grid",
  blurb: "Getting ready, the procession and the music.",
  cover: "04623",
  lead: "03492",
  satellites: ["04437", "05157", "05030", "04425"],
  frames: [
    { id: "03492", alt: "Two women in white costume, one in a green fringed headscarf, a string of gold coins passing between them", altSr: "Dve žene u beloj nošnji, jedna u zelenoj marami sa resama, preko njih prelazi niz zlatnih novčića" },
    { id: "04594", alt: "A red and white fringed parasol above a crowd gathered along a village lane", altSr: "Crveno-beli kišobran sa resama iznad gomile okupljene duž seoskog sokaka" },
    { id: "04623", alt: "Three figures in white embroidered costume walking under a red and white fringed parasol on a forest path", altSr: "Tri figure u beloj izvezenoj nošnji idu ispod crveno-belog kišobrana sa resama šumskom stazom" },
    { id: "04425", alt: "The procession filing down the village road under a red fringed parasol", altSr: "Povorka se kreće niz seoski put ispod crvenog kišobrana sa resama" },
    { id: "04437", alt: "A green fringed shawl with a white beaded medallion on a man's back, the parasol beyond", altSr: "Zeleni šal sa resama i belim medaljonom od perli na muškim leđima, iza njega kišobran" },
    { id: "04675", alt: "A woman in a white headscarf and embroidered black vest beside a bald man in a yellow polo, trees behind", altSr: "Žena u beloj marami i izvezenom crnom prsluku pored ćelavog muškarca u žutoj polo majici, iza drveće" },
    { id: "05030", alt: "Musicians playing zurnas in the lane, onlookers gathered close", altSr: "Svirači sviraju zurle u sokaku, posmatrači okupljeni blizu" },
    { id: "04859", alt: "A hand tipping a metal jug beside a woman in black embroidered costume with gold trim", altSr: "Ruka naginje metalni krčag pored žene u crnoj izvezenoj nošnji sa zlatnim ukrasima" },
    { id: "05157", alt: "Red embroidered veil with silver beadwork against a green hedge", altSr: "Crveni izvezeni veo sa srebrnim perlama naspram zelene žive ograde" },
    { id: "05164", alt: "A woman in a red beaded veil, a gold coin pinned at her chest, a hand reaching in", altSr: "Žena u crvenom velu od perli, zlatni novčić prikačen na grudima, ruka se pruža ka njemu" },
    { id: "05123", alt: "A glass vase wrapped in a ribbon dated 02.08.2026 on a patterned tablecloth", altSr: "Staklena vaza ovijena trakom sa datumom 02.08.2026 na stolnjaku sa šarom" },
    { id: "05190", alt: "People dancing in the road in front of a bare mountain under a blue sky", altSr: "Ljudi igraju na putu ispred gole planine pod plavim nebom" },
  ],
  sr: { title: "Svadba · dan", discipline: "dokumentarno", when: "avgust 2026", blurb: "Spremanje, svatovi i muzika." },
};

const weddingNight: SetDef = {
  slug: "wedding-night",
  pool: "wedding-night",
  title: "Wedding · Night",
  kind: "commissioned",
  discipline: "documentary",
  when: "Aug 2026",
  mode: "grid",
  blurb: "Guests before the evening, then the flares and the dancing.",
  cover: "02099",
  lead: "04349",
  satellites: ["01762", "01992", "02362", "01708"],
  frames: [
    { id: "01602", alt: "A blonde woman in a brown dress with a high slit, one hand on her hip, a railing hung with lights behind her", altSr: "Plavuša u braon haljini sa visokim prorezom, jedna ruka na boku, iza nje ograda ukrašena svetlima" },
    { id: "01623", alt: "A young man taking a phone selfie with two women in a brown dress and a cream top", altSr: "Mladić pravi selfi telefonom sa dve žene, u braon haljini i krem topu" },
    { id: "01633", alt: "Three guests in a close pose on a lit terrace, a green dress at the centre", altSr: "Troje gostiju u bliskoj pozi na osvetljenoj terasi, zelena haljina u sredini" },
    { id: "01667", alt: "A bald man in a navy suit, a woman in a green dress and a man in a beige jacket, all in red bow ties", altSr: "Ćelav muškarac u teget odelu, žena u zelenoj haljini i muškarac u bež sakou, svi sa crvenim leptir-mašnama" },
    { id: "01708", alt: "A young man in a white shirt, hands on his hips, lit against a dark rock wall", altSr: "Mladić u beloj košulji, ruke na bokovima, osvetljen naspram tamnog kamenog zida" },
    { id: "01762", alt: "A bride in a white veil carried through the dark by a close crowd of guests", altSr: "Mlada u belom velu nošena kroz mrak, okružena gustom grupom gostiju" },
    { id: "01799", alt: "The couple side by side among guests, the bride holding a white bouquet", altSr: "Mladenci jedno pored drugog među gostima, mlada drži beli buket" },
    { id: "01992", alt: "Guests in silhouette against red flare smoke, one flare burning low", altSr: "Gosti u silueti naspram crvenog dima baklji, jedna baklja nisko gori" },
    { id: "02009", alt: "A man in silhouette holding a flare aloft, red smoke behind him", altSr: "Muškarac u silueti drži baklju visoko, iza njega crveni dim" },
    { id: "02099", alt: "The bride seen from behind in a veiled gown, floodlit by a single street lamp, smoke in the air", altSr: "Mlada snimljena otpozadi u haljini sa velom, osvetljena samo jednom uličnom lampom, dim u vazduhu" },
    { id: "02362", alt: "A man dancing in a blue jacket with one arm raised high, guests dancing around him in the street", altSr: "Muškarac igra u plavoj jakni, jedna ruka visoko podignuta, gosti igraju oko njega na ulici" },
    { id: "02616", alt: "The bride from behind in a long veil and lace gown, guests blurred in the dark around her", altSr: "Mlada otpozadi u dugom velu i čipkanoj haljini, gosti razmazani u mraku oko nje" },
    { id: "04052", alt: "Drummers and dancers in white costume in the lane, a lit house behind", altSr: "Dobošari i igrači u beloj nošnji u sokaku, iza njih osvetljena kuća" },
    { id: "04349", alt: "A line of women in white costume and headscarves standing across the road at night", altSr: "Red žena u beloj nošnji i maramama stoji preko puta noću" },
  ],
  sr: { title: "Svadba · noć", discipline: "dokumentarno", when: "avgust 2026", blurb: "Gosti pre večeri, pa baklje i igranka." },
};

/** Index order — the procession. Gora sits apart, at the end, on its own. */
export const SETS: SetDef[] = [
  engagement,
  hot4stage,
  cyphercat,
  cocktailNight,
  graduation,
  fon,
  portraits,
  riviera,
  nightProtests,
  slavija,
  studentsWalk,
  urbanSportFest,
  weddingDay,
  weddingNight,
  zagreb,
  gora,
];

/** a poster I made from a frame in the same set: poster id → the frame's id */
export const POSTERS: Record<string, string> = {
  "docek-01": "00998",
  "slavija-01": "00854",
};

export const bySlug = (slug: string) => SETS.find((s) => s.slug === slug);
