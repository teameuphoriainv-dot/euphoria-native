import WidgetKit
import SwiftUI

// UNIT 15d — the four rotating states §15.3b decision 6 promised, finally built, plus the five
// that fell out of having nine Atlas expressions available.
//
// THE ARCHITECTURAL DECISION, and everything else follows from it: mood is keyed to LOCAL
// WALL-CLOCK TIME x DONE-TODAY, not to "hours since last practice". Three reasons.
//   1. Midnight is the actual deadline. A streak is lost at 00:00, not N hours after a lesson.
//   2. Time is computable INSIDE the widget process with zero data sync, so the mood can change
//      on a schedule iOS already holds rather than on a reload we have to pay for.
//   3. It makes `mood` a pure function of (date, data), which is what lets one timeline
//      pre-compute every state for the next two days. See getTimeline.

private let appGroup = "group.com.euphoriainv.euphoria"

/// Wall-clock boundaries where the mood can change. Entries are emitted at exactly these hours,
/// so a transition lands on the boundary instead of whenever a poll happened to fire.
// moodHours lives in mood.swift, beside the switch it must agree with.


struct EuphoriaEntry: TimelineEntry {
  let date: Date
  let data: WidgetData
  let mood: Mood
}

// MARK: - Provider

struct Provider: TimelineProvider {
  private func read() -> WidgetData {
    guard let d = UserDefaults(suiteName: appGroup), d.object(forKey: "dayKey") != nil else {
      return .empty
    }
    return WidgetData(
      streak: d.integer(forKey: "streak"),
      xp: d.integer(forKey: "xp"),
      bestStreak: d.integer(forKey: "bestStreak"),
      minutesToday: d.integer(forKey: "minutesToday"),
      goalMinutes: max(1, d.integer(forKey: "goalMinutes")),
      dayKey: d.string(forKey: "dayKey") ?? "",
      lastActiveDay: d.string(forKey: "lastActiveDay") ?? "",
      streakFreezes: d.integer(forKey: "streakFreezes"),
      hasData: true
    )
  }

  private func entry(at date: Date, _ data: WidgetData) -> EuphoriaEntry {
    EuphoriaEntry(date: date, data: data, mood: mood(at: date, data: data))
  }

  func placeholder(in context: Context) -> EuphoriaEntry {
    let d = WidgetData(streak: 12, xp: 340, bestStreak: 12, minutesToday: 10, goalMinutes: 10,
                       dayKey: Self_dayKey(Date()), lastActiveDay: Self_dayKey(Date()),
                       streakFreezes: 0, hasData: true)
    return entry(at: Date(), d)
  }

  func getSnapshot(in context: Context, completion: @escaping (EuphoriaEntry) -> Void) {
    completion(context.isPreview ? placeholder(in: context) : entry(at: Date(), read()))
  }

  /*
   * ONE RELOAD, MANY ENTRIES.
   *
   * Apple budgets a widget roughly 40-70 refreshes a day and tells you to "generate a timeline
   * for as many future dates as possible". The previous version of this file did the exact
   * opposite: a single entry with `.after(now + 1 hour)`, which burned ~24 of that budget every
   * day to re-render a state that only actually changes six times.
   *
   * Because `mood` is pure, every future state is computable NOW. Rendering a future entry costs
   * nothing — only the reload costs. So this emits today's remaining boundaries and all of
   * tomorrow's, and iOS transitions through them with no further budget spend.
   *
   * The consequence worth understanding: if the budget is exhausted, the widget still moves
   * correctly through every mood for the next two days. It just will not pick up NEW practice
   * data until the app next foregrounds — and the app-side reloadWidget() handles that instantly.
   * Correctness degrades to staleness, never to a frozen wrong state.
   */
  func getTimeline(in context: Context, completion: @escaping (Timeline<EuphoriaEntry>) -> Void) {
    let cal = Calendar.current
    let now = Date()
    let data = read()

    // Always render NOW first, or the tile shows nothing until the next boundary.
    var entries = [entry(at: now, data)]

    let dates = timelineDates(from: now, calendar: cal)

    entries.append(contentsOf: dates.sorted().map { entry(at: $0, data) })
    // .atEnd asks for a new timeline once the last entry passes — two days out, so the next
    // request costs one refresh rather than twenty-four.
    completion(Timeline(entries: entries, policy: .atEnd))
  }
}

// MARK: - Scene

/*
 * THE TILE IS A PLACE, NOT A SWATCH.
 *
 * Duolingo's set puts Duo IN somewhere — standing in fire, under a spotlight, out at night. That
 * environmental storytelling is most of why 25 of their tiles read as 25 situations rather than
 * 25 moods. We cannot commission 25 illustrations, but these are cheap SwiftUI shapes over the
 * gradient and they buy a real part of the same effect.
 *
 * Deliberately behind the content and low-contrast: the number and caption still have to clear
 * WCAG against the gradient underneath, and a scene that competes with them is a worse tile than
 * no scene at all.
 */
struct Scene: View {
  let mood: Mood

  var body: some View {
    GeometryReader { g in
      let w = g.size.width, h = g.size.height
      switch mood {
      case .night:
        // Small hours: a quiet star field.
        ForEach(Array([(0.14,0.16,1.5),(0.31,0.09,1.0),(0.68,0.13,1.3),(0.86,0.21,0.9),
                       (0.24,0.30,0.8),(0.78,0.34,1.1),(0.54,0.07,1.2)].enumerated()), id: \.offset) { _, s in
          Circle().fill(Color.white.opacity(0.55))
            .frame(width: s.2 * 2, height: s.2 * 2)
            .position(x: w * s.0, y: h * s.1)
        }
      case .late:
        /*
         * A GLOW, NOT FLAMES. The first attempt drew flame shapes from capsules with a gradient
         * and it read as an orange barcode along the bottom edge — worse than no scene, and it
         * collided with the caption.
         *
         * That failure is the useful part: procedural composition handles ATMOSPHERE (light,
         * stars, haze) because those are simple geometry, and it cannot handle REPRESENTATION
         * (fire, objects, anything with a recognisable silhouette). Those need an illustrator.
         * A heat glow says "late and urgent" honestly; fake flames said "unfinished".
         */
        LinearGradient(colors: [hexColor("FF8A2B").opacity(0.0), hexColor("FF6A1F").opacity(0.42)],
                       startPoint: .center, endPoint: .bottom)
      case .lapsed:
        // A cold shaft of light on an empty stage.
        Path { p in
          p.move(to: CGPoint(x: w * 0.5, y: -h * 0.05))
          p.addLine(to: CGPoint(x: w * 0.88, y: h))
          p.addLine(to: CGPoint(x: w * 0.12, y: h))
          p.closeSubpath()
        }
        .fill(LinearGradient(colors: [Color.white.opacity(0.13), Color.white.opacity(0.0)],
                             startPoint: .top, endPoint: .bottom))
      case .milestone:
        ForEach(Array([(0.16,0.22),(0.84,0.18),(0.74,0.40),(0.26,0.42)].enumerated()), id: \.offset) { _, s in
          Image(systemName: "sparkle")
            .font(.system(size: w * 0.10))
            .foregroundStyle(hexColor("FFE9A8").opacity(0.75))
            .position(x: w * s.0, y: h * s.1)
        }
      default:
        EmptyView()
      }
    }
  }
}

// MARK: - Views

/// Small helper so the streak ladder can live as hex in mood.swift rather than as seven more
/// colorsets in the asset catalog, which would imply they are theme tokens. They are not.
func hexColor(_ h: String) -> Color {
  let v = UInt32(h, radix: 16) ?? 0
  return Color(.sRGB,
               red: Double((v >> 16) & 0xff) / 255,
               green: Double((v >> 8) & 0xff) / 255,
               blue: Double(v & 0xff) / 255)
}


struct StreakLine: View {
  let entry: EuphoriaEntry
  let size: CGFloat

  var body: some View {
    HStack(spacing: 5) {
      ZStack(alignment: .topTrailing) {
        // HOLLOW until the lesson is done, SOLID once it is. Duolingo's tiles read done/not-done
        // from the flame alone, before you parse the number — ours drew the same solid flame in
        // every state, so the most important bit of information was carried by nothing.
        Image(systemName: entry.mood.flameFilled ? "flame.fill" : "flame")
          .font(.system(size: size * 0.62, weight: .semibold))
          .foregroundStyle(entry.data.hasData ? hexColor(flameTier(for: entry.data.streak).hex)
                                              : Color("brandFlame"))
        // The "!" badge appears only once the streak is genuinely at risk.
        if entry.mood.flameBadge {
          Circle().fill(Color("textPrimary")).frame(width: size * 0.26, height: size * 0.26)
            .overlay(Text("!").font(.system(size: size * 0.19, weight: .black))
                       .foregroundStyle(hexColor("A31B1B")))
            .offset(x: size * 0.12, y: -size * 0.06)
        }
      }
      // hasData false means the App Group was unreachable or never written. entry.data.streak is
      // whatever the struct defaulted to, NOT a streak this user owns — rendering it invents a
      // number. An em dash is honest and still fills the same slot.
      Text(entry.data.hasData ? "\(entry.data.streak)" : "—")
        .font(.system(size: size, weight: .bold, design: .rounded))
        .foregroundStyle(Color("textPrimary"))
        // Digits roll rather than cross-fade when the streak changes between entries.
        .contentTransition(.numericText())
    }
  }
}

struct EuphoriaWidgetView: View {
  @Environment(\.widgetFamily) var family
  let entry: EuphoriaEntry

  /*
   * widgetAccentedRenderingMode is declared on Image, NOT on View, and it is iOS 18+.
   *
   * Its position in the chain is load-bearing and took two compile errors to find. It takes an
   * Image and RETURNS `some View`, so it cannot go last (after .scaledToFit() the Image type is
   * already gone) and it cannot go first (then .resizable(), which is also Image-only, has
   * nothing to attach to). It goes between them. It also cannot be applied unconditionally,
   * because this target now deploys to iOS 17.
   *
   * What it buys: when a user tints their Home Screen on iOS 18, .fullColor keeps Atlas in his
   * own colours instead of being flattened into the accent group with everything else. Most
   * apps let their art get washed out there by default.
   */
  @ViewBuilder
  private var atlas: some View {
    if #available(iOS 18.0, *) {
      Image(entry.mood.asset)
        .resizable()                              // Image -> Image
        .widgetAccentedRenderingMode(.fullColor)  // Image -> some View, so it must sit HERE:
        .scaledToFit()                            // after resizable, before any View modifier
    } else {
      Image(entry.mood.asset)
        .resizable()
        .scaledToFit()
    }
  }

  var body: some View {
    Group {
      switch family {
      case .systemMedium:
        HStack(alignment: .center, spacing: 14) {
          atlas.frame(width: 62, height: 64)
          VStack(alignment: .leading, spacing: 3) {
            StreakLine(entry: entry, size: 34)
            Text(caption(for: entry.mood, data: entry.data))
              .font(.system(size: 14, weight: .semibold))
              .foregroundStyle(Color("textSecondary"))
            if entry.data.hasData {
              Text("\(entry.data.minutesToday) of \(entry.data.goalMinutes) min today")
                .font(.system(size: 12))
                .foregroundStyle(Color("textSecondary"))
                .opacity(0.8)
            }
          }
          Spacer(minLength: 0)
        }
        .padding(.horizontal, 2)

      default:
        /*
         * ATLAS IS THE SUBJECT. The first pass put the streak top-left, Atlas top-right at 44pt
         * and the caption on the floor, with a Spacer opening a black void down the middle — three
         * elements in three corners, no focal point, and a tile that read as unfinished. Rendering
         * it at the real 141pt floor is the only reason that was visible; at 155pt in a mockup it
         * looks merely sparse.
         *
         * Duolingo's widget is mascot-dominant and ours should be: Atlas large and centred, the
         * streak reading as a caption to HIM rather than competing from the opposite corner.
         */
        VStack(spacing: 2) {
          atlas.frame(height: 66)
          StreakLine(entry: entry, size: 26)
          Text(caption(for: entry.mood, data: entry.data))
            .font(.system(size: 12, weight: .semibold))
            .foregroundStyle(Color("textSecondary"))
            .lineLimit(1)
            .minimumScaleFactor(0.8)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
      }
    }
    // Tapping anywhere opens the app. Expo Router consumes this as an ordinary deep link on the
    // standard open-URL path, so the JS side needs nothing widget-specific.
    .widgetURL(URL(string: "euphorianative:///(tabs)/learn"))
    // Views fade by default between timeline entries; keying on the mood makes Atlas transition
    // as a unit when the STATE changes rather than cross-fading pixel-wise.
    .id(entry.mood)
    .transition(.opacity)
    .containerBackground(for: .widget) {
      // Opaque brand ground (C60: a translucent tint took the colour of the tray behind it and
      // rendered pale lavender), with a flame wash whose strength is the mood's heat.
      // A GRADIENT, not a wash. See Mood.gradient — the hue carries the time of day, which is
      // what makes an early tile and a late tile distinguishable at a glance.
      ZStack {
        LinearGradient(colors: [hexColor(entry.mood.gradient.0), hexColor(entry.mood.gradient.1)],
                       startPoint: .top, endPoint: .bottom)
        Scene(mood: entry.mood)
      }
    }
  }
}

struct EuphoriaWidget: Widget {
  let kind: String = "EuphoriaWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: Provider()) { entry in
      EuphoriaWidgetView(entry: entry)
    }
    .configurationDisplayName("Euphoria")
    .description("Your streak and whether today's goal is done.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}

@main
struct EuphoriaWidgetBundle: WidgetBundle {
  var body: some Widget {
    EuphoriaWidget()
  }
}
