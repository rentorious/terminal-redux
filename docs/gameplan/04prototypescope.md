# Terminal Redux — Prototype Scope Spec

**Version:** 0.1 · 20 August 2026
**Window:** weeks 1–3 · ~70% of your time
**Status of the code:** disposable, with exactly one exception
**Ships to:** nobody. It goes into cafés on a tablet in your hand and comes home with you.

---

## 0. What this is and isn't

This is **an instrument for the interviews**, not version 0.1 of the product.

Its job is to make eight specific questions answerable by watching a waiter's hands instead of by asking an operator's opinion. *"Would you use a system that shows how long a table has been idle?"* produces a polite yes and no information. *"Sto 7 se seli unutra"* produces either a confident sequence of taps or a person looking at you — and that's a real answer.

There is a second, quieter job: **it is a live test of the event vocabulary.** You'll implement the floor against `@tr/domain`'s event union. If the vocabulary can't express what a waiter actually does in a café, you want to discover that in week 2 against a hardcoded menu, not in week 9 against a sync engine.

**The one thing that survives:** the event vocabulary and the `Allocation` type, refined by contact with reality. Everything else — every screen, every bit of state management, the storage layer, the styling — burns.

---

## 1. The eight questions each screen must answer

Build nothing that isn't attached to one of these.

| # | Question | Screen / interaction |
|---|---|---|
| 1 | Can a waiter enter a round without being taught? | Order entry with auto speed screen |
| 2 | Do they find the repeat-round action, or re-ring from scratch? | Repeat round |
| 3 | **Do they read the table-ageing indicator unprompted and correctly?** | Floor map — *this is W1's kill test* |
| 4 | Do they attempt the "party moves inside" case, or assume it's impossible? | Floor map — move seats/check between tables |
| 5 | Does arbitrary partial payment surprise them? | Payment — "900 dinara i odlazi" |
| 6 | Do they expect to type the same amount four times? | Payment — even split with pre-filled buttons |
| 7 | Do they believe splitting one item across three people is possible? | Payment — shared bottle |
| 8 | Can the event vocabulary express all of the above without special cases? | *(For you, not them)* |

If a feature doesn't serve one of these eight, it is out of scope. That rule is the entire discipline of this document.

---

## 2. In scope

### Floor map

- One venue, two areas: **bašta** (~14 tables) and **unutra** (~8 tables). Hardcoded layout — no editor.
- Each table shows: occupied/free, party size, current total, and **time since last item added**, as a colour ramp that ages: fresh → settling → idle.
- **The ageing indicator is the single most important pixel in the prototype.** It needs to be legible from a metre away in sunlight and comprehensible without a legend. Test it outdoors before you show it to anyone.
- Tap a table → its check.
- **Move:** long-press or drag a table's check onto another table. Also support moving *individual seats* — the rain case is often "three of five move."
- **Join / separate tables** as a real operation with a visible joined state. Not a $0 fake menu item; that's the workaround you exist to eliminate.
- Floor map is the **home screen**. (Square defaults to the menu and its own users complain that everyone immediately taps through to the floor plan.)

### Order entry

- **Speed screen generated from usage**, not hand-built. In a prototype "usage" is a plausible hardcoded frequency ranking — the point is that the waiter sees the top 12 items first, with no configuration. Note in your write-up that in the real product this is computed per venue, daypart and user.
- Full menu behind categories as the fallback.
- **One search field** resolving items, tables and open tabs together, fuzzy, with aliases. *"esp"* → espresso; *"12"* → table 12; *"dom"* → domaća kafa. This is the escape hatch that makes menu depth stop mattering, and it's the mechanism that makes the product bilingual later.
- **Repeat round** — one action, from the check.
- Quantity by tapping the item repeatedly. No numpad for quantities under ~6.
- Modifiers: a small set, **sorted by frequency**, with free modifiers visually distinct from paid ones (*bez šećera, bez leda, sa sojinim* versus a paid extra).
- **Optimistic UI, under 100ms per item add.** Half-second latency is documented as breaking the type-ahead rhythm experts rely on, and a laggy prototype will fail tasks for the wrong reason.
- **Seat assignment at zero extra tap cost.** Whatever mechanism you choose, adding an item must not become slower because seats exist. If it does, the whole seat-level design is dead and you'll have proved it here — which is itself a valuable result.

### Payment

The demo that wins the room. Four flows, all against a check that is a real event log:

1. **Pay all** — one tender, done.
2. **Even split by N** — N **pre-filled amount buttons**, computed. The waiter never types the same number twice. Rounding remainder explicitly shown and assignable, not silently dumped on the last payer.
3. **Arbitrary partial** — "900 dinara" against the residual. Check stays open with the remaining balance clearly displayed.
4. **Split by seat**, including **one item shared across seats** — the bottle of wine.

**Fake the money.** No card, no cash drawer, no fiscalization. A "payment taken" button is enough. The interaction is what's under test.

### The check view

- Lines grouped by seat when seats are in use, flat when they aren't
- Void with a reason — recorded, never deleted, visible in a small history
- Running total, and settled-vs-remaining once a partial payment exists
- A **predračun** print/preview action — say "štampa" and show a preview. Do not attach a printer

---

## 3. Deliberately fake

Say this out loud in the interview if they ask. "Ovo je prototip, pola ovoga je lažno" costs you nothing and buys honest feedback.

| Faked | Why it's fine |
|---|---|
| Menu — hardcoded, ~40 items | Menu management isn't under test |
| No fiscalization, no PFR, no printer | Under test in Track B, separately, in the sandbox |
| No auth — one waiter, no PIN | Adds friction, tests nothing here |
| Local storage only, no server, no sync | Sync is week 7–10 work; a prototype that syncs proves nothing extra |
| No KDS | *Optional:* a read-only "kuhinja" tab showing fired items, if a restaurant interview needs it. Skip for cafés |
| No reports, no back office | Nobody's evaluating a dashboard on a terrace |
| No inventory, no staff, no settings | Out of scope entirely |
| No multi-venue | Out of scope entirely |
| Payments are a button | The interaction is under test, not the money |

---

## 4. Explicitly out of scope

Not "later." **Not in this build.** Each of these has killed a prototype window before:

- Any settings screen. If it needs configuring, hardcode it.
- A floor-plan editor. The layout is a constant.
- User accounts, roles, permissions.
- Any server, any deployment, any CI.
- Real fiscalization or any PFR call.
- Real printing.
- Reservations, loyalty, delivery, inventory, tips.
- Dark mode / sun mode. **Except:** make sure the ageing indicator is legible in direct sunlight, because question 3 is the whole point and you'll be testing it on a terrace at 15:00. That's a colour-contrast decision, not a theming feature.
- Tests. This code is going in the bin. Test `@tr/domain` — which isn't going in the bin — and nothing else.

---

## 5. Build order

Sequenced so that if you run out of time, what you cut is the least important thing.

**Days 1–2 — the vocabulary.** Draft `@tr/domain` v0: the event union, `Allocation`, the settlement invariants, and a projection reducer producing `floor_state` and a check view. Pure TypeScript, in-memory. This is the part that survives, so it gets your best attention. Write the invariant tests here and nowhere else.

**Days 3–5 — order entry.** Speed screen, categories, search, quantity, modifiers, seat assignment. Get the latency right before you make it pretty; a laggy prototype fails tasks 1 and 2 for reasons that have nothing to do with the design.

**Days 6–8 — floor map.** Tables, occupancy, totals, the ageing ramp. Then move and join. **Take it outside and look at it in the sun on day 8.** If the ageing ramp isn't readable at a metre in daylight, fix it before anything else — question 3 depends entirely on this.

**Days 9–11 — payment.** All four flows. This is where the `Allocation` type earns its place, and where you'll discover whether it actually covers reality.

**Days 12–13 — the check view and the rough edges.** Void, predračun preview, whatever visibly breaks.

**Days 14–15 — dress rehearsal.** Run all eight interview tasks yourself, on the tablet, on battery, outdoors. Then hand it to someone who has never seen it — ideally an actual waiter, even a friend — and watch without speaking. Fix only what stops a task from completing. Everything else stays ugly.

**If you're behind on day 11:** cut the check view and the seat-split flow, keep partial payment and even split. Cut the join-tables operation, keep move. Never cut the ageing indicator or the order-entry latency work — those are questions 1, 2 and 3.

---

## 6. Hardware

- **Two cheap Android tablets** — 10", the kind a Serbian café would actually buy. Not a flagship. If it feels good only on a €600 tablet, you've learned nothing about the deployed reality.
- **A rugged case on both.** They will be handled with wet hands, and one will be dropped during the round.
- **Battery for a full afternoon**, and a power bank. A prototype that dies at venue three costs you a day.
- Capacitor build, sideloaded. No Play Store, no signing ceremony.
- Test in **direct sunlight** and in a **dim bar** before the first interview. Both conditions will occur in week 2.

---

## 7. Throwaway discipline

The prototype's greatest risk is that it's good enough to keep. That is how a three-week instrument becomes a nine-month codebase with a hardcoded menu and no sync.

**Rules:**

1. **Separate repository**, or at minimum a `prototype/` workspace that the real app never imports from.
2. **The only shared dependency is `@tr/domain`**, and the dependency points one way: prototype → domain, never the reverse. If you find yourself adding something to `@tr/domain` "so the prototype can do X," stop and check whether X is a real domain concept or a prototype shortcut.
3. **No persistence beyond a local file.** Making state durable is the first step toward keeping it.
4. **Ugly on purpose.** No design system, no component library, no animation polish. Legible and fast, nothing more. Polish invites attachment.
5. **A dated delete note in the README:** *"Delete after week 5. Only `@tr/domain` survives."* Write it on day one, when you believe it.

**The honest exception.** If the interviews reveal that a specific interaction is *exactly right* — the ageing ramp's colour steps, a particular gesture for moving a party — screenshot it, write down why it works, and reimplement it properly. Copy the insight, not the code.

---

## 8. What you should have on day 15

- A tablet you can hand to a stranger in a café, where they complete tasks 1–7 without you speaking
- **`@tr/domain` v0**, validated against real floor behaviour, with the event union and `Allocation` type refined by having actually implemented them
- A written list of **every place the vocabulary didn't fit** — the moments where you had to reach for a special case. These are the most valuable notes you'll produce in the whole three weeks, because each one is a bug in the spine caught before the spine exists
- Confidence about whether the ageing indicator communicates without explanation — which you'll test properly on real operators in week 3, but you should already suspect the answer

Then you go outside with it.
