/**
 * Development work — one entry per project. `/dev` renders every entry with
 * `show: true`, in this order; the home page takes the first three that are
 * also `flagship`. To add a project, add an entry.
 *
 * Screenshots live in `public/dev/` as WebP: the first screen of the live
 * product at 1440 × 900, under about 150 KB. A terminal tool gets a real
 * `sample` of its output instead of a picture.
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
  /** real output, for a terminal tool — first line is the command */
  sample?: string;
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

// one real reading, cut after the busiest processes; the process table is
// narrowed to fit (the disk read/write columns are left out)
const AETHER_SAMPLE = `$ aether --once --plain
cpu     19.7%  2.74 GHz (2.20 to 3.80)  52.5 °C  48.8 W  load 5.86 4.04 3.27
        threads 24 20 16 32 24 27 15 19 23 8 8 24
mem     10.1 GiB used of 15.5 GiB  5.4 GiB available  3.1 GiB cached
        swap 5.8 GiB of 42.4 GiB  pressure 0.0%
gpu     Ellesmere [Radeon RX 470/480/570/570X/580/580X/590]  0%  vram 1.3 GiB of 4.0 GiB  55 °C  49.5 W
sensors amdgpu edge  55.0 °C
        amdgpu fan1  2423 rpm
        amdgpu PPT  49.5 W
        k10temp Tctl  52.5 °C
disk    /  /dev/sdb2  370.1 GiB of 403.3 GiB  read 0 B/s  write 0 B/s  busy 0%
procs   by cpu, grouped by app
NAME              COUNT  CPU        MEM  GPU       VRAM
brave                33  8.3    3.1 GiB  5.6  309.2 MiB
gnome-shell           1  3.3  132.0 MiB  1.1  449.4 MiB
spotify               7  2.7  564.7 MiB  0.9  106.5 MiB
chrome               10  2.0  158.2 MiB  2.9  228.3 MiB
aether                1  1.3  700.0 KiB    -          -
Xwayland              1  0.7    8.8 MiB  1.1   86.2 MiB`;

export const DEV_PROJECTS: DevProject[] = [
  {
    slug: "apartment-renovation-nyc",
    name: "Apartment Renovation NYC",
    line: "The website of a New York architecture and interior design firm that renovates apartments in Manhattan and Brooklyn.",
    role: "design and build, ongoing",
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
    sample: AETHER_SAMPLE,
    spill: "#435465",
    show: true,
    flagship: false,
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
    flagship: true,
  },
  {
    slug: "lunasol",
    name: "LunaSol",
    line: "A procedural roguelite arcade game: generated mazes, a shop and relics between runs. A university course project.",
    role: "one of three developers",
    stack: ["lua", "löve"],
    spill: "#5a4866",
    code: "https://github.com/matf-pp/2026_procedural-rougelite-arcade",
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
