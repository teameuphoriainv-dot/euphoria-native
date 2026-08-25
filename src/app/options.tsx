/**
 * Options — a real chain, Pro-gated.
 *
 * WHAT THIS REPLACED: a Black-Scholes calculator with chip pickers. It computed a number, but it
 * was not options — there were no contracts, no expiries that exist, no bid/ask, no greeks. The
 * user's verdict was exact: "the options is not really options its like nothing right now."
 *
 * Now it is a chain. Tradier's free sandbox returns every strike for a real expiry with bid, ask,
 * implied volatility and delta (see `api/options+api.ts` for why Tradier over Polygon: Polygon's
 * options sit behind a paid plan, Tradier's sandbox is free and delayed, which is the honest fit
 * for paper trading).
 *
 * Layout from Robinhood's options flow: pick an expiry, then read a strike list, then trade one
 * contract. Strikes run in a single column with the money marked, so "how far out of the money is
 * this" is a glance rather than arithmetic.
 *
 * WHEN THERE IS NO TOKEN it falls back to Black-Scholes rows and says so in as many words. A model
 * labelled as a model is teaching; a model presented as a quote is a lie.
 *
 * FUTURES ARE DELIBERATELY ABSENT — separate venue, margin model and settlement calendar.
 */
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { RetryNotice } from '@/components/retry-notice';
import { SkeletonRows } from '@/components/skeleton';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { AskAtlasRow } from '@/components/ask-atlas';
import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { SlabButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BottomTabInset, Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getChain, getExpirations, type Contract } from '@/lib/market';
import { ASSUMED_VOL, CONTRACT_SIZE, premium, strikesAround } from '@/lib/options';
import { ALL_SYMS, money, priceOf, STOCKS } from '@/lib/stocks';
import { useTier } from '@/lib/entitlement';
import { PRO_DERIVATIVE_PREVIEW, useApp } from '@/lib/store';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

/**
 * One greek, or nothing at all.
 *
 * DROPPED WHEN IT WOULD ROUND TO ZERO, not merely when it IS zero. Rendering `x.gamma ? ... : ''`
 * looked right and was not: 0.004 is truthy, so a chain expiring the same day printed
 * `\u03930.00 \u0398-0.00 \u03bd0.00` across every row — and `\u0398-0.00` reads as broken software rather than as a
 * quantity too small to matter. Same \u00a70.4 rule the IV column already follows: an absent number is
 * honest, a rounded-to-nothing one is a fake measurement.
 */
const greek = (glyph: string, v: number) => (Math.abs(v) >= 0.005 ? `${glyph}${v.toFixed(2)}` : '');

/** Days out for the modelled fallback expiries, when no live chain exists. */
const MODEL_DAYS = [7, 30, 90];

function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <SpringPressable
      haptic={false}
      scaleTo={0.94}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: on }}
    >
      <View
        style={[
          styles.chip,
          { borderColor: on ? theme.primary : theme.border, backgroundColor: on ? theme.primary + '1A' : 'transparent' },
        ]}
      >
        <ThemedText type="smallBold" style={{ color: on ? theme.iconLilac : theme.mutedForeground }}>
          {label}
        </ThemedText>
      </View>
    </SpringPressable>
  );
}

/**
 * One strike, BOTH SIDES.
 *
 * Robinhood's own docs describe two chain layouts: a "focused view" showing one side, and a
 * "side-by-side view" where "calls and puts [are] organized side-by-side, and strike prices in the
 * middle". The side-by-side is the canonical options chain and the reason a chain reads as a chain
 * — a single column of one side reads as a price list, which is exactly what this screen was.
 *
 * Tapping the CALLS or PUTS heading collapses to the focused view, as Robinhood does.
 */
function ChainRow({
  strike,
  call,
  put,
  spot,
  show,
  selected,
  onPick,
}: {
  strike: number;
  call: { cost: number; sub: string; greeks?: string; c?: Contract } | null;
  put: { cost: number; sub: string; greeks?: string; c?: Contract } | null;
  spot: number;
  show: 'both' | 'call' | 'put';
  selected: 'call' | 'put' | null;
  onPick: (k: 'call' | 'put') => void;
}) {
  const theme = useTheme();
  // A call is in the money below spot; a put above it. Shading the ITM half is how a chain shows
  // moneyness without making the reader compare two numbers on every row.
  const callItm = strike < spot;
  const putItm = strike > spot;

  const cell = (
    side: 'call' | 'put',
    data: { cost: number; sub: string; greeks?: string; c?: Contract } | null,
    itm: boolean,
  ) => (
    <SpringPressable
      haptic={false}
      scaleTo={0.97}
      onPress={() => data && onPick(side)}
      accessibilityRole="button"
      accessibilityLabel={
        data
          ? `${side === 'call' ? 'Call' : 'Put'} at ${money(strike)}, ${money(data.cost)}, ${data.sub}${data.greeks ? `, ${data.greeks}` : ''}`
          : `No ${side} at ${money(strike)}`
      }
      accessibilityState={{ selected: selected === side, disabled: !data }}
      style={{ flex: 1 }}
    >
      <View
        style={[
          styles.cell,
          itm && { backgroundColor: theme.success + '12' },
          selected === side && { backgroundColor: theme.primary + '2A' },
        ]}
      >
        {/* SPLIT NUMBER guard. At AX5 this broke as "$57." / "00" and the strike beside it as
              "$22" / "2.5" / "0" — three lines for one figure, which is unreadable rather than
              merely ugly. The iteration-52 pass capped the IV and greek sub-lines here and
              never touched the PRICES, which are the numbers that matter; the split-number
              sweep then missed them because it only matched display/title/hero tokens and
              these are bodyMedium and smallBold. Numeric data gets cap + one line. */}
        <ThemedText type="bodyMedium" maxFontSizeMultiplier={1.4} numberOfLines={1} style={styles.cellCost}>{data ? money(data.cost) : '—'}</ThemedText>
        {!!data && <ThemedText type="small" maxFontSizeMultiplier={1.4} themeColor="mutedForeground" style={styles.cellSub}>{data.sub}</ThemedText>}
        {!!data?.greeks && (
          <ThemedText type="small" maxFontSizeMultiplier={1.4} themeColor="mutedForeground" style={styles.cellGreeks}>{data.greeks}</ThemedText>
        )}
      </View>
    </SpringPressable>
  );

  return (
    <View style={[styles.chainRow, { borderBottomColor: theme.border }]}>
      {show !== 'put' && cell('call', call, callItm)}
      <View style={styles.strikeCell}>
        <ThemedText type="smallBold" maxFontSizeMultiplier={1.4} numberOfLines={1}>{money(strike)}</ThemedText>
      </View>
      {show !== 'call' && cell('put', put, putItm)}
    </View>
  );
}

export default function Options() {
  const theme = useTheme();
  /*
   * Gate on ACCESS, not on isPro. A trial user is entitled to options — 4/4 reference trials grant
   * full premium access, and the three-contract cap is a data limit that binds Pro equally. Gating
   * on isPro locked out exactly the users the trial was meant to convert. §22 C26.
   */
  const planTier = useTier();
  const hasAccess = planTier !== 'expired';
  const cash = useApp((s) => s.cash);
  const left = useApp((s) => s.derivativesLeft());
  const open = useApp((s) => s.openDerivative);
  const held = useApp((s) => s.derivatives);

  const [sym, setSym] = useState(ALL_SYMS[0]);
  /*
   * ERROR + RETRY. getExpirations().then() had no .catch(), so a rejected request was an unhandled
   * promise and `loadedFor` never advanced — which means `loading` stayed true FOREVER and the
   * screen spun with no way out. Polygon's free tier is 5 requests/minute, so that is not a rare
   * path; it is what a user hits by tapping through a few underlyings.
   *
   * `nonce` is what the retry button increments: it is in the effect's dep list, so bumping it
   * re-runs the fetch without the user leaving and re-entering the screen.
   */
  const [err, setErr] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const retry = useCallback(() => {
    setErr(null);
    setNonce((n) => n + 1);
  }, []);
  const [expiries, setExpiries] = useState<string[]>([]);
  const [expiry, setExpiry] = useState<string>('');
  const [chain, setChain] = useState<Contract[] | null>(null);
  /** The spot Cboe reported alongside this chain. 0 until one loads. See `spot` below. */
  const [chainSpot, setChainSpot] = useState(0);
  const [loadedFor, setLoadedFor] = useState('');
  const [pick, setPick] = useState<{ strike: number; side: 'call' | 'put' } | null>(null);
  // 'both' is Robinhood's side-by-side; tapping a heading collapses to their focused view.
  const [show, setShow] = useState<'both' | 'call' | 'put'>('both');

  const live = chain !== null && chain.length > 0;

  /*
   * OPEN AT THE MONEY. The chain is now the FULL expiry — 63 to 108 strikes — because Cboe charges
   * nothing and truncating it only hid strikes from the user. But a full chain sorted by strike
   * opens at the lowest one, which is precisely the bug that made this screen useless before: deep
   * ITM calls at $17,710 against a $6,448 balance, with the interesting strikes 55 rows down.
   *
   * So the list stays in strike order — a chain that jumps around is unreadable — and the SCROLL
   * moves instead. `didScroll` keys on symbol+expiry so this fires once per chain and never fights
   * a user who has scrolled away.
   */
  const scrollRef = useRef<ScrollView>(null);
  const didScroll = useRef('');
  /** The ATM row itself, measured in window coordinates. */
  const atmRef = useRef<View>(null);
  /** Current scroll offset, so a window measurement can be turned into a content offset. */
  const offsetY = useRef(0);

  // Expiries for the chosen underlying. An empty result means no token, which the UI states.
  useEffect(() => {
    let cancelled = false;
    // Clears a stale error when the dependency changes, before the fetch that may set a new one.
    // React bails out via Object.is when the value is already null, so on the common path this
    // renders nothing -- it is not the cascading render the rule exists to catch. refs/TASK_QUEUE.md
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setErr(null);
    getExpirations(sym)
      .then((d) => {
        if (cancelled) return;
        setExpiries(d);
        setExpiry(d[0] ?? '');
        setPick(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        // The CODE, never the raw error — market+api.ts distinguishes rate_limited from
        // plan_required precisely so the UI can say something true.
        setErr(e instanceof Error ? e.message : 'upstream');
      });
    return () => {
      cancelled = true;
    };
  }, [sym, nonce]);

  // The chain for the chosen expiry. `loadedFor` derives loading without setState in the effect
  // body — the rule the rest of this codebase follows.
  const key = `${sym}:${expiry}`;
  const loading = expiry !== '' && loadedFor !== key;

  /*
   * THE SPOT THAT PRODUCED THE CHAIN WINS.
   *
   * This was `priceOf(sym)`, which falls back to the static table for any symbol the user has not
   * opened a stock screen for — so the header rendered "Apple at $228.50" above strikes centred on
   * Cboe's real 305.35. One screen, one number, two sources: the same defect as the $1,184 headline
   * above a $225.30 previous close. NVDA hid it, because NVDA happened to have a live mark.
   *
   * Gated on `!loading` so switching underlying cannot show the PREVIOUS symbol's spot beside the
   * new one's strikes for a frame — which would be the same bug with a shorter lifetime. Until the
   * chain lands, `priceOf` is the honest answer: it is what the rest of the app values with.
   */
  const spot = !loading && chainSpot > 0 ? chainSpot : priceOf(sym);

  /*
   * CENTRING RUNS FROM AN EFFECT, not from the row's onLayout.
   *
   * onLayout only fires when layout CHANGES. Switching expiry re-renders the same strikes at the
   * same positions, so it never fired again and the chain snapped back to $50 — measured on device
   * moving from 08-14 to 08-21. Keying an effect on symbol+expiry fires once per chain regardless.
   *
   * rAF because the effect runs before the new rows have been laid out; by the next frame the ref
   * points at a measurable view.
   */
  /**
   * Put the money in view. Safe to call repeatedly — `didScroll` makes it once per chain.
   *
   * Two triggers, because neither alone is enough. The ATM row's `onLayout` is the reliable one on
   * first paint; the effect below covers switching EXPIRY, where the same strikes re-render at the
   * same positions so onLayout never fires again and the chain snapped back to $50 (measured moving
   * 08-14 -> 08-21). The effect alone does not work either: at rAF time after load the view is not
   * yet attached and `measureInWindow` never calls back.
   */
  const centreOnMoney = (k: string) => {
    if (didScroll.current === k) return;
    atmRef.current?.measureInWindow((_x: number, windowY: number) => {
      if (!Number.isFinite(windowY)) return;
      didScroll.current = k;
      // A third of a screen of headroom, so the money reads as the centre of the chain rather than
      // the top of it. Window coordinates plus the live scroll offset give a content offset without
      // knowing the header height — which is what makes this survive a layout change.
      scrollRef.current?.scrollTo({ y: Math.max(0, offsetY.current + windowY - 300), animated: false });
    });
  };

  useEffect(() => {
    if (loading || !live || didScroll.current === key) return;
    /*
     * A TIMEOUT, not requestAnimationFrame. On an expiry switch the ATM row is remounted, so at the
     * next frame `atmRef.current` is still null and `measureInWindow` never calls back — measured:
     * the chain stayed at $50 after moving 08-14 -> 08-21. One tick later the ref is live.
     */
    const id = setTimeout(() => centreOnMoney(key), 120);
    return () => clearTimeout(id);
  }, [key, loading, live]);

  /** The strike nearest the money, or null when there is nothing to centre on. */
  const atmStrike = (() => {
    if (!live || !(spot > 0)) return null;
    return chain!.reduce(
      (best, c) => (Math.abs(c.strike - spot) < Math.abs(best - spot) ? c.strike : best),
      chain![0].strike,
    );
  })();
  useEffect(() => {
    if (!expiry) return;
    let cancelled = false;
    getChain(sym, expiry)
      .catch((e: unknown) => {
        setErr(e instanceof Error ? e.message : 'upstream');
        return null;
      })
      .then((r) => {
        if (!r) return;
      if (cancelled) return;
      setChain(r?.contracts ?? null);
      setChainSpot(r?.spot ?? 0);
      setLoadedFor(`${sym}:${expiry}`);
    });
    return () => {
      cancelled = true;
    };
  }, [sym, expiry]);

  /**
   * One row per strike, carrying both sides. Live contracts when the chain is there, Black-Scholes
   * when it is not — and the header says which.
   */
  const rows = (() => {
    const cost = (c: Contract) => c.ask * CONTRACT_SIZE;
    if (live) {
      const strikes = [...new Set(chain!.map((c) => c.strike))].sort((a, b) => a - b);
      return strikes.map((strike) => {
        const c = chain!.find((x) => x.strike === strike && x.kind === 'call');
        const p = chain!.find((x) => x.strike === strike && x.kind === 'put');
        /*
         * The IV segment is OMITTED when we do not have one, rather than printed as "IV 0%".
         * `plausibleIv` in `api/_chain.ts` zeroes implied volatility that the provider solved out of
         * an option with no time value \u2014 measured: the deepest ITM calls came back 0.0001 while
         * their puts at the same strike were a healthy 0.41. Delta is unaffected and stays.
         */
        const fmt = (x?: Contract) =>
          x
            ? {
                cost: cost(x),
                sub:
                  (x.iv > 0 ? `IV ${(x.iv * 100).toFixed(0)}% \u00b7 ` : '') +
                  `\u0394${x.delta.toFixed(2)}`,
                /*
                 * The SECOND line: gamma, theta, vega, compact, per row.
                 *
                 * Theta across strikes is the lesson this screen exists to teach — time decay is
                 * not a constant, it peaks at the money, and that is visible only when you can read
                 * it DOWN a column. Putting the greeks solely on the ticket meant tapping eleven
                 * strikes to see a shape that one glance should give you.
                 *
                 * Two decimals, not three: a chain row is scanned, not studied, and the ticket
                 * still carries the precise values. Rho is deliberately omitted here — it is the
                 * least useful of the four for equity options at these tenors and the line has to
                 * stay short enough to read.
                 *
                 * Each term drops out when 0, because 0 means unknown in this mapping and a printed
                 * 0.00 reads as a measurement (\u00a70.4).
                 */
                greeks: [
                  greek('\u0393', x.gamma),
                  greek('\u0398', x.theta),
                  greek('\u03bd', x.vega),
                ]
                  .filter(Boolean)
                  .join(' '),
                // The contract itself, so the ticket below can show the FULL greek set. The row
                // stays deliberately terse \u2014 delta and IV \u2014 because a chain row is a scanning
                // surface; the greeks belong where the user has committed to one strike.
                c: x,
              }
            : null;
        return { strike, call: fmt(c), put: fmt(p), days: 0 };
      });
    }
    return strikesAround(spot).map((strike) => ({
      strike,
      // `c: undefined` keeps the modelled row the SAME SHAPE as a live one. Without it the two
      // branches union to a type with no `c`, and the ticket cannot ask for greeks at all — which
      // is also the honest answer here: a Black-Scholes row has no greeks worth printing.
      call: { cost: premium('call', spot, strike, MODEL_DAYS[1]) * CONTRACT_SIZE, sub: 'modelled', greeks: '', c: undefined },
      put: { cost: premium('put', spot, strike, MODEL_DAYS[1]) * CONTRACT_SIZE, sub: 'modelled', greeks: '', c: undefined },
      days: MODEL_DAYS[1],
    }));
  })();

  /** Where the underlying has to reach before the contract makes money. Robinhood surfaces this on
   *  every strike, and it is the one number that explains what a premium buys: a cheap far-out call
   *  is only cheap because the stock has further to travel. */
  const breakEven = (strike: number, c: number, k: 'call' | 'put') =>
    k === 'call' ? strike + c / CONTRACT_SIZE : strike - c / CONTRACT_SIZE;

  const picked = pick ? rows.find((r) => r.strike === pick.strike) : null;
  const chosen = picked && pick ? (pick.side === 'call' ? picked.call : picked.put) : null;
  const canTrade = !!chosen && hasAccess && left > 0 && chosen.cost > 0 && chosen.cost <= cash;

  if (!hasAccess) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <AmbientBackground starCount={26} glow={false} />
        <ScrollView contentContainerStyle={styles.content}>
          <SpringPressable haptic={false} onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel="Back to Trade">
            <UIcon name="chevronLeft" size={22} color={theme.mutedForeground} />
            <ThemedText type="small" themeColor="mutedForeground">Trade</ThemedText>
          </SpringPressable>
          <RiseIn>
            <ThemedText type="title" style={{ fontSize: FontSize.titleLg }}>Options</ThemedText>
            {/* The live header below carries a subtitle and this one did not, so the gated screen
                read as unfinished: a title with nothing under it, then a card. Deliberately NOT a
                shorter version of the card underneath, which already explains what a contract is.
                Restating the same fact twice on one screen is the defect that was just removed from
                the Learn tab. This says where options SIT for someone who has only bought shares. */}
            <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 4 }}>
              Where investing gets interesting.
            </ThemedText>
          </RiseIn>
          <RiseIn delay={80}>
            <Card style={styles.locked}>
              <Atlas size={92} expression="watching" interactive={false} idle />
              <ThemedText type="heading" style={styles.center}>Options are part of Pro</ThemedText>
              <ThemedText type="small" themeColor="mutedForeground" style={styles.center}>
                A contract moves on time and volatility, not just direction. Pro reopens{' '}
                {PRO_DERIVATIVE_PREVIEW} preview contracts on a real chain so you can watch that happen.
              </ThemedText>
              <SlabButton label="See Pro" full onPress={() => router.push('/onboarding?step=paywall')} />
            </Card>
          </RiseIn>
          <RiseIn delay={140}>
            <AskAtlasRow topic="options" label="What even is a call option?" />
          </RiseIn>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={26} glow={false} />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={32}
        onScroll={(e) => {
          offsetY.current = e.nativeEvent.contentOffset.y;
        }}
      >
        <SpringPressable haptic={false} onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel="Back to Trade">
          <UIcon name="chevronLeft" size={22} color={theme.mutedForeground} />
          <ThemedText type="small" themeColor="mutedForeground">Trade</ThemedText>
        </SpringPressable>

        <RiseIn>
          <ThemedText type="title" style={{ fontSize: FontSize.titleLg }}>Options</ThemedText>
          <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 4 }}>
            {STOCKS[sym]?.name ?? sym} at {money(spot)} · {left} of {PRO_DERIVATIVE_PREVIEW} preview contracts left
          </ThemedText>
        </RiseIn>

        {/* Says which of the two worlds you are in. Never let a model masquerade as a market. */}
        <RiseIn delay={60}>
          <View style={[styles.notice, { backgroundColor: theme.primary + '12', borderColor: theme.primary + '33' }]}>
            <ThemedText type="small" themeColor="mutedForeground">
              {live
                ? 'Delayed. Currency in USD. Prices shown are the ask, which is what a buyer actually pays.'
                : `No live chain connected, so these are Black-Scholes estimates at ${Math.round(ASSUMED_VOL * 100)}% assumed volatility. A teaching model, not quotes.`}
            </ThemedText>
          </View>
        </RiseIn>

        <RiseIn delay={100}>
          <ThemedText type="label" themeColor="mutedForeground" style={styles.label}>Underlying</ThemedText>
          <View style={styles.chipRow}>
            {ALL_SYMS.map((s) => (
              <Chip key={s} label={s} on={s === sym} onPress={() => { setSym(s); setPick(null); }} />
            ))}
          </View>
        </RiseIn>

        {expiries.length > 0 && (
          <RiseIn delay={180}>
            <ThemedText type="label" themeColor="mutedForeground" style={styles.label}>Expiry</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {expiries.map((e) => (
                <Chip key={e} label={e.slice(5)} on={e === expiry} onPress={() => { setExpiry(e); setPick(null); }} />
              ))}
            </ScrollView>
          </RiseIn>
        )}

        <RiseIn delay={220}>
          <Card padded={false}>
            {/* Tapping a heading collapses to Robinhood's focused view; tapping it again restores
                side-by-side. The active heading is the one you are reading. */}
            <View style={[styles.colHead, { borderBottomColor: theme.border }]}>
              {show !== 'put' && (
                <SpringPressable
                  haptic={false}
                  onPress={() => setShow(show === 'call' ? 'both' : 'call')}
                  accessibilityRole="button"
                  accessibilityLabel={show === 'call' ? 'Show puts as well' : 'Show calls only'}
                  style={{ flex: 1 }}
                >
                  <ThemedText type="label" style={{ textAlign: 'center', color: theme.iconLilac }}>CALLS</ThemedText>
                </SpringPressable>
              )}
              <View style={styles.strikeCell}>
                <ThemedText type="label" themeColor="mutedForeground">STRIKE</ThemedText>
              </View>
              {show !== 'call' && (
                <SpringPressable
                  haptic={false}
                  onPress={() => setShow(show === 'put' ? 'both' : 'put')}
                  accessibilityRole="button"
                  accessibilityLabel={show === 'put' ? 'Show calls as well' : 'Show puts only'}
                  style={{ flex: 1 }}
                >
                  <ThemedText type="label" style={{ textAlign: 'center', color: theme.iconLilac }}>PUTS</ThemedText>
                </SpringPressable>
              )}
            </View>

            {/*
              A PLAIN ScrollView RENDERS EVERY STRIKE — no virtualisation, 170 to 216 row views.
              That looks like it should be a FlatList, and it was nearly rewritten as one. Measured
              on device 2026-08-14 before touching it:

                Home screen (Rive mascot, course carousel)   789.6 MB RSS
                Options with the full chain rendered         615.3 MB, settling to 407.6 MB

              Opening the chain LOWERS memory, because Home unmounts. Simulator RSS is inflated in
              absolute terms; the delta is the signal, and the delta says this is not a memory
              problem.

              MEASURED 2026-08-24, and the answer is no. The owner reported the app feeling laggy on
              TestFlight, which is the trigger this note named, so the frame rate finally got taken
              with components/perf-hud.tsx: 16 fast flings through the full chain held

                  60 fps, worst frame 23ms, 0 stalls over 50ms

              One 23ms frame is a single dropped frame at 60Hz. This list does NOT block the JS
              thread, so the FlatList rewrite was NOT done — doing it on this evidence would be the
              same hunch-driven rewrite this note warns about.

              THE CEILING, because a clean number is read as proof: that was the SIMULATOR on a dev
              build, and the HUD measures requestAnimationFrame gaps, which is the JS thread only.
              Mounting 200 views taxes the native view system too, and this does not see that. If a
              real device still janks HERE specifically, FlatList with `scrollToIndex` remains the
              fix and it replaces the centring code below wholesale.
            */}
            {loading ? (
              // A hung spinner is worse than an error: it tells the user to wait for something
              // that is never coming. err wins over loading for that reason.
              err ? (
                <RetryNotice code={err} onRetry={retry} />
              ) : (
                // A skeleton, not a spinner. The research is specific about why: a spinner says
                // "wait", a skeleton says "here is the shape of what is coming", and the chain
                // has a very predictable shape — rows of strikes. search.tsx and news.tsx
                // already use SkeletonRows, so this is reuse, not a new component.
                <SkeletonRows count={8} height={44} />
              )
            ) : (
              rows.map((r) => {
                const row = (
                <ChainRow
                  key={r.strike}
                  strike={r.strike}
                  call={r.call}
                  put={r.put}
                  spot={spot}
                  show={show}
                  selected={pick?.strike === r.strike ? pick.side : null}
                  onPick={(side) => setPick({ strike: r.strike, side })}
                />
                );
                if (r.strike !== atmStrike) return row;
                // Measured rather than computed from a row height, which would break the moment the
                // row's typography or padding changes. Offset by a third of a screen so the money
                // sits comfortably in view rather than jammed against the top.
                return (
                  <View
                    /*
                     * KEYED ON THE CHAIN, not just the strike. React reuses a node whose key is
                     * unchanged, so switching expiry re-rendered the same ATM strike in the same
                     * place, `onLayout` never fired again, and the chain snapped back to $50
                     * (measured moving 08-14 -> 08-21). Including the chain key forces a remount,
                     * which fires onLayout, which re-centres. One line, and it is the actual cause
                     * rather than another timing guess.
                     */
                    key={`${key}:${r.strike}`}
                    ref={atmRef}
                    onLayout={() => centreOnMoney(key)}
                  >
                    {row}
                  </View>
                );
              })
            )}
          </Card>
        </RiseIn>

        <RiseIn delay={260}>
          <Card style={styles.ticket}>
            <View style={styles.ticketRow}>
              <ThemedText type="small" themeColor="mutedForeground">
                {pick && chosen
                  ? `${sym} ${money(pick.strike)} ${pick.side === 'call' ? 'Call' : 'Put'}`
                  : 'Tap a call or a put'}
              </ThemedText>
              <ThemedText type="heading" style={{ fontSize: FontSize.subhead }}>{chosen ? money(chosen.cost) : '\u2014'}</ThemedText>
            </View>
            {!!(pick && chosen) && (
              <View style={styles.ticketRow}>
                <ThemedText type="small" themeColor="mutedForeground">Break-even</ThemedText>
                <ThemedText type="smallBold">{money(breakEven(pick.strike, chosen.cost, pick.side))}</ThemedText>
              </View>
            )}
            {/*
              THE GREEKS, received free from Cboe and previously discarded in the mapper. Shown only
              for a LIVE contract: the Black-Scholes fallback has none worth printing, and inventing
              them would be the \u00a70.4 defect this screen keeps turning up. Each is omitted when it is
              0, because 0 means "unknown" throughout the chain mapping and a printed 0.000 reads as
              a measurement.
            */}
            {!!(pick && chosen?.c) && (
              <View style={styles.ticketRow}>
                <ThemedText type="small" themeColor="mutedForeground">Greeks</ThemedText>
                <ThemedText type="small" style={{ textAlign: 'right', flexShrink: 1 }}>
                  {[
                    `\u0394${chosen.c.delta.toFixed(3)}`,
                    chosen.c.gamma ? `\u0393${chosen.c.gamma.toFixed(3)}` : '',
                    chosen.c.theta ? `\u0398${chosen.c.theta.toFixed(3)}` : '',
                    chosen.c.vega ? `\u03bd${chosen.c.vega.toFixed(3)}` : '',
                    chosen.c.rho ? `\u03c1${chosen.c.rho.toFixed(3)}` : '',
                  ]
                    .filter(Boolean)
                    .join('  ')}
                </ThemedText>
              </View>
            )}
            {!!(pick && chosen?.c && (chosen.c.openInterest || chosen.c.volume)) && (
              <View style={styles.ticketRow}>
                <ThemedText type="small" themeColor="mutedForeground">Open interest / volume</ThemedText>
                <ThemedText type="small">
                  {chosen.c.openInterest.toLocaleString()} / {chosen.c.volume.toLocaleString()}
                </ThemedText>
              </View>
            )}
            <SlabButton
              label={left > 0 ? 'Open contract' : 'No previews left'}
              full
              disabled={!canTrade}
              onPress={() =>
                pick &&
                chosen &&
                open({ sym, kind: pick.side, strike: pick.strike, days: picked?.days ?? 0, premium: chosen.cost })
              }
            />
            <ThemedText type="small" themeColor="mutedForeground" style={styles.center}>
              {left === 0
                ? 'You\u2019ve used every preview contract. More arrives with a full options data plan.'
                : chosen && chosen.cost > cash
                  ? `Costs more than your ${money(cash)} in cash.`
                  : `One contract covers ${CONTRACT_SIZE} shares. Held to expiry \u2014 no exercise or assignment yet.`}
            </ThemedText>
          </Card>
        </RiseIn>

        {held.length > 0 && (
          <RiseIn delay={300}>
            <ThemedText type="label" themeColor="mutedForeground" style={styles.label}>Open contracts</ThemedText>
            <Card padded={false}>
              {held.map((p, i) => (
                <View
                  key={p.id}
                  style={[styles.strikeRow, i === held.length - 1 && { borderBottomWidth: 0 }, { borderBottomColor: theme.border }]}
                >
                  <ThemedText type="bodyMedium" style={{ flex: 1 }}>
                    {p.sym} {money(p.strike)} {p.kind === 'call' ? 'Call' : 'Put'}
                  </ThemedText>
                  <ThemedText type="bodyMedium">{money(p.premium)}</ThemedText>
                </View>
              ))}
            </Card>
          </RiseIn>
        )}

        <RiseIn delay={340}>
          <AskAtlasRow topic="options" label="What even is a call option?" />
        </RiseIn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: Spacing.three, paddingBottom: BottomTabInset + Spacing.four, gap: Spacing.three },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  center: { textAlign: 'center' },
  locked: { alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.four },
  notice: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.lg, padding: Spacing.three },
  label: { marginBottom: Spacing.two },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.pill, paddingVertical: 7, paddingHorizontal: Spacing.three },
  loading: { padding: Spacing.four, alignItems: 'center' },
  strikeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  colHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  chainRow: { flexDirection: 'row', alignItems: 'stretch', borderBottomWidth: StyleSheet.hairlineWidth },
  // The strike column is fixed-width and centred so the two sides stay symmetrical and the strikes
  // read as a spine down the middle — the thing that makes a chain legible at a glance.
  strikeCell: { width: 88, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.two },
  cell: { paddingVertical: Spacing.two + 2, paddingHorizontal: Spacing.two, alignItems: 'center', justifyContent: 'center' },
  cellCost: { fontVariant: ['tabular-nums'] },
  /* lineHeight REMOVED. It was frozen at 14 around an 11pt font, and these cells live in a
     fixed 88pt-wide column — the constrained container is exactly what turned the tab bar's
     `lineHeight: 13` and streak-ignite's `hero * 1.25` into clipping boxes at AX5. RN never
     scales lineHeight, so the box could not grow with the text. Capping is right here rather
     than wrapping: an options chain is dense numeric data whose density IS the information,
     and 3.12x text in an 88pt column is unreadable however it is laid out. */
  cellSub: { fontSize: FontSize.label },
  /* The greek line sits a step quieter than the IV/delta line above it: same size, more tracking,
     so a scanning eye reads price -> IV -> greeks in that order rather than treating them as one
     block. HIG-derived, NOT validated against reference apps — ScreensDesign Pro is lapsed and
     AGENTS.md rule 7 requires that be said out loud rather than implied. */
  cellGreeks: { fontSize: FontSize.label, letterSpacing: 0.2, opacity: 0.75 },
  ticket: { gap: Spacing.two },
  ticketRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.two, alignItems: 'center' },
});
