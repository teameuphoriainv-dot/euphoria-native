# Euphoria — competitive analysis

Researched 2026-08-06. Every claim is tagged **[V]** verified this session with a cited source,
**[K]** domain knowledge not re-verified today, or **[?]** could not verify — do not act on it
without checking.

---

## 0. The framing error to fix first

`refs/` benchmarks Euphoria almost exclusively against **Brilliant** and **Duolingo**. Those are
**craft benchmarks, not competitors.** Neither sells finance education. Nobody choosing where to
learn investing is comparing Euphoria to Duolingo.

The consequence is real: there is not one document in `refs/` comparing Euphoria to a company that
actually competes for the same user. Every quality bar in the repo is a *motion* bar. That is a
blind spot, not a strategy.

Separate the two permanently:

- **Craft benchmarks** — Duolingo, Brilliant. Steal motion, habit loop, lesson mechanics.
- **Competitors** — everyone below. They decide whether Euphoria gets users.

---

## 1. The market driver — this is the most important fact in this document

US states are **legislating this market into existence right now.**

- **30 states** require a *standalone* personal finance course to graduate, as of 2026. **[V]**
- **39 states** require personal finance in some form, including embedded in economics. **[V]**
- Up from **17 states in 2022** — the requirement roughly doubled in four years. **[V]**
- **Ohio's class of 2026 is the first cohort** that must pass the course. **Texas and Delaware**
  activate for the 2026‑27 cohort. **[V]**

Read that carefully: a legally-mandated, non-optional, annually-recurring audience of US high
schoolers is being switched on *this school year and next*. That is the tailwind, and it is the
reason this category is suddenly crowded.

It also tells you where the money is. A mandate creates a **budget holder** — the district — not
just a consumer. Every serious competitor below is chasing that budget, not the App Store.

---

## 2. Competitor set, tiered

### Tier 1 — Direct: gamified finance education, mobile, consumer-facing

| Competitor | What it is | Moat | Read |
|---|---|---|---|
| **Zogo** | Gamified financial literacy. **1,200+ bite-size modules**, points redeemable for gift cards. **[V]** Distributed through **banks and credit unions** who white-label it. **[V]** | **Distribution, not craft.** A credit union hands it to members; Zogo never pays for the user. | The closest true analogue to Euphoria, and the one to study hardest. |
| **Blossom** | Social investing app — community feed plus education. **[K]** | Community/network effect. | Investing-specific like Euphoria, but social-first rather than curriculum-first. |
| **Finimize** | Finance news + education for adult retail investors, subscription. **[K]** | Editorial voice, daily habit. | Wrong age bracket. Adjacent, not head-on. |

### Tier 2 — Adjacent: education attached to real money

| Competitor | What it is | Moat |
|---|---|---|
| **Greenlight** | Teen debit card + investing + built-in lessons. **[K]** | **The parent's wallet.** Parents pay monthly; education rides along free. |
| **GoHenry** | Teen card with "Money Missions" bite-size lessons. **[V]** | Same as Greenlight — card first, lessons attached. |
| **Step** | Teen banking, credit-building, education. **[K]** | Real credit history for teens. |
| **Stash** | Invest + learn; **earn stock for completing lessons**. **[V]** | Real money as the reward, not points. |
| **Public / Robinhood Learn** | Brokerage-attached educational content. **[K]** | The user is already funded and trading. |

This tier is dangerous in a way the founder should sit with: **their reward is real money; Euphoria's
is XP.** Stash gives you stock for finishing a lesson. Zogo gives you a gift card. Euphoria gives
you a number that goes up. That is a materially weaker incentive to any user old enough to invest.

### Tier 3 — Institutional: owns the classroom

| Competitor | What it is | Moat |
|---|---|---|
| **NGPF** (Next Gen Personal Finance) | Nonprofit, **free** curriculum + teacher PD. **[K]** Runs the definitive state-mandate tracker cited in §1. **[V]** | **Free, and teachers already use it.** Effectively the default. |
| **EVERFI** | Sponsor-funded school financial literacy, paid for by banks. **[K]** | Free to schools; banks pay for goodwill. |
| **Khan Academy** | Free personal finance course. **[K]** | Brand trust, zero price. |

If Euphoria ever chases the school budget created in §1, this is the wall. **Its price is zero and
its incumbency is a decade deep.**

### Tier 4 — Craft benchmarks, and one latent threat

- **Brilliant, Duolingo** — steal from, don't compete with.
- ⚠️ **Duolingo is a plausible entrant.** It has already expanded beyond language into **math,
  music and chess** **[K]**. Finance is an obvious next vertical, and they would arrive with the
  habit loop, the mascot, the brand and ~100M users. This is the single largest existential risk
  in the set and it is not mentioned anywhere in `refs/`.

---

## 3. The uncomfortable strategic read

Euphoria's stated differentiation, across every document in `refs/`, is **craft** — better motion,
a more alive mascot, "build above Duolingo + Brilliant."

**Craft is the weakest moat in this category.**

- Zogo wins on **distribution** — it doesn't need to be pretty, a credit union hands it to you.
- NGPF wins on **price and incumbency** — free, and the teacher already has it open.
- Greenlight/Stash win on **real money** — a stock beats a mascot hop.
- Duolingo, if it enters, wins on **everything at once**.

None of those are beaten by a nicer spring curve. The motion work is worth doing — a "horrible"-
feeling app cannot win on anything — but it is **table stakes, not the wedge.** Treat it as
removing a reason to churn, not as a reason to adopt.

---

## 4. Where the actual white space is

Three genuine openings, ranked:

**1. Investing, not "personal finance."** Nearly every Tier 1 and Tier 3 competitor is
budgeting/credit/saving-first; investing is a thin final module. Euphoria's brief says *investing*
explicitly. That is real differentiation and it is currently under-exploited in the positioning —
"finance education" is the crowded framing, "learn to actually invest" is not. **[K]**

**2. Consumer pull in a category built on institutional push.** Zogo, EVERFI and NGPF all arrive
*at* the user via a bank or a teacher. That makes them worthy but unloved — and it means nobody in
Tier 1/3 is optimising for a teenager voluntarily opening the app on a Saturday. Craft is the wrong
*moat* but exactly the right *wedge* for organic consumer growth where competitors structurally
cannot follow.

**3. The mandate cohort needs a supplement, not a curriculum.** Ohio's 2026 class and Texas's
2026‑27 class **[V]** are about to be forced through a course most will find dull. The opening is
not to replace NGPF in the classroom — unwinnable — but to be what students use *because* the
mandated course bored them. Consumer, not B2B2C.

---

## 5. What to steal, specifically

- **Zogo** → the **rewards ladder**. Points→gift cards is a stronger loop than pure XP. Euphoria's
  reward currency needs to eventually convert into something real. **[V on mechanism]**
- **Stash** → **stock-as-reward** framing. The reward should be thematically the thing being taught.
- **GoHenry** → **"Money Missions"** naming — task-shaped, not lesson-shaped. **[V]**
- **Duolingo** → the streak and its loss-aversion, already the plan.
- **Brilliant** → lesson interaction craft, already the plan.

---

## 6. What I could NOT verify — do not quote these

- **[?]** Funding, valuation, revenue or user counts for **any** competitor listed. Searches did not
  return reliable figures and I did not fabricate them.
- **[?]** Current pricing for Zogo, Blossom, Finimize, Greenlight, Step.
- **[?]** Blossom and Finimize specifics — search returned almost nothing on either; both are
  characterised from prior knowledge **[K]**, not from sources read today.
- **[?]** Whether Duolingo has any actual finance product in development. The entrant risk is
  reasoned from its math/music/chess expansion, not from any announcement.
- **[?]** Zogo's DAU/retention, and whether its bank-distribution model actually produces engaged
  users or just installs.

Any of these being wrong changes the ranking in §3. They are worth one hour of primary research
(Crunchbase, App Store rank history, LinkedIn headcount) before a strategy is built on this.

---

## Sources

- NGPF state-mandate tracker + live dashboard — https://www.ngpf.org/live-us-dashboard/
- SoFi, *State of Financial Literacy for High School Students by State (2026)*
- Forbes, *New High School Graduation Requirement: Financial Literacy* (2026-04-14)
- Ramsey Solutions, *Which States Require Financial Literacy in High School*
- Zogo — https://zogo.com/ and https://zogo.com/mobile-app
- Fitzsimons Credit Union, *13 Financial Literacy Games* (GoHenry Money Missions, Stash)
- TechBullion, *Gamified Financial Education Apps*
