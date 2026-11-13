import localFont from "next/font/local";

/** Geometric, Futura-like sans for UI and body copy. */
export const jost = localFont({
  variable: "--font-jost",
  src: [
    {
      path: "../../node_modules/@fontsource-variable/jost/files/jost-latin-wght-normal.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource-variable/jost/files/jost-latin-wght-italic.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
  display: "swap",
});

/** Separate family so ş, ğ, İ etc. fall through to it without overriding the latin faces. */
export const jostExt = localFont({
  variable: "--font-jost-ext",
  src: [
    {
      path: "../../node_modules/@fontsource-variable/jost/files/jost-latin-ext-wght-normal.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource-variable/jost/files/jost-latin-ext-wght-italic.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
  display: "swap",
  preload: false,
});

/** High-contrast Didone for headlines; the opsz axis sharpens contrast at display sizes. */
export const bodoni = localFont({
  variable: "--font-bodoni",
  src: [
    {
      path: "../../node_modules/@fontsource-variable/bodoni-moda/files/bodoni-moda-latin-standard-normal.woff2",
      weight: "400 900",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource-variable/bodoni-moda/files/bodoni-moda-latin-standard-italic.woff2",
      weight: "400 900",
      style: "italic",
    },
  ],
  display: "swap",
});

export const bodoniExt = localFont({
  variable: "--font-bodoni-ext",
  src: [
    {
      path: "../../node_modules/@fontsource-variable/bodoni-moda/files/bodoni-moda-latin-ext-standard-normal.woff2",
      weight: "400 900",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource-variable/bodoni-moda/files/bodoni-moda-latin-ext-standard-italic.woff2",
      weight: "400 900",
      style: "italic",
    },
  ],
  display: "swap",
  preload: false,
});

/** Editorial serif for model names — fashion-magazine Cormorant. */
export const cormorant = localFont({
  variable: "--font-cormorant",
  src: [
    {
      path: "../../node_modules/@fontsource-variable/cormorant/files/cormorant-latin-wght-normal.woff2",
      weight: "300 700",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource-variable/cormorant/files/cormorant-latin-wght-italic.woff2",
      weight: "300 700",
      style: "italic",
    },
  ],
  display: "swap",
});

export const cormorantExt = localFont({
  variable: "--font-cormorant-ext",
  src: [
    {
      path: "../../node_modules/@fontsource-variable/cormorant/files/cormorant-latin-ext-wght-normal.woff2",
      weight: "300 700",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource-variable/cormorant/files/cormorant-latin-ext-wght-italic.woff2",
      weight: "300 700",
      style: "italic",
    },
  ],
  display: "swap",
  preload: false,
});

export const fontVariables = [jost, jostExt, bodoni, bodoniExt, cormorant, cormorantExt]
  .map((f) => f.variable)
  .join(" ");
