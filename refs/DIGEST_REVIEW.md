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
| `budgeting-50-30-20-rule` | Money basics | ship | nothing |
| `build-your-first-investment-portfolio` | Investing | ship | nothing |
| `bull-vs-bear-markets` | Markets | ship | nothing |
| `buy-now-pay-later` | Credit | ship | nothing |
| `capital-gains-tax-basics` | Money basics | ship | nothing |
| `carrying-a-balance-myth` | Credit | ship | nothing |
| `dollar-cost-averaging-explained` | Strategy | ship | nothing |
| `emergency-fund-how-much` | Money basics | ship | nothing |
| `employer-401k-match` | Money basics | ship | nothing |
| `first-paycheck-guide` | Money basics | ship | nothing |
| `good-debt-vs-bad-debt` | Credit | ship | nothing |
| `how-credit-cards-work` | Credit | ship | nothing |
| `how-credit-scores-work` | Credit | ship | nothing |
| `how-tax-brackets-work` | Money basics | ship | nothing |
| `how-the-stock-market-works` | Markets | ship | nothing |
| `how-to-read-a-stock-quote` | Markets | ship | nothing |
| `inflation-explained` | Markets | ship | nothing |
| `investment-fees-explained` | Strategy | ship | nothing |
| `lump-sum-vs-dca` | Strategy | ship | nothing |
| `market-crashes-what-history-teaches` | Markets | ship | nothing |
| `picking-stocks-myth` | Investing | ship | nothing |
| `roth-ira-explained-for-beginners` | Investing | ship | nothing |
| `roth-vs-traditional` | Investing | ship | nothing |
| `stocks-vs-bonds-explained` | Investing | ship | nothing |
| `target-date-funds-explained` | Investing | ship | nothing |
| `the-cost-of-waiting-five-years` | Money basics | ship | nothing |
| `the-money-order-of-operations` | Strategy | ship | nothing |
| `the-month-maya-did-nothing` | Strategy | ship | nothing |
| `the-ten-best-days` | Markets | ship | nothing |
| `what-is-an-etf` | Investing | ship | nothing |
| `what-is-compound-interest` | Money basics | ship | nothing |
| `what-is-diversification` | Strategy | ship | nothing |
| `what-is-risk-tolerance` | Strategy | ship | nothing |
| `what-moves-a-stock-price` | Markets | ship | nothing |
