import clsx, { type ClassValue } from "clsx";
import type { Board, Division } from "@/types";

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

export interface BoardInfo {
  key: Board;
  slug: string;
  label: string;
  description: string;
}

export const BOARDS: Record<Board, BoardInfo> = {
  MAINBOARD: {
    key: "MAINBOARD",
    slug: "mainboard",
    label: "Mainboard",
    description: "Established faces booked for runway, editorial and global campaigns.",
  },
  NEW_FACES: {
    key: "NEW_FACES",
    slug: "new-faces",
    label: "New Faces",
    description: "Fresh talent in development — the names to watch next season.",
  },
  PLUS_SIZE: {
    key: "PLUS_SIZE",
    slug: "plus-size",
    label: "Plus Sizes",
    description: "Confident curve models for fashion, beauty and lifestyle campaigns.",
  },
  INFLUENCER: {
    key: "INFLUENCER",
    slug: "influencers",
    label: "Influencers",
    description: "Creators with engaged audiences for brand partnerships and launches.",
  },
  UGC_CREATOR: {
    key: "UGC_CREATOR",
    slug: "ugc-creators",
    label: "UGC Creators",
    description: "Authentic, platform-native content made for performance and social.",
  },
  MAKEUP_ARTIST: {
    key: "MAKEUP_ARTIST",
    slug: "makeup-artists",
    label: "Make-up Artists",
    description: "Beauty artists for editorial, runway, campaign and celebrity work.",
  },
  PHOTOGRAPHER: {
    key: "PHOTOGRAPHER",
    slug: "photographers",
    label: "Photographers",
    description: "Fashion, beauty and portrait photographers for every kind of production.",
  },
  HAIR_STYLIST: {
    key: "HAIR_STYLIST",
    slug: "hair-stylists",
    label: "Hair Stylists",
    description: "Session stylists for shows, shoots and red-carpet looks.",
  },
  DANCER: {
    key: "DANCER",
    slug: "dancers",
    label: "Dancers",
    description: "Contemporary, commercial and stage dancers for film, fashion and live performance.",
  },
};

/** A board-like listing derived from where models currently are rather than a stored board. */
export const PLACEMENT = {
  slug: "placed-in-turkey",
  label: "Placed in Turkey",
  country: "TR",
  description: "Models currently in Turkey — or arriving soon — and available to book locally.",
} as const;

export interface DivisionInfo {
  key: Division;
  slug: string;
  label: string;
  description: string;
  boards: Board[];
  /** Talents are creatives rather than models, so measurements are optional for them. */
  measured: boolean;
  /** Whether the division lists a "Placed in Turkey" view. */
  placement: boolean;
}

export const DIVISIONS: DivisionInfo[] = [
  {
    key: "WOMEN",
    slug: "women",
    label: "Women",
    description: "International women models for runway, editorial and commercial work.",
    boards: ["MAINBOARD", "NEW_FACES", "PLUS_SIZE"],
    measured: true,
    placement: true,
  },
  {
    key: "MEN",
    slug: "men",
    label: "Men",
    description: "A strong men's board, from fashion weeks to global campaigns.",
    boards: ["MAINBOARD", "NEW_FACES"],
    measured: true,
    placement: true,
  },
  {
    key: "KIDS",
    slug: "kids",
    label: "Kids",
    description: "Children and teens for catalogue, commercial and kidswear shoots.",
    boards: [],
    measured: true,
    placement: true,
  },
  {
    key: "TALENTS",
    slug: "talents",
    label: "Talents",
    description: "Influencers, creators, dancers and the artists behind the image.",
    boards: ["INFLUENCER", "UGC_CREATOR", "MAKEUP_ARTIST", "PHOTOGRAPHER", "HAIR_STYLIST", "DANCER"],
    measured: false,
    placement: false,
  },
];

/** Old URLs from before Plus Size moved under Women and Creative became Talents. */
const LEGACY_SLUGS: Record<string, { division: string; board?: string }> = {
  creative: { division: "talents" },
  "plus-size": { division: "women", board: "plus-size" },
};

export const divisionInfo = (key: Division) => DIVISIONS.find((d) => d.key === key)!;
export const divisionLabel = (key: Division) => DIVISIONS.find((d) => d.key === key)?.label ?? key;
export const boardLabel = (key: Board) => BOARDS[key].label;

export function divisionBySlug(slug?: string) {
  const resolved = slug && LEGACY_SLUGS[slug] ? LEGACY_SLUGS[slug].division : slug;
  return DIVISIONS.find((d) => d.slug === resolved);
}

/** Resolves `?division=…&board=…`, accepting legacy slugs and ignoring boards that don't belong to the division. */
export function resolveBoardParams(divisionSlug?: string, boardSlug?: string) {
  const division = divisionBySlug(divisionSlug);
  const legacyBoard = divisionSlug ? LEGACY_SLUGS[divisionSlug]?.board : undefined;
  const slug = boardSlug ?? legacyBoard;
  const board = division?.boards.map((b) => BOARDS[b]).find((b) => b.slug === slug);
  const placed = !!division?.placement && slug === PLACEMENT.slug;
  return { division, board, placed };
}

export const boardHref = (division: DivisionInfo, board?: { slug: string }) =>
  `/models?division=${division.slug}${board ? `&board=${board.slug}` : ""}`;

/** Private casting page — only reachable with the secret token, never linked from the public site. */
export const castPath = (token: string) => `/cast/${token}`;

/* Spelled out rather than derived from Intl.DisplayNames, whose names differ between Node and browsers. */
const COUNTRY_NAMES: Record<string, string> = {
  AE: "United Arab Emirates", AL: "Albania", AM: "Armenia", AR: "Argentina", AT: "Austria", AU: "Australia",
  AZ: "Azerbaijan", BA: "Bosnia & Herzegovina", BE: "Belgium", BG: "Bulgaria", BH: "Bahrain", BR: "Brazil",
  BY: "Belarus", CA: "Canada", CH: "Switzerland", CL: "Chile", CN: "China", CO: "Colombia", CR: "Costa Rica",
  CY: "Cyprus", CZ: "Czechia", DE: "Germany", DK: "Denmark", DO: "Dominican Republic", DZ: "Algeria",
  EC: "Ecuador", EE: "Estonia", EG: "Egypt", ES: "Spain", ET: "Ethiopia", FI: "Finland", FR: "France",
  GB: "United Kingdom", GE: "Georgia", GH: "Ghana", GR: "Greece", HK: "Hong Kong", HR: "Croatia", HU: "Hungary",
  ID: "Indonesia", IE: "Ireland", IL: "Israel", IN: "India", IQ: "Iraq", IR: "Iran", IS: "Iceland", IT: "Italy",
  JM: "Jamaica", JO: "Jordan", JP: "Japan", KE: "Kenya", KG: "Kyrgyzstan", KR: "South Korea", KW: "Kuwait",
  KZ: "Kazakhstan", LB: "Lebanon", LI: "Liechtenstein", LK: "Sri Lanka", LT: "Lithuania", LU: "Luxembourg",
  LV: "Latvia", MA: "Morocco", MC: "Monaco", MD: "Moldova", ME: "Montenegro", MK: "North Macedonia", MT: "Malta",
  MU: "Mauritius", MV: "Maldives", MX: "Mexico", MY: "Malaysia", NG: "Nigeria", NL: "Netherlands", NO: "Norway",
  NZ: "New Zealand", OM: "Oman", PA: "Panama", PE: "Peru", PH: "Philippines", PK: "Pakistan", PL: "Poland",
  PR: "Puerto Rico", PT: "Portugal", PY: "Paraguay", QA: "Qatar", RO: "Romania", RS: "Serbia", RU: "Russia",
  SA: "Saudi Arabia", SC: "Seychelles", SE: "Sweden", SG: "Singapore", SI: "Slovenia", SK: "Slovakia",
  SN: "Senegal", TH: "Thailand", TN: "Tunisia", TR: "Turkey", TW: "Taiwan", TZ: "Tanzania", UA: "Ukraine",
  US: "United States", UY: "Uruguay", UZ: "Uzbekistan", VE: "Venezuela", VN: "Vietnam", ZA: "South Africa",
};

export const countryName = (code: string) => (isCountryCode(code) ? COUNTRY_NAMES[code] : code);

export const COUNTRIES = Object.entries(COUNTRY_NAMES)
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => (a.name < b.name ? -1 : 1));

export const isCountryCode = (code: string) => Object.hasOwn(COUNTRY_NAMES, code);

/** "2026-07-12" → "12.07.26" */
export const stayDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y.slice(2)}`;
};

export const stayRange = ({ from, to }: { from: string | null; to: string | null }) =>
  from && to ? `${stayDate(from)} — ${stayDate(to)}` : from ? `From ${stayDate(from)}` : to ? `Until ${stayDate(to)}` : null;

/** Today's date in Istanbul as "YYYY-MM-DD", the agency's reference for whether a stay has ended. */
export const agencyToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(),
  );

/** e.g. "Women · New Faces", or just "Kids" when the division has no boards. */
export const categoryLabel = (m: { division: Division; board: Board | null }) =>
  m.board ? `${divisionLabel(m.division)} · ${boardLabel(m.board)}` : divisionLabel(m.division);

export const compactNumber = (n: number) =>
  new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);

export const fullName = (m: { firstName: string; lastName: string }) => `${m.firstName} ${m.lastName}`;

export type ImageVariant = "cover" | "portrait" | "close" | "mono" | "wide" | "square";

const UNSPLASH = "https://images.unsplash.com/photo-";

export function unsplash(id: string, variant: ImageVariant = "cover", width = 900) {
  const base = `${UNSPLASH}${id}?auto=format&q=75&fit=crop`;
  const h = (ratio: number) => Math.round(width * ratio);
  switch (variant) {
    case "close":
      return `${base}&w=${width}&h=${h(1.3)}&crop=focalpoint&fp-x=0.5&fp-y=0.35&fp-z=1.6`;
    case "mono":
      return `${base}&w=${width}&h=${h(1.3)}&sat=-100`;
    case "wide":
      return `${base}&w=${width}&h=${h(0.62)}&crop=faces`;
    case "square":
      return `${base}&w=${width}&h=${width}&crop=faces`;
    case "portrait":
      return `${base}&w=${width}&h=${h(1.5)}&crop=faces`;
    default:
      return `${base}&w=${width}&h=${h(1.3)}&crop=faces`;
  }
}

export const pexels = (id: number, width = 900, height = Math.round(width * 1.3)) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${width}&h=${height}`;

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function resizeImage(url: string, width: number, height: number) {
  try {
    const u = new URL(url);
    u.searchParams.set("w", String(width));
    u.searchParams.set("h", String(height));
    return u.toString();
  } catch {
    return url;
  }
}

/** YouTube / Vimeo links become iframe embeds; anything else is treated as a direct video file. */
export function videoEmbedUrl(url: string) {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso),
  );
}

export const cmToFeet = (cm: number) => {
  const inches = Math.round(cm / 2.54);
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
};
