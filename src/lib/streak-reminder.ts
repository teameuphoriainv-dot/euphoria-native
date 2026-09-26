/**
 * The evening streak reminder, as pure rules (pinned by scripts/streak-reminder-pin.mjs).
 * Duolingo's reminder is about what is at stake TONIGHT and never fires on a day already done,
 * so: rolling one-shot reminders for the next days, skipping today once practised, and only the
 * nearest one carries state-specific copy (it is the one the current state is true for).
 */
export type ReminderState = { streak: number; freezes: number; repairLost: number; repairLeft: number };

export const GENERIC_REMINDER = { title: 'Keep your streak alive', body: 'Five minutes with Atlas is all it takes.' };

export function nearestReminderCopy(p: ReminderState): { title: string; body: string } {
  if (p.repairLost > 0) {
    const n = `${String(p.repairLeft)} ${p.repairLeft === 1 ? 'lesson' : 'lessons'}`;
    return { title: 'Win your streak back', body: `${n} earn back your ${String(p.repairLost)}-day streak.` };
  }
  if (p.streak > 0 && p.freezes > 0) return { title: 'A freeze has tonight covered', body: 'A lesson saves it for later.' };
  if (p.streak > 0) return { title: `Your ${String(p.streak)}-day streak ends at midnight`, body: 'Five minutes with Atlas keeps it going.' };
  return GENERIC_REMINDER;
}

/** Which days (0 = today) get a reminder: today is skipped once practised or past the hour. */
export function reminderDayOffsets(p: { activeToday: boolean; nowHour: number; hour: number }, count = 7): number[] {
  const start = p.activeToday || p.nowHour >= p.hour ? 1 : 0;
  return Array.from({ length: count }, (_, i) => start + i);
}
