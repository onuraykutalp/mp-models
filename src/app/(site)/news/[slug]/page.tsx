import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/news/PostCard";
import { ArrowLeft } from "@/components/ui/Icons";
import { getPostBySlug, getPosts } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/news/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return post
    ? { title: post.title, description: post.excerpt, openGraph: { images: [post.coverImage] } }
    : { title: "Article not found" };
}

export default async function PostPage({ params }: PageProps<"/news/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const more = (await getPosts(4)).filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <article>
      <header className="container-x pt-28 lg:pt-36">
        <Link
          href="/news"
          className="group inline-flex items-center gap-2 text-sm text-stone transition-colors hover:text-ink"
        >
          <ArrowLeft width={16} height={16} className="transition-transform group-hover:-translate-x-1" />
          All news
        </Link>
        <div className="mx-auto mt-10 max-w-4xl text-center">
          <p className="eyebrow text-clay">{post.category}</p>
          <h1 className="font-display mt-4 text-3xl leading-tight text-balance sm:text-4xl">
            {post.title}
          </h1>
          <time dateTime={post.publishedAt} className="mt-6 block text-sm text-stone">
            {formatDate(post.publishedAt)}
          </time>
        </div>
      </header>

      <div className="container-x mt-12 lg:mt-16">
        <div className="relative aspect-[16/10] overflow-hidden bg-paper-dark lg:aspect-[21/9]">
          <Image src={post.coverImage} alt={post.title} fill priority sizes="100vw" className="object-cover" />
        </div>
      </div>

      <div className="container-x py-16 lg:py-24">
        <div className="mx-auto max-w-2xl">
          <p className="font-display text-3xl leading-snug">{post.excerpt}</p>
          <div className="mt-10 space-y-6 text-lg leading-relaxed text-ink-soft">
            {post.content.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>

      {more.length > 0 && (
        <section className="border-t border-line py-20 lg:py-28">
          <div className="container-x">
            <h2 className="font-display mb-8 text-3xl">
              More <em>stories</em>
            </h2>
            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
