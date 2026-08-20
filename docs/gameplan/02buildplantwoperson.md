# Terminal Redux — Build Plan, Weeks 0–14 (two-person team)

**Version:** 0.2 · 20 August 2026 · *supersedes 02-build-plan-12-weeks.md*
**Team:** one engineer (**E**), one commercial/ops founder (**C**)
**Stack:** TypeScript/Node · **Path:** building to raise
**Company status:** d.o.o. not yet registered — see §1, this is week-0 critical

---

## 0. What changed, and why it's more than a headcount adjustment

The solo plan's structural weakness was that weeks 2–5 asked one person to run 12–15 interviews, sit 20 hours on terraces, *and* build a prototype and a fiscal adapter. That was always the part most likely to break, and it would have broken by degrading the discovery — because building feels productive and interviewing feels like a detour.

A commercial co-founder doesn't just add capacity. It lets you **split the interview round in two**, which is a genuinely better research design than anything available to one person:

- **Round 1 (weeks 1–3, no prototype):** pure discovery. Closes open items #7, #8, #9, #10, #11 — none of which need software to exist.
- **Round 2 (weeks 4–6, with prototype):** the tablet tasks, W1's kill test, and the pilot close — including **revisits** to the best operators from round 1.

Going back a second time with *"you told me X, here's what I built"* is a dramatically stronger pilot ask than a single cold visit. That sequence is unavailable to a solo founder, and it's worth more than the two weeks of calendar the extra person saves.

**On the calendar: don't spend the savings on shipping earlier.** E's track was always the critical path and C doesn't write code, so the real gain is ~2 weeks of E's calendar recovered from travel and interviews. Put that into **certification iteration buffer** — field reports describe multiple rounds of resubmitted test receipts, and that's the one unknown that can genuinely wreck the quarter. Keep the 14 weeks; absorb the risk instead.

---

## 1. Week 0 is C's week, and one call comes first

**The Innovation Fund call, before you register anything.** Smart Start (RSD 5.4M ≈ €45,600 at 90%) now applies to you as a two-person team, but its rules say the d.o.o. must be **newly established**, founded as an obligation *after* approval. Registering now may disqualify you.

The Fund runs **weekly info sessions, Thursdays at 13:00.** C makes that call and asks exactly two things:

1. Does a d.o.o. founded in the last few months disqualify a Smart Start application?
2. When does the next **Mini Grants** call open?

**The likely resolution, and the one to plan for:** Mini Grants (up to **€120,000 at 70%**, company ≤10 years old) is 2.6× the money and *requires* an existing company rather than forbidding one. Register now, target Mini Grants, treat Smart Start as a bonus only if the rules permit. **Do not let this question hold registration more than one week** — the certification queue is worth more than the smaller grant, and the grant you actually want doesn't conflict with registering.

---

## 2. Ownership split

| Domain | Owner | Note |
|---|---|---|
| d.o.o., supplier registration, bezbednosni element | **C** | Pure paperwork with long latency. C's highest-value week-0 output |
| PU correspondence — drafting | **E** | The two questions are technical and must be precisely worded |
| PU correspondence — sending, chasing, escalating | **C** | Government correspondence needs someone who will phone. This is a real job, not an errand |
| L-PFR vendor conversations | **C** asks, **E** specifies | E writes the questions (OS, concurrency, latency); C works the relationships |
| Hardware procurement | **C** | E specifies exactly what, C buys it |
| Fiscal adapter, sandbox, certification submission | **E** | |
| `@tr/domain`, hub, sync, device apps | **E** | |
| Prototype | **E** | Still E's work. C cannot start round 2 without it |
| APR target list | **C** | |
| Interview round 1 (discovery) | **C** | |
| Terrace counting | **C** | 20 hours of sitting that no longer competes with building |
| Interview round 2 (tablet tasks) | **C leads, E attends ≥4** | See §6 — E attending is non-negotiable |
| HORES congress, 11–13 Oct | **Both** | |
| Pilot recruitment and close | **C** | |
| Pilot week on site | **Both** | |
| Mini Grants application | **C** | ~€120k. Worth real hours |
| Raise materials, metrics narrative | **C** drafts, **E** supplies the numbers | Metrics come from projections, not a spreadsheet |

**The rule that keeps this working:** E's calendar is protected from everything except the prototype, the fiscal adapter, the spine, four interviews, and the pilot week. Everything else routes to C. If E is chasing a government email, the split has failed.

---

## 3. Milestone spine

| Week | Milestone | Owner | Evidence produced |
|---|---|---|---|
| **0** | Innovation Fund call made; d.o.o. registered; supplier registration submitted; PU letters sent | C | The certification clock starts |
| **3** | Round 1 complete — 12–15 discovery interviews, 2 accountants, 1 tax adviser | C | Open items #9, #10, #11 closed |
| **3** | Prototype demoable on a tablet | E | Round 2 can begin |
| **4** | Terrace dataset complete — 10 venues × 2 sessions | C | Open item #8 closed; a data asset nobody else has |
| **6** | Round 2 complete — W1 verdict; fiscal adapter passing 17/17 in sandbox | Both | The two big risks retired together |
| **8** | `@tr/domain` complete and exhaustively tested | E | The spine is real |
| **10** | Vertical slice: offline order → reconnect → settle → compliant receipt | E | You have a POS |
| **11** | ESIR (+L-PFR) submitted | E | The approval queue starts |
| **12** | Pilot venue committed in writing, with a date | C | |
| **14** | Pilot live; both of you on site for their first week | Both | First reference, first real data |

---

## 4. Week by week

### Weeks 0–1

**C** — Innovation Fund Thursday session. Register the d.o.o. Submit supplier registration and request sandbox access. Send E's two questions to the Poreska uprava in writing. Contact three L-PFR vendors. Buy hardware: two cheap Android tablets in cases, one network thermal printer, one mini-PC (spec pending the L-PFR OS answer). Start the APR pull for NACE 56.10 and 56.30 — target 30 names with addresses, sorted into walking routes. Stand up a plain landing page.

**E** — Draft the two PU questions precisely. Specify hardware. Sandbox first contact as soon as access lands: get one test receipt through the dev E-SDC end to end. Draft `@tr/domain` v0 — the event union, `Allocation`, the settlement invariants.

### Weeks 1–3

**C — interview round 1, no prototype.** 12–15 operators, using only Part 1 of the interview script (their world). Plus 2 accountants and 1 tax adviser. Record, transcribe same day, send transcripts — not summaries — to E.

This round closes: **#9** (Wolt/Glovo commissions — ask directly), **#10** (are normativi and KEP books mandated, in what form), **#11** (stock shortfall at month end, asked neutrally), and most of **#7** (cash vs card).

**E — prototype.** Per the prototype scope doc, and now uninterrupted, so ~2.5 weeks rather than 3. Floor map with table ageing, order entry with speed screen and search, the four payment flows, seat assignment at zero tap cost.

**Gate (end of week 3):** can a stranger take a real order on it unaided? If not, cut prototype scope — do not extend the window. Round 2 is calendar-bound.

### Weeks 2–4

**C — terrace counting.** 10 venues × 2 sessions × 2 hours. Central Belgrade, residential, plus one or two in Novi Sad as a non-Belgrade control. Protocol in the interview kit. Compute median dwell, re-orders per table-hour, the gap between last consumed item and next order, cash share.

**That last metric is W1's premise under test.** If the median gap is short, the ageing indicator is solving a problem that doesn't exist. If it's 15+ minutes, the wedge is real and you have the number to prove it. This is the single most decision-relevant data C will produce.

### Weeks 3–6

**E — the real fiscal adapter.** The permanent artifact, not a spike. All invoice types; buyer-ID enforcement on refunds; payment-method collapse to *gotovina*; runtime tax-table resolution; `journal` rendering; **QR print validation** (render, machine-scan, verify 40–50mm and no clipping — the #1 documented field defect, which nobody validates); the full `FiscalHealth` surface.

**Gate (end of week 6):** 17/17 checks green, and a machine-scannable QR off real thermal paper on the printer a Serbian café would actually own.

### Weeks 4–6

**C leads, E attends ≥4 — interview round 2, with the tablet.** 10–12 sessions, weighted toward revisits from round 1. Full task battery from the interview kit, stopwatch on tasks 1 and 5.

**Gate (end of week 6) — the W1 kill test.** Across 12 tablet sessions: ≥6 read the ageing indicator correctly and unprompted; ≥4 ask "when can I have this" without invitation; ≥8 *attempt* the rain-move rather than assuming it's impossible. A polite *"da, dobro je"* is a fail. If W1 fails, re-rank against whatever they did react to — most likely arbitrary partial payment, which is the most viscerally broken thing in every competing product.

### Weeks 5–8

**E — `@tr/domain`.** Pure TypeScript, zero I/O, exhaustively tested, informed by both interview rounds. Event union finalised against what the prototype proved the floor actually does. `Allocation` and the settlement invariants including the rounding-remainder rule. Projection reducers. Property-based tests on the invariants that matter: fiscalized settlements never exceed check total; a fiscalized settlement can never be cancelled; replaying a log always yields an identical projection.

**Highest-leverage block in the plan.** One author. C stays out of it — and E stays out of everything else.

**C** — Mini Grants application drafting. Pilot candidate ranking. HORES congress prep: which multi-venue operators will be there, who to corner.

### Week 7 — HORES congress, 11–13 October, Belgrade Fair

Both attend. You will not have a product; go anyway. Densest concentration of your buyers in the calendar, and it lands mid-plan by luck. Prototype on a tablet, APR list in your pocket, no promises about dates.

### Weeks 7–10

**E — hub, sync, vertical slice.** Venue event log, settlement lease manager, time authority, printer/KDS routing. Resumable WebSocket sync: append-union for orders, lease for settlement. Capacitor device app with local SQLite, three shells. Minimal cloud plane: ingestion, Postgres with RLS, one back-office view.

**Run the failure drills for real, not on paper:** pull the hub's power mid-service; pull a tablet's Wi-Fi mid-order; unplug the printer between fire and acknowledgement; set a device clock five minutes fast.

**Gate (end of week 10):** waiter takes an order with Wi-Fi off, reconnects, settles, compliant receipt prints.

**C** — pilot close (see interview kit §5 for selection criteria). Mini Grants submitted if the call is open. Second-pilot pipeline.

### Weeks 11–14

**E** — Submit for ESIR approval week 11. 15-day statutory clock, expect iteration rounds. Then back-office essentials: the manager's fiscal-health screen (W4 — and it demos beautifully), shift report, daily sales, raw event export.

**C** — pilot onboarding: menu build, staff scheduling around training, expectation setting with the owner. Get the pilot terms in writing: free six months, both of you on site week one, named reference, permission to publish anonymised operating metrics.

**Week 14 — both of you on site for the pilot's entire first week of service.** Not on call. Present. This is where you learn the twenty things no interview surfaces.

---

## 5. Dependency graph

```
Innovation Fund call (Thu 13:00) ──► d.o.o. decision
        │
d.o.o. ─┼──► supplier registration ──► sandbox ──► fiscal adapter ──► submission ──► approval ──► PILOT
        └──► Mini Grants eligibility

PU: "is the tablet inside ESIR scope?"  ⚠ send week 0 — confirms or invalidates the velocity architecture
PU: "is V-PFR OK for brick-and-mortar?" ⚠ send week 0 — determines hub-failure fallback
L-PFR vendor: OS + concurrency + latency ⚠ ask week 0 — gates hub hardware

round 1 (C, wk 3) ──┐
                    ├──► @tr/domain (E, wk 5–8) ──► hub + sync (wk 10) ──► vertical slice
prototype (E, wk 3) ─┴──► round 2 (wk 6) ──► W1 verdict ──► spine scope confirmed
fiscal adapter (E, wk 6) ─────────────────────────────────┘

APR list (C, wk 1) ──► round 1 ──► round 2 ──► pilot candidate (wk 12)
```

The prototype is the one place where E blocks C. If it slips, round 2 slips, the W1 verdict slips, and `@tr/domain` gets designed on weaker evidence. Protect week 3.

---

## 6. Rules of engagement — the four ways this split goes wrong

**1. E loses touch with users.** The most common failure when a commercial co-founder owns discovery. Written summaries do not transfer the information you need; watching someone's hands hesitate does. **Non-negotiable: E attends at least four round-2 sessions and the entire pilot week, and reads round-1 transcripts rather than C's summaries of them.**

**2. C sells something that doesn't exist.** Set the rule now, before it's tested: **no delivery dates may be promised before certification is submitted**, and no feature may be described as existing unless it's on the tablet in C's hand. A missed date costs you the reference, and the reference is the whole point of the pilot.

**3. The prototype becomes a sales demo.** C will want to show it to everyone, which is mostly good. But it must stay throwaway and it must not set expectations. Keep the dated delete note in the README, and have C open every showing with *"ovo je prototip, pola ovoga je lažno."*

**4. Interview quality drifts between two interviewers.** Round 1 is script-driven and recorded. Round 2 uses the same task battery in the same order with a stopwatch, so that twelve sessions produce comparable numbers rather than twelve impressions.

**One thing worth settling before you take money:** roles and equity. Two technical-plus-commercial founders in a regulated vertical is a materially easier seed story than a solo founder — but only if the split is settled and documented. Do it while it's easy.

---

## 7. Decision gates

| Gate | Week | Owner | Pass condition | If it fails |
|---|---|---|---|---|
| **G0 · Grant path resolved** | 0 | C | Innovation Fund answer received; d.o.o. registered | Register anyway after one week. Mini Grants is the bigger, compatible program |
| **G1 · Prototype demoable** | 3 | E | A stranger takes a real order unaided | Cut scope, don't extend. Round 2 is calendar-bound |
| **G2 · Terrace data supports W1** | 4 | C | Median gap from last consumed item to next order ≥ ~15 min | W1's premise is weak. Re-rank before the spine is designed around it |
| **G3 · W1 validated with operators** | 6 | Both | Thresholds in §4 met | Re-rank against what they did react to — likely partial payment |
| **G4 · Fiscal risk retired** | 6 | E | 17/17 green, QR machine-scans off real paper | If not clear by week 8: license a third-party L-PFR, certify only the ESIR, accept the €3–6/venue/month leak, keep moving |
| **G5 · Tablet-scope answer** | ~6 | C | PU confirms the tablet sits outside ESIR scope | Design the thin certified relay shell now. Survivable if caught early, fatal in month six |
| **G6 · Vertical slice works** | 10 | E | Offline order → reconnect → settle → receipt | Cut back-office scope, never spine scope |
| **G7 · Pilot committed** | 12 | C | Named venue, in writing, with a date | Return to the interview cohort. Do not launch unpiloted |

---

## 8. Where the recovered calendar should go

Not into shipping earlier. Three places, in priority order:

1. **Certification iteration buffer.** The 15-day statutory decision is the floor, not the expectation; multiple resubmission rounds are documented. This is the only unknown that can wreck the quarter, and it's the one you can't work harder at.
2. **More evidence.** Two people can run 24–30 interviews in the same calendar as one running 12–15. Your top-ranked wedge has zero supporting data — that's the thing most likely to be wrong, and it's cheap to de-risk now and expensive to discover later.
3. **A second pilot, lined up for April.** A December pilot is a low-load pilot. The terrace thesis only gets stress-tested from the season opening, so have venue #2 committed before you need it.

**The scope trap has not gone away — it's gotten stronger.** Two people can build all fourteen wedges, and a commercial co-founder will surface customer requests faster than E can absorb them. W5–W9 get *better* the longer you wait; W1–W4 get *worse*. Build in that order. Defer past week 14, without exception: normativi, aggregator reconciliation, tipping, benchmarking, reservations, multi-venue UI, loyalty, anything guest-facing.
