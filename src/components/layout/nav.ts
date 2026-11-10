import { BOARDS, DIVISIONS, PLACEMENT, boardHref } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  children: { href: string; label: string }[];
}

/** Divisions with their boards, plus "Placed in Turkey" where it applies, as sub-menus. */
export const boardMenu: NavItem[] = DIVISIONS.map((d) => ({
  href: boardHref(d),
  label: d.label,
  children: [
    ...d.boards.map((b) => ({ href: boardHref(d, BOARDS[b]), label: BOARDS[b].label })),
    ...(d.placement ? [{ href: boardHref(d, PLACEMENT), label: PLACEMENT.label }] : []),
  ],
}));

export const boardLinks = boardMenu.map(({ href, label }) => ({ href, label }));

export const secondaryLinks = [
  { href: "/news", label: "News" },
  { href: "/production", label: "Production" },
  { href: "/contact", label: "Contact" },
  { href: "/become-a-model", label: "Get Scouted" },
];
