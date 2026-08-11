// Which intake files ship, per set. Curation source of truth for the pipeline.
// Presentation (order, alt text, modes) lives in content/sets.ts.

export const INTAKE = "../_assets-intake";

export interface CropSpec {
  /** fraction of height removed from the top (0–1) */
  top?: number;
}

export interface SetInput {
  slug: string;
  dir: string;
  files: string[];
  /** per-id crop, sanctioned in data/selections.md only */
  crops?: Record<string, CropSpec>;
}

// Gora Polaroids — the 12-frame sequence from data/selections.md. Cuts stay unprocessed.
const gora: SetInput = {
  slug: "gora-polaroids",
  dir: "gora-polaroids",
  files: [
    "_MG_2350.jpg",
    "_MG_2359.jpg",
    "_MG_2362.jpg",
    "_MG_2356.jpg",
    "_MG_2342.jpg",
    "_MG_2538.jpg",
    "_MG_2386.jpg",
    "_MG_2423.jpg",
    "_MG_2479.jpg",
    "_MG_2431.jpg",
    "_MG_2473.jpg",
    "_MG_2542.jpg",
  ],
};

// Personal archive, clustered per data/image-analysis.md.
// Titles provisional (open item #5). Held back entirely: 4085, 4291, 5230,
// 5864, 8402 (loose standouts with no body to sit in), 8541-2/9874/9583
// (dupes / crop does no work).
const nightAssembly: SetInput = {
  slug: "night-assembly",
  dir: "archive",
  files: [
    "_MG_2019.jpg",
    "_MG_2052.jpg",
    "_MG_2121.jpg",
    "_MG_2144.jpg",
    "_MG_2173.jpg",
    "_MG_2186.jpg",
    "_MG_2192.jpg",
    "_MG_2805.jpg",
  ],
};

const zagreb: SetInput = {
  slug: "zagreb",
  dir: "archive",
  files: [
    "_MG_0086.jpg",
    "_MG_0097.jpg",
    "_MG_0101.jpg",
    "_MG_0122-3.jpg",
    "_MG_0238.jpg",
    "_MG_0246.jpg",
    "_MG_0311-2.jpg",
    "_MG_0427.jpg",
    "_MG_0500.jpg",
    "_MG_0576.jpg",
  ],
};

const riviera: SetInput = {
  slug: "riviera",
  dir: "archive",
  files: [
    "_MG_0024.jpg",
    "_MG_8331.jpg",
    "_MG_8343.jpg",
    "_MG_8390.jpg",
    "_MG_8540.jpg",
    "_MG_9206.jpg",
    "_MG_9214.jpg",
    "_MG_9217.jpg",
    "_MG_9416.jpg",
    "_MG_9455.jpg",
    "_MG_9493-2.jpg",
    "_MG_9495-2.jpg",
    "_MG_9679.jpg",
    "_MG_9741.jpg",
    "_MG_9771.jpg",
    "_MG_9772-Pano.jpg",
    "_MG_9794.jpg",
    "_MG_9868.jpg",
  ],
};

// Commissioned work. Event sets are processed in full; curation after the
// vision pass prunes derivatives, it never re-encodes.
const laura: SetInput = {
  slug: "laura",
  dir: "events/laura-wedding-2025",
  files: [
    "_MG_0021.jpg", "_MG_0027.jpg", "_MG_0048.jpg", "_MG_0107.jpg",
    "_MG_0145.jpg", "_MG_0155.jpg", "_MG_0159.jpg", "_MG_0172.jpg",
    "_MG_0244.jpg", "_MG_0322.jpg", "_MG_0351.jpg", "_MG_0474.jpg",
    "_MG_0628.jpg", "_MG_0798.jpg", "_MG_0823.jpg", "_MG_0869.jpg",
    "_MG_1022.jpg",
  ],
};

const matura: SetInput = {
  slug: "matura",
  dir: "events/matura",
  files: [
    "DSC01119.jpg", "DSC01134.jpg", "DSC01138.jpg", "DSC01148.jpg",
    "DSC01160.jpg", "DSC01192.jpg", "DSC01217.jpg", "DSC01218.jpg",
    "DSC01246.jpg", "DSC09165.jpg", "DSC09172.jpg", "DSC09176.jpg",
    "DSC09224.jpg", "DSC09284.jpg", "DSC09357.jpg", "DSC09358.jpg",
    "DSC09379.jpg", "DSC09394.jpg", "DSC09428.jpg", "DSC09470.jpg",
    "DSC09619.jpg", "DSC09635.jpg", "DSC09677.jpg", "DSC09725.jpg",
    "DSC09794.jpg",
  ],
};

const fon: SetInput = {
  slug: "fon",
  dir: "events/fon",
  files: [
    "MLD_0475.jpg", "MLD_0502.jpg", "MLD_0532.jpg", "MLD_0558.jpg",
    "MLD_0591.jpg", "MLD_0627.jpg", "_MG_2571.jpg", "_MG_2585.jpg",
    "_MG_2636.jpg", "_MG_2669.jpg", "_MG_3011.jpg",
  ],
};

const doa: SetInput = {
  slug: "doa",
  dir: "events/doa",
  files: [
    "DSC00781.jpg", "DSC00805.jpg", "DSC00814.jpg", "DSC00821.jpg",
    "DSC00858.jpg", "DSC00897.jpg", "DSC00903.jpg", "DSC00919.jpg",
    "DSC00930.jpg", "DSC00951.jpg",
  ],
};

const karamba: SetInput = {
  slug: "karamba",
  dir: "events/karamba",
  files: [
    "DSC00472.jpg", "DSC00503.jpg", "DSC00509.jpg", "DSC00517.jpg",
    "DSC00574.jpg", "DSC00599.jpg", "DSC00670.jpg", "DSC00723.jpg",
    "DSC00733.jpg",
  ],
};

// 14 shipping frames per data/selections.md (+ 04317, approved spare).
// DSC04498 taken from picks/ (filed twice in intake — category TBC with Tarik).
// 04319 crop: backdrop crossbar across top ~15%, sanctioned in selections.md.
const hot4stage: SetInput = {
  slug: "2hot4stage",
  dir: "events/2hot4stage",
  files: [
    "picks/DSC04314.jpg",
    "picks/DSC04348.jpg",
    "picks/DSC04372.jpg",
    "picks/DSC04385.jpg",
    "picks/DSC04421.jpg",
    "picks/DSC04472.jpg",
    "picks/DSC04480.jpg",
    "picks/DSC04498.jpg",
    "picks/DSC04525.jpg",
    "picks/DSC04530-Edit.jpg",
    "studio/DSC04319.jpg",
    "studio/DSC04326.jpg",
    "studio/DSC04332.jpg",
    "studio/DSC04334.jpg",
    "studio/DSC04317.jpg",
  ],
  crops: { "04319": { top: 0.16 } },
};

export const SETS: SetInput[] = [
  gora, nightAssembly, zagreb, riviera,
  laura, matura, fon, doa, karamba, hot4stage,
];

/** _MG_0122-3.jpg → 0122-3 · DSC04530-Edit.jpg → 04530-edit · MLD_0475 → 0475 */
export function fileId(file: string): string {
  return file
    .split("/").pop()!
    .replace(/\.[a-z]+$/i, "")
    .replace(/^(_MG_|DSC|MLD_)/i, "")
    .toLowerCase();
}

export const AVIF_WIDTHS = [640, 1080, 1600, 2200, 2880];
export const WEBP_WIDTHS = [960, 1920, 2880];
