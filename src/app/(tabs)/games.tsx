import { StubScreen } from '@/components/stub-screen';

export default function Games() {
  return (
    <StubScreen
      title="Games"
      icon="controller"
      blurb="Learn by playing — 14 mini-games that turn investing concepts into muscle memory."
      features={['Term Match & Trend Master', 'Budget & life simulators', 'Bias Busted & Black Swan', 'Head-to-head vs AI']}
    />
  );
}
