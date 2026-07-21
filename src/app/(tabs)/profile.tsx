import { StubScreen } from '@/components/stub-screen';

export default function Profile() {
  return (
    <StubScreen
      title="Profile"
      icon="badge"
      blurb="Your level, XP, streak, certificates, and everything you've unlocked on the way."
      features={['Stats, XP & level', 'Certificate tiers', 'Badge showcase', 'Settings & subscription']}
    />
  );
}
