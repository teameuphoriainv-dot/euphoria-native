import { StubScreen } from '@/components/stub-screen';

export default function Trade() {
  return (
    <StubScreen
      title="Trade"
      icon="trend-line"
      blurb="Risk-free paper trading with live prices, native charts, and head-to-head competitions."
      features={['Portfolio dashboard + watchlist', 'Native price charts', 'Buy / sell with real-time quotes', 'Trading competitions']}
    />
  );
}
