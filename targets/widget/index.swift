import WidgetKit
import SwiftUI

// UNIT 15c — real data across the App Group.
// The four rotating states (§15.3b decision 6) land after this; today the widget renders the
// streak, which is the one value that is always true and never needs the network.

/// Mirrored from `app.json` -> `ios.entitlements` by the target config. If this string stops
/// matching the app side, `UserDefaults(suiteName:)` returns nil and every value falls back to
/// zero WITHOUT an error — so the fallback below is deliberately distinguishable in `hasData`.
private let appGroup = "group.com.euphoriainv.euphoria"

struct EuphoriaEntry: TimelineEntry {
  let date: Date
  let streak: Int
  let xp: Int
  /// False when the container is unreachable or the app has never written. Lets the view say
  /// something honest instead of confidently rendering a zero streak the user does not have.
  let hasData: Bool
}

struct Provider: TimelineProvider {
  private func read() -> EuphoriaEntry {
    guard let defaults = UserDefaults(suiteName: appGroup),
          defaults.object(forKey: "dayKey") != nil else {
      return EuphoriaEntry(date: Date(), streak: 0, xp: 0, hasData: false)
    }
    return EuphoriaEntry(
      date: Date(),
      streak: defaults.integer(forKey: "streak"),
      xp: defaults.integer(forKey: "xp"),
      hasData: true
    )
  }

  func placeholder(in context: Context) -> EuphoriaEntry {
    EuphoriaEntry(date: Date(), streak: 5, xp: 250, hasData: true)
  }

  func getSnapshot(in context: Context, completion: @escaping (EuphoriaEntry) -> Void) {
    completion(context.isPreview ? placeholder(in: context) : read())
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<EuphoriaEntry>) -> Void) {
    // iOS owns the refresh clock (§15.3b decision 6). Ask again after an hour; the app also calls
    // reloadWidget() on every real change, which is what makes the update feel immediate.
    let next = Calendar.current.date(byAdding: .hour, value: 1, to: Date()) ?? Date()
    completion(Timeline(entries: [read()], policy: .after(next)))
  }
}

struct StreakFlame: View {
  let streak: Int
  let size: CGFloat

  var body: some View {
    HStack(spacing: 6) {
      Image(systemName: "flame.fill")
        .font(.system(size: size, weight: .semibold))
        .foregroundStyle(Color("brandFlame"))
      Text("\(streak)")
        .font(.system(size: size, weight: .bold, design: .rounded))
        .foregroundStyle(Color("textPrimary"))
    }
  }
}

struct EuphoriaWidgetView: View {
  @Environment(\.widgetFamily) var family
  let entry: EuphoriaEntry

  private var caption: String {
    entry.hasData ? "day streak" : "Open Euphoria to start"
  }

  var body: some View {
    Group {
      switch family {
      case .systemMedium:
        HStack(alignment: .center, spacing: 16) {
          StreakFlame(streak: entry.streak, size: 40)
          VStack(alignment: .leading, spacing: 2) {
            Text(caption)
              .font(.system(size: 15, weight: .semibold))
              .foregroundStyle(Color("textPrimary"))
            Text(entry.hasData ? "\(entry.xp) XP earned" : "Your streak will show here.")
              .font(.system(size: 13))
              .foregroundStyle(Color("textSecondary"))
          }
          Spacer(minLength: 0)
        }
        .padding(.horizontal, 4)

      default:
        VStack(alignment: .leading, spacing: 6) {
          StreakFlame(streak: entry.streak, size: 34)
          Text(caption)
            .font(.system(size: 13, weight: .semibold))
            .foregroundStyle(Color("textSecondary"))
          Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
      }
    }
    // C60 fix. This was `Color("brandPrimary").opacity(0.14)` — a TRANSLUCENT tint, so it took the
    // colour of whatever iOS painted behind it and rendered pale lavender on a light tray, with
    // textSecondary failing contrast on top of it. An OPAQUE brand background is the whole point of
    // declaring $widgetBackground.
    .containerBackground(Color("brandBackground"), for: .widget)
  }
}

struct EuphoriaWidget: Widget {
  let kind: String = "EuphoriaWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: Provider()) { entry in
      EuphoriaWidgetView(entry: entry)
    }
    .configurationDisplayName("Euphoria")
    .description("Your streak, today's guide and your next lesson.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}

@main
struct EuphoriaWidgetBundle: WidgetBundle {
  var body: some Widget {
    EuphoriaWidget()
  }
}
