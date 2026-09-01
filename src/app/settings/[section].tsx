/**
 * Settings — real controls only.
 *
 * This screen used to be a placeholder reading "<Section> settings are coming soon" for all three
 * rows on the You tab. Three rows, one dead end, nothing configurable.
 *
 * Shape from a 5-app ScreensDesign pull of the $750k–$2.25M cohort — Elevate 1395, Praktika 1816,
 * Meetup 107, Kling AI 1699, Loora 1134. Counted:
 *
 *   plan/account status shown in settings        5/5   every one of them
 *   help + legal section                         5/5
 *   a preference that TUNES THE CORE LOOP        3/5   Elevate "WORKOUT LENGTH 3/4/5 Games",
 *                                                      Loora "Speaking speed", Praktika "Study mode"
 *   notifications with a stated reminder time    3/5   Elevate/Loora both show "REMIND ME AT"
 *   restore purchases                            3/5   and Apple requires it anyway
 *   sign out at the bottom                       3/5
 *
 * The 3/5 one is the interesting one: the high-revenue apps let you retune the product itself from
 * settings, not just silence notifications. Euphoria's equivalent already existed in the store —
 * `profile.dailyMinutes` drives the Home ring and `lessonsPerDay` — it simply had no surface after
 * onboarding. That is what "Daily goal" below is.
 *
 * RULE FOR THIS FILE: no control ships unless it changes real state. A toggle that writes nothing
 * is the dead button this app is trying to delete.
 */
import { router, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { deleteServerAccount } from '@/lib/auth';
import { setAnalyticsConsent } from '@/lib/analytics';
import { applyDailyNudge, applyMarketAlert, applyWinBack } from '@/lib/notifications';
import { hourLabel, NudgeTimePicker } from '@/components/nudge-time-picker';
import { FREE_ATLAS_MESSAGES, useApp } from '@/lib/store';
import { TRIAL_DAYS, trialDayNumber, useTier } from '@/lib/entitlement';
import { IAP_DISABLED_REASON, IAP_ENABLED, openManageSubscriptions, restore as restorePurchases, purchaseErrorMessage } from '@/lib/purchases';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

const TITLES: Record<string, string> = {
  account: 'Account',
  notifications: 'Notifications',
  preferences: 'Preferences',
};

/** Same three values onboarding offers, so the two surfaces cannot disagree about what a goal is. */
const GOALS = [
  { minutes: 5, label: '5 minutes', sub: 'One lesson a day' },
  { minutes: 10, label: '10 minutes', sub: 'Two lessons a day' },
  { minutes: 20, label: '20 minutes', sub: 'Four lessons a day' },
];


function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <ThemedText type="label" themeColor="mutedForeground">{title}</ThemedText>
      <View style={[styles.group, { backgroundColor: theme.card, borderColor: theme.border }]}>{children}</View>
    </View>
  );
}

function Row({
  label,
  value,
  onPress,
  danger,
  last,
  children,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  last?: boolean;
  /** A control rendered on the right, in place of the value text. Added for 15a's time picker. */
  children?: ReactNode;
}) {
  const theme = useTheme();
  const body = (
    <View style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border }]}>
      <ThemedText type="body" style={danger ? { color: theme.destructive } : undefined}>{label}</ThemedText>
      <View style={styles.rowRight}>
        {children ?? (!!value && <ThemedText type="small" themeColor="mutedForeground">{value}</ThemedText>)}
        {onPress && <UIcon name="arrowRight" size={16} color={theme.mutedForeground} />}
      </View>
    </View>
  );
  if (!onPress) return body;
  return (
    <SpringPressable haptic={false} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      {body}
    </SpringPressable>
  );
}

function ToggleRow({
  label,
  sub,
  value,
  onValueChange,
  last,
}: {
  label: string;
  sub?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  last?: boolean;
}) {
  const theme = useTheme();
  // The WHOLE ROW toggles, not just the 51pt switch. Standard iOS behaviour, a far bigger hit
  // target, and it makes the control reachable by the accessibility layer — `idb ui tap` cannot
  // actuate a React Native Switch even dead-centre on its real frame, so a switch-only row is
  // untestable on device.
  return (
    <SpringPressable
      haptic={false}
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
    >
      <View style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border }]}>
        <View style={styles.rowText}>
          <ThemedText type="body">{label}</ThemedText>
          {!!sub && <ThemedText type="small" themeColor="mutedForeground">{sub}</ThemedText>}
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ true: theme.primary }}
          // The row above owns the label; leaving one here makes VoiceOver announce it twice.
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      </View>
    </SpringPressable>
  );
}

function AccountSection() {
  const theme = useTheme();
  const isPro = useApp((s) => s.isPro);
  const billingIssue = useApp((s) => s.billingIssue);
  const setPro = useApp((s) => s.setPro);
  const name = useApp((s) => s.profile.name);
  const signOut = useApp((s) => s.signOut);
  const atlasLeft = useApp((s) => s.atlasLeft());
  // Three tiers exist, so a boolean `isPro ? 'Pro' : 'Free'` mislabelled a live trial as "Free".
  const planTier = useTier();
  const trialDay = useApp(trialDayNumber);

  return (
    <>
      {/* Plan status first — 5/5 of the reference apps put it at the top of settings. Ours also
          states what is LEFT, because a plan row that only says "Free" answers the wrong question. */}
      <Section title="PLAN">
        {/* 17e — the billing-retry message, ABOVE the status row because it outranks it.
            Apple is retrying a payment. Access stays open for a window (see BILLING_RETRY_GRACE_DAYS
            in lib/purchases), but only the user can fix the card, so keeping quiet wastes the window.
            Wording is deliberately not alarming: the overwhelming majority of these are an expired
            card, not a failed human. COPY IS UNAPPROVED (§20). */}
        {billingIssue && (
          <Pressable onPress={openManageSubscriptions} accessibilityRole="button" accessibilityLabel="Fix payment method">
            <View style={[styles.billingIssue, { backgroundColor: theme.cardElevated, borderColor: theme.warning }]}>
              <UIcon name="bell" size={18} color={theme.warning} />
              <View style={{ flex: 1, gap: 2 }}>
                <ThemedText type="smallBold">There&apos;s a problem with your payment method</ThemedText>
                <ThemedText type="small" themeColor="mutedForeground">
                  Your subscription is still active while Apple retries. Updating your card in the
                  App Store keeps it that way.
                </ThemedText>
              </View>
            </View>
          </Pressable>
        )}
        <Row
          label="Status"
          value={
            planTier === 'pro'
              ? 'Euphoria Pro'
              : planTier === 'expired'
                ? 'Trial ended'
                : `Free trial · day ${trialDay} of ${TRIAL_DAYS}`
          }
        />
        {/* C27: the lesson count is gone because lessons are unmetered during the trial. Atlas is
            the one allowance still worth counting, and it is the one with a real per-message cost. */}
        {planTier === 'trial' && (
          <Row label="Remaining" value={`${atlasLeft}/${FREE_ATLAS_MESSAGES} Atlas questions`} />
        )}
        {!isPro && <Row label="Upgrade to Pro" onPress={() => router.push('/onboarding?step=paywall')} />}
        <Row
          label="Restore purchases"
          // Last row only when "Manage subscription" below is absent, i.e. for a non-Pro member.
          // Without this the group drew a divider under its final row.
          last={planTier !== 'pro'}
          onPress={() => {
            // Apple requires this control on any surface selling a subscription, independent of
            // convergence (2/5 in the Unit 5 pull). Reports what it FOUND: "restored" and "nothing
            // to restore" are very different things to be told, and a single vague message for both
            // is how a user concludes the app is broken when it worked correctly.
            if (!IAP_ENABLED) {
              Alert.alert('Restore purchases', `${IAP_DISABLED_REASON} Once subscriptions are live, this will restore any prior purchase tied to your Apple ID.`);
              return;
            }
            void restorePurchases().then((r) => {
              if (r.ok && r.isPro) Alert.alert('Welcome back', 'Your Euphoria Pro subscription is active again.');
              else if (r.ok) Alert.alert('Nothing to restore', 'No previous Euphoria Pro purchase was found on this Apple ID.');
              else if (r.kind !== 'cancelled') Alert.alert('Restore failed', r.kind === 'not-configured' ? IAP_DISABLED_REASON : purchaseErrorMessage(r.code));
            });
          }}
        />
        {/*
          * MANAGE SUBSCRIPTION — 3/5 convergence (Elevate 1395, Duolingo 862, Quizlet 874), and
          * Quizlet names the action "Cancel on App Store" rather than pretending to cancel in-app.
          * That is the only honest framing: an app cannot cancel an Apple subscription itself, and a
          * "Cancel" button that merely opens Settings while implying it did the work is the kind of
          * thing that generates chargebacks.
          *
          * Shown only to a Pro member. Offering "manage your subscription" to someone without one is
          * a control with nothing behind it.
          */}
        {planTier === 'pro' && (
          <Row label="Manage subscription" value="App Store" onPress={openManageSubscriptions} last />
        )}
      </Section>

      <Section title="PROFILE">
        <Row label="Name" value={name ?? 'Not set'} />
        {/*
          * DELETE PROFILE — App Store Guideline 5.1.1(v): an app that supports account creation must
          * offer deletion inside the app, and `/auth` offers Sign in with Apple and Google, so this
          * app does support it. Without this control the reviewer looks for deletion, does not find
          * it, and rejects; the guideline is one of the more mechanically enforced ones.
          *
          * It says PROFILE rather than ACCOUNT because the visible thing being erased is the local
          * profile: progress, streak, cosmetics and practice portfolio. When there is a signed-in
          * Supabase account, deleteServerAccount() removes that first while the session can still
          * authorise it.
          *
          * The confirm is destructive and names what goes, because a one-tap wipe of a streak
          * somebody has held for months is not a thing to do on a mis-tap. Cancelling the scheduled
          * notifications first matters for the same reason: a win-back that fires three days after
          * you deleted your profile, greeting a name that no longer exists, is the kind of detail
          * that makes an app feel broken.
          */}
        <Row
          label="Delete profile"
          danger
          last
          onPress={() => {
            Alert.alert(
              'Delete profile?',
              'This removes your name, avatar, progress, streak and practice portfolio from this device. It cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    const usedApple = useApp.getState().profile.authProvider === 'apple';
                    /*
                     * ORDER MATTERS TWICE OVER.
                     *
                     * The SERVER account goes first, while the session is still alive to authorise
                     * it. deleteProfile() does not clear the Supabase session, but doing it the
                     * other way round invites exactly that bug the first time someone reorders
                     * these lines.
                     *
                     * Then deleteProfile(), then the notification cleanup.
                     * applyMarketAlert() cancels and then RE-SCHEDULES if the user still holds a
                     * symbol, so calling it before the wipe could queue a fresh alert about the
                     * portfolio being deleted. After the wipe there are no positions and no
                     * watchlist, so it cancels and returns null, which is the intent.
                     */
                    void deleteServerAccount({ revokeApple: usedApple }).then((server) => {
                      // Local data goes regardless. Somebody who asked to be forgotten must not be
                      // left with their progress intact because a network call failed.
                      useApp.getState().deleteProfile();
                      return Promise.all([
                        applyDailyNudge(false),
                        applyWinBack(false),
                        applyMarketAlert(),
                      ]).finally(() => {
                        router.replace('/welcome');
                        // Said AFTER routing, and only on failure: they must not be told the server
                        // copy is gone when it is not.
                        const appleRevocation = usedApple && server.appleRevoked !== true
                          ? ' To revoke Euphoria\'s Apple sign-in access, open iOS Settings, tap your Apple Account, then Sign in with Apple, Euphoria, and Delete.'
                          : '';
                        if (!server.ok && server.message) {
                          Alert.alert('Profile deleted on this device', `${server.message}${appleRevocation}`);
                        } else if (usedApple) {
                          Alert.alert('Profile deleted', `Your Euphoria account and device data were deleted.${appleRevocation}`);
                        }
                      });
                    });
                  },
                },
              ],
            );
          }}
        />
      </Section>

      {__DEV__ && (
        <Section title="DEVELOPER">
          <ToggleRow
            label="Euphoria Pro"
            sub="Flips the real entitlement. Dev builds only."
            value={isPro}
            onValueChange={setPro}
            last
          />
        </Section>
      )}

      <Section title="SUPPORT">
        <Row label="Privacy Policy" onPress={() => void Linking.openURL('https://euphoriainv.com/privacy').catch(() => undefined)} />
        <Row label="Terms of Use" onPress={() => void Linking.openURL('https://euphoriainv.com/terms').catch(() => undefined)} last />
      </Section>

      <Section title="SESSION">
        <Row
          label="Sign out"
          danger
          last
          onPress={() =>
            Alert.alert('Sign out?', 'Your progress stays on this device.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign out', style: 'destructive', onPress: () => { void signOut().finally(() => router.replace('/welcome')); } },
            ])
          }
        />
      </Section>
      <ThemedText type="small" themeColor="mutedForeground" style={[styles.version, { color: theme.mutedForeground }]}>
        Euphoria 1.0.0
      </ThemedText>
    </>
  );
}

function NotificationsSection() {
  const optIn = useApp((s) => s.profile.notifyOptIn);
  const nudgeHour = useApp((s) => s.nudgeHour);
  const setProfile = useApp((s) => s.setProfile);
  const [busy, setBusy] = useState(false);

  /** Persist what the OS ACTUALLY scheduled, never what was tapped — notifications.ts is explicit
   *  that iOS keeps a veto at the permission prompt, and storing intent as outcome is how an app
   *  ends up believing reminders are on while every one is dropped. */
  const toggle = async (want: boolean) => {
    setBusy(true);
    const scheduled = await applyDailyNudge(want);
    setProfile({ notifyOptIn: scheduled });
    setBusy(false);
    if (want && !scheduled) {
      Alert.alert(
        'Notifications are off',
        'iOS is blocking notifications for Euphoria. Turn them on in Settings › Notifications › Euphoria.',
      );
    }
  };

  return (
    <Section title="DAILY NUDGE">
      <ToggleRow
        label="Daily reminder"
        sub={optIn ? `Every day at ${hourLabel(nudgeHour)}` : 'Off'}
        value={optIn}
        onValueChange={(v) => { if (!busy) void toggle(v); }}
      />
      {/* UNIT 15a. This row USED to render a hardcoded constant — it looked editable and was not,
          which is exactly the dead control §0.5 forbids. It is now the same picker onboarding
          shows, per §15.3b decision 4: one component, two mounts. Evening remains the default
          because a nudge is only useful while there is still time to act on it. */}
      <Row label="Reminder time" value={hourLabel(nudgeHour)} last>
        <NudgeTimePicker compact />
      </Row>
    </Section>
  );
}

/** N22. Dark leads because it IS the default — the list should read in the order of what you get
 *  if you never come here. `system` is last for the same reason: it is the deliberate choice now,
 *  not the assumption. */
const THEMES = [
  { key: 'dark', label: 'Dark', sub: 'The Euphoria default' },
  { key: 'light', label: 'Light', sub: 'Bright backgrounds, same art' },
  { key: 'system', label: 'Match my device', sub: 'Follows your iOS appearance setting' },
] as const;

function PreferencesSection() {
  const theme = useTheme();
  const perfHud = useApp((s) => s.perfHud);
  const setPerfHud = useApp((s) => s.setPerfHud);
  const dailyMinutes = useApp((s) => s.dailyGoalMinutes());
  const setProfile = useApp((s) => s.setProfile);
  const themePref = useApp((s) => s.themePref);
  const setThemePref = useApp((s) => s.setThemePref);
  const analyticsOptIn = useApp((s) => s.profile.analyticsOptIn);

  return (
    <>
    <Section title="PRIVACY">
      <ToggleRow
        label="Share app analytics"
        sub="Sends pseudonymous feature-use events to PostHog. No name, email, ads, or screen recording."
        value={analyticsOptIn}
        onValueChange={(value) => {
          setProfile({ analyticsOptIn: value });
          void setAnalyticsConsent(value);
        }}
        last
      />
    </Section>
    <Section title="DIAGNOSTICS">
      {/*
        * A JS-thread frame counter, off by default and NOT persisted, so it cannot survive a
        * relaunch into a real user's session. It exists because every performance number in this
        * repo was measured in the simulator and the app is reported laggy on real hardware, where
        * there is no profiler and console.log does not reach the syslog. Turn it on, use the app,
        * screenshot the number.
        */}
      <SpringPressable
        haptic={false}
        onPress={() => { setPerfHud(!perfHud); }}
        accessibilityRole="switch"
        accessibilityState={{ checked: perfHud }}
        accessibilityLabel="Performance overlay"
      >
        <View style={styles.row}>
          <View style={styles.rowText}>
            <ThemedText type="body">Performance overlay</ThemedText>
            <ThemedText type="small" themeColor="mutedForeground">
              Shows frames per second and the worst frame. Resets when the app restarts.
            </ThemedText>
          </View>
          {perfHud ? <UIcon name="check" size={20} color={theme.primary} strokeWidth={3} /> : null}
        </View>
      </SpringPressable>
    </Section>
    <Section title="APPEARANCE">
      {THEMES.map((t, i) => {
        const on = themePref === t.key;
        return (
          <SpringPressable
            key={t.key}
            haptic={false}
            onPress={() => setThemePref(t.key)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${t.label}, ${t.sub}`}
          >
            <View
              style={[
                styles.row,
                i < THEMES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
              ]}
            >
              <View style={styles.rowText}>
                <ThemedText type="body">{t.label}</ThemedText>
                <ThemedText type="small" themeColor="mutedForeground">{t.sub}</ThemedText>
              </View>
              {on ? <UIcon name="check" size={20} color={theme.primary} strokeWidth={3} /> : null}
            </View>
          </SpringPressable>
        );
      })}
    </Section>
    <Section title="DAILY GOAL">
      {GOALS.map((g, i) => {
        const on = dailyMinutes === g.minutes;
        return (
          <SpringPressable
            key={g.minutes}
            haptic={false}
            onPress={() => setProfile({ dailyMinutes: g.minutes })}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${g.label}, ${g.sub}`}
          >
            <View
              style={[
                styles.row,
                i < GOALS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
              ]}
            >
              <View style={styles.rowText}>
                <ThemedText type="body">{g.label}</ThemedText>
                <ThemedText type="small" themeColor="mutedForeground">{g.sub}</ThemedText>
              </View>
              {on ? <UIcon name="check" size={20} color={theme.primary} strokeWidth={3} /> : null}
            </View>
          </SpringPressable>
        );
      })}
    </Section>
    </>
  );
}

export default function SettingsSection() {
  const theme = useTheme();
  const { section } = useLocalSearchParams<{ section: string }>();
  const title = TITLES[section ?? ''] ?? 'Settings';

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={25} glow={false} />
      <SpringPressable
        haptic={false}
        onPress={() => router.back()}
        style={styles.back}
        accessibilityRole="button"
        accessibilityLabel="Back to profile"
      >
        <UIcon name="chevronLeft" size={22} color={theme.mutedForeground} />
        <ThemedText type="small" themeColor="mutedForeground">Profile</ThemedText>
      </SpringPressable>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <RiseIn>
          <ThemedText type="title" style={styles.title}>{title}</ThemedText>
        </RiseIn>
        <RiseIn delay={80}>
          {section === 'account' ? (
            <AccountSection />
          ) : section === 'notifications' ? (
            <NotificationsSection />
          ) : section === 'preferences' ? (
            <PreferencesSection />
          ) : (
            <Section title="SETTINGS">
              <Row label="Nothing here yet" last />
            </Section>
          )}
        </RiseIn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  billingIssue: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.two,
  },
  safe: { flex: 1 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: Spacing.three, paddingTop: Spacing.two },
  content: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.six, gap: Spacing.four },
  title: { fontSize: FontSize.titleLg, marginTop: Spacing.two },
  section: { gap: Spacing.two, marginBottom: Spacing.four },
  group: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.lg, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', flexWrap: 'wrap',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    minHeight: 52,
  },
  rowText: { flex: 1, gap: 1 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flexShrink: 1 },
  version: { textAlign: 'center', marginTop: -Spacing.two },
});
