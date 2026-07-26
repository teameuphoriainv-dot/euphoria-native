/** Dev-only preview grid for LessonArt. Not reachable in production. */
import { ScrollView, View, Text } from 'react-native';
import { LessonArt } from '@/components/lesson-art';
import { COURSES } from '@/lib/curriculum';

const SAMPLE = [
  'The Magic of Compound Interest',
  'Diversification',
  'Inflation and Purchasing Power',
  'Risk vs. Reward',
  'Reading Stock Charts',
  'Introduction to Investing',
];

export default function ArtTest() {
  if (!__DEV__) return null;
  const courses = COURSES.slice(0, 4);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0B0710' }} contentContainerStyle={{ padding: 16, paddingTop: 60 }}>
      {courses.map((c) => (
        <View key={c.id} style={{ marginBottom: 20 }}>
          <Text style={{ color: '#fff', fontSize: 13, marginBottom: 8 }}>{c.title}</Text>
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
