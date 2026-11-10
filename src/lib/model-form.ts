import type { Board, Division } from "@/types";

export interface ModelFormValues {
  firstName: string;
  lastName: string;
  division: Division;
  board: Board | "";
  height: string;
  bust: string;
  waist: string;
  hips: string;
  shoes: string;
  hair: string;
  eyes: string;
  city: string;
  nationality: string;
  instagram: string;
  tiktok: string;
  website: string;
  followers: string;
  specialties: string;
  locationCountry: string;
  locationCity: string;
  locationFrom: string;
  locationTo: string;
  bio: string;
  featured: boolean;
  published: boolean;
  portfolio: string[];
  snaps: string[];
  videos: string[];
  portfolioPdf: string;
}

export const EMPTY_MODEL: ModelFormValues = {
  firstName: "",
  lastName: "",
  division: "WOMEN",
  board: "MAINBOARD",
  height: "",
  bust: "",
  waist: "",
  hips: "",
  shoes: "",
  hair: "",
  eyes: "",
  city: "",
  nationality: "",
  instagram: "",
  tiktok: "",
  website: "",
  followers: "",
  specialties: "",
  locationCountry: "",
  locationCity: "",
  locationFrom: "",
  locationTo: "",
  bio: "",
  featured: false,
  published: true,
  portfolio: [],
  snaps: [],
  videos: [],
  portfolioPdf: "",
};
