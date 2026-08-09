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
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';
import { GradientButton } from '@/components/ui/button';
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
            <Atlas size={72} expression="happy" interactive={false} />
            <ThemedText type="title" style={styles.title}>Create your free profile</ThemedText>
            <ThemedText type="body" themeColor="mutedForeground" style={styles.sub}>Save your streak, XP, and learning plan.</ThemedText>
          </View>
        </RiseIn>

        {/* Rendered only where the provider can actually work. An unconfigured provider is an
            absent button, never a broken one — that distinction is what the rejection was about. */}
        {(appleOk || GOOGLE_ENABLED) && (
          <RiseIn delay={90}>
            {/* Apple's and Google's OWN button components, not lookalikes.
             *
             * These previously rendered a generic person glyph and a globe. Apple's Sign in with
             * Apple guidelines require the Apple mark and an approved treatment, and Google has the
             * equivalent rule — so a hand-drawn "Continue with Apple" pill is a guideline problem
             * on the exact screen this app was already rejected over. Using the vendors' shipped
             * components makes the question unarguable, at the cost of these two not matching the
             * violet pills below. That trade was made deliberately. */}
            <View style={{ gap: Spacing.two + 2 }}>
              {appleOk && (
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                  // WHITE on a near-black screen. Apple permits BLACK, WHITE and WHITE_OUTLINE;
                  // BLACK would vanish into this background and fail its own contrast guidance.
                  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                  cornerRadius={Radius.pill}
                  style={styles.vendorButton}
                  onPress={() => void runProvider('apple')}
                />
              )}
              {GOOGLE_ENABLED && (
                <View style={styles.googleWrap} pointerEvents={busy ? 'none' : 'auto'}>
                  <GoogleSigninButton
                    size={GoogleSigninButton.Size.Wide}
                    color={GoogleSigninButton.Color.Dark}
                    disabled={busy !== null}
                    onPress={() => void runProvider('google')}
                  />
                </View>
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
  title: { fontSize: FontSize.title, textAlign: 'center', marginTop: Spacing.two },
  sub: { textAlign: 'center', maxWidth: 280 },
  // Apple's component draws itself and REQUIRES explicit dimensions -- given none it lays out at
  // zero height and silently disappears. 52 matches the old pill's 15pt padding + text.
  vendorButton: { width: '100%', height: 52 },
  // GoogleSigninButton takes a fixed `size` rather than a style width, so it is centred rather
  // than stretched; forcing it wider distorts the mark and breaks Google's branding rules.
  googleWrap: { alignItems: 'center' },
  vendorBusy: { alignItems: 'center', marginTop: Spacing.two },
  authError: { textAlign: 'center', marginTop: Spacing.two },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginVertical: Spacing.three },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  input: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, paddingHorizontal: Spacing.three, paddingVertical: 14, fontSize: FontSize.body },
  signin: { alignItems: 'center', paddingVertical: Spacing.two },
});
