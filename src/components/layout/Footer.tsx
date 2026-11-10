import Link from "next/link";
import { boardLinks, secondaryLinks } from "./nav";
import { ArrowUpRight, Instagram } from "@/components/ui/Icons";

const offices = [
  { city: "Istanbul", address: "Silahşör Cd. No:42, Bomonti", phone: "+90 212 555 01 01" },
  { city: "Milan", address: "Via Tortona 27", phone: "+39 02 5555 0101" },
];

export function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="container-x pt-16 pb-8 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="eyebrow mb-4 text-paper/50">Let&apos;s work together</p>
            <a
              href="mailto:booking@mpmodels.com"
              className="group font-display inline-flex items-center gap-2 text-2xl sm:text-3xl"
            >
              booking@mpmodels.com
              <ArrowUpRight
                width={20}
                height={20}
                className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-6">
            <div>
              <p className="eyebrow mb-5 text-paper/50">Boards</p>
              <ul className="space-y-3 text-sm">
                {boardLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="link-underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-5 text-paper/50">Agency</p>
              <ul className="space-y-3 text-sm">
                {secondaryLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="link-underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/shortlist" className="link-underline">
                    Shortlist
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-span-2 space-y-6 sm:col-span-1">
              <p className="eyebrow text-paper/50">Offices</p>
              {offices.map((o) => (
                <div key={o.city} className="text-sm leading-relaxed text-paper/80">
                  <p className="font-semibold text-paper">{o.city}</p>
                  <p>{o.address}</p>
                  <p>{o.phone}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col-reverse items-start justify-between gap-6 border-t border-paper/15 pt-8 text-xs text-paper/50 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} MP Model Management. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/contact" className="link-underline">
              Privacy Policy
            </Link>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-paper">
              <Instagram />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
