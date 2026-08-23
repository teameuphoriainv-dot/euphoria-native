/**
 * Auth — create-a-profile / sign-in. Apple + Google + email.
 *
 * The Apple and Google buttons are REAL as of the rejection fix. They previously called `enter`,
 * the same local function the email form uses, which signed the user in with no provider involved
 * at all — Apple rejected the app for it (Guideline 2.1(a), "unable to complete signing up with
 * Apple due to an error"). Provider logic lives in `lib/social-auth.ts`; this file only renders it.
 *
 * Two rules this screen must keep:
 *  - A cancel is NOT an error. Backing out of the Apple/Google sheet returns you here silently.
 *  - A provider that is not configured renders NO button. Never a button that cannot work.
 */
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { Atlas } from '@/components/atlas';
import { ProviderButton } from '@/components/provider-button';
import { ThemedText } from '@/components/themed-text';
import { SlabButton } from '@/components/ui/button';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import type { Profile } from '@/lib/onboarding-path';
import {
  appleAvailable,
  GOOGLE_ENABLED,
  signInWithApple,
  signInWithGoogle,
  type SocialIdentity,
} from '@/lib/social-auth';
import { useApp } from '@/lib/store';
import { useTheme } from '@/hooks/use-theme';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

export default function Auth() {
  const theme = useTheme();
  const signIn = useApp((s) => s.signIn);
  const setProfile = useApp((s) => s.setProfile);
  const firstRunDoneAt = useApp((s) => s.profile.firstRunDoneAt);
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  /** null until the OS answers. The Apple button renders only on `true` — an iPad on iOS 12 or an
   *  Android build must not show a button the platform cannot service. */
  const [appleOk, setAppleOk] = useState(false);
  const [busy, setBusy] = useState<'apple' | 'google' | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    appleAvailable().then((ok) => {
      if (alive) setAppleOk(ok);
    });
    return () => {
      alive = false;
    };
  }, []);

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

  /**
   * The provider path. Persists BEFORE navigating, deliberately: Apple hands back the name and
   * email on the first authorisation and never again, so anything not written here is gone for
   * good. Whatever the provider gives us wins over what is typed in the form below, but a null
   * from the provider never wipes a value we already hold — that is the same bug `enter` was
   * fixed for.
   */
  const enterWith = (identity: SocialIdentity) => {
    const patch: Partial<Profile> = { authProvider: identity.provider, authId: identity.id };
    if (identity.name?.trim()) patch.name = identity.name.trim();
    if (identity.email?.trim()) patch.email = identity.email.trim();
    const h = slug(identity.name ?? '');
    if (h && !useApp.getState().profile.handle) patch.handle = h;
    setProfile(patch);
    signIn();
    router.replace(firstRunDoneAt ? '/(tabs)/home' : ('/start' as never));
  };

  /** Shared by both providers. `null` back means the user cancelled — that is not an error and
   *  must leave the screen exactly as it was, with nothing surfaced. */
  const runProvider = async (which: 'apple' | 'google') => {
    setAuthError(null);
    setBusy(which);
    try {
      const identity = which === 'apple' ? await signInWithApple() : await signInWithGoogle();
      if (identity) enterWith(identity);
    } catch {
      setAuthError(
        which === 'apple'
          ? "Apple sign-in didn't complete. You can try again or use your email below."
          : "Google sign-in didn't complete. You can try again or use your email below.",
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientBackground starCount={40} />
      <View style={styles.content}>
        <RiseIn>
          <View style={styles.head}>
            <Atlas size={72} expression="happy" interactive={false} idle />
            <ThemedText type="title" style={styles.title}>Create your free profile</ThemedText>
            {/*
              * "Save your streak, XP, and learning plan." WAS FALSE, and false on the screen where a
              * user decides whether to trust this app. Nothing on this screen saves anything
              * anywhere: enter() writes to the LOCAL zustand profile and flips a local boolean, the
              * Apple and Google buttons run real OAuth and then write that identity to the same
              * local profile, AUTH_ENABLED is false and currentUserId() returns a hardcoded null.
              * §22 C99 states the consequence — deleting the app destroys the streak and XP, and
              * there is no recovery. §0.4 forbids a claim the app cannot back; that rule applies to
              * a sentence exactly as it applies to a number.
              *
              * COPY APPROVED 2026-08-11 (§0.7, §20), chosen from three drafts. It is deliberately
              * candid rather than reassuring, matching the register the user already approved for
              * why-not-free.tsx in C103. When Supabase lands — lib/auth.ts is scaffolded for it and
              * the web app already runs on the same project — this line is the one to change, and
              * "Save your streak, XP, and learning plan" becomes true and can come back.
              */}
            <ThemedText type="body" themeColor="mutedForeground" style={styles.sub}>Your progress stays on this device.</ThemedText>
          </View>
        </RiseIn>

        {/* Rendered only where the provider can actually work. An unconfigured provider is an
            absent button, never a broken one — that distinction is what the rejection was about. */}
        {(appleOk || GOOGLE_ENABLED) && (
          <RiseIn delay={90}>
            {/* ONE COMPONENT FOR BOTH — see components/provider-button.tsx for the full rationale.
             *
             * The vendors' shipped components CANNOT be made to match: Apple's renders 312x48 with
             * centred bold black text, Google's ~303x39 with grey text left of centre, and
             * GoogleSigninButton ignores style entirely (tested, reverted; §22 C97 was right).
             *
             * This is NOT a return to what C97 removed. C97 deleted buttons drawn with a generic
             * person glyph and a globe — no vendor marks at all. ProviderButton uses Apple's own SF
             * Symbol and Google's own G, both unmodified, with each company's required wording. Both
             * publish that as a permitted path. */}
            <View style={{ gap: Spacing.two + 2 }}>
              {appleOk && (
                <ProviderButton provider="apple" disabled={busy !== null} onPress={() => void runProvider('apple')} />
              )}
              {GOOGLE_ENABLED && (
                <ProviderButton provider="google" disabled={busy !== null} onPress={() => void runProvider('google')} />
              )}
            </View>
            {busy && (
              <View style={styles.vendorBusy}>
                <ActivityIndicator size="small" color={theme.mutedForeground} />
              </View>
            )}
            {authError && (
              <ThemedText type="small" style={[styles.authError, { color: theme.destructive }]}>
                {authError}
              </ThemedText>
            )}
          </RiseIn>
        )}

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
          <SlabButton label="Sign up" full onPress={enter} style={{ marginTop: Spacing.two + 2 }} />
        </RiseIn>

        <RiseIn delay={230}>
          <SpringPressable haptic={false} onPress={enter} style={styles.signin}>
            {/* "Existing user? Sign in" implied ACCOUNT RECOVERY. There is none — a returning user
                on a new phone signs in and gets an empty account, because there was never an account.
                The only real journey through here is somebody who signed out on THIS device (you.tsx
                routes signOut to /auth), which is what the line now describes. */}
            <ThemedText type="small" themeColor="mutedForeground">Signed out? <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>Sign back in</ThemedText></ThemedText>
          </SpringPressable>
        </RiseIn>
      </View>
    </SafeAreaView>
  );
}

/** GoogleSigninButton Size.Wide. Apple's button is matched to it so the pair aligns. */
// Provider button geometry now lives with the button — see components/provider-button.tsx.

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: Spacing.four, gap: Spacing.four },
  head: { alignItems: 'center', gap: Spacing.two },
  title: { fontSize: FontSize.title, textAlign: 'center', marginTop: Spacing.two },
  sub: { textAlign: 'center', maxWidth: 280 },
  // Apple's component draws itself and REQUIRES explicit dimensions -- given none it lays out at
  // zero height and silently disappears.
  //
  // The width is matched to GoogleSigninButton rather than to the screen. Google's button takes a
  // fixed `size` enum, not a style width, and stretching it distorts the mark and breaks Google's
  // branding rules -- so the only way to get two provider buttons that line up is to bring APPLE
  // down to Google's width. 312x48 is Size.Wide.
  vendorBusy: { alignItems: 'center', marginTop: Spacing.two },
  authError: { textAlign: 'center', marginTop: Spacing.two },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginVertical: Spacing.three },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  input: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, paddingHorizontal: Spacing.three, paddingVertical: 14, fontSize: FontSize.body },
  signin: { alignItems: 'center', paddingVertical: Spacing.two },
});
