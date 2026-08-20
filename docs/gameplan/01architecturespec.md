# Terminal Redux — Architecture Spec

**Version:** 0.1 · 20 August 2026
**Audience:** you, building this
**Stack:** TypeScript / Node end-to-end
**Strategic frame:** building to raise — so regional expandability and the data moat must be *architecturally true*, not aspirational

---

## 0. What this document is for

This specifies the **spine** — the parts that survive any answer the operator interviews give you, and that are expensive or impossible to retrofit. It deliberately does not specify screens, features, or anything downstream of an unresolved open item.

Five decisions carry almost all the risk:

1. **Where the certification boundary sits** — because every material change inside it needs a new government approval.
2. **How the check is represented** — because splitting, seat attribution and audit trail are all consequences of this one choice, and it's the thing every incumbent got wrong.
3. **Where the CAP line falls** — because "works offline" retrofitted is a rewrite.
4. **Whether the fiscal layer is country-agnostic** — because it costs ~nothing now and is the difference between "a Serbian POS" and "a Balkan POS company" in a pitch.
5. **Whether the event stream is a first-class asset** — because the normativ moat, the benchmarking moat, and reproducible reporting all fall out of it, and none of them are retrofittable.

Everything else in here is downstream of those five.

---

## 1. Constraints the architecture must absorb

These are not preferences. They are extracted from the research and each one has a direct structural consequence.

| Constraint | Source | Architectural consequence |
|---|---|---|
| Any material change to a certified ESIR/L-PFR requires a fresh *rešenje* | Uredba čl. 8 | The certified element must be a small, separately-versioned artifact with its own release train |
| The PFR returns `journal` (the rendered receipt body) and the ESIR prints it as-is | PU technical guide | You do not own receipt layout. Differentiation lives before and after the fiscal moment |
| L-PFR requires a **physical smart card** in a reader | Pravilnik o bezbednosnom elementu | On-premises hardware is mandatory. Lean into it — you get local-first for free |
| Offline receipts must reach the tax system within **5 days**, else the security element **auto-suspends the device** | Zakon o fiskalizaciji čl. 5 + Uredba čl. 4 | Fiscal health is operational state that must be surfaced, not hidden |
| The security element carries a **cumulative unaudited-amount limit** and stops signing past it | TaxCore platform docs | "PFR unwilling" is a distinct failure mode from "PFR unreachable" |
| Bezbednosni element expires after **3 years**, bound to a specific premises address | PU | Certificate lifecycle is domain state with a countdown, not a config file |
| No fiscal document type exists for an open tab | Absence across the whole framework | The tab is entirely yours. Fiscalization is a *transition*, not a save |
| Once fiscalized, re-splitting = refund + re-issue, with buyer ID and a signed copy | Pravilnik o vrstama fiskalnih računa | The pre-fiscal check must be fully mutable; the commit must be modelled as irreversible |
| Hospitality collapses cash/card/cheque to **"gotovina"** in the fiscal report | Pravilnik, 57/2022 amendment | Internal payment method and fiscal payment method are two different fields. Never one |
| Tax rates are Cyrillic labels from a **versioned server-side table** | PU `GET /status` | Rates are resolved at runtime, never stored in your schema |
| Some L-PFRs block if clock deviation > 3 minutes | Vendor docs (Calculus) | The venue needs a time authority |
| Terrace Wi-Fi doesn't reach the tables; handhelds die mid-order | Operator reviews, industry-wide | Order entry must be genuinely local-first with resumable drafts |
| Tickets fail silently — "you have no idea the ticket didn't make it" | Square/Toast communities | Every fire needs an end-to-end acknowledgement, modelled as an event |
| Course pacing and per-item firing are mutually exclusive in Toast | Toast's own docs | Hold/fire must be per-item state, never a global mode |
| Staff churn is extreme; kitchens increasingly non-Serbian-speaking | RZS, HORES | Menu/UI text is i18n from commit one; item aliases are a data structure |

---

## 2. Topology — three planes

```
┌─────────────────────────────────────────────────────────────────┐
│  CLOUD PLANE  (multi-tenant, EU)                                │
│  · durable event ledger        · projections & analytics        │
│  · back office (web)           · SEF / accounting integrations  │
│  · benchmarking cohort engine  · billing, provisioning          │
└────────────────────────▲────────────────────────────────────────┘
                         │  event push/pull (WebSocket, resumable)
                         │  eventually consistent, minutes of lag OK
┌────────────────────────┴────────────────────────────────────────┐
│  VENUE PLANE  — the "hub": small always-on box on premises      │
│  · venue event log (authority)   · settlement lease manager     │
│  · CERTIFIED FISCAL MODULE ──────┐                              │
│  · time authority                │  smart card reader (BE)      │
│  · printer/KDS routing           └──► L-PFR ──► SUF (tax auth.) │
└────────────────────────▲────────────────────────────────────────┘
                         │  LAN / local Wi-Fi, WebSocket
                         │  strongly consistent for settlement
┌────────────────────────┴────────────────────────────────────────┐
│  DEVICE PLANE                                                    │
│  waiter tablets · counter terminal · KDS screens · customer disp │
│  each holds a full local replica of the venue's working set      │
└─────────────────────────────────────────────────────────────────┘
```

### Why the hub exists, and why that's an advantage

The L-PFR needs a physical smart card, so **you are forced to have on-premises compute anyway**. Every cloud-native US POS treats that as a liability. Treat it as the asset it is: the hub becomes the venue's source of truth for the operating day, and the cloud becomes a durable ledger plus an analytics plane. The venue keeps working when the internet dies — which inverts the single worst failure mode of every incumbent, and does so with legal cover rather than a liability disclaimer.

### Hub failure — plan for it explicitly

The hub is a single point of failure and pretending otherwise is how you get a 1-star review.

- **Hub down, floor keeps working.** Devices elect a temporary coordinator (lowest device ID that is reachable by a quorum of peers) and continue accepting orders, firing to KDS peers, and holding drafts. Order entry never depends on the hub.
- **Hub down, settlement stops.** You cannot legally settle without fiscalizing, and you cannot fiscalize without the L-PFR. Do not paper over this. Surface it as: *"Ne mogu da izdam račun — fiskalni modul nedostupan"*, with the count of checks waiting to settle, and a visible ETA-to-recovery.
- **Standby.** Serbian vendors already sell a standby fiscal device at ~350 RSD/month; there is an established market expectation here. Design the hub so a cold spare can take over by moving the smart card and pulling the event log from the devices. Test this drill, because you will need it.
- **V-PFR as a fallback** is attractive but blocked on open item #4 (whether V-PFR is acceptable for brick-and-mortar hospitality). If it resolves favourably, a V-PFR fallback path turns hub failure from "closed" into "degraded" and is worth building.

### Hub hardware — an open item that constrains you

Many Serbian L-PFR implementations are Windows or Android services. **Before you pick hardware, confirm whether the L-PFR you certify or license runs on Linux.** If it's Windows-only, your hub is a fanless mini-PC running Windows IoT and your Node service is a Windows service — which is fine, but it changes your build, your deployment story and your support model. Do not discover this in month four.

---

## 3. The certification boundary — the most important seam in the system

### The rule

Everything inside the boundary is a **certified element with its own version number and its own release train**. Everything outside ships continuously. If a line of code inside the boundary changes, you file for a new *rešenje*. If it doesn't, you don't.

### What is inside

- Composition of the fiscal invoice payload from a settled check
- The PFR protocol client (`POST /api/v3/invoices`, `/status`, `/attention`, `/pin`)
- Rendering and printing of the returned `journal`
- QR rendering at 40–50 mm with margin validation
- The fiscal journal store and the 17-point-checkable behaviours across all invoice types (Promet, Avans, Kopija, Predračun, Obuka × Prodaja, Refundacija)

### What is outside

Floor plan, table state, ordering, menu, modifiers, coursing, splitting logic *before* fiscalization, sync, KDS, analytics, back office, integrations, and — critically — **the waiter tablet app**.

### The subtle decision: keep the tablet out of scope

The ESIR is legally "the system for issuing invoices." If your tablet composes the fiscal invoice, a regulator could reasonably consider the tablet part of the certified element — which would mean **every waiter-app release needs government approval**. That would be fatal to your velocity and to the whole "ship weekly" positioning.

So the architecture is: **tablets emit domain events; only the hub's certified module turns a settled check into a fiscal invoice.** The tablet never constructs a `FiscalDocument`. It never talks to the PFR. It requests settlement and receives a result.

> **This is the single highest-value question to put to the Poreska uprava, alongside the V-PFR question.** Ask it explicitly, in writing, before you submit for approval. If the answer is unfavourable, you need to know in month one, not month six — and the fallback (a very thin certified shell on the tablet that only relays) is much cheaper to design for now than to retrofit.

### The interface — country-agnostic from day one

This costs you an afternoon now and is worth a slide in the deck later.

```ts
// packages/fiscal-core — knows nothing about Serbia

export interface FiscalGateway {
  readonly jurisdiction: JurisdictionCode          // 'RS' | 'HR' | 'BA' | 'ME' | 'MK'
  capabilities(): FiscalCapabilities
  taxTable(): Promise<TaxTable>                    // versioned, always resolved at runtime
  fiscalize(doc: FiscalDocument): Promise<FiscalResult>
  health(): Promise<FiscalHealth>
}

export interface FiscalCapabilities {
  supportsOffline: boolean                          // RS L-PFR: true · RS V-PFR: false
  offlineWindow: Duration | null                    // RS: 5 days
  requiresBuyerIdOnRefund: boolean                  // RS: true
  requiresSignedRefundCopy: boolean                 // RS: true
  hasVoidTransaction: boolean                       // RS: false — void is a refund
  paymentMethodMapping: 'verbatim' | 'collapsed'    // RS hospitality: 'collapsed'
  receiptBodyOwner: 'gateway' | 'application'       // RS: 'gateway' — journal comes back rendered
  documentTypes: FiscalDocumentType[]
}

export interface FiscalHealth {
  reachable: boolean
  willing: boolean                                  // distinct from reachable — SE limit, PIN lock, suspension
  securityElementLimitConsumed: number | null       // 0..1 — warn at 0.75
  daysSinceSuccessfulAudit: number | null
  certificateExpiresAt: Date | null                 // the 3-year cliff
  unconfirmedInvoiceCount: number
  clockSkewSeconds: number
  storageFreeBytes: number | null
  messages: FiscalMessage[]
}
```

Two things to notice.

**`reachable` and `willing` are separate booleans.** "No internet" and "the security element has hit its unaudited-amount limit and will not sign" are different failures with different remedies, and no product on the market distinguishes them. This one field is the seed of wedge W4.

**`FiscalDocument` is derived by a pure function**, `toFiscalDocument(settlement, jurisdiction, taxTable) → FiscalDocument`. The domain emits a `Settlement`; a per-jurisdiction translator maps it. Serbia's translator is where payment-method collapse lives, where tax labels get mapped, where refund buyer-ID rules get enforced. Croatia's is a different file. **The domain model never contains the word ESIR.**

---

## 4. The check is a log, not a row

### Why

Every incumbent failure documented in the research is a symptom of a mutable `order_header` / `order_line` schema:

- *"If a guest wants to pay $50 and leave, you have to pay the rest"* — no representation for a partial settlement against a residual pool.
- *"Being able to split individual items across multiple checks would be a huge fix"* — a line belongs to one check, so a shared bottle is unrepresentable.
- *"There is no way I can remember who got what two hours later"* — seat is not on the line, so attribution is lost at entry time and unrecoverable at split time.
- *"Checks will merge themselves back together after a payment has been processed"* — mutation with no causal history, so a concurrent update silently clobbers.
- *"Voiding items returns the item to stock, creating a vicious cycle"* — void is a state flip rather than a recorded event with an actor.
- *"Figuring out why data is off for a particular day"* — reports aren't reproducible because there's no immutable history to replay.

An append-only log fixes all six *as a side effect*, and hands you the audit trail (W7), the inspection defence (W14), reproducible reports, and clean export — none of which you then have to build separately.

### Event vocabulary

This is the artifact worth getting right; everything else is downstream. Validate it against real floor behaviour in the prototype (see the prototype scope doc) — it is the one thing worth carrying forward from that throwaway build.

```ts
type CheckEvent =
  // lifecycle
  | { t: 'CheckOpened';        checkId; venueId; channel: 'dine_in'|'takeaway'|'delivery'|'bar'; openedBy; tableId?; guestCount? }
  | { t: 'CheckClosed';        checkId; reason: 'settled'|'abandoned'|'merged' }
  | { t: 'CheckReopened';      checkId; authorizedBy }          // pre-fiscal only — enforce this
  | { t: 'CheckMerged';        checkId; intoCheckId }

  // physical world — first-class, never a $0 fake SKU
  | { t: 'TableAssigned';      checkId; tableId }
  | { t: 'CheckMovedToTable';  checkId; fromTableId; toTableId }
  | { t: 'TablesJoined';       groupId; tableIds[] }
  | { t: 'TablesSeparated';    groupId }
  | { t: 'SeatAdded';          checkId; seatId; label? }        // label = "žena u plavom", not "Seat 2"
  | { t: 'SeatMoved';          seatId; fromCheckId; toCheckId } // the rain case
  | { t: 'ServerChanged';      checkId; fromStaffId; toStaffId; authorizedBy }

  // items
  | { t: 'ItemAdded';          lineId; checkId; itemId; qty; unitPriceMinor; tariffId; seatId?; courseId?; modifiers[]; note? }
  | { t: 'ItemQtyChanged';     lineId; qty; authorizedBy? }
  | { t: 'ItemVoided';         lineId; reason; authorizedBy }   // never deletes
  | { t: 'ItemMoved';          lineId; toCheckId }
  | { t: 'ItemSeatChanged';    lineId; seatId }
  | { t: 'ItemShared';         lineId; shares: Array<{ seatId; weight }> }   // the bottle of wine

  // kitchen — per-item, never a global pacing mode
  | { t: 'ItemHeld';           lineId }
  | { t: 'ItemFired';          lineId; firedBy; routeTo: StationId[] }
  | { t: 'CourseFired';        checkId; courseId; firedBy }
  | { t: 'FireAcknowledged';   lineId; stationId; at }          // solves the silent printer drop
  | { t: 'FireFailed';         lineId; stationId; error }       // escalates to the waiter's device
  | { t: 'ItemBumped';         lineId; stationId }
  | { t: 'ItemRecalled';       lineId; stationId; reason }      // the dropped plate, first-class

  // money — pre-fiscal, fully mutable
  | { t: 'DiscountApplied';    checkId; lineId?; kind; valueMinor; authorizedBy }
  | { t: 'SettlementOpened';   settlementId; checkId; allocation: Allocation }
  | { t: 'SettlementCancelled';settlementId }                    // only while un-fiscalized
  | { t: 'TenderAdded';        settlementId; tenderId; methodInternal; amountMinor }

  // the irreversible commit
  | { t: 'SettlementFiscalized'; settlementId; fiscalDocId; invoiceNumber; counters; journal; verificationUrl; at }
  | { t: 'RefundIssued';         refundDocId; refFiscalDocId; buyerId; lines[]; authorizedBy }
```

Every event carries the same envelope: `{ id: ULID, checkId, venueId, actorId, deviceId, deviceSeq, occurredAt, receivedAt, schemaVersion }`.

### `Settlement` is the abstraction that makes splitting work

A check produces **1..N settlements**. Each settlement becomes exactly one fiscal receipt. Splitting is then not a special case — it's just how you partition a check into settlements.

```ts
type Allocation =
  | { kind: 'lines';    lineIds: LineId[] }                       // "these dishes"
  | { kind: 'seats';    seatIds: SeatId[] }                       // split by seat
  | { kind: 'fraction'; numerator: number; denominator: number }  // even split by N
  | { kind: 'amount';   amountMinor: number }                     // "I'll pay 900 and go"
  | { kind: 'residual' }                                          // whatever's left
```

This single type covers every case the research says is broken elsewhere:

- **Even split by 4** → four `fraction` settlements. Compute all four amounts up front and present four pre-filled buttons; never make the waiter type the same number four times.
- **Split by seat** → `seats` settlements, which only works if seat was captured at entry — hence the zero-tap requirement.
- **Shared bottle** → `ItemShared` distributes the line across seats by weight before allocation.
- **"Pay 900 RSD and leave"** → an `amount` settlement against the residual pool. The remaining balance stays open. This case alone is worth a demo.
- **Rounding.** Explicitly assign the remainder to a named settlement, surfaced in the UI. Do not silently dump it on whoever pays last — the research documents servers noticing exactly that and resenting it.

Invariant to enforce in the domain, not the UI: **the sum of fiscalized settlements can never exceed the check total**, and a settlement cannot be cancelled once `SettlementFiscalized` has been appended.

### Projections

The log is truth; everything read is a projection, and every projection is rebuildable from the log.

`open_checks` · `floor_state` (including the table-ageing clock for W1) · `kds_queue` per station · `shift_report` · `daily_sales` · `staff_activity` (the W7 substrate) · `stock_movements` (the W5 substrate).

Because projections are rebuildable, you get the thing Toast measurably cannot do: **reproducible reports**. Snapshot the projection version alongside every exported report. When an operator asks "why is Tuesday different now than it was on Wednesday," you have an answer. Put that in the pitch.

---

## 5. The CAP line falls exactly on the fiscal boundary

This is the cleanest result in the design, and it's handed to you by the law.

| Concern | Mode | Why |
|---|---|---|
| Order entry, item add/void, seat, course, hold/fire | **AP** — available, partition-tolerant | Appends to a per-check log are commutative. Two waiters adding to table 7 do not conflict; both events apply. This is why append-only wins over row mutation |
| Table join/move, server change | **Optimistic + hub-arbitrated** | Low frequency, highly visible. Apply locally, reconcile with the hub, roll back with a visible notice if rejected |
| **Settlement and fiscalization** | **CP — consistent** | You cannot legally settle without the PFR, and the PFR lives on the hub. So the consistency requirement and the legal requirement coincide |

**The settlement lease.** Before a device may open a settlement on a check, it acquires a short-lived lease from the hub (`{checkId, deviceId, expiresAt}`). No hub, no lease, no settlement. This makes double-settlement structurally impossible rather than something you detect and apologise for — and because fiscalization is impossible offline anyway, you lose nothing.

### The conflicts that actually happen, and their rules

1. **Two waiters add items to the same check** → no conflict. Both append. Union.
2. **Two devices void the same line** → idempotent on `lineId`; both actors recorded in the audit trail.
3. **A device rejoins after a check was settled elsewhere** → its queued *order* events still apply (they're history, and they matter for the audit trail and for stock); its queued *settlement* events are rejected because it never held the lease. Surface it: *"Račun je već zatvoren na drugom uređaju."*
4. **A device dies mid-order** → the draft lives in the local log and resumes on relaunch. Never lose a half-entered order; that's what "not spill proof and glass screens" costs everyone else.
5. **Clock skew** → the hub is the venue time authority; devices sync on connect and every few minutes. Every event carries device time *and* hub-received time. Some L-PFRs hard-block past 3 minutes of drift, so surface skew before it becomes a settlement failure.

### IDs

All domain IDs are **ULID or UUIDv7, generated client-side** — time-sortable, collision-safe, no server round-trip, works offline. The *only* server-assigned sequence in the entire system is the fiscal invoice number, which comes from the PFR. Do not use database autoincrement for anything a device can create.

---

## 6. Data model — the parts that are expensive to change

### Tenancy: org → venue → device, from commit one

```
organisation ─┬─ venue ─┬─ device
              │         ├─ staff_assignment (role, hourly rate, permissions) → staff
              │         ├─ table / table_group / floor_plan (versioned)
              │         └─ fiscal_registration (BE serial, premises address, expiry, PFR endpoint)
              ├─ item / recipe / supplier  (org-level master)
              └─ venue_item_override       (price, availability, tariff, per venue)
```

Multi-venue in the schema costs almost nothing now and is a migration later. Every incumbent bolted a "group view" onto a single-venue schema and the reviews are unambiguous about the result — *"Cannot analyze multiple restaurants on same dashboard; must sign into each location separately"* (TouchBistro), *"Changes made in one account affected other restaurant locations"* (MarginEdge, the opposite failure). Both are the same root cause.

For the raise: this is also what makes "we sell to groups" and "we expand regionally" credible in due diligence rather than a claim.

### Money

Integer minor units (para), never floats. Every monetary value carries its currency. The fiscal layer's rounding is **4 decimals, HalfRoundUp** — implement it there, once, and do not let it leak into the domain.

### Tax

`tax_table_snapshot { revision, fetchedAt, entries: [{ label: 'Ђ', ratePpm: 200000, name }] }` — fetched from the PFR, cached, and re-read on revision change. Items carry a **tax category**, and the mapping from category → label is resolved per-jurisdiction at fiscalization time.

Critically: an item's tax category depends on **service mode**. The same bread is 10% over the counter and 20% served at a table. So the mapping key is `(itemId, serviceMode, jurisdiction)`, not `itemId`. Get this wrong and you will find out via an inspection.

### Payment method — two fields, always

```ts
interface Tender {
  methodInternal: 'cash' | 'card' | 'ips_qr' | 'voucher' | 'transfer' | 'on_account'
  // fiscal method is DERIVED at fiscalization by the jurisdiction translator.
  // RS hospitality collapses cash | card | cheque → 'gotovina'.
  // NEVER store the fiscal value as the source of truth.
}
```

Your analytics report `methodInternal`. The tax authority receives the collapsed value. If you conflate them you permanently lose your cash-vs-card data — which is exactly the data that open item #7 says nobody in Serbia has.

### Menu, i18n and aliases

Items carry `names: Record<Locale, string>` plus `aliases: string[]` used by search. This makes the fuzzy-search escape hatch (W3) bilingual for free, and lets a venue teach the system that *"domaća"* finds *"domaća kafa"*. Given the staffing reality — non-Serbian-speaking kitchen staff, one shadowing shift of training — this is spine, not polish.

### Time-priced tariffs, not duplicate "HH" buttons

`tariff { id, itemId, priceMinor, validity: { daysOfWeek, from, to, validFrom, validUntil } }`, resolved at `ItemAdded` time and **stamped onto the line**. The research documents the industry's workaround — duplicate happy-hour buttons — and its failure at the boundary: a round ordered at 19:58 and fired at 20:01. Stamping the resolved tariff on the line settles that argument permanently and keeps the sales data clean.

---

## 7. The event stream as a product asset

You're building to raise. The moat is not the till — it's the corpus. Design for that now, because it's free now and a migration later.

**Two corpora, both structurally unavailable to any foreign vendor:**

1. **Fiscalized transaction events** — every item, at a timestamp, at a venue, with a table and a seat. This is the substrate for W7 (staff anomaly detection against peer thresholds) and W9 (benchmarking). Same statistical engine, two products, twelve months apart.
2. **SEF inbound purchase invoices** — structured UBL 2.1 supplier documents, which auto-populate goods-received and therefore make the normativ system fill itself (W5). This is the thing that kills the setup-cost failure mode that destroys every inventory product globally.

**Build these in from the start:**

- **Immutable event export** — raw events as CSV/Parquet, on demand, no paywall. Free data export is a positioning weapon against every incumbent (*"26 days and still no API key"* — SpotOn; API behind a paid tier — Revel) and costs you nothing because the log already exists.
- **A documented public API from day one.** OAuth2 client credentials, self-serve.
- **Cohort tables with k-anonymity enforced in the query layer**, not in the application. `cohort(venueType, geoCell, capacityBand)` with a minimum-N gate. Build the gate now; run the queries in month twelve. Retrofitting anonymity guarantees into a schema that didn't have them is how you end up unable to ship the feature.
- **Instrument the raise metrics as projections**, not as a spreadsheet you maintain by hand: venues live, devices active, checks/day, GMV fiscalized, IPS share of tenders, table-hours served, cohort retention. When a partner asks in month nine, the answer should be a query.

---

## 8. Permissions — capabilities and undo, not walls

The research documents the current model failing in both directions: five permission flags the server discovers are missing mid-shift with a guest waiting, and *"only one admin code"* so managers share the owner's credentials.

**Model:** named capabilities (`void_after_fire`, `apply_comp`, `change_server`, `reopen_check`, `settle`, `export_data`, …) granted per role per venue. Staff authenticate with a PIN on shared devices; the actor is on every event, always.

**Default posture: let them do it, log it, allow one-tap undo, escalate after the fact.** Hard blocks are reserved for things that are genuinely irreversible — which in Serbia means **anything already fiscalized**. That's a clean, defensible line, and it converts the manager's job from gatekeeping in real time to reviewing exceptions after service. It's also exactly what makes W7 work: you get a complete behavioural record instead of a record of who asked permission.

---

## 9. Stack

Recommendations with reasoning, not commandments.

| Layer | Recommendation | Why / alternatives |
|---|---|---|
| **Monorepo** | pnpm workspaces + Turborepo | The shared `@tr/domain` package (event types, allocation logic, projections) is the single most valuable artifact you own. One source of truth for the vocabulary across device, hub and cloud is the whole point of choosing TS end-to-end |
| **Device app** | React + TypeScript in **Capacitor**, Android | You need kiosk behaviour, wake locks, reliable local SQLite, and printer access. A pure PWA gets you 80% and fails on the 20% that matters at 22:00 on a Friday. One codebase, three shells (waiter / counter / KDS) |
| **Device store** | SQLite via `@capacitor-community/sqlite` | Append table for events + materialized projection tables. Avoid IndexedDB-only: you want real queries against the local log, and you want it to survive a crash mid-order |
| **Sync transport** | Hand-rolled WebSocket protocol over the event log, resumable by `(deviceId, deviceSeq)` | **Do not reach for a general CRDT library.** You don't need general convergence — you need append-only union for orders plus a lease for settlement. That's ~400 lines you fully understand, versus a dependency you'll be debugging at a customer site |
| **Hub** | Node 22 + TypeScript, fanless mini-PC | **Confirm the L-PFR's OS requirement before buying hardware.** If Windows-only, this is a Windows service and your deployment story changes |
| **Fiscal module** | Separate package, separate version, separate release train, minimal dependencies | It is the certified artifact. Boring by design. Pin everything. Changing a transitive dependency is a regulatory event |
| **Cloud API** | Fastify + TypeScript | NestJS if you want the structure; for a solo dev Fastify is less to fight. Either is defensible |
| **Database** | Postgres — event store + projections + **row-level security** by `org_id` | One database with RLS is far cheaper to operate solo than per-tenant databases, and RLS gives you a real tenancy boundary rather than a `WHERE` clause you hope you remembered. Partition the event table by `(venue_id, month)` |
| **Analytics** | Postgres materialized views → DuckDB/ClickHouse only when it actually hurts | Do not build a warehouse in year one. You will not have enough data to justify it until you have enough venues to fund it |
| **Hosting** | EU region (Frankfurt) | Serbia's data protection law is GDPR-aligned; EU hosting is clean for both compliance and investor diligence. Note in your privacy copy that fiscal data also flows to the tax authority by law |
| **Auth** | Own it — staff PIN on device, OIDC for back office | Staff identity is domain data (it's on every event, it drives payroll and W7). Don't outsource the thing your audit trail depends on |
| **Printing** | ESC/POS over TCP to network printers | Avoid Bluetooth for kitchen printers. The research is unambiguous: *"Bluetooth printers continuously disconnect without a notification."* Network printers plus the `FireAcknowledged` event is the whole fix |

### One package to design first

`@tr/domain` — the event union, the `Allocation` type, the settlement invariants, the projection reducers, and the `toFiscalDocument` translator interface. Pure TypeScript, zero I/O, exhaustively tested. **If this package is right, the rest is typing.** If it's wrong, everything downstream inherits the error. Spend disproportionate time here; this is where your architecture experience actually converts into advantage over a competitor with more people.

---

## 10. Anti-patterns — each one is a documented incumbent failure

Do not:

- **Mutate check rows.** Every splitting, attribution and audit failure in the research traces to this.
- **Store tax rates.** They're versioned server-side and you must re-read them.
- **Use server-assigned IDs for domain objects.** It breaks offline entry, which is your headline capability.
- **Treat printing as fire-and-forget.** Un-acknowledged fires must escalate to the waiter's device, loudly.
- **Make coursing a global mode.** Hold/fire is per-item state. This is the "one more beer nukes the hold" bug and it's architectural, not a UI bug.
- **Model per-terminal licensing in the schema.** You're deliberately pricing terminals near zero; don't build the meter that tempts you to change your mind.
- **Ship any non-fiscal bill print that resembles a receipt.** That's the *međuzbir* mechanism, publicly documented in June 2026 with POS vendors named. `Predračun` is a fiscal document type with a defined form — use it and nothing else.
- **Store IPS payer account numbers.** NBS rules prohibit merchants collecting or storing them. Don't build loyalty identity on IPS data.
- **Conflate internal and fiscal payment method.** You permanently lose the cash-vs-card data that nobody in Serbia has.
- **Let fiscal code import domain code.** The dependency arrow points one way: `domain → fiscal-core ← fiscal-rs`. If it ever reverses, every release becomes a government approval.

---

## 11. Open architectural questions

Ordered by how much they change the design. Items 1–3 are new and are not in the research doc's list; 4–6 map to open items #4, #5 and #1/#10 there.

1. **Is the waiter tablet inside the ESIR scope?** Determines whether your highest-velocity component is behind a government approval gate. Ask the Poreska uprava in writing, before submission. *(§3)*
2. **What OS does the L-PFR you'll use require?** Determines hub hardware, deployment, and support model. *(§2)*
3. **Can a single L-PFR serve multiple ESIR instances at acceptable latency?** Vendor docs report L-PFR ≈ 0.5–1s per invoice, serialized — several devices settling simultaneously at closing time could queue for seconds. Measure this in the sandbox early; it may force a second L-PFR per venue, which changes your unit economics.
4. **Is V-PFR acceptable for brick-and-mortar hospitality?** If yes, you get a genuine hub-failure fallback and a lower-cost tier for micro venues.
5. **What are Serbia's configured security-element unaudited-amount limits?** You're surfacing this to the manager, so the thresholds have to be real numbers.
6. **Do the 109/2025 e-invoicing amendments change the SEF integration surface?** Blocks the W5/W6 design, not the spine.

---

## 12. What this buys you

If you build only §3–§6 and nothing else, you have:

- A system where the waiter app ships weekly and the certified element ships rarely — the velocity story
- Splitting, partial payment, seat attribution and shared items that work by construction, because they're allocations over a log rather than special cases — the demo that wins every head-to-head
- Genuine offline continuity with legal backing, and a consistency boundary that coincides exactly with the legal one
- A complete, actor-attributed audit trail — W7 and W14 arrive for free rather than as projects
- Reproducible reports, which the market leader demonstrably cannot do
- A country-agnostic fiscal layer, so "Balkan POS company" is a fact about the codebase
- Two data corpora accumulating from day one that no foreign competitor can obtain

That is a defensible seed story that does not depend on a single one of the twelve unresolved research questions.
