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
  /** frames that drift around the focal in the index */
  satellites: string[];
  frames: FrameDef[];
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
  blurb: "A village engagement, start to finish — the drums arrive first.",
  cover: "0027",
  satellites: ["0322", "0021", "0474", "0798", "0145"],
  frames: [
    { id: "0021", alt: "Procession musicians on the village road — two drummers with slung tapan drums and a zurna player leading the guests downhill" },
    { id: "0107", alt: "Guests crowd the groom-to-be as a zurna is played straight at him, the green fringed shawl over his shoulders" },
    { id: "0027", alt: "The bride-to-be in white beaded traditional dress and gold coins beside her fiancé, guests gathered under the trees" },
    { id: "0048", alt: "The couple glimpsed between guests' shoulders, a patterned scarf crossing the foreground" },
    { id: "0798", alt: "The groom-to-be in a pale suit with the green fringed ceremonial shawl, in the dressing room between hanging garments" },
    { id: "0869", alt: "The green fringed shawl with its white beaded medallion hung beside dresses, an embroidered portrait of the couple below" },
    { id: "0322", alt: "Close view of her eye beneath the beaded bonnet, a red flower fixed at its edge" },
    { id: "0244", alt: "The bride-to-be laughing in profile in a white room, beaded veil and layered coin necklaces" },
    { id: "0474", alt: "The brooch bouquet of red and gold flowers resting against the beaded sleeve" },
    { id: "0628", alt: "The bride-to-be and her maid of honour before a backdrop of hearts, the bouquet held between them" },
    { id: "0823", alt: "The couple side by side indoors — beaded whites against the grey suit and green shawl" },
    { id: "0351", alt: "Woman in a gold coin headdress and green scarf beside a man in a blue suit, posed beneath the window" },
    { id: "0172", alt: "Guests at the garden table, one standing mid-toast in a bright blue suit" },
    { id: "0145", alt: "Gifts wrapped in tulle and cellophane crowding a low-lit table" },
    { id: "0155", alt: "Gift bags and wrapped hampers stacked in the half-dark of the gift room" },
    { id: "1022", alt: "The brooch bouquet carried down the lane after the ceremony, the bride-to-be following in her beaded whites" },
  ],
};

const hot4stage: SetDef = {
  slug: "2hot4stage",
  pool: "2hot4stage",
  title: "2Hot4Stage",
  kind: "commissioned",
  discipline: "clothing",
  when: "Mar 2026",
  mode: "grid",
  blurb: "Campaign frames for the crew's clothing line — studio, showroom, light.",
  client: {
    name: "2Hot4Stage",
    url: "https://2hot4stage.com",
    mark: "/brand/2h4s-logo.svg",
    markMinWidth: 140,
  },
  cover: "04525",
  satellites: ["04421", "04480", "04332", "04319"],
  feature: "orbit",
  frames: [
    { id: "04525", alt: "Model centred in a ring of spun light, the 2H4S neon burning behind her" },
    { id: "04314", alt: "Studio pair — her direct gaze over the dragon-print tee on his back, warm key light" },
    { id: "04348", alt: "Back to back in the two dragon prints, white and red, on grey" },
    { id: "04372", alt: "Sleeve dragon and red kanji, her hand at the necklace" },
    { id: "04319", alt: "Full lengths — cropped tee and chained jeans beside ochre carpenter pants" },
    { id: "04385", alt: "A hand with silver rings resting over the dark dragon back print" },
    { id: "04421", alt: "White-set frame — off-shoulder tee with the red 24 embroidery, stacked silver bracelets" },
    { id: "04326", alt: "She looks at him instead of the lens — same frame, different weather" },
    { id: "04472", alt: "Pink-lit room scene — seated at the bed's edge, the dragon back print turned away at right" },
    { id: "04334", alt: "Head on his shoulder — the frayed-denim pair, the quiet pose of the shoot" },
    { id: "04480", alt: "The back print burning red under red light, cigarette smoke at the window" },
    { id: "04332", alt: "Detail — the dragon and kanji filling the frame" },
    { id: "04498", alt: "Red-lit profile beside the white 2H4S neon" },
    { id: "04530-edit", alt: "Long-exposure ribbons of light wrapping her as she lifts the tee" },
  ],
};

const cocktailNight: SetDef = {
  slug: "cocktail-night",
  pool: "karamba",
  title: "Cocktail Night",
  kind: "commissioned",
  discipline: "nightlife",
  when: "Jul 2026",
  mode: "grid",
  blurb: "A summer night at the bar — since 1999.",
  client: { name: "Karamba" },
  cover: "00574",
  satellites: ["00733", "00509", "00670", "00517"],
  frames: [
    { id: "00509", alt: "The Karamba sign — gold on black, since 1999 — on the stone wall" },
    { id: "00733", alt: "Blue and red cocktails on crushed ice as a bottle pours at the bar" },
    { id: "00599", alt: "Bartender at work under the vine canopy, the terrace carrying on behind" },
    { id: "00574", alt: "Guests in silhouette against the amber lamplight of the corridor" },
    { id: "00670", alt: "Hands on the decks, a lit pint balanced above the mixer" },
    { id: "00472", alt: "Three friends posing on the terrace, club light grazing past" },
    { id: "00503", alt: "A table of six against the brick wall, drinks in" },
    { id: "00723", alt: "Two guests throwing peace signs across the terrace tables" },
    { id: "00517", alt: "A kiss at the bar, cocktails untouched" },
  ],
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
  satellites: ["09428", "09284", "09619", "09358", "09165"],
  frames: [
    { id: "09172", alt: "Graduate in a brown satin off-shoulder dress looking down at her bouquet under the pergola" },
    { id: "09176", alt: "Leaning back toward family in the garden greenery, bouquet in her arms" },
    { id: "09224", alt: "Four women posed together with the bouquet between them" },
    { id: "09284", alt: "Two friends face to face in the garden doorway, laughing" },
    { id: "09358", alt: "Walking the garden path away from camera, looking back over her shoulder" },
    { id: "09635", alt: "Full-length profile on the path between planted beds, wooden cabins behind" },
    { id: "09619", alt: "Looking up from under the tree, one hand raised to the branch" },
    { id: "09428", alt: "The bouquet held close in its paper wrap, red against cream" },
    { id: "09725", alt: "A selfie taken together beneath the climbing roses" },
    { id: "09165", alt: "Portrait in low light, the bouquet at her shoulder" },
    { id: "09794", alt: "Night frame washed in red light, the white bouquet in her arms" },
  ],
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
  blurb: "Case tournament coverage — hall, screens, handshakes.",
  client: { name: "Business Case Association SEE" },
  cover: "2571",
  satellites: ["0627", "2585", "0591", "2669"],
  frames: [
    { id: "0502", alt: "Speaker addressing the full lecture hall, the tournament screen lit behind" },
    { id: "0627", alt: "The three case tasks up on screen between two presenters" },
    { id: "0591", alt: "A handshake in front of the tournament screen" },
    { id: "2571", alt: "A presenter smiling at the lectern in a navy blazer" },
    { id: "2669", alt: "The Chaintrier Family Office crest on the hall screen as a presenter crosses the stage" },
    { id: "2585", alt: "Rows of students following the presentation" },
    { id: "0532", alt: "Applause moving across the middle rows" },
    { id: "0558", alt: "The hall from the side, every seat taken" },
    { id: "2636", alt: "Front rows listening, a videographer working the aisle" },
    { id: "3011", alt: "Guests seated along the panel table" },
  ],
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
  blurb: "One subject, one evening — terrace dusk into blue hour on the plaza.",
  cover: "01218",
  satellites: ["00805", "01246", "00919", "01134", "00930"],
  frames: [
    { id: "01134", alt: "Seated in a cream blazer with a glass, the hedge wall behind" },
    { id: "01148", alt: "Leaning back on the terrace sofa, drink in hand" },
    { id: "01119", alt: "The terrace at dusk — seated at the far end, city rising behind" },
    { id: "01192", alt: "Checking his phone in the dark of the terrace, restaurant lights behind" },
    { id: "01218", alt: "Dusk portrait lowering his sunglasses, glass towers blurred behind" },
    { id: "01246", alt: "The table at dusk — iced drinks, an ashtray, a lit phone" },
    { id: "00805", pool: "doa", alt: "Full length in a beige puffer and cream joggers, adjusting sunglasses in the courtyard of the glass block" },
    { id: "00781", pool: "doa", alt: "Seated on the granite planter edge, sunglasses in hand" },
    { id: "00821", pool: "doa", alt: "Mid-stride, looking back across the empty plaza" },
    { id: "00897", pool: "doa", alt: "Seated on a steel bench, low sun raking the facade" },
    { id: "00858", pool: "doa", alt: "The plaza at dusk — reclined on the bench, small against the buildings" },
    { id: "00951", pool: "doa", alt: "Opening the jacket mid-walk, white tee underneath, last light" },
    { id: "00930", pool: "doa", alt: "Detail — phone and a green leather wallet in hand, quilted sleeve behind" },
    { id: "00919", pool: "doa", alt: "Night portrait zipping the collar, street light catching the quilting" },
  ],
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
  blurb: "One stretch of coast — harbour, cars, and under the water.",
  cover: "8331",
  satellites: ["9868", "9493-2", "0024", "9206", "9741"],
  frames: [
    { id: "9772-pano", alt: "Wide sweep of the marina fronting the hillside city, mist on the ridge" },
    { id: "9771", alt: "White yachts stacked in the harbour below the packed hillside" },
    { id: "9868", alt: "Varnished wooden sailboat moored among the plastic hulls" },
    { id: "9794", alt: "The marina framed both sides by dark branches, cloud on the peak" },
    { id: "0024", alt: "Black 911 cabriolet in the casino plaza, pedestrians under the marquee" },
    { id: "9214", alt: "Dark red coupé nosed against a stone archway, hazy skyline behind" },
    { id: "9217", alt: "Top-down on the red fender and round headlight beside a striped bollard" },
    { id: "9206", alt: "Teal roadster, number 38, panned past the sunlit cliff" },
    { id: "9416", alt: "Yellow SUV between a curved glass tower and old stone, backlit by flare" },
    { id: "9741", alt: "Wood-panelled ballroom — chandeliers, tapestry, red chairs on sunlit parquet" },
    { id: "9455", alt: "Stone path curving through dense green toward two distant figures" },
    { id: "9493-2", alt: "A school of silver fish streaming through the dark cavern toward the light shaft" },
    { id: "9495-2", alt: "Yellow-striped fish crossing the grotto's lit opening" },
    { id: "9679", alt: "Spotted cowfish in profile against black water" },
    { id: "8343", alt: "Three scooters strung down the coastal road past blue shutters" },
    { id: "8331", alt: "Birds spaced along a sagging wire against the pink-orange dusk" },
    { id: "8390", alt: "Town lights coming on around the curved bay under storm cloud" },
    { id: "8540", alt: "Profile silhouette at dusk, sunglasses in hand, the lit town below" },
  ],
};

const nightProtests: SetDef = {
  slug: "night-protests",
  pool: "night-assembly",
  title: "Night Protests",
  kind: "personal",
  discipline: "documentary",
  when: "Winter 2024–25",
  mode: "grid",
  blurb: "A winter night of protest — fog, floodlight, flare smoke.",
  cover: "2186",
  satellites: ["2144", "2019", "2805", "2052"],
  frames: [
    { id: "2121", alt: "The crowd filling the street before the floodlit Ethnographic Museum, one beam cutting the fog" },
    { id: "2052", alt: "Signs and a flag above the packed street, soap bubbles drifting through the light" },
    { id: "2144", alt: "Phone flashlights held overhead; a woman in a Santa suit fronts the crowd with a sign" },
    { id: "2173", alt: "The crowd beneath a lit bicycle-crossing sign, amber windows burning through the fog" },
    { id: "2186", alt: "Red flare smoke washing over the protest beside the museum, black balloons above" },
    { id: "2192", alt: "An elderly woman in a white coat raises her hand amid the banner line" },
    { id: "2019", alt: "A hand holds a phone up over the crowd, its screen lit against the orange glow" },
    { id: "2805", alt: "A face caught inside swirling long-exposure light trails" },
  ],
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
  blurb: "Streets between trams — ochre, teal, dusk.",
  cover: "0122-3",
  satellites: ["0238", "0097", "0500", "0086"],
  frames: [
    { id: "0122-3", alt: "Blue tram descending the converging cobbled street under a web of wires" },
    { id: "0238", alt: "A flat row of shopfronts — teal shutters and hand-painted signage" },
    { id: "0097", alt: "A passer-by blurred across the mustard KRZNARIJA shopfront" },
    { id: "0246", alt: "Delivery cyclist threading the alley toward the distant glass tower" },
    { id: "0086", alt: "Grey 911 and a cyclist with red panniers held at the crosswalk, autumn trees over pastel facades" },
    { id: "0311-2", alt: "An elderly man in a bucket hat walking his small dog past arched shop windows, cobbles wet" },
    { id: "0101", alt: "Dim shop window — boots, folded shirts, rope and burlap under a single bulb" },
    { id: "0576", alt: "Green scalloped domes and a white minaret behind the parking lot's bare tree" },
    { id: "0427", alt: "Curved modernist block and a passing tram silhouetted against the orange-to-navy sunset" },
    { id: "0500", alt: "A guitarist alone in the lit bus shelter beside the glowing ad panel" },
  ],
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
  cover: "2350",
  satellites: [],
  spillOverride: "#4a5f58",
  frames: [
    { id: "2350", beat: "departure", breathing: true, alt: "The driver from behind, one hand on the wheel, snow country blurred through the fogged windshield" },
    { id: "2359", beat: "the road", alt: "The two-lane road curving past utility poles into the misty treeline" },
    { id: "2362", beat: "nobody there", alt: "An empty frost-dusted roadside shelter beside the road, pines dissolving in fog" },
    { id: "2356", beat: "looking back", breathing: true, alt: "Through the rear window past a silhouetted headrest — the shelter receding" },
    { id: "2342", beat: "the place is named", alt: "Blue street sign — RR. / UL. RAVENI — snow-capped on its pole, the village behind fog" },
    { id: "2538", beat: "the car has stopped", alt: "A parked car beside the snow-topped block wall, chimney and forested slopes above" },
    { id: "2386", beat: "weight", alt: "A barn roof collapsing under snow on the hillside above the village" },
    { id: "2423", beat: "downward, quiet", breathing: true, alt: "Snowdrifts crossed by animal tracks, framed in thin bare branches" },
    { id: "2479", beat: "widening", alt: "Snowed rooftops stepping down into the wide valley, a hazy mountain closing it" },
    { id: "2431", beat: "light breaking", alt: "The forest path descending toward distant rooftops, sun flaring through cloud" },
    { id: "2473", beat: "sky, distance", alt: "The snow-capped ridge framed by a bare branch under a diffused sky" },
    { id: "2542", beat: "resolution", alt: "The minaret's spire glinting above snow-covered rooftops against streaked cloud" },
  ],
};

/** Index order — the procession. Gora sits apart, at the end, on its own. */
export const SETS: SetDef[] = [
  engagement,
  hot4stage,
  cocktailNight,
  graduation,
  fon,
  portraits,
  riviera,
  nightProtests,
  zagreb,
  gora,
];

export const bySlug = (slug: string) => SETS.find((s) => s.slug === slug);
