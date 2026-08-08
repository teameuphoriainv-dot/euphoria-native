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
| `avalanche-vs-snowball` | Credit | ship | nothing |
| `budgeting-50-30-20-rule` | Money basics | polish | matches no format (best: explainer, 1/5). Formats: explainer, myth, number, head2head, case |
| `build-your-first-investment-portfolio` | Investing | polish | matches no format (best: explainer, 1/5). Formats: explainer, myth, number, head2head, case |
| `bull-vs-bear-markets` | Markets | polish | matches no format (best: explainer, 1/5). Formats: explainer, myth, number, head2head, case; excerpt may not state a surprise — no contrast or negation |
| `buy-now-pay-later` | Credit | ship | nothing |
| `capital-gains-tax-basics` | Money basics | polish | matches no format (best: explainer, 1/5). Formats: explainer, myth, number, head2head, case; excerpt may not state a surprise — no contrast or negation |
| `carrying-a-balance-myth` | Credit | ship | nothing |
| `dollar-cost-averaging-explained` | Strategy | polish | matches no format (best: explainer, 1/5). Formats: explainer, myth, number, head2head, case; excerpt may not state a surprise — no contrast or negation |
| `emergency-fund-how-much` | Money basics | polish | matches no format (best: explainer, 1/5). Formats: explainer, myth, number, head2head, case; excerpt may not state a surprise — no contrast or negation |
| `employer-401k-match` | Money basics | polish | matches no format (best: explainer, 1/5). Formats: explainer, myth, number, head2head, case; excerpt may not state a surprise — no contrast or negation |
| `first-paycheck-guide` | Money basics | polish | matches no format (best: explainer, 1/5). Formats: explainer, myth, number, head2head, case; excerpt may not state a surprise — no contrast or negation |
| `good-debt-vs-bad-debt` | Credit | polish | matches no format (best: explainer, 1/5). Formats: explainer, myth, number, head2head, case |
| `how-credit-cards-work` | Credit | polish | excerpt may not state a surprise — no contrast or negation |
| `how-credit-scores-work` | Credit | polish | matches no format (best: explainer, 1/5). Formats: explainer, myth, number, head2head, case |
| `how-tax-brackets-work` | Money basics | ship | nothing |
| `how-the-stock-market-works` | Markets | polish | matches no format (best: explainer, 1/5). Formats: explainer, myth, number, head2head, case; excerpt may not state a surprise — no contrast or negation; only 0 numeric facts — §9d wants a worked example with real numbers |
| `how-to-read-a-stock-quote` | Markets | polish | matches no format (best: explainer, 1/5). Formats: explainer, myth, number, head2head, case; excerpt may not state a surprise — no contrast or negation |
| `inflation-explained` | Markets | polish | matches no format (best: explainer, 1/5). Formats: explainer, myth, number, head2head, case; excerpt may not state a surprise — no contrast or negation |
| `investment-fees-explained` | Strategy | polish | excerpt may not state a surprise — no contrast or negation |
| `lump-sum-vs-dca` | Strategy | ship | nothing |
| `market-crashes-what-history-teaches` | Markets | polish | matches no format (best: explainer, 1/5). Formats: explainer, myth, number, head2head, case; only 2 numeric facts — §9d wants a worked example with real numbers |
| `picking-stocks-myth` | Investing | polish | only 1 numeric facts — §9d wants a worked example with real numbers |
| `roth-ira-explained-for-beginners` | Investing | polish | matches no format (best: explainer, 1/5). Formats: explainer, myth, number, head2head, case |
| `roth-vs-traditional` | Investing | ship | nothing |
| `stocks-vs-bonds-explained` | Investing | polish | matches no format (best: explainer, 1/5). Formats: explainer, myth, number, head2head, case; excerpt may not state a surprise — no contrast or negation |
| `target-date-funds-explained` | Investing | polish | excerpt may not state a surprise — no contrast or negation; only 1 numeric facts — §9d wants a worked example with real numbers |
| `the-cost-of-waiting-five-years` | Money basics | ship | nothing |
| `the-money-order-of-operations` | Strategy | ship | nothing |
| `the-month-maya-did-nothing` | Strategy | ship | nothing |
| `the-ten-best-days` | Markets | ship | nothing |
| `what-is-an-etf` | Investing | polish | matches no format (best: explainer, 1/5). Formats: explainer, myth, number, head2head, case; excerpt may not state a surprise — no contrast or negation |
| `what-is-compound-interest` | Money basics | polish | matches no format (best: explainer, 1/5). Formats: explainer, myth, number, head2head, case; excerpt may not state a surprise — no contrast or negation |
| `what-is-diversification` | Strategy | polish | matches no format (best: explainer, 1/5). Formats: explainer, myth, number, head2head, case; only 0 numeric facts — §9d wants a worked example with real numbers |
| `what-is-risk-tolerance` | Strategy | polish | matches no format (best: explainer, 1/5). Formats: explainer, myth, number, head2head, case |
| `what-moves-a-stock-price` | Markets | polish | only 1 numeric facts — §9d wants a worked example with real numbers |
