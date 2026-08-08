/** Dev-only preview grid for LessonArt. Not reachable in production. */
import { ScrollView, View, Text } from 'react-native';
import { LessonArt } from '@/components/lesson-art';
import { COURSES } from '@/lib/curriculum';
import { FontSize } from '@/constants/theme';

/** Real curriculum titles, one per art key, so the grid doubles as a routing check. */
const SAMPLE = [
  'The Magic of Compound Interest',
  'Diversification',
  'Inflation & Deflation',
  'Risk vs. Reward',
  'Reading Stock Charts',
  'Stocks vs. Bonds',
  'Tax-Advantaged Investing',
  'Retirement Planning & Withdrawal Strategies',
  'Budgeting Basics',
  'Managing Debt Wisely',
  'Dividend Policy & Share Buybacks',
  'Understanding Fees & Expense Ratios',
  'Financial Ratios: X-Raying a Company',
  'Cognitive Biases That Destroy Wealth',
  'Real Estate Investing',
  'The Federal Reserve & Monetary Policy',
  'International Trade & Globalization',
  'DCF Analysis & Valuation',
  'Insurance as a Wealth Tool',
  'Building an Emergency Fund',
  'Cash Flow Statement Mastery',
  'Probability & Expected Value',
  'Journal Entries & Double-Entry Bookkeeping',
  'Competitive Analysis & Market Positioning',
  'Identity Theft & Financial Security',
  'Introduction to Investing',
];

export default function ArtTest() {
  if (!__DEV__) return null;
  const courses = COURSES.slice(0, 4);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0B0710' }} contentContainerStyle={{ padding: 16, paddingTop: 60 }}>
      {courses.map((c) => (
        <View key={c.id} style={{ marginBottom: 20 }}>
          <Text style={{ color: '#fff', fontSize: FontSize.small, marginBottom: 8 }}>{c.title}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {SAMPLE.map((t, i) => (
              <View
                key={t}
                style={{
                  width: 66,
                  height: 66,
                  borderRadius: 33,
                  backgroundColor: '#181022',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: '#2A1D3A',
                }}>
                <LessonArt courseId={c.id} title={t} index={i} size={44} />
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
