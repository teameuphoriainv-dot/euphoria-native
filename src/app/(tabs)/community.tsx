import { StubScreen } from '@/components/stub-screen';

export default function Community() {
  return (
    <StubScreen
      title="Community"
      icon="forum"
      blurb="Class discussions, leaderboards, and friendly competition with the people you learn with."
      features={['iMessage-style class chat', 'Global & class leaderboards', 'Reactions and threads', 'Join a class with a code']}
    />
  );
}
