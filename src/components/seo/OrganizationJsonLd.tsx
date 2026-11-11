const SITE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://three15management.com";

/** Organization + WebSite structured data for Google rich results. */
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE}/#organization`,
        name: "Three15 Management",
        url: SITE,
        logo: `${SITE}/brand/three15-mark.svg`,
        sameAs: [],
        description:
          "International model management agency representing women, men, kids and talents.",
      },
      {
        "@type": "WebSite",
        "@id": `${SITE}/#website`,
        url: SITE,
        name: "Three15 Management",
        publisher: { "@id": `${SITE}/#organization` },
        inLanguage: "en",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
