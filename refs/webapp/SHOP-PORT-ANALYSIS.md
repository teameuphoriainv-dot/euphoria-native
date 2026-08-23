# N21 — porting the Euphorium Shop to iOS. Read this before building.
Source read 2026-08-23 from `euphoriaweb@origin/master:src/features/shop/*`.

## Two blockers, and neither is a styling problem

### 1. The web shop is SERVER-BACKED. iOS has no server and no accounts.
`useCoinShop.ts` reads and writes Supabase:

| table / rpc | holds |
|---|---|
| `profiles.coins` | the balance |
| `user_inventory` | owned items |
| `active_powerups` | active effects, with `expires_at` |
| `coin_transactions` | an append-only ledger |
| `increment_coins` (rpc) | the only mutation path |

iOS state is local zustand + AsyncStorage, and `auth.tsx` says outright there is no account system.
So an iOS wallet would be a **separate local economy**: a learner with 500 Euphorium on web opens
iOS and has 0, and spending on one never touches the other. That is not a bug I can fix in the
client — it is what "no accounts" means. It should be a deliberate decision, not a discovery.

### 2. Only 4 of the 21 items map to mechanics iOS actually has
| item | iOS has the mechanic? |
|---|---|
| `double_xp_1hr` `double_xp_3hr` | **yes** — XP exists (`applyXp`) |
| `streak_freeze_1` `streak_freeze_3` | **yes** — streaks exist (`nextStreak`) |
| `heart_refill` | **no** — iOS has no hearts/lives system at all |
| `hint_pack_3` `hint_pack_10` | **no** — lessons have no hint mechanic |
| 6 × `avatar_*` | **no** — no user avatar. Atlas is a mascot, not a customisable player |
| 8 × `theme_*` `frame_*` `badge_*` | **no** — no profile customisation surface |

**17 of 21 items require building a system that does not exist**: hearts, hints, avatars, profile
themes, frames and badges. That is a product build, not a port. Shipping the shop with 17 items
that cannot be used — or worse, that are purchasable and inert — would be a shelf of dead controls
on a screen whose entire job is to make spending feel good.

## The full item table, for whoever builds this
| id | price | category | rarity |
|---|---|---|---|
| double_xp_1hr | 200 | power-up | uncommon |
| double_xp_3hr | 450 | power-up | rare |
| streak_freeze_1 | 150 | power-up | common |
| streak_freeze_3 | 400 | power-up | uncommon |
| heart_refill | 100 | power-up | common |
| hint_pack_3 | 120 | power-up | common |
| hint_pack_10 | 350 | power-up | uncommon |
| avatar_sunglasses | 250 | avatar | uncommon |
| avatar_monocle | 300 | avatar | uncommon |
| avatar_top_hat | 400 | avatar | rare |
| avatar_crown | 500 | avatar | rare |
| avatar_wizard_hat | 600 | avatar | epic |
| avatar_diamond_ring | 800 | avatar | epic |
| theme_midnight | 300 | profile | uncommon |
| theme_neon | 350 | profile | rare |
| theme_gold | 500 | profile | rare |
| frame_rainbow | 350 | profile | uncommon |
| frame_fire | 400 | profile | rare |
| frame_diamond | 1000 | profile | legendary |
| badge_rocket | 300 | profile | uncommon |
| badge_whale | 750 | profile | epic |

Earn rates, from the Shop's own "How to earn Euphorium" panel:
lessons **+50–100** · daily streaks **+25** · winning games **+10–50** · daily challenges **+30**.

Award sites on web: `CompletionScreen.tsx`, `useXPSystem.tsx`, `LifeSimInvestorGame.tsx`, all via
`increment_coins`. iOS already fires equivalents for three of the four (lesson completion, streak,
daily quests); "winning games" needs a game that reports a win, and iOS has one game.

## Recommendation
Ship **earning + balance + the four usable power-ups** first, and leave the other 17 out rather
than shipping inert cards. Say plainly in the UI that the balance is device-local until accounts
exist. Everything else waits on: an account system (blocker 1) and hearts/hints/avatars/profile
customisation (blocker 2).

The `shopItems.ts` shape ports cleanly and should be the shared source of truth when those land —
same argument as the pixel catalogue and the curriculum.
