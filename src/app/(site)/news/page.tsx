import type { Metadata } from "next";
import { PostCard } from "@/components/news/PostCard";
import { Reveal } from "@/components/ui/Reveal";
import { getPosts } from "@/lib/queries";

export const metadata: Metadata = { title: "News" };
export const revalidate = 60;

export default async function NewsPage() {
  const [lead, ...rest] = await getPosts();

  return (
    <section className="container-x pt-28 pb-20 lg:pt-36 lg:pb-24">
      <p className="eyebrow mb-5 text-stone">Journal</p>
      <h1 className="font-display text-4xl leading-tight sm:text-5xl">
        News
      </h1>

      {lead && (
        <div className="mt-14 border-t border-line pt-10 lg:mt-20">
          <PostCard post={lead} size="lg" priority />
        </div>
      )}

      <div className="mt-20 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((post, i) => (
          <Reveal key={post.slug} delay={(i % 3) * 80}>
            <PostCard post={post} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
