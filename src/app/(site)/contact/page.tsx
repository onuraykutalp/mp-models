import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/ContactForm";
import { getModelBySlug } from "@/lib/queries";
import { fullName } from "@/lib/utils";

export const metadata: Metadata = { title: "Contact" };

const offices = [
  {
    city: "Istanbul",
    tag: "Turkey",
    email: "info@three15management.com",
  },
  {
    city: "Warsaw",
    tag: "Poland",
    email: "info@three15management.com",
  },
];

const departments = [
  ["Info", "info@three15management.com"],
  ["Magda", "magda@three15management.com"],
  ["Poli", "poli@three15management.com"],
  ["Alissa", "alissa@three15management.com"],
];

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const { model: modelSlug } = await searchParams;
  const model = typeof modelSlug === "string" ? await getModelBySlug(modelSlug) : null;

  return (
    <section className="container-x pt-28 pb-20 lg:pt-36 lg:pb-24">
      <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <p className="eyebrow mb-5 text-stone">Contact</p>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">
            Say <em>hello.</em>
          </h1>
          <p className="mt-8 max-w-md leading-relaxed text-stone">
            Get in touch for bookings, partnerships or press enquiries. Our team replies within 24 hours on business
            days.
          </p>

          <dl className="mt-12 space-y-4 border-t border-line pt-8">
            {departments.map(([label, email]) => (
              <div key={label} className="flex items-baseline justify-between gap-4">
                <dt className="eyebrow text-stone">{label}</dt>
                <dd>
                  <a href={`mailto:${email}`} className="link-underline text-sm font-medium">
                    {email}
                  </a>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <ContactForm
            key={model?.slug}
            defaultSubject={model ? "booking" : undefined}
            defaultMessage={model ? `Hello, we would like to make a booking request for ${fullName(model)}.` : undefined}
          />
        </div>
      </div>

      <div className="mt-24 grid gap-px bg-line sm:grid-cols-2 lg:mt-32">
        {offices.map((o) => (
          <div key={o.city} className="bg-paper py-10 sm:px-8 sm:first:pl-0">
            <p className="eyebrow text-stone">{o.tag}</p>
            <h2 className="font-display mt-2 text-2xl">{o.city}</h2>
            <address className="mt-6 space-y-1 text-sm leading-relaxed not-italic">
              <p>
                <a href={`mailto:${o.email}`} className="link-underline">
                  {o.email}
                </a>
              </p>
            </address>
          </div>
        ))}
      </div>
    </section>
  );
}
