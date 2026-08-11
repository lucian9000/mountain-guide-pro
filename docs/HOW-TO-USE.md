# SummitFit — How To Use The New Features

A plain-English walkthrough of everything added in this update. No technical
knowledge needed. For the older day-to-day admin basics see
[ADMIN-GUIDE.md](./ADMIN-GUIDE.md).

**Contents**
1. [Signing in — two ways now](#1-signing-in--two-ways-now)
2. [The Book Now button](#2-the-book-now-button)
3. [Group events — create and sell dated adventures](#3-group-events)
4. [Uploading photos](#4-uploading-photos)
5. [Group pricing on private tours](#5-group-pricing)
6. [The pop-up event card](#6-the-pop-up-event-card)
7. [Managing bookings](#7-managing-bookings)
8. [Brand colours](#8-brand-colours)

---

## 1. Signing in — two ways now

Clients (and you) can now use **either** method at `/login`:

- **Continue with Google** — one click, as before.
- **Email + password** — for anyone without a Google account. Choosing *"New
  here? Create an account"* asks for a name, email and password, plus a
  pre-ticked **"Keep me posted on upcoming hikes and specials"** box that records
  their marketing consent on their profile.

Forgotten passwords are self-service: **Forgot password?** emails a reset link
that lands on a "Set a new password" page.

> **Your admin account is unchanged.** Sign in with
> `info@summitfitadventures.com` and you land in the admin panel as before.

---

## 2. The Book Now button

The floating blue **Book Now** button (bottom-right of every page) opens the
**quick-book panel**. This replaced the old "Adventure Bot" chat.

**What changed and why:** the old chat pretended to be a person, asked your
fitness level, then *hid* trails that didn't match — and often dead-ended in a
WhatsApp message even when the trail was bookable. The new panel is an honest
menu:

- Two tabs, always visible: **Mountain Routes** and **Personal Training**.
- **Every** route is listed immediately — nothing hidden behind questions.
- Tap a route card to expand it for terrain, required gear and the weather policy.
- Routes with a price show a **Book Now** button that takes the client straight
  to the booking page with that tour pre-selected.
- Routes without a set price (the 13 Peaks challenges, custom training) show
  **Enquire via WhatsApp** instead — that's the only place WhatsApp is now the
  main action.
- A quiet *"Prefer to chat? WhatsApp Ernest"* line sits at the bottom as a
  backup.

**Nothing to configure** — prices come from Admin → Pricing automatically.

---

## 3. Group events

Events are one-off dated adventures (a sunrise hike, a full-moon summit) that
several people book onto — different from private tours, which are booked
one-to-one.

### Creating one

**Admin → Events → New event.** It's a 3-step wizard:

| Step | What you enter |
|---|---|
| **1. The basics** | Title, date, start time, location |
| **2. Spots & price** | Capacity (how many people can come) and price per person |
| **3. Make it look good** | Description, photo, guide — then a **live preview** of exactly how it will appear on the website |

At the end choose **Save as draft** (keep working on it, invisible to the
public) or **Publish now** (goes live immediately).

### After it's live

- It appears in **Upcoming Adventures** on the homepage and in the pop-up card.
- The site shows how many spots are left, and **"Fully booked"** with the button
  disabled once it's full.
- **The system will not let anyone oversell an event.** If two people try to take
  the last spots at the same time, the second one gets *"This event just filled
  up — please pick another date."* This is enforced by the database, not just the
  website, so it cannot be bypassed.

### Editing, copying, deleting

Each event card has **Edit**, **Duplicate** and **Delete**. *Duplicate* copies
everything and clears the date — the fastest way to run the same hike monthly.
Past events tuck away under a collapsed **"Past events"** section.

---

## 4. Uploading photos

Anywhere you used to paste an image link — **events, specials and guide
photos** — you now get a proper upload box.

- **On your phone:** tap the box and it opens the camera directly. Take the photo
  and it uploads.
- **On a computer:** click the box or drag a photo onto it.
- Photos are **shrunk automatically** before uploading, so a big phone photo
  won't be slow for visitors. You don't need to resize anything yourself.
- Maximum **5 MB** per photo — bigger ones are rejected with a message.
- **Change photo** or the **X** removes it. Pasting a link still works via
  *"or paste an image URL instead"*.
- If an upload fails (bad signal), your photo stays on screen with a **Retry
  upload** button — you won't lose it.

---

## 5. Group pricing

Private tours can now charge less per person for bigger parties.

**Admin → Pricing → Edit** on any tour:

- **Price** — the normal per-person price.
- **Group price** — the cheaper per-person price for groups.
- **Group applies from [N] people** — the party size where it kicks in.

The booking page applies it automatically: once a client picks that many people,
the total switches to the group rate and shows **"Group rate applied ✓"** with
the normal price struck through. Leave *Group price* empty for no group rate.

---

## 6. The pop-up event card

Five seconds after someone lands on the homepage, a small card slides in at the
**bottom-left** showing your next bookable event: its photo, title, date and
spots remaining, with one **Book** button.

- It shows **"Only 3 spots left"** in amber when 5 or fewer remain — a nudge to
  book.
- **Sold-out events are skipped** — it moves to the next one that can actually be
  booked.
- If there are no upcoming events, it shows your **active special** instead. If
  there's neither, nothing appears.
- Visitors can close it with the **X**, and it won't come back during that visit.

You don't manage this card directly — it simply reflects whatever event or
special is live.

---

## 7. Managing bookings

**Admin → Bookings.** Website bookings arrive automatically within ~10 minutes
and are tagged **"Via Cal Page"**.

**The one workflow that matters:** bookings arrive as **Pending** on purpose —
there's no online payment yet, so *Pending* means *"the slot is held, but not
paid"*. Once you've arranged payment with the client, change the status to
**Confirmed**. That is the approval step.

There's also an **Events** tab that groups bookings by event and gives you an
attendance register (name, email, number of people) plus a **Download list**
button for a spreadsheet you can take up the mountain.

---

## 8. Brand colours

Use these for anything you make that should match the site — slides, posters,
social graphics.

### Core palette

| Role | Colour | Hex | Use for |
|---|---|---|---|
| **Deep navy** (background) | ⬛ | `#061B2D` | Main background of everything |
| **Card navy** | ⬛ | `#0C263B` | Panels and cards sitting on the background |
| **Raised surface** | ⬛ | `#1D2B34` | Floating notifications (slightly warmer) |
| **Cyan** (primary accent) | 🔵 | `#00C8FF` | Buttons, links, highlights — the signature colour |
| **Cyan hover** | 🔵 | `#00A8D6` | Pressed/hover state of cyan buttons |
| **Cyan soft** | 🔵 | `#66DEFF` | Gradient partner for cyan headings |
| **Gold** | 🟡 | `#DDAB2C` | Section eyebrows, secondary accent, urgency edge |
| **Off-white** (text) | ⬜ | `#F1F5F9` | Headings and body text on dark |
| **Muted grey-blue** | ◽ | `#8599AD` | Secondary/supporting text |
| **Border** | ▫️ | `#1F3547` | Hairlines and card edges |

### Status colours

| Meaning | Hex |
|---|---|
| Success / available | `#10B77F` |
| Warning / low spots | `#F59F0A` |
| Danger / cancelled | `#EF4343` |

### Typography

- **Headings:** Montserrat — **Black/ExtraBold (800–900)**, `UPPERCASE`, wide
  letter-spacing (~0.1em).
- **Body:** Inter — Regular/Medium, sentence case.

### Style rules

- Dark background always — this is a dark-mode-first brand, never a white page.
- **Cyan is the action colour.** Use it for one primary action per screen; don't
  paint whole blocks in it.
- **Gold is the highlight**, used sparingly for labels and urgency.
- Cards use generous rounding (12–16px) and soft cyan-tinted glows rather than
  hard shadows.
- Photography is dramatic mountain landscape, usually darkened so light text
  sits on top.
