import Foundation

// Exercises targets/widget/mood.swift on macOS. Compile both together:
//   node scripts/widget-mood-test.mjs
// (Swift requires top-level code to live in a file named main.swift, so the runner copies this
// file to a temp main.swift before compiling — see that script.)
//
// This exists because the widget's state machine is the only part of it that can be wrong in a
// way a screenshot would not reveal. A mood that fires an hour late, or that reports "done" from
// yesterday's stale minutes, looks entirely plausible on a Home Screen.

let allCases: [Mood] = [.noData,.lapsed,.doneFresh,.doneSettled,.milestone,.doneLong,.night,.morning,.afternoon,.evening,.urgent,.late]
var failures = 0
func check(_ name: String, _ got: Mood, _ want: Mood) {
  if got == want { print("  ok    \(name)") }
  else { print("  FAIL  \(name): got .\(got.rawValue), want .\(want.rawValue)"); failures += 1 }
}

let cal = Calendar.current
func at(_ y: Int, _ mo: Int, _ d: Int, _ h: Int) -> Date {
  cal.date(from: DateComponents(year: y, month: mo, day: d, hour: h, minute: 30))!
}
func data(streak: Int = 5, best: Int = 5, mins: Int = 0, goal: Int = 10,
          day: String = "2026-09-20", active: String? = nil, freezes: Int = 0,
          has: Bool = true) -> WidgetData {
  // lastActiveDay defaults to the same day as dayKey: a user who is up to date. Tests that care
  // about lapsing pass it explicitly.
  WidgetData(streak: streak, xp: 100, bestStreak: best, minutesToday: mins,
             goalMinutes: goal, dayKey: day, lastActiveDay: active ?? day,
             streakFreezes: freezes, hasData: has)
}

let today = at(2026, 9, 20, 14)

print("no data")
check("container unreachable", mood(at: today, data: data(has: false)), .noData)

print("\nSTALENESS — the lie the widget must never tell")
// Practised YESTERDAY to goal, has not opened the app today. minutesToday still reads 10.
let stale = data(mins: 10, goal: 10, day: "2026-09-19")
check("yesterday's minutes are not today's, 14:00", mood(at: today, data: stale), .afternoon)
check("yesterday's minutes are not today's, 23:00", mood(at: at(2026,9,20,23), data: stale), .late)
check("same data ON its own day reads done", mood(at: at(2026,9,19,14), data: stale), .doneSettled)

print("\ndone today")
check("goal met", mood(at: today, data: data(mins: 10, goal: 10)), .doneSettled)
check("goal exceeded", mood(at: today, data: data(mins: 40, goal: 10)), .doneSettled)
check("partial does NOT count as done", mood(at: today, data: data(mins: 9, goal: 10)), .afternoon)
check("milestone streak", mood(at: today, data: data(streak: 30, mins: 10)), .milestone)
// streak 8: not a milestone, and under 30 so the day-seeded doneLong alternate cannot fire.
check("non-milestone streak", mood(at: today, data: data(streak: 8, mins: 10, goal: 10)), .doneSettled)

print("\nlapsed vs never started")
// LAPSED IS NOW DERIVED FROM lastActiveDay. The old condition (streak 0 && best > 0) was
// unreachable: nextStreak() never returns 0, so the app cannot produce that state.
check("lapsed: last active 3 days ago, no freezes",
      mood(at: today, data: data(streak: 12, active: "2026-09-17")), .lapsed)
check("NOT lapsed: practised yesterday",
      mood(at: today, data: data(streak: 12, active: "2026-09-19")), .afternoon)
check("NOT lapsed: gap but a freeze remains",
      mood(at: today, data: data(streak: 12, active: "2026-09-17", freezes: 1)), .afternoon)
check("never started: streak 0", mood(at: today, data: data(streak: 0, best: 0)), .afternoon)

print("\ntime buckets, not done")
let nd = data(mins: 0)
// THE SIX BUCKETS, both edges of each. The widths matter more than the faces: the last two are
// 2h where the daytime ones are 4-8h, and that acceleration is the whole pressure curve.
check("00:30 night",      mood(at: at(2026,9,20,0),  data: nd), .night)
check("03:30 night",      mood(at: at(2026,9,20,3),  data: nd), .night)
check("04:30 morning",    mood(at: at(2026,9,20,4),  data: nd), .morning)
check("11:30 morning",    mood(at: at(2026,9,20,11), data: nd), .morning)
check("12:30 afternoon",  mood(at: at(2026,9,20,12), data: nd), .afternoon)
check("15:30 afternoon",  mood(at: at(2026,9,20,15), data: nd), .afternoon)
check("16:30 evening",    mood(at: at(2026,9,20,16), data: nd), .evening)
check("19:30 evening",    mood(at: at(2026,9,20,19), data: nd), .evening)
check("20:30 urgent",     mood(at: at(2026,9,20,20), data: nd), .urgent)
check("21:30 urgent",     mood(at: at(2026,9,20,21), data: nd), .urgent)
check("22:30 late",       mood(at: at(2026,9,20,22), data: nd), .late)
check("23:30 late",       mood(at: at(2026,9,20,23), data: nd), .late)

// THE BACKGROUND HUE MUST ACTUALLY DIFFER PER STAGE. `heat` (one orange at varying opacity)
// was replaced by a gradient whose HUE carries the time of day — the mechanic Duolingo's tiles
// are built on. A stage reusing another stage's gradient means two times of day look identical,
// which is the exact failure a glanceable widget cannot have. Also asserts every state is
// covered, so adding a Mood without a gradient fails here rather than shipping a default.
let stages: [Mood] = [.night, .morning, .afternoon, .evening, .urgent, .late]
var seenGradients: [String: Mood] = [:]
var gradientsUnique = true
for m in allCases {
  let key = m.gradient.0 + m.gradient.1
  if let prior = seenGradients[key], !(m.flameFilled && prior.flameFilled) {
    print("  FAIL  \(m) reuses \(prior)'s gradient"); gradientsUnique = false; failures += 1
  }
  seenGradients[key] = m
}
if gradientsUnique { print("  ok    every stage has its own gradient (done-states may share)") }
// And the ladder must get DARKER/hotter toward midnight, not lighter.
let lateLum = Int(Mood.late.gradient.0.prefix(2), radix: 16) ?? 0
let mornLum = Int(Mood.morning.gradient.0.prefix(2), radix: 16) ?? 0
print(lateLum > mornLum ? "  ok    late is hotter in red than morning"
                        : "  FAIL  late is not hotter than morning"); if lateLum <= mornLum { failures += 1 }

print("\npurity — the timeline computes future entries, so this must never drift")
let a = mood(at: today, data: nd), b = mood(at: today, data: nd)
check("same input, same output", a, b)
var futureStable = true
// Must carry a lastActiveDay near the rendered date, or the (correct) lapse logic fires and this
// asserts the wrong thing — which it did the moment lapsing started working.
let far = data(mins: 0, day: "2026-12-25", active: "2026-12-25")
for _ in 0..<50 where mood(at: at(2026,12,25,23), data: far) != .late { futureStable = false }
print(futureStable ? "  ok    a date 3 months out is stable across 50 calls"
                   : "  FAIL  future date is not stable"); if !futureStable { failures += 1 }

// doneFresh is intentionally unreachable until a completion timestamp is synced — see mood.swift.
// Asserting that here means the day someone wires goalMetAt, this test fails and tells them to
// add the real case rather than leaving a state that silently never fires.
print("\nknown gap")
let allMoods: [Mood] = allCases
var reachable = Set<String>()
// Sweep DATES as well as hours. The first version of this pinned the date to one day and
// reported .doneLong(silly) as unreachable — but doneLong is day-SEEDED (streak >= 30 and
// daySeed % 3 == 0), so on a single day it genuinely never fires. The bug was in the test.
for day in 1...31 {
  for h in 0..<24 {
    for d in [data(has:false), data(mins:0), data(mins:10), data(streak:0,best:9),
              data(streak:30,mins:10), data(streak:0,best:0),
              // 45: >= 30 so doneLong is eligible, and NOT in the milestone set. Without this the
              // sweep only ever passed streak 30, which milestone claims first — so .doneLong
              // looked unreachable when it was simply never exercised.
              data(streak:45,mins:10)] {
      reachable.insert(mood(at: at(2026,9,day,h), data: d).rawValue)
    }
  }
}
let unreachable = allMoods.filter { !reachable.contains($0.rawValue) }.map(\.rawValue)
if unreachable == ["doneFresh"] { print("  ok    only .doneFresh is unreachable, as documented") }
else { print("  FAIL  unreachable set changed: \(unreachable) — expected exactly [proud]"); failures += 1 }

// THE COPY BUDGET IS A RULE, NOT A PREFERENCE.
// systemSmall is as narrow as 141pt on a 568pt device. With an Atlas render and padding, that
// leaves roughly 12-16 characters on one line. A caption that overflows does not wrap gracefully
// in a widget — it truncates or shrinks, and either one looks broken. Enforcing it here means a
// future copy edit fails the build instead of shipping a clipped line nobody screenshots.
// ── BOUNDARY ALIGNMENT ──────────────────────────────────────────────────────────────────────
// The timeline emits entries ONLY at moodHours. If mood() changes at an hour that is not in that
// list, the widget keeps rendering the previous face until the next emitted entry — a state that
// silently never appears. If moodHours contains an hour where mood() does NOT change, we spend a
// timeline entry on a no-op. Neither is visible by looking at the widget.
//
// Kept in sync by hand because moodHours lives in index.swift (WidgetKit) and cannot be imported
// into this Foundation-only test. This assertion IS the sync.
print("\nboundary alignment (moodHours vs mood() buckets)")
let moodHoursMirror = moodHours   // now the REAL constant, not a hand-kept copy
let ndAll = data(mins: 0)
var changeHours: [Int] = []
for h in 0..<24 {
  let prev = mood(at: at(2026,9,20,(h + 23) % 24), data: ndAll)
  let cur  = mood(at: at(2026,9,20,h), data: ndAll)
  if prev != cur { changeHours.append(h) }
}
if changeHours.sorted() == moodHoursMirror.sorted() {
  print("  ok    mood() changes at exactly \(changeHours.sorted()) — matches moodHours")
} else {
  print("  FAIL  mood() changes at \(changeHours.sorted()) but moodHours emits \(moodHoursMirror.sorted())")
  failures += 1
}

print("\ntimeline entry generation")
do {
  let base = at(2026,9,20,13)
  let ds = timelineDates(from: base)
  let unique = Set(ds).count == ds.count
  let sorted = ds == ds.sorted()
  let future = ds.allSatisfy { $0 > base }
  print(unique ? "  ok    no duplicate instants (\(ds.count) entries)"
               : "  FAIL  \(ds.count - Set(ds).count) duplicate instant(s)"); if !unique { failures += 1 }
  print(sorted ? "  ok    entries are sorted" : "  FAIL  entries out of order"); if !sorted { failures += 1 }
  print(future ? "  ok    every entry is in the future" : "  FAIL  a past entry was emitted"); if !future { failures += 1 }
  // Apple requires >= ~5 min between entries.
  let tooClose = zip(ds, ds.dropFirst()).contains { $1.timeIntervalSince($0) < 300 }
  print(!tooClose ? "  ok    entries are >= 5 min apart" : "  FAIL  entries closer than 5 minutes"); if tooClose { failures += 1 }
}

// The ladder is ported from the web app's StreakDisplay.tsx. If that file changes and this does
// not, the same streak shows two different colours on two surfaces — and nobody would notice,
// because each surface looks internally consistent.
print("\nflame tier ladder (mirrors web StreakDisplay.tsx)")
let ladder: [(Int, String)] = [(0,"orange"),(6,"orange"),(7,"red"),(13,"red"),(14,"yellow"),
                               (29,"yellow"),(30,"purple"),(49,"purple"),(50,"blue"),(69,"blue"),
                               (70,"violet"),(99,"violet"),(100,"pink"),(365,"pink")]
for (n, want) in ladder {
  let got = flameTier(for: n).label
  if got == want { print("  ok    \(n) day -> \(got)") }
  else { print("  FAIL  \(n) day -> \(got), want \(want)"); failures += 1 }
}
// Tier 0 must stay identical to the theme token, or the widget's default flame drifts from the app.
if flameTier(for: 1).hex.uppercased() == "F97316" { print("  ok    tier 0 == theme.dark.streak #F97316") }
else { print("  FAIL  tier 0 is #\(flameTier(for: 1).hex), theme.dark.streak is #F97316"); failures += 1 }

print("\ncaption budget (<= 16 chars, systemSmall floor is 141pt)")
for m: Mood in allCases {
  let c = caption(for: m, data: data())
  if c.count <= 16 { print("  ok    \(m.rawValue): \"\(c)\" (\(c.count))") }
  else { print("  FAIL  \(m.rawValue): \"\(c)\" is \(c.count) chars, budget is 16"); failures += 1 }
}

print("\nevery mood maps to an asset that exists")
for m: Mood in allCases {
  let path = "targets/widget/Assets.xcassets/\(m.asset).imageset/Contents.json"
  if FileManager.default.fileExists(atPath: path) { print("  ok    \(m.asset)") }
  else { print("  FAIL  \(m.asset) has no imageset at \(path)"); failures += 1 }
}

print("")
if failures > 0 { print("widget-mood-test: \(failures) FAILURE(S)"); exit(1) }
print("widget-mood-test: OK")
