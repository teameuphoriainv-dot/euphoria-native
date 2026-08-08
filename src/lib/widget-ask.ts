/**
 * UNIT 15d — which widget ask to show, and when.
 *
 * Duolingo asks THREE times and NEVER repeats its argument (§15.1): emotional at `112661`,
 * statistical at `112677`, transactional at `112739`. Copying the count without copying the
 * escalation is the version that reads as nagging, so the variant is derived from how many asks
 * have already been spent, not from a random pick.
 */
import { dayKey } from './store';

export type WidgetAskVariant = 'emotional' | 'statistical' | 'transactional';

export const WIDGET_ASK_XP = 50;

/**
 * The three arguments, in escalation order.
 *
 * `source` is NOT decoration and NOT optional for the statistical ask. §15.3b decision 2 permits a
 * sourced claim and forbids a bare number, because a reader assumes an unattributed figure is ours.
 * Headway `128565` is the reference: `+40% habit` with "Based on internal research, 2025" printed
 * under it. Ours is someone else's number, so the attribution names them.
 */
export const WIDGET_ASKS: Record<
  WidgetAskVariant,
  { lead: string; accentTail: string; body: string; source?: string; cta: string }
> = {
  emotional: {
    lead: 'Keep me where',
    accentTail: 'you can see me.',
    body: "Put Atlas on your home screen and your streak is the first thing you see. No opening the app to find out.",
    cta: 'Show me how',
  },
  statistical: {
    lead: 'The people who keep',
    accentTail: 'streaks, keep widgets.',
    body: 'Learners with a widget were 60% more likely to keep a month-long streak.',
    // Visible on screen, not a footnote in a doc. It is a competitor's number and it says so.
    source: 'Duolingo, reported in-app',
    cta: 'Show me how',
  },
  transactional: {
    lead: 'Add the widget,',
    accentTail: `take ${String(WIDGET_ASK_XP)} XP.`,
    body: 'Your streak on the home screen, and a one-off XP boost for setting it up.',
    cta: `Add it for ${String(WIDGET_ASK_XP)} XP`,
  },
};

const ORDER: WidgetAskVariant[] = ['emotional', 'statistical', 'transactional'];

/**
 * The next ask, or null.
 *
 * Two guards, both of which exist because the failure mode of a three-ask flow is being annoying:
 * never more than three in total, and never twice in one day. The day guard is what stops asks two
 * and three landing in the same session as ask one for a user who plays a lot on their first day.
 */
export function nextWidgetAsk(s: {
  widgetAsksSeen: number;
  widgetAskDay: string;
  widgetAdded: boolean;
}): WidgetAskVariant | null {
  if (s.widgetAdded) return null;
  if (s.widgetAsksSeen >= ORDER.length) return null;
  if (s.widgetAskDay === dayKey()) return null;
  return ORDER[s.widgetAsksSeen] ?? null;
}
