import type { privacy as En } from "../en/privacy";

export const privacy: typeof En = {
  eyebrow: "Privatnost",
  title: "Šta se dešava sa vašim upitom",
  sub: "Šta čuvam i kako se to može ukloniti",
  email: "hello@kestrra.com",
  whoHead: "Ko",
  whoText: "Tarik Ramadani, poslujem pod imenom Kestrra, Beograd, Srbija.",
  rows: [
    {
      head: "Šta se prikuplja",
      body: "Ono što upišete u formular za upit: ime, adresa e-pošte, za šta je posao, datum i mesto (nije obavezno) i vaša poruka. Posete se broje pomoću servisa Cloudflare Web Analytics, koji ne koristi kolačiće i ne identifikuje vas: beleži samo otvorenu stranicu, sajt sa kog ste došli, vašu zemlju i vrstu pregledača. Sajt ne postavlja kolačiće za praćenje.",
    },
    {
      head: "Zašto",
      body: "Da bi se odgovorilo na vaš upit. Ne koristi se ni za šta drugo i ne prodaje se niti deli u marketinške svrhe.",
    },
    {
      head: "Koliko dugo",
      body: "Do 12 meseci, osim ako upit preraste u posao. Tada se čuva onoliko dugo koliko su potrebni posao i njegova dokumentacija.",
    },
    {
      head: "Ko obrađuje podatke",
      body: "Formular se šalje kao e-poruka preko Cloudflare servisa za e-poštu, a Cloudflare je i domaćin sajta. Ako ta putanja ne radi, poruka može da prođe preko servisa Resend, koji služi za dostavu e-pošte. Nijedan od njih podatke ne koristi za sopstvene potrebe.",
    },
    {
      head: "Vaša prava",
      body: "Pišite na gornju adresu da biste saznali šta se o vama čuva ili da biste tražili brisanje. Ovo je u skladu sa srpskim Zakonom o zaštiti podataka o ličnosti (ZZPL) i GDPR (Opštom uredbom o zaštiti podataka).",
    },
  ],
};
