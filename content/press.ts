/** Where the work has been published. Kept apart from CLIENTS: a feature
    is not a client. Marks follow the same rule as the client marks. */
export interface Press {
  outlet: string;
  /** where every visible link goes: the outlet's own site */
  site: string;
  title: string;
  href: string;
  mark: { src: string; w: number; h: number };
}

export const PRESS: Press[] = [
  {
    outlet: "Vogue Adria",
    site: "https://vogueadria.com/",
    title: "Young artists in Serbia: ten years of Inter/Akcija",
    href: "https://vogueadria.com/young-artists-in-serbia-interakcija/",
    mark: { src: "/brand/press/vogue-adria.svg", w: 495, h: 210 },
  },
];
