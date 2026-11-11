export type Division = "WOMEN" | "MEN" | "KIDS" | "TALENTS";

export type Board =
  | "MAINBOARD"
  | "NEW_FACES"
  | "PLUS_SIZE"
  | "INFLUENCER"
  | "UGC_CREATOR"
  | "MAKEUP_ARTIST"
  | "PHOTOGRAPHER"
  | "HAIR_STYLIST"
  | "DANCER";

export type JobKind = "BASIC_EVENT" | "WORK" | "FITTING" | "ZOOM_CALL";

export interface ModelImage {
  url: string;
  alt: string;
}

export interface ModelVideo {
  url: string;
  poster: string | null;
}

export interface Model {
  slug: string;
  firstName: string;
  lastName: string;
  division: Division;
  board: Board | null;
  /** Measurements are always set for models; talents may leave them empty. */
  height: number | null;
  bust: number | null;
  waist: number | null;
  hips: number | null;
  shoes: number | null;
  hair: string | null;
  eyes: string | null;
  city: string;
  nationality: string;
  instagram: string | null;
  tiktok?: string | null;
  website?: string | null;
  followers?: number | null;
  specialties?: string | null;
  bio: string;
  coverImage: string;
  featured: boolean;
  portfolio: ModelImage[];
  snaps: ModelImage[];
  videos: ModelVideo[];
  portfolioPdf?: string | null;
  /** Current stay, only present while it hasn't ended. Dates are "YYYY-MM-DD". */
  location?: ModelLocation | null;
}

export interface ModelLocation {
  country: string;
  city: string | null;
  from: string | null;
  to: string | null;
}

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage: string;
  publishedAt: string;
}

export type ShortlistItem = Pick<
  Model,
  "slug" | "firstName" | "lastName" | "division" | "board" | "coverImage" | "height" | "city" | "nationality"
>;

export interface FormState {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
}
