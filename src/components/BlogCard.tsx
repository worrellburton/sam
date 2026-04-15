import Link from "next/link";
import Image from "next/image";
import { isPostReleased, type BlogPost } from "@/data/blog";
import { BlogCardAudioBtn } from "./BlogCardAudioBtn";

// Pure Server Component — all interactive bits live inside
// <BlogCardAudioBtn />, which is a client island.

export interface BlogCardProps {
  post: BlogPost;
  showEpisode?: boolean;
  /** Override the card's coming-soon styling (used by the rotation teaser). */
  asComingSoon?: boolean;
  /** Optional custom "Coming …" label; falls back to post.date. */
  comingLabel?: string;
}

export function BlogCard({ post, showEpisode, asComingSoon, comingLabel }: BlogCardProps) {
  const isComingSoon =
    asComingSoon ?? Boolean(post.comingSoon && !isPostReleased(post));
  // An authored draft is not yet published, so we shouldn't link to it. A
  // derived teaser (asComingSoon=true on an already-released post) is a real
  // article — keep the link live.
  const isUnreleasedDraft = Boolean(post.comingSoon && !isPostReleased(post));

  return (
    <div className={`blog-card${isComingSoon ? " coming-soon" : ""}`}>
      <Link href={isUnreleasedDraft ? "#" : `/blog/${post.slug}`} className="blog-card-link">
        <div className="blog-card-img-wrap">
          <Image
            className="blog-card-img"
            src={post.image1x1 || post.image}
            alt={post.imageAlt}
            width={600}
            height={600}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {showEpisode && post.episode && (
            <span className="blog-card-ep">EP. {post.episode}</span>
          )}
          {isComingSoon && (
            <span className="blog-card-coming">
              {comingLabel ? comingLabel : `Coming ${post.date}`}
            </span>
          )}
        </div>
        <div className="blog-card-body">
          <div className="blog-card-tag-row">
            <span className="blog-card-tag">{post.tag}</span>
            {post.readTime && <span className="blog-card-meta">{post.readTime}</span>}
          </div>
          <h3>{post.title}</h3>
          <p>{post.excerpt}</p>
          <div className="blog-card-footer">
            <span className="blog-card-meta">{post.date}</span>
            {!isUnreleasedDraft && <BlogCardAudioBtn slug={post.slug} />}
          </div>
        </div>
      </Link>
    </div>
  );
}
