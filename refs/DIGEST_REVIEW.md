# Digest review — all 25 existing guides (§9b)

**GENERATED. Do not hand-edit.** Regenerate with:

```bash
cd ~/euphoriaweb-current && node scripts/new-digest.mjs lint --md
```

Three of §9b's six criteria are already enforced mechanically and are not re-checked here:
`readMinutes` is **recomputed** by `sync-digest.sh` at 225 wpm rather than trusted, the lesson
mapping is checked by the native repo's `check-digest-lessons.mjs` (currently **25 guides → 24
distinct lessons, no orphans** — §9b's "31 entries" is out of date), and an unknown `hero` key
kills the sync. What was unenforced, and what this table covers, is the editorial shape.

## The headline finding: the library is two cohorts, not one

| cohort | n | shape |
|---|---|---|
| A | 10 | `Why it matters` → `By the numbers` → `The catch` → `What to do` → **`The bottom line`** |
| B | 15 | bespoke per-article headings, ending on **`Why this matters for you`** — a house ad (*"practice with paper trading…"*), not a conclusion |

Where a Bottom Line exists it never restates the lead — all 10 pass. The defect is that **15
guides have no conclusion at all**. `verdict = REWRITE` below means a structural error, not a
judgement about the prose, which is mostly good.


| guide | cat | verdict | what is wrong |
|---|---|---|---|
| `emergency-fund-how-much` | Money basics | **REWRITE** | no "## The bottom line" — the article has no conclusion; ends on "Why this matters for you" — that is a house ad, not a conclusion; only 0/5 canonical sections (Why it matters / By the numbers / The catch / What to do / The bottom line); excerpt may not state a surprise — no contrast or negation |
| `how-the-stock-market-works` | Markets | **REWRITE** | no "## The bottom line" — the article has no conclusion; ends on "Why this matters for you" — that is a house ad, not a conclusion; only 0/5 canonical sections (Why it matters / By the numbers / The catch / What to do / The bottom line); excerpt may not state a surprise — no contrast or negation; only 0 numeric facts — §9d wants a worked example with real numbers |
| `inflation-explained` | Markets | **REWRITE** | no "## The bottom line" — the article has no conclusion; ends on "Why this matters for you" — that is a house ad, not a conclusion; only 0/5 canonical sections (Why it matters / By the numbers / The catch / What to do / The bottom line); excerpt may not state a surprise — no contrast or negation |
| `what-is-an-etf` | Investing | **REWRITE** | no "## The bottom line" — the article has no conclusion; ends on "Why this matters for you" — that is a house ad, not a conclusion; only 0/5 canonical sections (Why it matters / By the numbers / The catch / What to do / The bottom line); excerpt may not state a surprise — no contrast or negation |
| `what-is-compound-interest` | Money basics | **REWRITE** | no "## The bottom line" — the article has no conclusion; ends on "Why this matters for you" — that is a house ad, not a conclusion; only 0/5 canonical sections (Why it matters / By the numbers / The catch / What to do / The bottom line); excerpt may not state a surprise — no contrast or negation |
| `budgeting-50-30-20-rule` | Money basics | **REWRITE** | no "## The bottom line" — the article has no conclusion; only 0/5 canonical sections (Why it matters / By the numbers / The catch / What to do / The bottom line) |
| `build-your-first-investment-portfolio` | Investing | **REWRITE** | no "## The bottom line" — the article has no conclusion; only 0/5 canonical sections (Why it matters / By the numbers / The catch / What to do / The bottom line) |
| `dollar-cost-averaging-explained` | Strategy | **REWRITE** | no "## The bottom line" — the article has no conclusion; only 0/5 canonical sections (Why it matters / By the numbers / The catch / What to do / The bottom line); excerpt may not state a surprise — no contrast or negation |
| `first-paycheck-guide` | Money basics | **REWRITE** | no "## The bottom line" — the article has no conclusion; only 0/5 canonical sections (Why it matters / By the numbers / The catch / What to do / The bottom line); excerpt may not state a surprise — no contrast or negation |
| `good-debt-vs-bad-debt` | Credit | **REWRITE** | no "## The bottom line" — the article has no conclusion; only 0/5 canonical sections (Why it matters / By the numbers / The catch / What to do / The bottom line) |
| `how-credit-scores-work` | Credit | **REWRITE** | no "## The bottom line" — the article has no conclusion; only 0/5 canonical sections (Why it matters / By the numbers / The catch / What to do / The bottom line) |
| `market-crashes-what-history-teaches` | Markets | **REWRITE** | no "## The bottom line" — the article has no conclusion; only 0/5 canonical sections (Why it matters / By the numbers / The catch / What to do / The bottom line); only 2 numeric facts — §9d wants a worked example with real numbers |
| `roth-ira-explained-for-beginners` | Investing | **REWRITE** | no "## The bottom line" — the article has no conclusion; only 0/5 canonical sections (Why it matters / By the numbers / The catch / What to do / The bottom line) |
| `stocks-vs-bonds-explained` | Investing | **REWRITE** | no "## The bottom line" — the article has no conclusion; only 0/5 canonical sections (Why it matters / By the numbers / The catch / What to do / The bottom line); excerpt may not state a surprise — no contrast or negation |
| `what-is-risk-tolerance` | Strategy | **REWRITE** | no "## The bottom line" — the article has no conclusion; only 0/5 canonical sections (Why it matters / By the numbers / The catch / What to do / The bottom line) |
| `bull-vs-bear-markets` | Markets | polish | only 1/5 canonical sections (Why it matters / By the numbers / The catch / What to do / The bottom line); excerpt may not state a surprise — no contrast or negation |
| `capital-gains-tax-basics` | Money basics | polish | only 1/5 canonical sections (Why it matters / By the numbers / The catch / What to do / The bottom line); excerpt may not state a surprise — no contrast or negation |
| `employer-401k-match` | Money basics | polish | only 1/5 canonical sections (Why it matters / By the numbers / The catch / What to do / The bottom line); excerpt may not state a surprise — no contrast or negation |
| `how-credit-cards-work` | Credit | polish | excerpt may not state a surprise — no contrast or negation |
| `how-tax-brackets-work` | Money basics | ship | nothing |
| `how-to-read-a-stock-quote` | Markets | polish | only 1/5 canonical sections (Why it matters / By the numbers / The catch / What to do / The bottom line); excerpt may not state a surprise — no contrast or negation |
| `investment-fees-explained` | Strategy | polish | excerpt may not state a surprise — no contrast or negation |
| `target-date-funds-explained` | Investing | polish | excerpt may not state a surprise — no contrast or negation; only 1 numeric facts — §9d wants a worked example with real numbers |
| `what-is-diversification` | Strategy | polish | only 1/5 canonical sections (Why it matters / By the numbers / The catch / What to do / The bottom line); only 0 numeric facts — §9d wants a worked example with real numbers |
| `what-moves-a-stock-price` | Markets | polish | only 1 numeric facts — §9d wants a worked example with real numbers |
