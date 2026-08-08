import WidgetKit
import SwiftUI

// UNIT 15b — GO/NO-GO GATE.
// Everything here is hardcoded on purpose. This target exists to prove one thing:
// that the @bacons/apple-targets config plugin recreates it across
// `npx expo prebuild --clean`. Real App Group data lands in 15c; the four
// rotating states (streak / today's guide / next lesson / portfolio) land after that.

struct EuphoriaEntry: TimelineEntry {
  let date: Date
  let streak: Int
}

struct Provider: TimelineProvider {
  private static let placeholderStreak = 5

  func placeholder(in context: Context) -> EuphoriaEntry {
    EuphoriaEntry(date: Date(), streak: Self.placeholderStreak)
  }

  func getSnapshot(in context: Context, completion: @escaping (EuphoriaEntry) -> Void) {
    completion(EuphoriaEntry(date: Date(), streak: Self.placeholderStreak))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<EuphoriaEntry>) -> Void) {
    let entry = EuphoriaEntry(date: Date(), streak: Self.placeholderStreak)
    completion(Timeline(entries: [entry], policy: .atEnd))
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

  var body: some View {
    switch family {
    case .systemMedium:
      HStack(alignment: .center, spacing: 16) {
        StreakFlame(streak: entry.streak, size: 40)
        VStack(alignment: .leading, spacing: 2) {
          Text("day streak")
            .font(.system(size: 15, weight: .semibold))
            .foregroundStyle(Color("textPrimary"))
          Text("Keep it going with one lesson.")
            .font(.system(size: 13))
            .foregroundStyle(Color("textSecondary"))
        }
        Spacer(minLength: 0)
      }
      .padding(.horizontal, 4)
      .containerBackground(Color("brandPrimary").opacity(0.14), for: .widget)

    default:
      VStack(alignment: .leading, spacing: 6) {
        StreakFlame(streak: entry.streak, size: 34)
        Text("day streak")
          .font(.system(size: 13, weight: .semibold))
          .foregroundStyle(Color("textSecondary"))
        Spacer(minLength: 0)
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      .containerBackground(Color("brandPrimary").opacity(0.14), for: .widget)
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
