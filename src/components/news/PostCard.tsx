import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/types";
import { cn, formatDate } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  size?: "lg" | "md";
  className?: string;
  priority?: boolean;
}

export function PostCard({ post, size = "md", className, priority }: PostCardProps) {
  return (
    <article className={cn("group", className)}>
      <Link href={`/news/${post.slug}`} className="block">
        <div className={cn("relative overflow-hidden bg-paper-dark", size === "lg" ? "aspect-[4/3] lg:aspect-[16/11]" : "aspect-[4/3]")}>
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority={priority}
            sizes={size === "lg" ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 30vw, 100vw"}
            className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
          />
          <span className="eyebrow absolute top-4 left-4 bg-paper px-3 py-1.5 text-[10px] text-ink">{post.category}</span>
        </div>
        <div className="mt-5">
          <time dateTime={post.publishedAt} className="text-xs text-stone">
            {formatDate(post.publishedAt)}
          </time>
          <h3
            className={cn(
              "font-display mt-2 leading-[1.05] tracking-tight text-balance transition-colors group-hover:text-clay",
              size === "lg" ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
            )}
          >
            {post.title}
          </h3>
          {size === "lg" && <p className="mt-4 max-w-xl leading-relaxed text-stone">{post.excerpt}</p>}
        </div>
      </Link>
    </article>
  );
}
