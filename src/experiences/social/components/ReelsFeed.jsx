import { useEffect, useRef } from "react";
import VideoReel from "./VideoReel";
import ImageReel from "./ImageReel";
import ReelSkeleton from "./ReelSkeleton";
import { useInfiniteFeed } from "../hooks/useInfiniteFeed";
import { useLikes } from "../hooks/useLikes";

// Full-bleed vertical snap-scroll feed, one reel filling the screen at a
// time — swipe down/up (or scroll) advances to the next/previous reel, and
// each reel's own IntersectionObserver (see VideoReel.jsx) starts/stops its
// playback purely from how much of it is on screen.
export default function ReelsFeed() {
  const { posts, isInitialLoading, isLoadingMore, hasMore, loadMore } = useInfiniteFeed();
  const { isLiked, getCount, toggleLike } = useLikes();
  const sentinelRef = useRef(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "0px 0px 300% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  if (isInitialLoading) {
    return (
      <div className="h-full w-full">
        <ReelSkeleton />
      </div>
    );
  }

  return (
    <div className="no-scrollbar h-full w-full snap-y snap-mandatory overflow-y-scroll overscroll-y-contain">
      {posts.map((post, index) => {
        const props = {
          post,
          liked: isLiked(post.id),
          likeCount: getCount(post.id, post.likes),
          onToggleLike: () => toggleLike(post.id, post.likes),
        };

        return (
          <section key={post.id} className="relative h-full w-full snap-start snap-always">
            {post.type === "video" ? <VideoReel {...props} /> : <ImageReel {...props} />}
            {index === posts.length - 3 && (
              <div ref={sentinelRef} className="pointer-events-none absolute bottom-0 h-px w-full" />
            )}
          </section>
        );
      })}

      {isLoadingMore && (
        <section className="relative h-full w-full snap-start snap-always">
          <ReelSkeleton />
        </section>
      )}

      {!hasMore && !isLoadingMore && (
        <section className="relative flex h-full w-full snap-start snap-always items-center justify-center bg-tide-navy">
          <p className="text-sm font-medium text-white/70">You're all caught up ✦</p>
        </section>
      )}
    </div>
  );
}
