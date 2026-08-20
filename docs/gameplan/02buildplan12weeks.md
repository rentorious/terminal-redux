# Terminal Redux — Sequenced Build Plan, Weeks 0–14

**Version:** 0.1 · 20 August 2026
**Context:** solo dev, high AI leverage, TypeScript/Node, **building to raise**
**Start date assumption:** week 0 begins ~25 August 2026, putting week 14 at the start of December

---

## 0. The shape of the plan, and why

Five tracks run **in parallel**, not in sequence. That's the whole point.

| Track | Nature | Why it can't wait |
|---|---|---|
| **A · Legal & admin** | Blocking, low effort, long latency | The d.o.o. gates supplier registration, which gates the sandbox, which gates everything fiscal |
| **B · Certification** | Queue-bound, not effort-bound | Statutory 15-day decision plus documented multi-round resubmission. No amount of AI leverage compresses a government queue |
| **C · Discovery** | Perishable, and gets 10× better with a prototype in hand | Your top-ranked wedge (W1) has literally zero supporting data |
| **D · Spine** | Effort-bound, expensive to get wrong | This is where your architecture experience converts to advantage |
| **E · GTM & raise prep** | Compounding | Target list and metrics instrumentation are cheap early, painful late |

The single biggest sequencing mistake available to you is treating this as *research → design → build → sell*. Track B's clock starts the day you register the company and runs regardless of what you're coding. Track C's quality depends on Track D having produced something to show. Run them together.

---

## 1. Milestone spine

| Week | Milestone | Evidence it produces |
|---|---|---|
| **0** | d.o.o. registered, PIB issued, supplier registration submitted | The certification clock starts |
| **3** | Prototype on a tablet, walkable into a venue | Something to interview *with* |
| **5** | 12+ operator interviews done, dwell/turnover data collected | W1 validated or killed; open items #8, #9, #11 closed |
| **6** | Fiscal adapter passing all 17 receipt checks in the sandbox | The hard technical risk retired |
| **8** | `@tr/domain` complete and exhaustively tested | The spine is real |
| **10** | End-to-end vertical slice: tablet → hub → L-PFR → printed receipt | You have a POS |
| **11** | ESIR (+ L-PFR) submitted for approval | The queue starts |
| **14** | Pilot venue live, unpaid, you present for their opening week | The first reference and the first real data |

If week 10 slips, everything after it slips. Protect it.

---

## 2. Week by week

### Week 0 — unblock everything (admin, ~4 days of your time)

- **Register the d.o.o.** Do not defer this. It gates supplier registration, the bezbednosni element, Innovation Fund eligibility, and any contract you sign. Budget a week of calendar time even if it's a day of work.
- **Submit supplier registration** with the Poreska uprava and request sandbox access (`tap.sandbox.suf.purs.gov.rs`).
- **Send two written questions to the Poreska uprava.** These are the highest-value hours in the whole quarter:
  1. Is a waiter tablet that emits orders but never composes a fiscal invoice inside the ESIR scope? *(Determines whether your fastest-moving component is behind a government approval gate.)*
  2. Is V-PFR acceptable for a brick-and-mortar hospitality venue? *(Determines whether hub failure means "degraded" or "closed", and whether a low-cost tier is possible.)*
- **Contact two or three L-PFR vendors** and ask one question: what OS does your L-PFR run on, and can a single instance serve N concurrent ESIR clients at what latency? This determines your hub hardware.
- Buy the hardware you'll actually test on: two cheap Android tablets (the ones a Serbian café would actually buy — not a flagship), one network thermal printer, one mini-PC.
- Register the domain and a plain landing page. You'll want a URL to leave behind after interviews.

> **Do not start the Innovation Fund application yet.** Smart Start requires teams of 2–5 — you're excluded solo. Mini Grants requires an existing company, which you'll have. Note the next call date and revisit in Track E.

### Weeks 1–3 — prototype (Track D-prime) + sandbox first contact (Track B)

**Prototype (≈70% of your time).** See the prototype scope doc. Non-fiscal, single-venue, hardcoded menu, local-only. Floor map with per-table ageing, order entry with a speed screen, split and partial payment, seat assignment. Deliberately throwaway — with one exception: it is a live test of the event vocabulary from `@tr/domain`, and the vocabulary is the thing you carry forward.

**Sandbox (≈30%).** Get a single test receipt to fiscalize end to end against the dev E-SDC. Not the real adapter yet — just prove the loop closes and learn the protocol's actual shape. Expect this to be fiddlier than the docs suggest.

**Also this window:** build the interview target list from APR filings (NACE 56.10 and 56.30). Rank by revenue and venue count. You want ~30 names to get 12–15 conversations.

**Gate at end of week 3:** can you walk into a café, put a tablet on a table, and have a waiter take a real order on it without you touching it? If not, cut prototype scope — don't extend the window.

### Weeks 2–5 — discovery (Track C) running over the prototype

- **12–15 interviews**, mixed café / bar / restaurant, at least three multi-venue operators. Weekday afternoons, 15:00–17:00, never during service.
- **Dwell and turnover counting** at ten Belgrade terraces — this closes open item #8, on which your top-ranked wedge depends. Protocol is in the interview kit.
- **Two accountant conversations** (knjigovođe serving hospitality clients). They close open item #10 (are normativi and KEP books mandated, in what form) in about thirty minutes each, and they're a distribution channel you'll want later anyway.
- **One tax adviser conversation** on napojnice (open item #3) before you design anything tipping-shaped.

**Gate at end of week 5 — the honest one.** If the table-ageing idea produces shrugs rather than *"where do I get this"*, W1 is not your wedge. Re-rank against what they actually reacted to and adjust the roadmap before you build the spine around the wrong assumption. **This gate is the entire reason the prototype comes before the spine.**

### Weeks 3–6 — the real fiscal adapter (Track B)

This is the permanent artifact, not a spike. Built to the interface in §3 of the architecture spec.

- All invoice types: Promet, Avans, Kopija, Predračun, Obuka × Prodaja, Refundacija
- Buyer-ID enforcement on refunds; reference to the original document
- Payment-method collapse to *gotovina* for hospitality
- Runtime tax-table resolution with revision tracking
- `journal` rendering and printing
- **QR print validation**: render a test receipt, machine-scan it, verify 40–50 mm and no clipping. Nobody does this and it's the #1 documented field defect
- `FiscalHealth`: SE limit consumed, days since audit, certificate expiry, unconfirmed count, clock skew
- All 17 approval-report checks passing in the sandbox

**Gate at end of week 6:** every one of the 17 checks green, and a machine-scannable QR off real thermal paper on the printer a Serbian café would actually own.

### Weeks 5–8 — `@tr/domain` (Track D)

Pure TypeScript, zero I/O, exhaustively tested. Informed by whatever the interviews changed.

- The event union, finalised against what the prototype proved the floor actually does
- `Allocation` and the settlement invariants — including the rounding-remainder rule
- Projection reducers: `open_checks`, `floor_state`, `kds_queue`, `shift_report`, `staff_activity`
- The `toFiscalDocument` translator interface, with `fiscal-rs` as the first implementation
- Property-based tests on the invariants that actually matter: sum of fiscalized settlements never exceeds check total; a fiscalized settlement can never be cancelled; replaying a log always produces an identical projection

**This is the highest-leverage week-block in the plan.** If this package is right, everything downstream is typing. Resist the urge to start on screens.

### Weeks 7–10 — hub, sync and the vertical slice (Track D)

- Hub service: venue event log, settlement lease manager, time authority, printer/KDS routing
- Sync protocol: resumable WebSocket by `(deviceId, deviceSeq)`; append-union for orders, lease for settlement
- Device app on Capacitor with local SQLite; the three shells (waiter / counter / KDS)
- The cloud plane, minimally: event ingestion, Postgres with RLS, one back-office view
- **The failure drills, run for real, not reasoned about:** pull the hub's power mid-service; pull a tablet's Wi-Fi mid-order; unplug the printer between fire and acknowledgement; set a device clock 5 minutes fast

**Gate at end of week 10:** a waiter takes an order on a tablet with Wi-Fi off, reconnects, settles, and a compliant fiscal receipt prints. That's a POS.

### Weeks 11–14 — submission, pilot, and the first real data

- **Week 11: submit for ESIR approval** (and L-PFR if you're certifying your own). The 15-day statutory clock starts, and field reports say to expect multiple rounds of resubmitted test receipts. Budget for iteration; do not plan around a first-pass approval.
- **Weeks 11–13:** back office essentials — the manager's fiscal-health screen (W4, and it demos beautifully), shift report, daily sales, raw event export.
- **Week 12:** pick the pilot venue from the interview cohort. Criteria in §5.
- **Week 14: pilot goes live, free.** You are physically present for their entire first week of service. Not on call — present. This is where you learn the twenty things no interview surfaces, and it's the reference that unlocks the next ten venues.

---

## 3. Dependency graph — what blocks what

```
d.o.o. registered
   ├──► supplier registration ──► sandbox access ──► fiscal adapter ──► submission ──► approval ──► PILOT LIVE
   ├──► bezbednosni element (for your own test venue)
   └──► Innovation Fund eligibility (Mini Grants)

PU written answer: "is the tablet in ESIR scope?"
   └──► confirms or invalidates the whole velocity architecture   ⚠ ask week 0

L-PFR vendor answer: OS + concurrency
   └──► hub hardware purchase ──► hub build                        ⚠ ask week 0

prototype (wk 3)
   └──► interviews (wk 5) ──► W1 validated ──► spine scope confirmed ──► @tr/domain (wk 8)

@tr/domain (wk 8) ──► hub + sync + devices (wk 10) ──► vertical slice
fiscal adapter (wk 6) ──────────────────────────────┘

APR target list (wk 3) ──► interviews ──► pilot candidate (wk 12)
```

**The two week-0 questions sit upstream of almost everything.** Ask them on day one. A written answer takes weeks to arrive and both answers change the architecture.

---

## 4. Decision gates — with real criteria

| Gate | Week | Pass condition | If it fails |
|---|---|---|---|
| **G1 · Prototype is demoable** | 3 | A waiter takes a real order on it unaided | Cut scope, don't extend. The interviews matter more than the prototype's completeness |
| **G2 · W1 is validated** | 5 | ≥6 of 12 operators react to table-ageing with a specific "when could I have this" question, unprompted | Re-rank the wedges against what they *did* react to. Do not build the spine around a dead assumption |
| **G3 · Fiscal risk retired** | 6 | 17/17 checks green, QR machine-scans off real paper | This is the existential technical risk. If it's not clear by week 8, consider licensing a third-party L-PFR and certifying only the ESIR, accepting the €3–6/venue/month leak |
| **G4 · Tablet-scope answer received** | ~6 | PU confirms the tablet sits outside ESIR scope | Design the thin certified relay shell now. Painful but survivable if caught early; fatal if caught in month six |
| **G5 · Vertical slice works** | 10 | Offline order → reconnect → settle → compliant receipt | Slipping here slips everything. Cut back-office scope, never spine scope |
| **G6 · Pilot committed** | 12 | A named venue has agreed in writing, with a start date | Go back to the interview cohort. Do not launch without a pilot — an unpiloted product meeting real service is how you burn your first reference |

---

## 5. Choosing the pilot venue

Not the biggest, not the friendliest. Optimise for **learning per week** and for the reference being credible to the next customer.

**Want:** 20–40 covers of table service with a real terrace (that's your W1 thesis under load) · an owner who was specific and critical in the interview rather than enthusiastic · a venue that has already switched POS at least once, so they know what migration costs and won't romanticise it · walking distance from you.

**Avoid:** the highest-volume venue in your cohort (a bad week there is a public failure) · anyone whose main interest was price · anyone who couldn't describe their current system's actual failures — they haven't looked hard enough to give you useful feedback · multi-venue groups as pilot #1. Group #1 should be pilot #3 or #4, once the product survives contact.

**Terms:** free for six months, in exchange for you being on site during the first week, a named reference, and permission to publish anonymised operating metrics. Get it in writing, briefly.

---

## 6. Building to raise — what to instrument and when

Since you chose the raise path, three things change relative to bootstrapping.

**Build the moat components earlier than pure revenue logic would justify.** The SEF inbound-invoice ingestion (W5) and the cohort/anonymity query layer (W9) are month-6 to month-9 work rather than year-2 work — not because they drive early revenue, but because they are the *only* parts of the story a foreign competitor structurally cannot copy, and diligence will probe exactly there. Build the *plumbing* early; the features can follow.

**Instrument from the first pilot, as projections rather than a hand-maintained spreadsheet:**

| Metric | Why it matters in the room |
|---|---|
| Venues live · devices active | The only number that matters at seed |
| Checks/day, GMV fiscalized | Proves the product is load-bearing, not shelfware |
| Table-hours served, revenue per table-hour | Proves W1 is real and gives you a metric nobody else reports |
| IPS share of tenders, acquiring fees avoided | Your renewal argument, and evidence of payments optionality without payments risk |
| Cohort retention by month | The number that determines whether you get a second meeting |
| Corpus size: fiscal events, SEF invoices ingested | The moat, quantified |

**The 12-month story you're building toward:** *"N venues live in Serbia on a certified, offline-first stack that no international vendor can legally enter. Two proprietary data corpora accumulating. Fiscal layer is country-agnostic — Croatia and BiH are integration work, not rewrites. Here's revenue per table-hour across the network, which is a number nobody else in the market can produce."*

Every architectural decision in the spec supports a clause of that sentence. That's not decoration — it's why the country-agnostic fiscal interface and the k-anonymity gate are in the spine rather than the backlog.

---

## 7. Kill and defer criteria

Written down now, while you're unattached to them.

**Defer past week 14, without exception:**
- Normativi and inventory (W5) — blocked on open items #1 and #10, and it needs real purchase data to be worth anything
- Aggregator reconciliation (W8) — blocked on #9
- Tipping (W10) — blocked on #3, and shipping it uncounselled is a real liability
- Benchmarking (W9) — mathematically worthless below cohort minimums; build the query gate, run nothing
- Reservations — no habit exists in the market; you'd be creating behaviour, not capturing it
- Multi-venue *UI* — multi-venue *schema* is week 8, the interface is month 6+
- Loyalty, marketing, anything guest-facing

**Kill outright if:**
- **G3 fails at week 10.** Certification is existential. Pivot to a third-party L-PFR, certify only the ESIR, accept the margin leak, keep moving. This is a real fallback, not a failure.
- **G2 fails and nothing replaces it.** If twelve operators can't name a problem they'd pay to fix, you have a product looking for a market. Better to know in week 5 than month eighteen.
- **Certification is refused twice on grounds you can't engineer around.** Unlikely — ~932 elements are approved and the bar is documented as low — but define the tripwire now.

**The scope trap, stated plainly.** Your leverage means you *can* build all fourteen wedges. W5–W9 get better the longer you wait — they need real data and settled law. W1–W4 get worse the longer you wait — they're what gets you the venue that produces the data. Build in that order even though the backend is more interesting and more defensible. The failure mode for a technically strong solo founder is a beautiful backend with zero venues on it.

---

## 8. Where the calendar actually hurts

**Seasonality.** Terraces peak May–September. A December pilot is a *low-load* pilot, which is good for learning and bad for proving W1 under stress. Plan a second, higher-volume pilot for April–May when the terrace season starts — and treat the winter as the window to build the back office and get through certification iteration.

**HORES 2nd Congress, 11–13 October 2026, Belgrade Fair.** That lands in week 7. You will not have a product. Go anyway — as an attendee, with the prototype on a tablet and a specific list of the multi-venue operators you identified from APR. It is the single densest concentration of your target buyers in the calendar, and it is seven weeks out.

**Innovation Fund calls.** Mini Grants (€120k at 70%, company ≤10 years) are a recurring annual call. Track the opening date from week 0 and have the application drafted before it opens, because these windows are short and the paperwork is not.

---

## 9. A note on how to spend your leverage

You have unusual throughput for one person. Spend it asymmetrically:

- **On the spine (`@tr/domain`, sync, the fiscal seam): go slow.** These are the decisions where being wrong costs months. Use the leverage for exhaustive property-based testing and for exploring alternative designs before committing — not for writing more code faster.
- **On surface (screens, reports, back office, integrations): go fast and expect to throw it away.** These are cheap to redo and you'll redo them after the pilot anyway.
- **On the things that aren't code at all — the PU questions, the interviews, the pilot week, the APR list — leverage doesn't help.** They are the constraint. Protect the calendar for them; they're the reason the plan has five tracks instead of one.
