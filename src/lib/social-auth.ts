/**
 * Social sign-in — Apple and Google. REAL, unlike what shipped before.
 *
 * WHY THIS FILE EXISTS: `auth.tsx` used to wire "Continue with Apple" and "Continue with Google"
 * to `enter`, the same local function the email form calls. No Apple framework, no Google SDK, no
 * `applesignin` entitlement — the buttons signed you in with neither provider involved. Apple
 * rejected the app for it under Guideline 2.1(a): "We were unable to complete signing up with
 * Apple due to an error." A control can be live and still be a lie; this module is what makes the
 * labels true.
 *
 * SCOPE: identity only, resolved on-device. There is no server exchange here on purpose — the app
 * keeps every other piece of user state (streak, XP, portfolio) locally, so posting the identity
 * to Supabase would create an account that disagrees with the data attached to it. `lib/auth.ts`
 * still holds the Supabase scaffolding for when that lands; this module deliberately does not use
 * it.
 *
 * CANCEL IS NOT AN ERROR. Both providers report a user backing out through their normal failure
 * channel. Surfacing that as an error would put an alert on screen for someone who simply changed
 * their mind — the same rule `purchases.ts` already applies to `userCancelled` (C71). Both
 * functions below return `null` for a cancel and throw only on a genuine failure.
 */
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

export type SocialIdentity = {
  provider: 'apple' | 'google';
  /** Stable, provider-scoped user id. Apple's `user`, Google's `user.id`. Never an email. */
  id: string;
  /** Apple returns this ONCE, ever. See the warning on signInWithApple. */
  name: string | null;
  email: string | null;
};

const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

/**
 * Shape-validated, not length-validated.
 *
 * This is the C76 lesson applied a second time: `IAP_ENABLED` was once `KEY.length > 0`, which was
 * TRUE for a `test_…` placeholder, so the app believed purchases were live and shipped a Buy button
 * that could only fail. A Google iOS client id has a fixed form — `<digits>-<hash>.apps.
 * googleusercontent.com` — so anything else (empty, "TODO", a web client id) reads as NOT
 * configured and the button does not render at all. An unconfigured provider must be an absent
 * button, never a broken one.
 */
export const GOOGLE_ENABLED = /^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/.test(GOOGLE_IOS_CLIENT_ID ?? '');

/** iOS 13+ only, and never on Android or web. Async because the OS answers it, so callers hold it
 *  in state and render the button only once it resolves true. */
export async function appleAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  return AppleAuthentication.isAvailableAsync();
}

/** Apple's own constant for "the user dismissed the sheet". */
function isAppleCancel(e: unknown): boolean {
  return typeof e === 'object' && e !== null && (e as { code?: string }).code === 'ERR_REQUEST_CANCELED';
}

/**
 * Sign in with Apple.
 *
 * ⚠️ APPLE RETURNS `fullName` AND `email` EXACTLY ONCE — on the FIRST authorisation for this Apple
 * ID against this bundle id, and never again. Every later sign-in returns them as null with no
 * error. The caller MUST persist whatever comes back on this call; there is no second chance and
 * no API to re-request it. (Recovering it requires the user to delete the app from their Apple ID
 * settings, which you cannot ask of a reviewer.)
 *
 * @returns the identity, or `null` if the user cancelled.
 */
export async function signInWithApple(): Promise<SocialIdentity | null> {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Apple hands back the parts separately and any of them can be null even on a first sign-in
    // (people can edit what they share). Join only what is actually there rather than emitting a
    // name with a stray space in it.
    const parts = [credential.fullName?.givenName, credential.fullName?.familyName]
      .map((p) => p?.trim())
      .filter((p): p is string => !!p);

    return {
      provider: 'apple',
      id: credential.user,
      name: parts.length ? parts.join(' ') : null,
      email: credential.email ?? null,
    };
  } catch (e) {
    if (isAppleCancel(e)) return null;
    throw e;
  }
}

let googleConfigured = false;

/**
 * Loaded lazily, and this is not a micro-optimisation.
 *
 * `@react-native-google-signin/google-signin` is a NATIVE module, and it is only PARTLY installed
 * right now. MEASURED in the built app: `GoogleSignIn.bundle`, `GTMAppAuth` and `AppAuthCore` are
 * all embedded — CocoaPods autolinks the pod from the npm package whether or not the config plugin
 * is listed. What the config plugin adds is the `iosUrlScheme` the OAuth callback returns through,
 * and that is out of `app.json` until a real client id exists.
 *
 * So the failure mode is "linked but unconfigured", not "missing". A dynamic import is still the
 * right call: it keeps every Google code path off the startup critical path, so a configuration
 * mistake can only ever surface when someone taps a Google button rather than while the JS bundle
 * is still evaluating. That second kind of failure presents as the app hanging on launch — which
 * is precisely the symptom Apple reported ("the app became unresponsive during onboarding"), and
 * not a risk worth taking while fixing that very bug. `GOOGLE_ENABLED` already guarantees the
 * button does not exist until the client id is real.
 */
async function loadGoogle() {
  const mod = await import('@react-native-google-signin/google-signin');
  if (!googleConfigured) {
    // configure() is synchronous and idempotent, but it is pointless to re-run per tap.
    mod.GoogleSignin.configure({ iosClientId: GOOGLE_IOS_CLIENT_ID });
    googleConfigured = true;
  }
  return mod;
}

/**
 * Sign in with Google.
 *
 * Unlike Apple, Google returns the profile on EVERY sign-in, so there is no one-shot trap here.
 *
 * @returns the identity, or `null` if the user cancelled.
 * @throws if called while {@link GOOGLE_ENABLED} is false — that is a programming error, since the
 *         button must not be rendered at all in that state.
 */
export async function signInWithGoogle(): Promise<SocialIdentity | null> {
  if (!GOOGLE_ENABLED) {
    throw new Error('signInWithGoogle called without a valid EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID');
  }
  const { GoogleSignin, isErrorWithCode, isSuccessResponse } = await loadGoogle();

  try {
    const response = await GoogleSignin.signIn();
    // The library models a cancel as a RESPONSE (`{ type: 'cancelled' }`), not a throw. Anything
    // that is not a success is a cancel for our purposes.
    if (!isSuccessResponse(response)) return null;

    const { user } = response.data;
    return { provider: 'google', id: user.id, name: user.name, email: user.email };
  } catch (e) {
    // Older/native failure paths still throw with a code; treat an in-flight cancel the same way.
    if (isErrorWithCode(e) && (e.code === 'SIGN_IN_CANCELLED' || e.code === '-5')) return null;
    throw e;
  }
}
