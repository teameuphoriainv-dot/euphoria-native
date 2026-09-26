#!/usr/bin/env node
/** Pins the streak reminder rules (src/lib/streak-reminder.ts). */
import assert from 'node:assert/strict';

const { nearestReminderCopy, reminderDayOffsets, GENERIC_REMINDER } = await import('../src/lib/streak-reminder.ts');

assert.deepEqual(reminderDayOffsets({ activeToday: true, nowHour: 9, hour: 19 }), [1, 2, 3, 4, 5, 6, 7], 'never remind on a day already practised');
assert.deepEqual(reminderDayOffsets({ activeToday: false, nowHour: 9, hour: 19 }).slice(0, 2), [0, 1], 'remind tonight if not yet practised');
assert.equal(reminderDayOffsets({ activeToday: false, nowHour: 20, hour: 19 })[0], 1, 'never schedule a time already passed');
assert.match(nearestReminderCopy({ streak: 0, freezes: 0, repairLost: 12, repairLeft: 2 }).body, /2 lessons earn back your 12-day streak/);
assert.match(nearestReminderCopy({ streak: 12, freezes: 0, repairLost: 0, repairLeft: 0 }).title, /12-day streak ends at midnight/);
assert.match(nearestReminderCopy({ streak: 12, freezes: 1, repairLost: 0, repairLeft: 0 }).title, /freeze has tonight covered/);
assert.deepEqual(nearestReminderCopy({ streak: 0, freezes: 0, repairLost: 0, repairLeft: 0 }), GENERIC_REMINDER);
for (const c of [nearestReminderCopy({ streak: 3, freezes: 0, repairLost: 0, repairLeft: 0 }), GENERIC_REMINDER]) {
  assert.ok(!/lost|—/.test(c.title + c.body), 'no shame copy and no em dashes');
}
console.log('streak-reminder-pin: ok');
