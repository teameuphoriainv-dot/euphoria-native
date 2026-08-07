/**
 * Auth — create-a-profile / sign-in. Google + Apple + email options (Brilliant reference,
 * violet-branded). Mock sign-in for now: sets the store flag and enters the app. Wire a real
 * provider (Apple/Google/Supabase/Clerk) in a later pass — the UI + flow are ready.
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';
import { UIcon, type UIconName } from '@/components/ui-icon';
import { GradientButton } from '@/components/ui/button';
import { Radius, Spacing } from '@/constants/theme';
import type { Profile } from '@/lib/onboarding-path';
import { useApp } from '@/lib/store';
import { useTheme } from '@/hooks/use-theme';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

function ProviderButton({ label, icon, onPress }: { label: string; icon: UIconName; onPress: () => void }) {
  const theme = useTheme();
  return (
    <SpringPressable onPress={onPress}>
      <View style={[styles.provider, { borderColor: theme.border, backgroundColor: theme.card }]}>
        <UIcon name={icon} size={20} color={theme.text} />
        <ThemedText type="bodyMedium">{label}</ThemedText>
      </View>
    </SpringPressable>
  );
}

export default function Auth() {
  const theme = useTheme();
  const signIn = useApp((s) => s.signIn);
  const setProfile = useApp((s) => s.setProfile);
  const firstRunDoneAt = useApp((s) => s.profile.firstRunDoneAt);
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');

  /** Lowercase, alphanumeric. Nobody should be forced to invent a handle, so an empty one is
   *  derived from the name; typing your own still wins. */
  const slug = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);

  const enter = () => {
    // This used to call signIn() and navigate, discarding everything typed above it. The profile
    // write is the point: a follow graph needs a name and handle for anyone to follow back.
    // Only write what was actually typed. Writing `|| null` unconditionally meant an existing
    // user signing back in with the fields blank had their saved name and handle WIPED, which
    // showed up on device as the greeting falling back to "Hey there".
    const patch: Partial<Profile> = {};
    if (name.trim()) patch.name = name.trim();
    const h = slug(handle) || slug(name);
    if (h) patch.handle = h;
    if (email.trim()) patch.email = email.trim();
    setProfile(patch);
    signIn();
    // A brand new account gets one concrete thing to do; a returning user signing back in must
    // never see it. The stamp lives on the profile, so it survives a relaunch.
    router.replace(firstRunDoneAt ? '/(tabs)/home' : ('/start' as never));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientBackground starCount={40} />
      <View style={styles.content}>
        <RiseIn>
          <View style={styles.head}>
            <Atlas size={72} expression="happy" interactive={false} />
            <ThemedText type="title" style={styles.title}>Create your free profile</ThemedText>
            <ThemedText type="body" themeColor="mutedForeground" style={styles.sub}>Save your streak, XP, and learning plan.</ThemedText>
          </View>
        </RiseIn>

        <RiseIn delay={90}>
          <View style={{ gap: Spacing.two + 2 }}>
            <ProviderButton label="Continue with Apple" icon="you" onPress={enter} />
            <ProviderButton label="Continue with Google" icon="globe" onPress={enter} />
          </View>
        </RiseIn>

        <RiseIn delay={160}>
          <View style={styles.orRow}>
            <View style={[styles.line, { backgroundColor: theme.border }]} />
            <ThemedText type="small" themeColor="mutedForeground">OR</ThemedText>
            <View style={[styles.line, { backgroundColor: theme.border }]} />
          </View>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={theme.mutedForeground}
            autoCapitalize="words"
            style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card, marginBottom: Spacing.two }]}
          />
          <TextInput
            value={handle}
            onChangeText={setHandle}
            placeholder={name ? `@${slug(name)}` : '@handle'}
            placeholderTextColor={theme.mutedForeground}
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card, marginBottom: Spacing.two }]}
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={theme.mutedForeground}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card }]}
          />
          <GradientButton label="Sign up" full onPress={enter} style={{ marginTop: Spacing.two + 2 }} />
        </RiseIn>

        <RiseIn delay={230}>
          <SpringPressable haptic={false} onPress={enter} style={styles.signin}>
            <ThemedText type="small" themeColor="mutedForeground">Existing user? <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>Sign in</ThemedText></ThemedText>
          </SpringPressable>
        </RiseIn>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: Spacing.four, gap: Spacing.four },
  head: { alignItems: 'center', gap: Spacing.two },
  title: { fontSize: 24, textAlign: 'center', marginTop: Spacing.two },
  sub: { textAlign: 'center', maxWidth: 280 },
  provider: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, paddingVertical: 15, borderRadius: Radius.pill, borderWidth: StyleSheet.hairlineWidth },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginVertical: Spacing.three },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  input: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, paddingHorizontal: Spacing.three, paddingVertical: 14, fontSize: 16 },
  signin: { alignItems: 'center', paddingVertical: Spacing.two },
});
