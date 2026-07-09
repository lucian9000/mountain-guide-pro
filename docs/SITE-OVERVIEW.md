# SummitFit Adventures — Site Overview & What's New (v4.0)

A quick, plain-English tour of the site and everything that changed in the v4.0
update. For the day-to-day admin how-to, see [ADMIN-GUIDE.md](./ADMIN-GUIDE.md).

## What the site is

A marketing + booking site for Ernest Carrick's mountain-guiding and fitness
business in Cape Town. Visitors can explore guided routes, read the latest news,
and **book a tour online**. Ernest manages everything — bookings, content,
pricing — from a private admin console.

**Main pages**
- **Home** — hero video, what he offers, meet Ernest, social feed.
- **Routes** — the guided hikes, each with photos, a map, difficulty and price.
- **News ("What's New")** — announcements + the live Facebook feed.
- **Book a Tour** — sign in with Google, pick a tour, pick a slot on Ernest's
  calendar.
- **Admin** — the private back office (owner only).

## What's new in v4.0

v4.0 was a four-part upgrade. In plain terms:

### 1. Accessibility — the site now works for everyone
Screen-reader labels, keyboard navigation, a "skip to content" link, readable
colour contrast, and larger tap targets throughout. The 404 page's "return home"
link (previously invisible) is fixed. Nothing looks different — it just works for
more people, and meets accessibility standards.

### 2. Speed — the site loads noticeably faster
The main code bundle shrank by **~60%** (648 KB → 258 KB), images were resized to
what's actually shown (~450 KB saved), fonts load faster, and the Facebook feed no
longer slows down page loads. Result: quicker first paint, especially on mobile.

### 3. Consistency & polish — one cohesive design
- **One unified header** across every page. Previously "The Guide", "Training"
  and "Contact" were unreachable from inner pages — now the full menu is
  everywhere, and "Book Now" is always visible.
- Snappier hover animations, consistent brand colours (midnight blue + cyan),
  and cleaner typography.
- The News page's Facebook feed now sits beside a "Follow the Adventure" panel
  instead of floating in empty space.

### 4. Online booking — the big one
Clients can now **book a tour directly on the site**:
1. They sign in with Google (free, one click).
2. They pick a tour, then pick an available date & time straight from Ernest's
   real Google Calendar, embedded in the page.
3. Google instantly reserves the slot and emails both the client and Ernest.
4. The booking automatically appears in Ernest's admin console within ~10
   minutes, marked **Pending**.
5. Ernest confirms payment with the client directly, then flips the booking to
   **Confirmed** in the admin console.

**Why "Pending" first?** There's no online payment on the site yet, so every
booking is held for Ernest's manual approval once he's arranged payment. When a
card-payment gate is added later, this can flip to auto-confirm.

## What's live vs. coming next

**Live now**
- The whole marketing site, accessibility, speed and design upgrades.
- Online booking via Google Calendar, syncing into the admin console as Pending.

**Configured, needs a final switch**
- **Confirmation emails** — the branded email system is built and ready; it needs
  the email service (Resend) connected and the domain verified to start sending.

**Planned**
- Online card payment → automatic booking confirmation.
- Live guide availability shown before booking.

## The tech, in one line
Vite + React + Tailwind front end on Vercel; Supabase for accounts, data and the
booking sync; Google Calendar for scheduling. No paid scheduling or booking
software — it's all built in.
