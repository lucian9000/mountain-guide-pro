# Slide-deck generation prompt (SummitFit update)

Paste everything in the fenced block below into Gemini / NotebookLM / Gamma /
Canva Magic Design. It contains the brand rules **and** the content, so the deck
comes back on-brand without further editing.

> Tip: if the tool asks for a source document, also attach
> `docs/HOW-TO-USE.md` — it has the same facts in longer form.

---

```
Create a 12-slide presentation titled "SummitFit Adventures — What's New"
for a client walkthrough. The audience is Ernest, a professional mountain
guide who is NOT technical, plus his business partners. Tone: clear,
confident, plain English. Explain benefits, not code. Never use jargon
like "component", "schema", "RLS" or "deploy".

═══════════════════════════════════════════
VISUAL STYLE — follow exactly
═══════════════════════════════════════════
This is a DARK-MODE brand. Every slide has a dark navy background. Never
use a white or light background.

Colour palette (use these exact hex values):
- Background (all slides):      #061B2D   deep navy
- Card / panel surfaces:        #0C263B   lighter navy
- Primary accent:               #00C8FF   bright cyan  ← the signature colour
- Accent gradient partner:      #66DEFF   soft cyan
- Secondary accent:             #DDAB2C   gold
- Heading + body text:          #F1F5F9   off-white
- Secondary / caption text:     #8599AD   muted grey-blue
- Hairlines, card borders:      #1F3547
- Success / positive stat:      #10B77F   green
- Warning / urgency:            #F59F0A   amber

Typography:
- Headings: Montserrat, ExtraBold or Black (800–900), ALL UPPERCASE,
  wide letter-spacing (~0.1em). Large and confident.
- Body: Inter, Regular or Medium, sentence case, comfortable line height.
- Key numbers/stats: Montserrat Black, oversized, in cyan #00C8FF.

Layout rules:
- Generous whitespace; never crowd a slide. Max ~35 words of body text.
- Content sits in rounded cards (12–16px radius) of #0C263B on the #061B2D
  background, with a thin #1F3547 border.
- Cyan is the ACTION colour — use it for one emphasis per slide (a key
  number, an arrow, a highlighted word). Do not flood slides with cyan.
- Gold #DDAB2C is for small uppercase "eyebrow" labels above headings.
- Optional imagery: dramatic, darkened mountain landscape photography with
  text overlaid. Never bright/washed-out stock photos.
- Use simple line icons (outline style, cyan), never emoji.

═══════════════════════════════════════════
SLIDE CONTENT
═══════════════════════════════════════════

Slide 1 — Title
Eyebrow: SUMMITFIT ADVENTURES
Title: WHAT'S NEW
Subtitle: Online booking, group events and a faster way to manage it all.

Slide 2 — The headline
Title: FIVE BIG CHANGES
Body, as five short bullets:
• Clients can sign up with email — not just Google
• Group events you can create and sell in minutes
• Real photo uploads, straight from your phone
• Group discounts applied automatically
• A booking panel that actually converts

Slide 3 — Sign in your way
Eyebrow: FOR YOUR CLIENTS
Title: TWO WAYS TO SIGN IN
Body: Clients can continue with Google, or create an account with an email
and password. Forgotten passwords now reset themselves — no message to you.
Callout: Fewer clients lost at the sign-in step.

Slide 4 — Book Now panel (before/after)
Title: FROM CHATBOT TO QUICK BOOK
Two columns.
BEFORE: A fake chat asked visitors their fitness level, then hid the trails
that didn't match — and often ended in a WhatsApp message even when the
trail was bookable.
AFTER: One tap on "Book Now" opens a clean menu. Every route is visible
immediately, with prices, and one tap goes straight to booking.

Slide 5 — Group events
Eyebrow: NEW
Title: SELL DATED ADVENTURES
Body: Create a one-off event — a sunrise hike, a full-moon summit — with a
date, capacity and price per person. Publish it and it appears on the
website instantly.
Callout in cyan: A 3-step wizard. Under two minutes.

Slide 6 — Never oversell
Title: THE SYSTEM WON'T LET YOU OVERSELL
Body: Spots remaining are counted live. If two people try to take the last
places at the same moment, the second is told the event just filled up.
Stat, oversized in cyan: 0
Stat caption: chances of a double-booked event

Slide 7 — Photos from your phone
Eyebrow: NO MORE PASTING LINKS
Title: TAP, SHOOT, DONE
Body: Tap the photo box on your phone and the camera opens. Photos are
shrunk automatically so the site stays fast — nothing for you to resize.
Caption: Works for events, specials and guide photos.

Slide 8 — Group pricing
Title: GROUP RATES, APPLIED AUTOMATICALLY
Body: Set a lower per-person price and the party size it starts at. When a
client books that many people, the discount applies itself and shows
"Group rate applied".
Example line: 4+ people → R1 200 becomes R1 000 per person

Slide 9 — The pop-up card
Title: YOUR NEXT EVENT, FRONT AND CENTRE
Body: Five seconds after a visitor lands, a small card slides in showing
your next event — photo, date and spots left — with one Book button.
Highlight in amber #F59F0A: "Only 3 spots left" appears when places run low.

Slide 10 — Managing bookings
Eyebrow: THE ONE WORKFLOW THAT MATTERS
Title: PENDING → CONFIRMED
Body: Website bookings arrive automatically and sit as Pending, because
there's no online payment yet. Once you've taken payment, switch them to
Confirmed. That's the approval step.
Caption: An Events tab gives you a downloadable attendance register.

Slide 11 — Built properly
Title: QUIETLY, UNDER THE HOOD
Three short bullets:
• Works on any phone, tested at every screen size
• Meets accessibility standards — usable with a screen reader
• Loads fast: the site's code is 60% smaller than before

Slide 12 — Closing
Title: READY WHEN YOU ARE
Body: Everything above is live. The next step is online card payment, which
will let bookings confirm themselves.
Footer, small, muted: SummitFit Adventures · Powered by StateOfAshes
```

---

## If you want a shorter deck

Cut slides 3, 8 and 11 for a **9-slide** version — the story still holds:
what's new → quick-book panel → events → no overselling → photos → pop-up
card → bookings workflow → close.

## Accuracy notes (so the deck stays honest)

- **Online payment does not exist yet.** Bookings are held as *Pending* and
  confirmed by hand — slide 10 and 12 say so; don't let a tool "improve" that
  into automated payment.
- The 60% figure on slide 11 refers to the main JavaScript bundle shrinking
  from 649 KB to 258 KB during the performance work.
- Confirmation emails are built but need the email service switched on, so
  don't claim automatic emails to clients yet.
