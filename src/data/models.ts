import type { Board, Division, Model, ModelImage, ModelVideo } from "../types";
import { pexels, slugify, unsplash } from "../lib/utils";

type Row = [
  photoId: string | number,
  firstName: string,
  lastName: string,
  height: number,
  measurements: [bust: number, waist: number, hips: number],
  shoes: number,
  hair: string,
  eyes: string,
  city: string,
  nationality: string,
  featured?: boolean,
];

const bioFor = (first: string, division: Division, board: Board | null, city: string) => {
  const intro: Record<Division, string> = {
    WOMEN:
      board === "PLUS_SIZE"
        ? `${first} brings confidence and warmth to every set, and has become a go-to face for inclusive fashion and beauty campaigns.`
        : board === "NEW_FACES"
          ? `${first} is one of our most exciting new faces — fresh, editorial and already turning heads at castings.`
          : `${first} is one of the most requested names of recent seasons, known for her striking features and effortless runway walk.`,
    MEN:
      board === "NEW_FACES"
        ? `${first} joined our new faces board this year and is quickly building an editorial book.`
        : `${first} stands out in both editorial and commercial work with his strong presence and versatile expression.`,
    KIDS: `${first} is a natural in front of the camera — playful, patient and always ready for the next shot.`,
    TALENTS: `${first} brings a distinct creative voice to every project.`,
  };
  return `${intro[division]} Based in ${city}, with credits across campaigns, catalogues and editorial shoots. A favourite among photographers and brands alike.`;
};

const RUNWAY_VIDEOS = [9512045, 9509327, 9509328, 9509330];

const runwayVideo = (id: number): ModelVideo => ({
  url: `https://videos.pexels.com/video-files/${id}/${id}-hd_1366_720_25fps.mp4`,
  poster: `https://images.pexels.com/videos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`,
});

function photos(id: string | number, name: string) {
  const alt = (kind: string, i: number) => ({ alt: `${name} ${kind} ${i + 1}` });
  const withAlt = (kind: string, urls: string[]): ModelImage[] => urls.map((url, i) => ({ url, ...alt(kind, i) }));

  if (typeof id === "number") {
    return {
      coverImage: pexels(id, 800),
      portfolio: withAlt("portfolio", [pexels(id, 1200, 1800), pexels(id, 1000, 1000), pexels(id, 1400, 868)]),
      snaps: withAlt("snap", [pexels(id, 1000, 1300)]),
    };
  }
  return {
    coverImage: unsplash(id, "cover", 800),
    portfolio: withAlt("portfolio", [unsplash(id, "portrait", 1200), unsplash(id, "square", 1000), unsplash(id, "wide", 1400)]),
    snaps: withAlt("snap", [unsplash(id, "close", 1000), unsplash(id, "mono", 1000)]),
  };
}

const build = (division: Division, rows: Row[], board: Board | null = null): Model[] =>
  rows.map(([id, firstName, lastName, height, [bust, waist, hips], shoes, hair, eyes, city, nationality, featured]) => {
    const name = `${firstName} ${lastName}`;
    return {
      slug: slugify(name),
      firstName,
      lastName,
      division,
      board,
      height,
      bust,
      waist,
      hips,
      shoes,
      hair,
      eyes,
      city,
      nationality,
      instagram: `@${slugify(firstName)}.${slugify(lastName)}`.replace(/-/g, ""),
      bio: bioFor(firstName, division, board, city),
      featured: !!featured,
      ...photos(id, name),
      videos: [],
    };
  });

const women: Row[] = [
  ["1534528741775-53994a69daeb", "Mira", "Aksoy", 178, [82, 60, 89], 39, "Dark Brown", "Brown", "Istanbul", "Turkish", true],
  ["1438761681033-6461ffad8d80", "Elena", "Novak", 176, [81, 59, 88], 39, "Red", "Green", "Prague", "Czech"],
  ["1544005313-94ddf0286df2", "Defne", "Yalın", 177, [83, 61, 90], 40, "Brown", "Hazel", "Izmir", "Turkish", true],
  ["1531746020798-e6953c6e8e04", "Leyla", "Karaca", 175, [80, 59, 87], 38, "Black", "Brown", "Istanbul", "Turkish"],
  ["1524504388940-b1c1722653e1", "Sofia", "Marin", 179, [84, 61, 90], 40, "Light Brown", "Blue", "Milan", "Italian", true],
  ["1529626455594-4ff0802cfb7e", "Aurora", "Lind", 174, [82, 60, 88], 38, "Auburn", "Brown", "Stockholm", "Swedish"],
  ["1488426862026-3ee34a7d66df", "Nehir", "Aydın", 180, [83, 62, 90], 40, "Black", "Brown", "Ankara", "Turkish"],
  ["1502823403499-6ccfcf4fb453", "Camille", "Durand", 176, [81, 60, 89], 39, "Brown", "Hazel", "Paris", "French"],
  ["1509967419530-da38b4704bc6", "Anya", "Volkova", 178, [82, 59, 88], 39, "Light Brown", "Blue", "Warsaw", "Polish", true],
  ["1512316609839-ce289d3eba0a", "Ivy", "Hartmann", 177, [83, 61, 89], 40, "Blonde", "Blue", "Berlin", "German"],
  ["1485178575877-1a13bf489dfe", "Zeynep", "Tunç", 175, [80, 58, 87], 38, "Dark Brown", "Green", "Istanbul", "Turkish"],
  ["1557296387-5358ad7997bb", "Aylin", "Demir", 176, [84, 62, 91], 39, "Black", "Brown", "Bodrum", "Turkish"],
  ["1571513722275-4b41940f54b8", "Naomi", "Clarke", 181, [82, 60, 89], 41, "Brown", "Brown", "London", "British", true],
  ["1464863979621-258859e62245", "Lara", "Esen", 177, [81, 60, 88], 39, "Dark Brown", "Blue", "Istanbul", "Turkish"],
  ["1506863530036-1efeddceb993", "Maja", "Kowalska", 179, [83, 61, 90], 40, "Brown", "Hazel", "Kraków", "Polish"],
  ["1534751516642-a1af1ef26a56", "Hana", "Sato", 174, [79, 58, 86], 38, "Black", "Brown", "Tokyo", "Japanese"],
  ["1519699047748-de8e457a634e", "Amara", "Okafor", 180, [84, 61, 91], 40, "Black", "Brown", "Amsterdam", "Dutch", true],
  ["1532170579297-281918c8ae72", "Selin", "Arslan", 176, [82, 60, 88], 39, "Dark Brown", "Brown", "Istanbul", "Turkish"],
  ["1526510747491-58f928ec870f", "Freya", "Olsen", 178, [81, 59, 88], 39, "Red", "Green", "Copenhagen", "Danish"],
  ["1581044777550-4cfa60707c03", "Mei", "Lin", 175, [80, 58, 87], 38, "Black", "Brown", "Shanghai", "Chinese"],
];

const men: Row[] = [
  ["1506794778202-cad84cf45f1d", "Kaan", "Erdem", 188, [96, 76, 94], 44, "Brown", "Brown", "Istanbul", "Turkish", true],
  ["1507003211169-0a1dd7228f2d", "Marcus", "Reyes", 186, [98, 78, 95], 43, "Black", "Brown", "Madrid", "Spanish"],
  ["1500648767791-00dcc994a43e", "Luca", "Bianchi", 185, [94, 75, 92], 43, "Brown", "Brown", "Milan", "Italian", true],
  ["1519085360753-af0119f7cbe7", "Emir", "Kaya", 187, [97, 77, 94], 44, "Black", "Brown", "Ankara", "Turkish"],
  ["1521119989659-a83eee488004", "Julian", "Weber", 189, [98, 78, 96], 45, "Brown", "Blue", "Munich", "German"],
  ["1463453091185-61582044d556", "Tobi", "Adeyemi", 190, [100, 79, 96], 45, "Black", "Brown", "London", "British", true],
  ["1566492031773-4f4e44671857", "Andre", "Silva", 186, [96, 76, 93], 43, "Black", "Brown", "Lisbon", "Portuguese"],
  ["1520975954732-35dd22299614", "Arda", "Şahin", 184, [95, 75, 92], 43, "Brown", "Hazel", "Izmir", "Turkish"],
  ["1480455624313-e29b44bbfde1", "Theo", "Laurent", 187, [96, 77, 94], 44, "Dark Brown", "Brown", "Lyon", "French"],
  ["1531427186611-ecfd6d936c79", "Deniz", "Öztürk", 185, [95, 76, 93], 43, "Brown", "Brown", "Antalya", "Turkish"],
  ["1541647376583-8934aaf3448a", "Oskar", "Nowak", 188, [97, 78, 95], 44, "Dark Brown", "Brown", "Warsaw", "Polish"],
  ["1528892952291-009c663ce843", "Ethan", "Brooks", 186, [95, 76, 93], 44, "Brown", "Blue", "New York", "American", true],
  ["1508341591423-4347099e1f19", "Rafael", "Costa", 185, [96, 77, 94], 43, "Black", "Brown", "Rio de Janeiro", "Brazilian"],
  ["1496345875659-11f7dd282d1d", "Can", "Aksu", 189, [98, 78, 95], 45, "Brown", "Green", "Istanbul", "Turkish"],
  ["1536766820879-059fec98ec0a", "Malik", "Johnson", 191, [100, 80, 97], 46, "Black", "Brown", "Paris", "French"],
];

type TalentRow = [
  photoId: string,
  firstName: string,
  lastName: string,
  board: Board,
  city: string,
  nationality: string,
  extra: { followers?: number; specialties: string; website?: string; tiktok?: string; featured?: boolean },
];

const talents: TalentRow[] = [
  ["1508214751196-bcfd4ca60f91", "Ayşe", "Güler", "INFLUENCER", "Istanbul", "Turkish", { followers: 412000, specialties: "Fashion, Beauty, Travel", tiktok: "@aysegulerr", featured: true }],
  ["1547425260-76bcadfb4f2c", "Diego", "Morales", "UGC_CREATOR", "Barcelona", "Spanish", { followers: 86000, specialties: "Lifestyle, Tech, Fitness", tiktok: "@diegomakes" }],
  ["1566616213894-2d4e1baee5d8", "Margaret", "Hale", "MAKEUP_ARTIST", "London", "British", { specialties: "Editorial, Bridal, Runway" }],
  ["1504257432389-52343af06ae3", "Richard", "Stone", "PHOTOGRAPHER", "Berlin", "German", { specialties: "Fashion, Portrait, Campaign", website: "https://richardstone.studio" }],
  ["1618077360395-f3068be8e001", "Selim", "Başaran", "HAIR_STYLIST", "Istanbul", "Turkish", { specialties: "Session, Runway, Red Carpet", featured: true }],
  ["1522075469751-3a6694fb2f61", "Viktor", "Hansen", "PHOTOGRAPHER", "Oslo", "Norwegian", { specialties: "Beauty, Still Life", website: "https://viktorhansen.no" }],
];

const buildTalents = (rows: TalentRow[]): Model[] =>
  rows.map(([id, firstName, lastName, board, city, nationality, { featured, ...extra }]) => {
    const name = `${firstName} ${lastName}`;
    return {
      slug: slugify(name),
      firstName,
      lastName,
      division: "TALENTS",
      board,
      height: null,
      bust: null,
      waist: null,
      hips: null,
      shoes: null,
      hair: null,
      eyes: null,
      city,
      nationality,
      instagram: `@${slugify(firstName)}.${slugify(lastName)}`.replace(/-/g, ""),
      tiktok: extra.tiktok ?? null,
      website: extra.website ?? null,
      followers: extra.followers ?? null,
      specialties: extra.specialties,
      bio: bioFor(firstName, "TALENTS", board, city),
      featured: !!featured,
      ...photos(id, name),
      videos: [],
    };
  });

const moreWomen: Row[] = [
  ["1520813792240-56fc4a3765a7", "Ece", "Yıldız", 176, [80, 59, 87], 38, "Light Brown", "Brown", "Eskişehir", "Turkish"],
  ["1554151228-14d9def656e4", "Lina", "Berg", 177, [81, 60, 88], 39, "Brown", "Green", "Gothenburg", "Swedish"],
  ["1548142813-c348350df52b", "Isabela", "Rocha", 175, [82, 60, 89], 38, "Black", "Brown", "São Paulo", "Brazilian"],
  ["1525134479668-1bee5c7c6845", "Chloe", "Martin", 178, [81, 59, 88], 39, "Blonde", "Blue", "Nice", "French"],
  ["1614644147724-2d4785d69962", "Yuna", "Park", 174, [79, 58, 86], 38, "Black", "Brown", "Seoul", "South Korean"],
  ["1545912452-8aea7e25a3d3", "İpek", "Doğan", 177, [82, 60, 88], 39, "Blonde", "Hazel", "Istanbul", "Turkish"],
];

const moreMen: Row[] = [
  ["1499996860823-5214fcc65f8f", "Alp", "Yurt", 186, [94, 74, 91], 43, "Black", "Blue", "Istanbul", "Turkish"],
  ["1583195764036-6dc248ac07d9", "Noah", "Fischer", 187, [95, 75, 92], 44, "Dark Blonde", "Hazel", "Vienna", "Austrian"],
  ["1539571696357-5a69c17a67c6", "Liam", "Carter", 185, [93, 74, 91], 43, "Curly Blonde", "Brown", "Dublin", "Irish"],
  ["1552374196-c4e7ffc6e126", "Baran", "Kılıç", 184, [94, 75, 92], 43, "Curly Brown", "Brown", "Izmir", "Turkish"],
];

const plusSize: Row[] = [
  [7240120, "Carmen", "Vega", 170, [112, 95, 122], 40, "Black", "Brown", "Barcelona", "Spanish", true],
  [26904670, "Imani", "Wells", 174, [110, 92, 120], 41, "Black", "Brown", "London", "British", true],
  [11903906, "Ingrid", "Solberg", 176, [108, 90, 118], 41, "Brown", "Blue", "Oslo", "Norwegian"],
  [7239997, "Gizem", "Er", 168, [106, 88, 116], 39, "Dark Brown", "Brown", "Istanbul", "Turkish"],
  [7239887, "Valeria", "Luna", 169, [114, 96, 124], 40, "Dark Brown", "Brown", "Mexico City", "Mexican"],
];

const kids: Row[] = [
  [36909815, "Kerem", "Aydın", 128, [62, 56, 66], 31, "Brown", "Brown", "Istanbul", "Turkish", true],
  [36026375, "Zoe", "Lambert", 118, [58, 53, 62], 29, "Dark Brown", "Brown", "Paris", "French"],
  [14760732, "Elif", "Demirci", 122, [59, 54, 63], 30, "Black", "Brown", "Izmir", "Turkish"],
  [12158341, "Jayden", "Brooks", 105, [55, 51, 58], 26, "Black", "Brown", "London", "British"],
  [5354089, "Aria", "Kapoor", 132, [64, 57, 68], 32, "Black", "Brown", "Milan", "Indian"],
  [28644431, "Mateo", "Ruiz", 138, [67, 60, 71], 34, "Dark Brown", "Brown", "Madrid", "Spanish", true],
  [6673270, "Maya", "Johnson", 145, [70, 60, 75], 36, "Curly Black", "Brown", "Amsterdam", "Dutch"],
  [5560013, "Lila", "Novak", 110, [56, 52, 60], 27, "Curly Brown", "Brown", "Prague", "Czech"],
];

export const models: Model[] = [
  ...build("WOMEN", women, "MAINBOARD"),
  ...build("WOMEN", moreWomen, "NEW_FACES"),
  ...build("WOMEN", plusSize, "PLUS_SIZE"),
  ...build("MEN", men, "MAINBOARD"),
  ...build("MEN", moreMen, "NEW_FACES"),
  ...build("KIDS", kids),
  ...buildTalents(talents),
];

models
  .filter((m) => m.board === "MAINBOARD" && m.division === "WOMEN" && m.featured)
  .slice(0, RUNWAY_VIDEOS.length)
  .forEach((m, i) => (m.videos = [runwayVideo(RUNWAY_VIDEOS[i])]));

const carmen = models.find((m) => m.slug === "carmen-vega");
carmen?.portfolio.splice(1, 0, { url: pexels(7240124, 1200, 1800), alt: "Carmen Vega portfolio 2" });
