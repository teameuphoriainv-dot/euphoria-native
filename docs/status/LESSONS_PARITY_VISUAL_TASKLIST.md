# Euphoria Native — 300 Lesson Parity Task List

> **Generated** from `artifacts/lesson-parity/manifest.json` at 2026-09-01T21:46:19Z.
> Do not hand-edit. Regenerate with `node scripts/parity/render-tasklist.mjs`.

## Corpus (authoritative)

| Metric | Count |
|---|---:|
| Courses | 12 |
| Lessons | 300 |
| Authored steps | 4050 |
| Expanded lesson screens | 4050 |
| Mastery-challenge screens | 1770 |
| **Total happy-path screens** | **5820** |

## Lane progress

- **Native iOS** `░░░░░░░░░░░░░░░░░░░░░░░░░░░░` 0/300 (0.0%) — 1 failed, 299 pending
- **Live Chrome** `░░░░░░░░░░░░░░░░░░░░░░░░░░░░` 0/300 (0.0%) — 0 failed, 300 pending
- **Adjudication** `░░░░░░░░░░░░░░░░░░░░░░░░░░░░` 0/300 (0.0%) — 0 failed, 300 pending

A lesson is **verified** only when all three lanes are 🟢. Live Chrome evidence is
operator-attested by design: the harness refuses local renders as live-web coverage.

## Open failure reasons

| Reason | Count |
|---|---:|
| `driver_stall_detected` | 1 |
| `lesson_not_completed` | 1 |
| `native_graph_control_coverage_incomplete` | 1 |
| `native_interaction_coverage_incomplete` | 1 |

## Device-fit lane (typography, layout, friction)

The parity harness proves *behavioral* parity. It does not prove the screen **fits**.
These audits cover that and must be green before submission:

| Check | Command | Covers |
|---|---|---|
| Type scale | `python3 scripts/type_audit.py` | font sizes, line height, truncation |
| Dynamic Type | `python3 scripts/dynamic_type_audit.py` | accessibility text sizes, overflow |
| Contrast | `python3 scripts/contrast_audit.py` | WCAG contrast on both themes |
| Touch targets | `python3 scripts/touch_audit.py` | ≥44pt hit areas, friction |
| Interactive states | `python3 scripts/states_audit.py` | pressed/disabled/focus states |
| Reduced motion | `python3 scripts/reduced_motion_audit.py` | motion-off parity |
| Locale | `python3 scripts/locale_audit.py` | string expansion overflow |
| A11y | `node scripts/a11y-audit.mjs` | VoiceOver order and labels |

## Course rollup

| Course | Lessons | Screens | Native | Web | Audit |
|---|---:|---:|---:|---:|---:|
| investing-fundamentals | 25 | 363 | 0/25 | 0/25 | 0/25 |
| personal-finance | 25 | 352 | 0/25 | 0/25 | 0/25 |
| global-economics | 25 | 329 | 0/25 | 0/25 | 0/25 |
| corporate-finance | 25 | 263 | 0/25 | 0/25 | 0/25 |
| business-strategy | 25 | 305 | 0/25 | 0/25 | 0/25 |
| financial-analytics | 25 | 260 | 0/25 | 0/25 | 0/25 |
| behavioral-finance | 25 | 333 | 0/25 | 0/25 | 0/25 |
| applied-accounting | 25 | 362 | 0/25 | 0/25 | 0/25 |
| quantitative-analysis | 25 | 374 | 0/25 | 0/25 | 0/25 |
| risk-management | 25 | 341 | 0/25 | 0/25 | 0/25 |
| alternative-investments | 25 | 396 | 0/25 | 0/25 | 0/25 |
| wealth-management | 25 | 372 | 0/25 | 0/25 | 0/25 |

## Per-lesson ledger

Columns: **N**ative · **W**eb-live · **A**udit. ⚪ pending · 🟡 running · 🟢 accepted · 🔴 failed

### investing-fundamentals

| # | Lesson | Screens | N | W | A | Open issues |
|---:|---|---:|:-:|:-:|:-:|---|
| 1 | Introduction to Investing | 17 | 🔴 | ⚪ | ⚪ | `lesson_not_completed`, `driver_stall_detected`, `native_interaction_coverage_incomplete`, `native_graph_control_coverage_incomplete` |
| 2 | Risk vs. Reward | 14 | ⚪ | ⚪ | ⚪ | — |
| 3 | The Magic of Compound Interest | 14 | ⚪ | ⚪ | ⚪ | — |
| 4 | Stocks vs. Bonds | 15 | ⚪ | ⚪ | ⚪ | — |
| 5 | Diversification | 15 | ⚪ | ⚪ | ⚪ | — |
| 6 | ETFs & Index Funds | 15 | ⚪ | ⚪ | ⚪ | — |
| 7 | Mutual Funds & Fund Types | 15 | ⚪ | ⚪ | ⚪ | — |
| 8 | Dollar Cost Averaging | 15 | ⚪ | ⚪ | ⚪ | — |
| 9 | Building Your First Portfolio | 15 | ⚪ | ⚪ | ⚪ | — |
| 10 | Investment Account Types | 14 | ⚪ | ⚪ | ⚪ | — |
| 11 | Reading Stock Charts | 15 | ⚪ | ⚪ | ⚪ | — |
| 12 | Understanding Market Orders | 15 | ⚪ | ⚪ | ⚪ | — |
| 13 | Dividends & Dividend Investing | 15 | ⚪ | ⚪ | ⚪ | — |
| 14 | Growth vs Value Investing | 15 | ⚪ | ⚪ | ⚪ | — |
| 15 | International Investing | 15 | ⚪ | ⚪ | ⚪ | — |
| 16 | Understanding Market Cycles | 15 | ⚪ | ⚪ | ⚪ | — |
| 17 | Introduction to Options | 14 | ⚪ | ⚪ | ⚪ | — |
| 18 | Tax-Efficient Investing | 14 | ⚪ | ⚪ | ⚪ | — |
| 19 | Behavioral Investing Pitfalls | 14 | ⚪ | ⚪ | ⚪ | — |
| 20 | Evaluating Investment Fees | 14 | ⚪ | ⚪ | ⚪ | — |
| 21 | Rebalancing Your Portfolio | 13 | ⚪ | ⚪ | ⚪ | — |
| 22 | Investment Research & Due Diligence | 14 | ⚪ | ⚪ | ⚪ | — |
| 23 | The Power of Long-Term Investing | 14 | ⚪ | ⚪ | ⚪ | — |
| 24 | Paper Trading: Build Your Portfolio | 13 | ⚪ | ⚪ | ⚪ | — |
| 25 | Paper Trading: Evaluate & Graduate | 14 | ⚪ | ⚪ | ⚪ | — |

### personal-finance

| # | Lesson | Screens | N | W | A | Open issues |
|---:|---|---:|:-:|:-:|:-:|---|
| 1 | Why Personal Finance Matters | 13 | ⚪ | ⚪ | ⚪ | — |
| 2 | Budgeting Basics | 14 | ⚪ | ⚪ | ⚪ | — |
| 3 | Tracking Your Spending | 14 | ⚪ | ⚪ | ⚪ | — |
| 4 | Building an Emergency Fund | 15 | ⚪ | ⚪ | ⚪ | — |
| 5 | Understanding Credit Scores | 15 | ⚪ | ⚪ | ⚪ | — |
| 6 | Managing Debt Wisely | 15 | ⚪ | ⚪ | ⚪ | — |
| 7 | Taxes 101 | 15 | ⚪ | ⚪ | ⚪ | — |
| 8 | Insurance Essentials | 13 | ⚪ | ⚪ | ⚪ | — |
| 9 | Smart Saving & Banking | 13 | ⚪ | ⚪ | ⚪ | — |
| 10 | Building Long-Term Wealth | 14 | ⚪ | ⚪ | ⚪ | — |
| 11 | Negotiating Your Salary & Income | 14 | ⚪ | ⚪ | ⚪ | — |
| 12 | The Psychology of Spending | 14 | ⚪ | ⚪ | ⚪ | — |
| 13 | Student Loans & Education Financing | 15 | ⚪ | ⚪ | ⚪ | — |
| 14 | Renting vs. Buying a Home | 14 | ⚪ | ⚪ | ⚪ | — |
| 15 | Introduction to Investing for Personal Finance | 14 | ⚪ | ⚪ | ⚪ | — |
| 16 | Retirement Accounts Deep Dive | 14 | ⚪ | ⚪ | ⚪ | — |
| 17 | Side Hustles & Multiple Income Streams | 14 | ⚪ | ⚪ | ⚪ | — |
| 18 | Financial Planning for Life Events | 14 | ⚪ | ⚪ | ⚪ | — |
| 19 | Identity Theft & Financial Security | 14 | ⚪ | ⚪ | ⚪ | — |
| 20 | Understanding Inflation & Purchasing Power | 14 | ⚪ | ⚪ | ⚪ | — |
| 21 | Estate Planning Basics | 14 | ⚪ | ⚪ | ⚪ | — |
| 22 | Charitable Giving & Tax Benefits | 14 | ⚪ | ⚪ | ⚪ | — |
| 23 | Financial Independence & Early Retirement | 14 | ⚪ | ⚪ | ⚪ | — |
| 24 | Teaching Kids About Money | 14 | ⚪ | ⚪ | ⚪ | — |
| 25 | Personal Finance Capstone | 14 | ⚪ | ⚪ | ⚪ | — |

### global-economics

| # | Lesson | Screens | N | W | A | Open issues |
|---:|---|---:|:-:|:-:|:-:|---|
| 1 | What Is Economics? | 14 | ⚪ | ⚪ | ⚪ | — |
| 2 | Supply and Demand | 15 | ⚪ | ⚪ | ⚪ | — |
| 3 | The Federal Reserve & Monetary Policy | 14 | ⚪ | ⚪ | ⚪ | — |
| 4 | GDP: Measuring the Economy | 14 | ⚪ | ⚪ | ⚪ | — |
| 5 | Inflation & Deflation | 14 | ⚪ | ⚪ | ⚪ | — |
| 6 | International Trade & Globalization | 14 | ⚪ | ⚪ | ⚪ | — |
| 7 | Fiscal Policy & Government Spending | 14 | ⚪ | ⚪ | ⚪ | — |
| 8 | Currency Markets & Exchange Rates | 15 | ⚪ | ⚪ | ⚪ | — |
| 9 | Emerging Markets & Economic Development | 15 | ⚪ | ⚪ | ⚪ | — |
| 10 | Global Economics Foundations Checkpoint | 15 | ⚪ | ⚪ | ⚪ | — |
| 11 | Labor Markets & Employment | 13 | ⚪ | ⚪ | ⚪ | — |
| 12 | Income Inequality & Wealth Distribution | 13 | ⚪ | ⚪ | ⚪ | — |
| 13 | Economic Indicators & Leading Signals | 14 | ⚪ | ⚪ | ⚪ | — |
| 14 | Central Banks Around the World | 13 | ⚪ | ⚪ | ⚪ | — |
| 15 | Trade Wars & Tariffs | 13 | ⚪ | ⚪ | ⚪ | — |
| 16 | Economic Sanctions & Geopolitics | 12 | ⚪ | ⚪ | ⚪ | — |
| 17 | Commodity Markets & Natural Resources | 12 | ⚪ | ⚪ | ⚪ | — |
| 18 | The Economics of Climate Change | 13 | ⚪ | ⚪ | ⚪ | — |
| 19 | Digital Economy & Platform Economics | 12 | ⚪ | ⚪ | ⚪ | — |
| 20 | Debt, Deficits & Sovereign Risk | 12 | ⚪ | ⚪ | ⚪ | — |
| 21 | Economic Bubbles & Financial Crises | 13 | ⚪ | ⚪ | ⚪ | — |
| 22 | Behavioral Economics in Policy | 13 | ⚪ | ⚪ | ⚪ | — |
| 23 | The Future of Money: CBDCs & Digital Currency | 13 | ⚪ | ⚪ | ⚪ | — |
| 24 | Development Economics & Poverty | 13 | ⚪ | ⚪ | ⚪ | — |
| 25 | Global Economics Advanced Capstone | 6 | ⚪ | ⚪ | ⚪ | — |

### corporate-finance

| # | Lesson | Screens | N | W | A | Open issues |
|---:|---|---:|:-:|:-:|:-:|---|
| 1 | What Is Corporate Finance? | 9 | ⚪ | ⚪ | ⚪ | — |
| 2 | Financial Statements: The Language of Business | 9 | ⚪ | ⚪ | ⚪ | — |
| 3 | Time Value of Money | 11 | ⚪ | ⚪ | ⚪ | — |
| 4 | Capital Structure: Debt vs. Equity | 10 | ⚪ | ⚪ | ⚪ | — |
| 5 | Valuing a Company | 11 | ⚪ | ⚪ | ⚪ | — |
| 6 | Working Capital Management | 6 | ⚪ | ⚪ | ⚪ | — |
| 7 | Mergers & Acquisitions | 6 | ⚪ | ⚪ | ⚪ | — |
| 8 | Dividend Policy & Share Buybacks | 6 | ⚪ | ⚪ | ⚪ | — |
| 9 | Risk Management & Hedging | 5 | ⚪ | ⚪ | ⚪ | — |
| 10 | Corporate Governance & Ethics | 5 | ⚪ | ⚪ | ⚪ | — |
| 11 | Capital Budgeting & Project Evaluation | 14 | ⚪ | ⚪ | ⚪ | — |
| 12 | Cost of Capital & WACC | 13 | ⚪ | ⚪ | ⚪ | — |
| 13 | Leveraged Buyouts & Private Equity | 13 | ⚪ | ⚪ | ⚪ | — |
| 14 | IPOs & Going Public | 13 | ⚪ | ⚪ | ⚪ | — |
| 15 | Financial Distress & Restructuring | 12 | ⚪ | ⚪ | ⚪ | — |
| 16 | International Corporate Finance | 12 | ⚪ | ⚪ | ⚪ | — |
| 17 | Corporate Bonds & Debt Markets | 12 | ⚪ | ⚪ | ⚪ | — |
| 18 | Treasury Management & Cash Flow | 12 | ⚪ | ⚪ | ⚪ | — |
| 19 | ESG & Sustainable Finance | 12 | ⚪ | ⚪ | ⚪ | — |
| 20 | Financial Regulation & Compliance | 12 | ⚪ | ⚪ | ⚪ | — |
| 21 | Startup Finance & Venture Funding | 12 | ⚪ | ⚪ | ⚪ | — |
| 22 | Executive Compensation & Incentives | 12 | ⚪ | ⚪ | ⚪ | — |
| 23 | Corporate Tax Strategy | 12 | ⚪ | ⚪ | ⚪ | — |
| 24 | Financial Engineering & Structured Products | 12 | ⚪ | ⚪ | ⚪ | — |
| 25 | Corporate Finance Advanced Capstone | 12 | ⚪ | ⚪ | ⚪ | — |

### business-strategy

| # | Lesson | Screens | N | W | A | Open issues |
|---:|---|---:|:-:|:-:|:-:|---|
| 1 | What Is Business Strategy? | 15 | ⚪ | ⚪ | ⚪ | — |
| 2 | Business Models & Revenue Strategies | 15 | ⚪ | ⚪ | ⚪ | — |
| 3 | Competitive Analysis & Market Positioning | 15 | ⚪ | ⚪ | ⚪ | — |
| 4 | Startup Fundraising & Venture Capital | 14 | ⚪ | ⚪ | ⚪ | — |
| 5 | Go-to-Market Strategy | 15 | ⚪ | ⚪ | ⚪ | — |
| 6 | Scaling a Business | 15 | ⚪ | ⚪ | ⚪ | — |
| 7 | Mergers, Acquisitions & Corporate Strategy | 15 | ⚪ | ⚪ | ⚪ | — |
| 8 | Innovation & Disruption | 15 | ⚪ | ⚪ | ⚪ | — |
| 9 | Leadership & Organizational Design | 14 | ⚪ | ⚪ | ⚪ | — |
| 10 | Strategic Planning Capstone | 14 | ⚪ | ⚪ | ⚪ | — |
| 11 | Customer Acquisition & Retention | 13 | ⚪ | ⚪ | ⚪ | — |
| 12 | Pricing Strategy & Revenue Optimization | 11 | ⚪ | ⚪ | ⚪ | — |
| 13 | Brand Building & Market Perception | 12 | ⚪ | ⚪ | ⚪ | — |
| 14 | Supply Chain Strategy | 11 | ⚪ | ⚪ | ⚪ | — |
| 15 | Digital Transformation | 11 | ⚪ | ⚪ | ⚪ | — |
| 16 | Data-Driven Decision Making | 11 | ⚪ | ⚪ | ⚪ | — |
| 17 | Strategic Partnerships & Alliances | 11 | ⚪ | ⚪ | ⚪ | — |
| 18 | Crisis Management & Business Continuity | 11 | ⚪ | ⚪ | ⚪ | — |
| 19 | Global Expansion Strategy | 11 | ⚪ | ⚪ | ⚪ | — |
| 20 | Platform Business Models | 11 | ⚪ | ⚪ | ⚪ | — |
| 21 | Sustainability & Corporate Social Responsibility | 11 | ⚪ | ⚪ | ⚪ | — |
| 22 | Talent Strategy & Human Capital | 11 | ⚪ | ⚪ | ⚪ | — |
| 23 | Product Strategy & Portfolio Management | 8 | ⚪ | ⚪ | ⚪ | — |
| 24 | Strategic Finance for Business Leaders | 8 | ⚪ | ⚪ | ⚪ | — |
| 25 | Business Strategy Advanced Capstone | 7 | ⚪ | ⚪ | ⚪ | — |

### financial-analytics

| # | Lesson | Screens | N | W | A | Open issues |
|---:|---|---:|:-:|:-:|:-:|---|
| 1 | What Is Financial Analytics? | 15 | ⚪ | ⚪ | ⚪ | — |
| 2 | Descriptive Statistics for Finance | 14 | ⚪ | ⚪ | ⚪ | — |
| 3 | Probability & Risk Assessment | 14 | ⚪ | ⚪ | ⚪ | — |
| 4 | Regression Analysis & Forecasting | 15 | ⚪ | ⚪ | ⚪ | — |
| 5 | Financial Modeling Fundamentals | 14 | ⚪ | ⚪ | ⚪ | — |
| 6 | DCF Analysis & Valuation | 15 | ⚪ | ⚪ | ⚪ | — |
| 7 | Monte Carlo Simulation | 14 | ⚪ | ⚪ | ⚪ | — |
| 8 | Data Visualization & Financial Dashboards | 15 | ⚪ | ⚪ | ⚪ | — |
| 9 | Machine Learning in Finance | 15 | ⚪ | ⚪ | ⚪ | — |
| 10 | Financial Analytics Capstone | 15 | ⚪ | ⚪ | ⚪ | — |
| 11 | Time Series Analysis for Finance | 14 | ⚪ | ⚪ | ⚪ | — |
| 12 | Sentiment Analysis & Alternative Data | 14 | ⚪ | ⚪ | ⚪ | — |
| 13 | Credit Scoring Models | 14 | ⚪ | ⚪ | ⚪ | — |
| 14 | Portfolio Analytics & Performance Attribution | 6 | ⚪ | ⚪ | ⚪ | — |
| 15 | A/B Testing & Experimentation in Finance | 6 | ⚪ | ⚪ | ⚪ | — |
| 16 | SQL & Database Queries for Finance | 6 | ⚪ | ⚪ | ⚪ | — |
| 17 | Python for Financial Analysis | 6 | ⚪ | ⚪ | ⚪ | — |
| 18 | Automated Reporting & Dashboards | 6 | ⚪ | ⚪ | ⚪ | — |
| 19 | Anomaly Detection & Fraud Analytics | 6 | ⚪ | ⚪ | ⚪ | — |
| 20 | Real-Time Data Processing & Streaming | 6 | ⚪ | ⚪ | ⚪ | — |
| 21 | Natural Language Processing in Finance | 6 | ⚪ | ⚪ | ⚪ | — |
| 22 | Predictive Modeling for Market Trends | 6 | ⚪ | ⚪ | ⚪ | — |
| 23 | Risk Analytics & Stress Testing Models | 6 | ⚪ | ⚪ | ⚪ | — |
| 24 | Big Data & Cloud Computing in Finance | 6 | ⚪ | ⚪ | ⚪ | — |
| 25 | Financial Analytics Advanced Capstone | 6 | ⚪ | ⚪ | ⚪ | — |

### behavioral-finance

| # | Lesson | Screens | N | W | A | Open issues |
|---:|---|---:|:-:|:-:|:-:|---|
| 1 | Your Brain vs. Your Money | 15 | ⚪ | ⚪ | ⚪ | — |
| 2 | Cognitive Biases That Destroy Wealth | 15 | ⚪ | ⚪ | ⚪ | — |
| 3 | Emotional Cycles of Investing | 16 | ⚪ | ⚪ | ⚪ | — |
| 4 | Herd Behavior & Social Proof | 16 | ⚪ | ⚪ | ⚪ | — |
| 5 | Overconfidence & Illusion of Control | 14 | ⚪ | ⚪ | ⚪ | — |
| 6 | Mental Accounting & Framing Effects | 14 | ⚪ | ⚪ | ⚪ | — |
| 7 | Prospect Theory & Decision Making | 14 | ⚪ | ⚪ | ⚪ | — |
| 8 | Nudge Theory & Choice Architecture | 15 | ⚪ | ⚪ | ⚪ | — |
| 9 | Building a Rational Investment Framework | 14 | ⚪ | ⚪ | ⚪ | — |
| 10 | Behavioral Finance Capstone | 15 | ⚪ | ⚪ | ⚪ | — |
| 11 | Anchoring Bias & Price Perception | 16 | ⚪ | ⚪ | ⚪ | — |
| 12 | Sunk Cost Fallacy in Investing | 16 | ⚪ | ⚪ | ⚪ | — |
| 13 | Regret Aversion & Decision Paralysis | 16 | ⚪ | ⚪ | ⚪ | — |
| 14 | Status Quo Bias & Inertia | 16 | ⚪ | ⚪ | ⚪ | — |
| 15 | Narrative Fallacy & Storytelling in Markets | 16 | ⚪ | ⚪ | ⚪ | — |
| 16 | Attention Bias & Media Influence | 16 | ⚪ | ⚪ | ⚪ | — |
| 17 | Disposition Effect: Selling Winners Too Early | 13 | ⚪ | ⚪ | ⚪ | — |
| 18 | Gambler's Fallacy & Hot Hand Bias | 12 | ⚪ | ⚪ | ⚪ | — |
| 19 | Endowment Effect & Loss Aversion | 11 | ⚪ | ⚪ | ⚪ | — |
| 20 | Social Media & Modern Market Psychology | 9 | ⚪ | ⚪ | ⚪ | — |
| 21 | Behavioral Portfolio Theory | 10 | ⚪ | ⚪ | ⚪ | — |
| 22 | Debiasing Techniques & Cognitive Tools | 9 | ⚪ | ⚪ | ⚪ | — |
| 23 | Behavioral Economics in Everyday Life | 9 | ⚪ | ⚪ | ⚪ | — |
| 24 | Market Anomalies & Behavioral Explanations | 10 | ⚪ | ⚪ | ⚪ | — |
| 25 | Behavioral Finance Advanced Capstone | 6 | ⚪ | ⚪ | ⚪ | — |

### applied-accounting

| # | Lesson | Screens | N | W | A | Open issues |
|---:|---|---:|:-:|:-:|:-:|---|
| 1 | The Language of Accounting | 15 | ⚪ | ⚪ | ⚪ | — |
| 2 | Financial Ratios: X-Raying a Company | 15 | ⚪ | ⚪ | ⚪ | — |
| 3 | The Income Statement Deep Dive | 15 | ⚪ | ⚪ | ⚪ | — |
| 4 | The Balance Sheet Decoded | 15 | ⚪ | ⚪ | ⚪ | — |
| 5 | Cash Flow Statement Mastery | 15 | ⚪ | ⚪ | ⚪ | — |
| 6 | Journal Entries & Double-Entry Bookkeeping | 15 | ⚪ | ⚪ | ⚪ | — |
| 7 | Cost Accounting & Break-Even Analysis | 15 | ⚪ | ⚪ | ⚪ | — |
| 8 | Auditing & Internal Controls | 15 | ⚪ | ⚪ | ⚪ | — |
| 9 | Forensic Accounting & Fraud Detection | 15 | ⚪ | ⚪ | ⚪ | — |
| 10 | Applied Accounting Foundations Checkpoint | 15 | ⚪ | ⚪ | ⚪ | — |
| 11 | Revenue Recognition & Accrual Accounting | 15 | ⚪ | ⚪ | ⚪ | — |
| 12 | Inventory Accounting Methods | 16 | ⚪ | ⚪ | ⚪ | — |
| 13 | Depreciation & Asset Management | 16 | ⚪ | ⚪ | ⚪ | — |
| 14 | Accounts Receivable & Payable Management | 16 | ⚪ | ⚪ | ⚪ | — |
| 15 | Payroll Accounting & Employee Benefits | 16 | ⚪ | ⚪ | ⚪ | — |
| 16 | Tax Accounting Fundamentals | 16 | ⚪ | ⚪ | ⚪ | — |
| 17 | Budgeting & Variance Analysis | 14 | ⚪ | ⚪ | ⚪ | — |
| 18 | Consolidation & Group Accounting | 13 | ⚪ | ⚪ | ⚪ | — |
| 19 | International Accounting Standards (IFRS vs GAAP) | 13 | ⚪ | ⚪ | ⚪ | — |
| 20 | Nonprofit & Government Accounting | 13 | ⚪ | ⚪ | ⚪ | — |
| 21 | Managerial Accounting & Decision Making | 13 | ⚪ | ⚪ | ⚪ | — |
| 22 | Advanced Financial Statement Analysis | 13 | ⚪ | ⚪ | ⚪ | — |
| 23 | Accounting Information Systems | 13 | ⚪ | ⚪ | ⚪ | — |
| 24 | Ethics & Professional Standards in Accounting | 12 | ⚪ | ⚪ | ⚪ | — |
| 25 | Applied Accounting Advanced Capstone | 13 | ⚪ | ⚪ | ⚪ | — |

### quantitative-analysis

| # | Lesson | Screens | N | W | A | Open issues |
|---:|---|---:|:-:|:-:|:-:|---|
| 1 | What Is Quantitative Finance? | 15 | ⚪ | ⚪ | ⚪ | — |
| 2 | Probability & Expected Value | 14 | ⚪ | ⚪ | ⚪ | — |
| 3 | Time Series Analysis | 14 | ⚪ | ⚪ | ⚪ | — |
| 4 | Portfolio Optimization & Markowitz | 14 | ⚪ | ⚪ | ⚪ | — |
| 5 | Derivatives Pricing & Black-Scholes | 15 | ⚪ | ⚪ | ⚪ | — |
| 6 | Monte Carlo Methods in Finance | 14 | ⚪ | ⚪ | ⚪ | — |
| 7 | Factor Models & Alpha Generation | 15 | ⚪ | ⚪ | ⚪ | — |
| 8 | Statistical Arbitrage | 14 | ⚪ | ⚪ | ⚪ | — |
| 9 | Algorithmic Trading Systems | 15 | ⚪ | ⚪ | ⚪ | — |
| 10 | Quantitative Analysis Foundations Checkpoint | 15 | ⚪ | ⚪ | ⚪ | — |
| 11 | Stochastic Calculus Foundations | 15 | ⚪ | ⚪ | ⚪ | — |
| 12 | Volatility Modeling & GARCH | 15 | ⚪ | ⚪ | ⚪ | — |
| 13 | Fixed Income Analytics | 15 | ⚪ | ⚪ | ⚪ | — |
| 14 | Exotic Options & Path-Dependent Derivatives | 15 | ⚪ | ⚪ | ⚪ | — |
| 15 | Credit Derivatives & CDS Pricing | 15 | ⚪ | ⚪ | ⚪ | — |
| 16 | Interest Rate Models | 16 | ⚪ | ⚪ | ⚪ | — |
| 17 | Machine Learning for Quant Trading | 15 | ⚪ | ⚪ | ⚪ | — |
| 18 | High-Frequency Trading & Market Microstructure | 15 | ⚪ | ⚪ | ⚪ | — |
| 19 | Backtesting & Strategy Validation | 16 | ⚪ | ⚪ | ⚪ | — |
| 20 | Execution Algorithms & Transaction Costs | 15 | ⚪ | ⚪ | ⚪ | — |
| 21 | Risk-Neutral Pricing & Measure Theory | 16 | ⚪ | ⚪ | ⚪ | — |
| 22 | Copulas & Dependency Modeling | 15 | ⚪ | ⚪ | ⚪ | — |
| 23 | Bayesian Methods in Finance | 15 | ⚪ | ⚪ | ⚪ | — |
| 24 | Quantum Computing & Future of Quant Finance | 16 | ⚪ | ⚪ | ⚪ | — |
| 25 | Quantitative Analysis Advanced Capstone | 15 | ⚪ | ⚪ | ⚪ | — |

### risk-management

| # | Lesson | Screens | N | W | A | Open issues |
|---:|---|---:|:-:|:-:|:-:|---|
| 1 | What Is Risk? | 14 | ⚪ | ⚪ | ⚪ | — |
| 2 | Measuring & Managing Market Risk | 15 | ⚪ | ⚪ | ⚪ | — |
| 3 | Value at Risk Deep Dive | 15 | ⚪ | ⚪ | ⚪ | — |
| 4 | Credit Risk & Default Probability | 15 | ⚪ | ⚪ | ⚪ | — |
| 5 | Operational & Liquidity Risk | 15 | ⚪ | ⚪ | ⚪ | — |
| 6 | Options & Hedging Strategies | 15 | ⚪ | ⚪ | ⚪ | — |
| 7 | Fixed Income Risk & Duration | 14 | ⚪ | ⚪ | ⚪ | — |
| 8 | Enterprise Risk Management | 15 | ⚪ | ⚪ | ⚪ | — |
| 9 | Regulatory Frameworks & Basel III | 15 | ⚪ | ⚪ | ⚪ | — |
| 10 | Risk Management Capstone | 15 | ⚪ | ⚪ | ⚪ | — |
| 11 | Tail Risk & Black Swan Events | 15 | ⚪ | ⚪ | ⚪ | — |
| 12 | Counterparty Risk & Collateral Management | 15 | ⚪ | ⚪ | ⚪ | — |
| 13 | Currency Risk & FX Hedging | 14 | ⚪ | ⚪ | ⚪ | — |
| 14 | Interest Rate Risk Management | 15 | ⚪ | ⚪ | ⚪ | — |
| 15 | Insurance & Risk Transfer | 14 | ⚪ | ⚪ | ⚪ | — |
| 16 | Cyber Risk & Technology Threats | 15 | ⚪ | ⚪ | ⚪ | — |
| 17 | Climate Risk & ESG Risk Factors | 14 | ⚪ | ⚪ | ⚪ | — |
| 18 | Model Risk & Validation | 15 | ⚪ | ⚪ | ⚪ | — |
| 19 | Scenario Analysis & War Gaming | 15 | ⚪ | ⚪ | ⚪ | — |
| 20 | Portfolio Risk Decomposition | 11 | ⚪ | ⚪ | ⚪ | — |
| 21 | Systemic Risk & Contagion | 11 | ⚪ | ⚪ | ⚪ | — |
| 22 | Behavioral Risk: Human Factors in Risk Management | 11 | ⚪ | ⚪ | ⚪ | — |
| 23 | Quantitative Risk Modeling | 11 | ⚪ | ⚪ | ⚪ | — |
| 24 | Risk Governance & Board Oversight | 11 | ⚪ | ⚪ | ⚪ | — |
| 25 | Risk Management Advanced Capstone | 6 | ⚪ | ⚪ | ⚪ | — |

### alternative-investments

| # | Lesson | Screens | N | W | A | Open issues |
|---:|---|---:|:-:|:-:|:-:|---|
| 1 | Beyond Stocks & Bonds | 15 | ⚪ | ⚪ | ⚪ | — |
| 2 | Real Estate Investing | 15 | ⚪ | ⚪ | ⚪ | — |
| 3 | Cryptocurrency & Digital Assets | 15 | ⚪ | ⚪ | ⚪ | — |
| 4 | Commodities & Futures Trading | 14 | ⚪ | ⚪ | ⚪ | — |
| 5 | Private Equity & Venture Capital | 15 | ⚪ | ⚪ | ⚪ | — |
| 6 | Hedge Fund Strategies | 15 | ⚪ | ⚪ | ⚪ | — |
| 7 | Collectibles, Art & Alternative Assets | 15 | ⚪ | ⚪ | ⚪ | — |
| 8 | Infrastructure & Farmland Investing | 15 | ⚪ | ⚪ | ⚪ | — |
| 9 | Portfolio Integration & Alternative Allocation | 15 | ⚪ | ⚪ | ⚪ | — |
| 10 | Alternative Investments Capstone | 15 | ⚪ | ⚪ | ⚪ | — |
| 11 | Real Estate Investment Trusts (REITs) | 16 | ⚪ | ⚪ | ⚪ | — |
| 12 | Distressed Debt Investing | 16 | ⚪ | ⚪ | ⚪ | — |
| 13 | DeFi & Tokenized Assets | 16 | ⚪ | ⚪ | ⚪ | — |
| 14 | Carbon Credits & Environmental Markets | 17 | ⚪ | ⚪ | ⚪ | — |
| 15 | Music Royalties & Intellectual Property | 17 | ⚪ | ⚪ | ⚪ | — |
| 16 | SPACs & Blank Check Companies | 17 | ⚪ | ⚪ | ⚪ | — |
| 17 | Emerging Market Alternatives | 17 | ⚪ | ⚪ | ⚪ | — |
| 18 | Fund of Funds & Multi-Strategy | 17 | ⚪ | ⚪ | ⚪ | — |
| 19 | Due Diligence for Alternatives | 17 | ⚪ | ⚪ | ⚪ | — |
| 20 | Liquidity & Lock-Up Considerations | 16 | ⚪ | ⚪ | ⚪ | — |
| 21 | Tax Implications of Alternative Investments | 16 | ⚪ | ⚪ | ⚪ | — |
| 22 | Alternative Data & Analytics | 17 | ⚪ | ⚪ | ⚪ | — |
| 23 | Structuring Alternative Investment Vehicles | 16 | ⚪ | ⚪ | ⚪ | — |
| 24 | Regulation & Compliance in Alternatives | 16 | ⚪ | ⚪ | ⚪ | — |
| 25 | Alternative Investments Advanced Capstone | 16 | ⚪ | ⚪ | ⚪ | — |

### wealth-management

| # | Lesson | Screens | N | W | A | Open issues |
|---:|---|---:|:-:|:-:|:-:|---|
| 1 | Building & Preserving Wealth | 15 | ⚪ | ⚪ | ⚪ | — |
| 2 | Tax-Advantaged Investing | 14 | ⚪ | ⚪ | ⚪ | — |
| 3 | Retirement Planning & Withdrawal Strategies | 14 | ⚪ | ⚪ | ⚪ | — |
| 4 | Estate Planning & Trusts | 14 | ⚪ | ⚪ | ⚪ | — |
| 5 | Insurance as a Wealth Tool | 15 | ⚪ | ⚪ | ⚪ | — |
| 6 | Charitable Giving & Philanthropy | 15 | ⚪ | ⚪ | ⚪ | — |
| 7 | Family Wealth & Multi-Generational Planning | 15 | ⚪ | ⚪ | ⚪ | — |
| 8 | Advanced Tax Optimization | 14 | ⚪ | ⚪ | ⚪ | — |
| 9 | Working with Financial Advisors | 15 | ⚪ | ⚪ | ⚪ | — |
| 10 | Wealth Management Capstone | 14 | ⚪ | ⚪ | ⚪ | — |
| 11 | Asset Location & Tax-Efficient Portfolios | 16 | ⚪ | ⚪ | ⚪ | — |
| 12 | Social Security & Government Benefits | 15 | ⚪ | ⚪ | ⚪ | — |
| 13 | Health Care Planning & HSAs | 15 | ⚪ | ⚪ | ⚪ | — |
| 14 | Real Estate in Wealth Management | 16 | ⚪ | ⚪ | ⚪ | — |
| 15 | Business Owner Wealth Strategies | 15 | ⚪ | ⚪ | ⚪ | — |
| 16 | Divorce & Financial Separation | 15 | ⚪ | ⚪ | ⚪ | — |
| 17 | Behavioral Wealth Management | 14 | ⚪ | ⚪ | ⚪ | — |
| 18 | Alternative Investments for HNW Clients | 16 | ⚪ | ⚪ | ⚪ | — |
| 19 | International Wealth Management | 15 | ⚪ | ⚪ | ⚪ | — |
| 20 | Concentrated Stock Positions | 15 | ⚪ | ⚪ | ⚪ | — |
| 21 | Wealth Transfer Techniques | 15 | ⚪ | ⚪ | ⚪ | — |
| 22 | Impact Investing & Values-Based Portfolios | 15 | ⚪ | ⚪ | ⚪ | — |
| 23 | Retirement Income Strategies | 15 | ⚪ | ⚪ | ⚪ | — |
| 24 | Technology & Robo-Advisors in Wealth Management | 15 | ⚪ | ⚪ | ⚪ | — |
| 25 | Wealth Management Advanced Capstone | 15 | ⚪ | ⚪ | ⚪ | — |

## Acceptance rule

- Every lesson row shows 🟢 in all three lanes.
- Every device-fit audit above exits clean.
- `npm run precheck` and `npm run check` both green.
- No failure reason remains in the table above.
