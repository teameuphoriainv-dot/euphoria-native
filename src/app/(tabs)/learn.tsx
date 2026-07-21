import { StubScreen } from '@/components/stub-screen';

export default function Learn() {
  return (
    <StubScreen
      title="Learn"
      icon="open-book"
      blurb="12 courses on a Duolingo-style pathway, taught through Brilliant-grade interactive lessons."
      features={['Pathway trail for every course', '28 interactive lesson types', '11 drag-to-learn labs', 'Atlas AI tutor in every lesson']}
    />
  );
}
