import type { Post } from "../types";
import { unsplash } from "../lib/utils";

const body = (lead: string) =>
  [
    lead,
    "The shoot took place over three days across two studios in Istanbul and Milan. The creative team opted for a visual language built on minimal set design, natural light and bold silhouettes. The result is a timeless series that clearly captures the brand's new-season identity.",
    "Our booking team worked alongside the brand and production crew from day one, managing the entire casting process. Our models' professionalism and chemistry on set were key to wrapping the production on schedule.",
    "The campaign imagery will roll out across digital channels, store windows and selected print titles starting next week. A huge thank you to everyone involved.",
  ].join("\n\n");

export const posts: Post[] = [
  {
    slug: "fall-winter-campaign-mira-aksoy",
    title: "Mira Aksoy fronts a new fall/winter campaign",
    excerpt: "Mira takes the lead in an international fashion house's FW26 campaign. Minimal, powerful and timeless.",
    category: "Campaign",
    coverImage: unsplash("1534528741775-53994a69daeb", "wide", 1600),
    publishedAt: "2026-09-18T10:00:00.000Z",
    content: body("Mira Aksoy has been announced as the face of an international fashion house's fall/winter 2026 campaign."),
  },
  {
    slug: "milan-fashion-week-2026",
    title: "12 of our models walked Milan Fashion Week",
    excerpt: "This season, 12 of our models appeared in more than 30 shows in Milan. Here are the highlights.",
    category: "Runway",
    coverImage: unsplash("1509967419530-da38b4704bc6", "wide", 1600),
    publishedAt: "2026-09-10T10:00:00.000Z",
    content: body("Milan Fashion Week was one of the busiest seasons in our agency's history."),
  },
  {
    slug: "new-faces-open-call",
    title: "New Faces Open Call: applications are open",
    excerpt: "We're looking for new faces aged 16-24 ready to start their careers. Here's how to apply, plus a few tips.",
    category: "Scouting",
    coverImage: unsplash("1571513722275-4b41940f54b8", "wide", 1600),
    publishedAt: "2026-09-02T10:00:00.000Z",
    content: body("As every year, this autumn we're launching our New Faces open call."),
  },
  {
    slug: "sofia-marin-editorial-cover",
    title: "Sofia Marin opens the season with an editorial cover",
    excerpt: "Sofia's 12-page editorial stands out with natural light and sculptural poses.",
    category: "Editorial",
    coverImage: unsplash("1524504388940-b1c1722653e1", "wide", 1600),
    publishedAt: "2026-08-27T10:00:00.000Z",
    content: body("Sofia Marin features in a 12-page editorial in the September issue of a leading fashion magazine."),
  },
  {
    slug: "sustainable-capsule-collection",
    title: "Two new faces for a sustainable capsule collection",
    excerpt: "Ece and Alp star in a local designer's collection made entirely from recycled fabrics.",
    category: "Campaign",
    coverImage: unsplash("1519699047748-de8e457a634e", "wide", 1600),
    publishedAt: "2026-08-14T10:00:00.000Z",
    content: body("Our new faces Ece Yıldız and Alp Yurt star in the campaign for a capsule collection with sustainability at its core."),
  },
  {
    slug: "creative-division-turns-one",
    title: "Our Creative division turns one",
    excerpt: "In its first year, our Creative board of character faces took part in more than 40 projects.",
    category: "Agency",
    coverImage: unsplash("1438761681033-6461ffad8d80", "wide", 1600),
    publishedAt: "2026-07-30T10:00:00.000Z",
    content: body("The Creative division we launched last year reflects how much we value diversity of age, look and story in the industry."),
  },
  {
    slug: "paris-street-style-shoot",
    title: "A street style series in the streets of Paris",
    excerpt: "Camille and Theo teamed up for a spontaneous street style shoot in the back streets of Paris.",
    category: "Editorial",
    coverImage: unsplash("1502823403499-6ccfcf4fb453", "wide", 1600),
    publishedAt: "2026-07-12T10:00:00.000Z",
    content: body("Shot in Paris's Le Marais district, the series set out to capture the effortlessness of street fashion."),
  },
  {
    slug: "aegean-summer-campaign",
    title: "A summer campaign on the Aegean coast",
    excerpt: "Behind-the-scenes moments from our summer campaign shoot in Bodrum.",
    category: "Behind the scenes",
    coverImage: unsplash("1557296387-5358ad7997bb", "wide", 1600),
    publishedAt: "2026-06-20T10:00:00.000Z",
    content: body("For a swimwear brand's summer campaign, we shot in Bodrum from sunrise to sunset."),
  },
];
