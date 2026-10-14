import Foundation

// The widget's STATE MACHINE, deliberately free of WidgetKit and SwiftUI.
//
// It lives in its own file for one reason: it is the only part of the widget that can be WRONG
// in a way a screenshot would not reveal. A mood that fires an hour late, or that reports "done"
// from yesterday's stale minutes, looks completely plausible on a home screen. Keeping it
// Foundation-only means scripts/widget-mood-test.swift can compile and exercise it on macOS,
// which is the only way any of this gets verified without a device.
//
// Everything here must stay PURE. The timeline computes entries for dates hours in the future,
// so a hidden Date() call would freeze every one of them to "now".

// MARK: - Data

struct WidgetData {
  let streak: Int
  let xp: Int
  let bestStreak: Int
  let minutesToday: Int
  let goalMinutes: Int
  /// The local day the app last wrote, as "yyyy-MM-dd". Matches src/lib/day-keys.ts.
  let dayKey: String
  /// The last day the user actually practised. The ONLY way the widget can tell a live streak
  /// from a dead one — the app never writes streak 0 on a miss.
  let lastActiveDay: String
  /// A gap is legitimate while freezes remain, so this gates the lapsed decision.
  let streakFreezes: Int
  /// False when the container is unreachable or the app has never written. Lets the view say
  /// something honest instead of confidently rendering a zero streak the user does not have.
  let hasData: Bool

  static let empty = WidgetData(streak: 0, xp: 0, bestStreak: 0, minutesToday: 0,
                                goalMinutes: 10, dayKey: "", lastActiveDay: "",
                                streakFreezes: 0, hasData: false)
}


// MARK: - Mood

/// One case per Atlas expression in targets/widget/Assets.xcassets. Nine states, nine assets,
/// nothing unused and nothing doing two jobs.
/*
 * THE SIX BUCKETS, AND THEIR WIDTHS ARE THE DESIGN.
 *
 * Reconstructed from Duolingo's widget schedule (SECONDARY source — the community catalogue,
 * corroborated across two independent queries; Duolingo has never published it):
 *
 *     00:00-03:59   4h    up late
 *     04:00-11:59   8h    morning, no pressure
 *     12:00-15:59   4h    midday
 *     16:00-19:59   4h    evening
 *     20:00-21:59   2h    <- narrows
 *     22:00-23:59   2h    <- narrows again
 *
 * The daytime buckets run 4-8 hours and the last two collapse to 2, so the widget changes face
 * TWICE AS OFTEN after 20:00. That acceleration IS the pressure curve. This file previously used
 * 05/12/18/22 — evenly spaced — which escalates linearly, and deadline pressure does not feel
 * linear.
 *
 * Deliberately NOT adopting the widely-repeated "11PM, 60-minute countdown": it traces to a single
 * user COMMENT on one blog, never the article body, and it contradicts the 22:00 boundary above.
 * Unverified folklore. We escalate at 22:00.
 */
let moodHours = [0, 4, 12, 16, 20, 22]

/// The widget's states. The ASSET is a separate lookup rather than the raw value, because two
/// states can legitimately wear the same face: a user who has never opened the app and a user who
/// simply has not practised yet this morning are both greeted by a neutral Atlas — but they are
/// different states with different copy, different heat, and different reasons to exist.
/// Forcing case names to equal asset names collided the moment that became true.
enum Mood: String {
  case noData, lapsed, doneFresh, doneSettled, milestone, doneLong
  case night, morning, afternoon, evening, urgent, late

  /// Which Atlas render this state wears. Several states may share one.
  var asset: String {
    switch self {
    case .noData, .morning:   return "atlas-default"  // neutral: nothing has gone wrong yet
    case .lapsed:           return "atlas-sad"
    case .doneFresh:        return "atlas-proud"
    case .doneSettled:      return "atlas-happy"
    case .milestone:        return "atlas-whoa"
    case .doneLong:         return "atlas-silly"
    // Duolingo ships ~25 illustrations across these buckets; we have NINE. So two pairs share a
    // face and are separated by copy and heat instead. Honest constraint, not a bug — and the
    // first thing to revisit if we generate more Atlas expressions.
    case .night, .evening:    return "atlas-watching"
    case .afternoon, .urgent: return "atlas-thinking"
    case .late:             return "atlas-oops"
    }
  }


  /*
   * THE BACKGROUND IS THE CLOCK. This replaced a flat orange wash at varying opacity, which was
   * the wrong mechanic entirely.
   *
   * Duolingo's 25-illustration set was studied directly (blog.duolingo.com/widget-feature). The
   * single biggest thing it does is NOT the mascot — it is a continuous HUE ROTATION across the
   * day: teal -> blue -> purple -> magenta -> red -> black, one hue per stage, as a gradient.
   * Their tiles are legible as early/late from six feet away with the owl covered up. A
   * one-colour wash at 8% vs 42% opacity is not readable at a glance; a hue change is.
   *
   * Done states deliberately go COOL and calm rather than pale — Duolingo relaxes to pastels, but
   * this app is dark-first, so relief is expressed as a settled violet-green instead of a bright
   * one. The point is the same: finishing visibly changes the temperature of the tile.
   */
  var gradient: (String, String) {
    switch self {
    case .noData:      return ("1A1824", "0E0C16")   // inert
    case .night:       return ("1B2A6B", "0E1330")   // deep indigo, small hours
    case .morning:     return ("0E5A63", "0B2E3C")   // teal, calm
    case .afternoon:   return ("1E4FA3", "13244F")   // blue
    case .evening:     return ("6A2BAF", "2E1257")   // violet
    case .urgent:      return ("A8207A", "4A0C37")   // magenta
    case .late:        return ("A31B1B", "3D0A0A")   // red
    case .lapsed:      return ("15121C", "07060A")   // void
    case .doneFresh,
         .doneSettled,
         .doneLong:    return ("1F6B4A", "0C2A20")   // settled green
    case .milestone:   return ("7A3BD1", "2A1052")   // brand violet, celebratory
    }
  }

  /*
   * THE FLAME HAS THREE STATES, which the tile reads even when the number does not change.
   * Duolingo uses a hollow outline flame while a streak is unfinished, adds a red "!" badge once
   * it is genuinely at risk, and fills the flame solid orange once the lesson is done. Ours drew
   * one solid flame in every state, so "done" and "about to lose it" looked identical.
   */
  var flameFilled: Bool {
    switch self {
    case .doneFresh, .doneSettled, .doneLong, .milestone: return true
    default: return false
    }
  }

  var flameBadge: Bool {
    switch self { case .urgent, .late, .lapsed: return true; default: return false }
  }

}

private let milestones: Set<Int> = [7, 14, 30, 50, 100, 180, 365]

/// PURE. Given an instant and the mirrored data, what should the widget look like AT that instant?
/// Nothing here may read the clock or any runtime state — the whole timeline is computed at build
/// time for dates hours in the future, so a hidden `Date()` would freeze every entry to "now".
func mood(at date: Date, data: WidgetData, calendar: Calendar = .current) -> Mood {
  guard data.hasData else { return .noData }

  // Is the mirrored progress actually about the day being rendered? minutesToday is only
  // meaningful for the day it was written. If the user practised yesterday and has not opened
  // the app since, this container still holds yesterday's minutes — rendering that as "done"
  // would tell a user their streak was safe when it is not, which is the one lie a streak
  // widget must never tell.
  let fresh = data.dayKey == Self_dayKey(date, calendar: calendar)
  let done = fresh && data.goalMinutes > 0 && data.minutesToday >= data.goalMinutes

  if done {
    if milestones.contains(data.streak) { return .milestone }
    // A day-seeded alternate so a long streak does not show the identical tile for months.
    // Seeded off the day, never random: the provider must return the same entry every time it
    // is asked, or the widget flickers between renders of the same instant.
    if data.streak >= 30 && Self_daySeed(date, calendar: calendar) % 3 == 0 { return .doneLong }
    return .doneSettled
  }

  /*
   * LAPSED IS DERIVED, NOT READ. The app never writes streak 0 on a miss, so the old condition
   * (streak == 0 && bestStreak > 0) was unreachable and this branch never fired.
   *
   * A streak is alive if the user practised today or yesterday. Older than that with freezes
   * remaining is still legitimate — a freeze is exactly permission to miss a day — so lapsed
   * requires no freezes left. Conservative on purpose: showing a live streak as dead is a worse
   * error than the reverse.
   */
  if !data.lastActiveDay.isEmpty && data.streak > 0 && data.streakFreezes == 0 {
    let today = Self_dayKey(date, calendar: calendar)
    let yesterday = Self_dayKey(date.addingTimeInterval(-86_400), calendar: calendar)
    if data.lastActiveDay != today && data.lastActiveDay != yesterday { return .lapsed }
  }

  let hour = calendar.component(.hour, from: date)
  switch hour {
  case 22..<24: return .late
  case 20..<22: return .urgent
  case 16..<20: return .evening
  case 12..<16: return .afternoon
  case 4..<12:  return .morning
  default:      return .night      // 00:00-03:59
  }
}

/// "yyyy-MM-dd" in the device's current timezone. Must match src/lib/day-keys.ts, which builds
/// the same string by offsetting a Date by its timezone and slicing the ISO form.
/*
 * GREGORIAN, NOT Calendar.current.
 *
 * Calendar.current honours the user's Region CALENDAR setting, not just their timezone.
 * day-keys.ts builds its key with toISOString(), which is always proleptic Gregorian. On a device
 * set to Buddhist (the default in Thailand), Japanese, or Republic-of-China calendars the two
 * disagree completely — "2569-09-09" vs "2026-09-09" — so dayKey never matches, `fresh` is
 * permanently false, and the user's finished goal reads "Still time" forever.
 *
 * The .hour component is identical across calendar identifiers, so the bucket switch is
 * unaffected and still correctly uses the device calendar via Calendar.current.
 */
let dayCalendar: Calendar = {
  var c = Calendar(identifier: .gregorian)
  c.timeZone = .current
  return c
}()

func Self_dayKey(_ date: Date, calendar: Calendar = dayCalendar) -> String {
  let c = calendar.dateComponents([.year, .month, .day], from: date)
  return String(format: "%04d-%02d-%02d", c.year ?? 0, c.month ?? 0, c.day ?? 0)
}

private func Self_daySeed(_ date: Date, calendar: Calendar = dayCalendar) -> Int {
  let c = calendar.dateComponents([.year, .month, .day], from: date)
  return (c.year ?? 0) * 10000 + (c.month ?? 0) * 100 + (c.day ?? 0)
}

// MARK: - Copy

/// Caption budget is brutal: systemSmall is as narrow as 141pt on a 568pt device, and an Atlas
/// render plus padding leaves roughly 12-16 characters on one line. Every string here is <= 16.
func caption(for mood: Mood, data: WidgetData) -> String {
  switch mood {
  case .noData:      return "Open Euphoria"
  case .lapsed:      return "Start again"
  case .doneFresh:   return "See you tmrw"
  case .doneSettled, .doneLong: return "day streak"
  case .milestone:   return "days. Huge."
  case .night:       return "Up late?"
  case .morning:     return "Not done yet"
  case .afternoon:   return "Still time"
  case .evening:     return "Tonight?"
  case .urgent:      return "2 hours left"
  case .late:        return "Ends at 12"
  }
}

// MARK: - Timeline dates

/*
 * The instants the timeline emits, extracted from the TimelineProvider so it can be tested.
 *
 * It was NOT testable before, and that is exactly how a duplicate survived: moodHours had gained
 * hour 0 while a separate "midnight" block still emitted the same instant, so every night carried
 * two entries for the same date — in every timezone — at the one boundary where a streak is lost.
 * Nothing caught it because nothing exercised entry generation at all.
 */
func timelineDates(from now: Date, calendar: Calendar = .current, days: Int = 3) -> [Date] {
  var out: [Date] = []
  for dayOffset in 0..<days {
    guard let day = calendar.date(byAdding: .day, value: dayOffset, to: now) else { continue }
    for hour in moodHours {
      if let d = calendar.date(bySettingHour: hour, minute: 0, second: 0, of: day), d > now {
        out.append(d)
      }
    }
  }
  return out.sorted()
}

// MARK: - Streak tiers

/*
 * THE FLAME EARNS ITS COLOUR. Ported verbatim from the web app's canonical streak component,
 * src/features/home/components/StreakDisplay.tsx in euphoriaweb-current, which documents the
 * ladder in its own header comment.
 *
 * The widget previously painted every streak the same orange, so a 128-day streak looked exactly
 * like day one and the entire progression — which is a reward, not decoration — was invisible on
 * the one surface the user sees most often.
 *
 * These are NOT theme.ts tokens and deliberately are not routed through the asset catalog: they
 * are a product ladder owned by StreakDisplay.tsx, and the honest thing is to mirror that file
 * rather than invent a parallel set. If the web ladder changes, change it here and say so.
 */
struct FlameTier {
  let hex: String
  let label: String
}

func flameTier(for streak: Int) -> FlameTier {
  switch streak {
  case 100...:  return FlameTier(hex: "EC4899", label: "pink")
  case 70...99: return FlameTier(hex: "AE66ED", label: "violet")
  case 50...69: return FlameTier(hex: "3B82F6", label: "blue")
  case 30...49: return FlameTier(hex: "B862ED", label: "purple")
  case 14...29: return FlameTier(hex: "EAB308", label: "yellow")
  case 7...13:  return FlameTier(hex: "EF4444", label: "red")
  default:      return FlameTier(hex: "F97316", label: "orange")   // == theme.dark.streak
  }
}
