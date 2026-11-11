/**
 * Development work — one entry per project. `/dev` renders every entry with
 * `show: true`, in this order; the home page takes the first three that are
 * also `flagship`. To add a project, add an entry.
 *
 * Screenshots live in `public/dev/` as WebP: the first screen of the live
 * product at 1440 × 900, under about 150 KB. A terminal tool gets a real
 * capture of it running, at its own shape.
 */

export interface DevImage {
  /** path under public/, e.g. "/dev/kestrra-frames.webp" */
  src: string;
  w: number;
  h: number;
  alt: string;
}

export interface DevProject {
  slug: string;
  name: string;
  /** one line on what it is */
  line: string;
  role: string;
  stack: string[];
  /** the live product */
  live?: string;
  /** a public repository */
  code?: string;
  image?: DevImage;
  /** the year it was made, shown in the row's info panel when set */
  year?: string;
  /** the room's colour while this project is on screen (corpus tone if unset) */
  spill?: string;
  show: boolean;
  flagship: boolean;
}

/** quiet links for employers on /dev — the line hides while this is empty */
export const EMPLOYER_LINKS: { label: string; href: string }[] = [
  { label: "github ↗", href: "https://github.com/tarikee" },
  { label: "hello@kestrra.com", href: "mailto:hello@kestrra.com" },
];

/** the name shown at the head of the employer line */
export const EMPLOYER_NAME = "Tarik Ramadani";

export const DEV_PROJECTS: DevProject[] = [
  {
    slug: "apartment-renovation-nyc",
    name: "Apartment Renovation NYC",
    line: "The website of a New York architecture and interior design firm that renovates apartments in Manhattan and Brooklyn.",
    role: "site design and build, SEO, hosting, scripts and dashboards",
    stack: ["wordpress", "elementor", "php"],
    live: "https://apartmentrenovation.nyc",
    spill: "#5a5853",
    image: {
      src: "/dev/apartment-renovation-nyc.webp",
      w: 1440,
      h: 900,
      alt: "The Apartment Renovation NYC home page: the firm's name over a photograph of a renovated bathroom.",
    },
    show: true,
    flagship: true,
  },
  {
    slug: "kestrra-frames",
    name: "Frames",
    line: "Lays photos across a strip of slides and exports a seamless Instagram carousel. Runs entirely in the browser, offline too.",
    role: "design and build",
    stack: ["react", "typescript", "konva", "vite", "cloudflare workers"],
    live: "https://frames.kestrra.com",
    year: "2026",
    spill: "#614847",
    image: {
      src: "/dev/kestrra-frames.webp",
      w: 1440,
      h: 900,
      alt: "Frames: three photographs laid across six carousel slides, with the layers panel open.",
    },
    show: true,
    flagship: true,
  },
  {
    slug: "kestrra-com",
    name: "kestrra.com",
    line: "This site. A photography and film portfolio with its own image pipeline, a rotating hero and an inquiry form.",
    role: "design and build",
    stack: ["next.js", "react", "typescript", "tailwind", "cloudflare workers"],
    live: "https://kestrra.com",
    year: "2026",
    spill: "#5b544d",
    image: {
      src: "/dev/kestrra-com.webp",
      w: 1440,
      h: 900,
      alt: "The kestrra.com home page: the wordmark beside a photograph from one of the sets.",
    },
    show: true,
    flagship: false,
  },
  {
    slug: "aether",
    name: "aether",
    line: "A Rust library and terminal dashboard that shows the whole machine as numbers: CPU, GPU, memory, sensors, disks, network and every process.",
    role: "author",
    stack: ["rust", "linux", "windows", "macos"],
    code: "https://github.com/tarikee/aether",
    year: "2026",
    spill: "#435465",
    image: {
      src: "/dev/aether.webp",
      w: 1800,
      h: 849,
      alt: "aether running full screen in a terminal: CPU, memory, GPU, disks, network, sensors and the process list.",
    },
    show: true,
    flagship: true,
  },
  {
    slug: "aether-studio",
    name: "Aether studio",
    line: "A concept landing page for a fictional design studio, built around 3D scroll scenes and smooth scrolling.",
    role: "design and build",
    stack: ["react", "three.js", "gsap", "lenis", "vite"],
    live: "https://studio-aether.kestrra.com",
    spill: "#484a6e",
    image: {
      src: "/dev/aether-studio.webp",
      w: 1440,
      h: 900,
      alt: "The Aether studio landing page: a large headline, “Digital worlds that feel alive”, on a dark violet ground.",
    },
    show: true,
    flagship: false,
  },
  {
    slug: "lunasol",
    name: "LunaSol",
    line: "A procedural roguelite arcade game: generated mazes, a shop and relics between runs. A university course project.",
    role: "one of three developers",
    stack: ["lua", "löve"],
    spill: "#5a4866",
    code: "https://github.com/matf-pp/2026_procedural-rougelite-arcade",
    year: "2026",
    image: {
      src: "/dev/lunasol.webp",
      w: 1440,
      h: 900,
      alt: "LunaSol gameplay: a ghost moving through a procedurally generated maze, relic slots on either side.",
    },
    show: true,
    flagship: false,
  },
];

/** what /dev lists — entries without a name are skipped, whatever their flag */
export const shownProjects = () => DEV_PROJECTS.filter((p) => p.show && p.name.trim() !== "");

/** what the home page shows — at most three */
export const flagshipProjects = () => shownProjects().filter((p) => p.flagship).slice(0, 3);

/** "frames.kestrra.com", "github.com/tarikee/aether" */
export const host = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");
