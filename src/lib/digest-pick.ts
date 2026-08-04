/**
 * Which guide is "today".
 *
 * Extracted from digest.tsx because the guided first-run screen needs the same answer. A second
 * copy of this logic is exactly how the You tab and the league ended up naming different tiers for
 * the same user, so it lives in one place.
 */
import { DIGEST_POSTS } from './digest-content';
import { dayKey } from './store';

/** Fallback only, for when every guide has been read: rotate by day so the tab still offers
 *  something rather than going blank. */
const dayNumber = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86_400_000);

/**
 * Today's guide: the newest one not yet read, pinned to the day it was chosen on.
 *
 * This replaced `DIGEST_POSTS[dayNumber() % DIGEST_POSTS.length]`, which had three problems: a
 * newly published guide could wait 20 days to surface, adding one shifted the modulo so every
 * future day's pick changed, and it happily offered something already read while unread guides
 * sat in the list. Pinning matters because the choice depends on read state: without it, finishing
 * today's guide would immediately swap the card for a different one.
 */
export function pickToday(readPosts: string[], pinned: { day: string; slug: string } | null) {
  const day = dayKey();
  if (pinned?.day === day) {
    const still = DIGEST_POSTS.find((p) => p.slug === pinned.slug);
    if (still) return { day, post: still };
  }
  // DIGEST_POSTS is newest-first, so the first unread is the freshest unread
  const unread = DIGEST_POSTS.find((p) => !readPosts.includes(p.slug));
  return { day, post: unread ?? DIGEST_POSTS[dayNumber() % DIGEST_POSTS.length] };
}
