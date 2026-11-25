import type { license as En } from "../en/license";

export const license: typeof En = {
  eyebrow: "Licenciranje",
  title: "Licenciranje fotografija",
  sub: "© Tarik Ramadani · Sva prava zadržana",
  email: "hello@kestrra.com",
  rows: [
    {
      head: "Autorsko pravo",
      body: "Sve fotografije na kestrra.com je snimio Tarik Ramadani, koji radi pod imenom Kestrra, i zaštićene su autorskim pravom.",
    },
    {
      head: "Dozvoljena upotreba",
      body: "Linkovanje i deljenje stranica ovog sajta.",
    },
    {
      head: "Licenca je obavezna",
      body: "Za svako umnožavanje, objavljivanje, uređivanje ili komercijalnu upotrebu fotografija, uključujući reklame, proizvode ili treniranje veštačke inteligencije, potrebna je pisana licenca.",
    },
    {
      head: "Rad po narudžbini",
      body: "Fotografije sa posla rađenog po narudžbini koriste se pod uslovima dogovorenim za taj posao.",
    },
  ],
  requestHead: "Zahtev za licencu",
  request: {
    before: "Pošaljite link ka fotografiji, nameravanu upotrebu, mesto gde će se pojaviti i na koliko dugo, preko ",
    link: "formulara za upit",
    middle: " ili na adresu ",
    after: ". Uslovi se određuju po fotografiji i upotrebi.",
  },
  creditHead: "Autorstvo",
  credit: "Foto: Tarik Ramadani · Kestrra",
};
