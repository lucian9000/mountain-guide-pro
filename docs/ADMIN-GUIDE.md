# SummitFit Adventures — Admin Guide

A plain-English guide to running your website day-to-day. No technical knowledge needed. Keep this handy — it walks you through every part of your admin console.

---

## 1. Getting in

1. Open your web browser and go to your website address followed by **`/admin`**
   (for example: `summitfitadventures.com/admin`).
2. Click **Sign in with Google**.
3. Sign in with the **info@summitfitadventures.com** Google account.

That's it. Only that one email address can see the admin console. If a normal customer signs in with their own Google account, they simply land on their personal **customer dashboard** (their bookings and account) — they never see any of your admin controls. So there's no way for a client to accidentally get in.

**Tip:** Bookmark the `/admin` page so you can get back quickly.

---

## 2. The dashboard at a glance

When you sign in you land on the **Dashboard** — your home base. At the top you'll see four quick numbers:

- **Total Clients** — how many people have signed up.
- **Upcoming** — bookings still to come.
- **Active Specials** — how many promotions are currently live.
- **This Month** — bookings made this month.

Below that:

- **Recent Bookings** — the latest few reservations (with a "View all" link to the full Bookings page).
- **New Clients** — the newest people to sign up.
- **Google Calendar** — a small card showing your own upcoming calendar events. The first time you use it, it asks to connect your Google Calendar (read-only, admins only). This is just a convenience view — you can safely skip it.

Everything is reached from the **menu down the left-hand side**: Dashboard, Clients, Pricing, Specials, Bookings, Guides, Routes, What's New. On a phone, tap the **menu icon** (top-left) to open that list. The **Back to Site** link at the bottom returns you to the public website.

---

## 3. Bookings — the most important section

This is where you manage every reservation. **Read this section carefully — it's the heart of running the site.**

### How bookings arrive

When a customer books through your website's calendar (the Google Calendar booking page), the reservation flows into your Bookings list **automatically, usually within about 10 minutes**. You don't have to do anything to bring it in.

These automatic bookings are marked with a blue **Via Cal Page** tag in the **Calendar** column, so you can tell at a glance that they came from the website's booking calendar.

### Why new bookings say "Pending" — and what you do about it

Every new website booking arrives with the status **Pending**. This is on purpose. There is no online card payment yet, so a booking is not automatically treated as paid-and-confirmed.

**Pending means:** *"The slot is held on the calendar, but the customer hasn't paid yet and you haven't approved it."*

**Your job:** Once you've sorted out payment directly with the customer (for example through your WhatsApp follow-up), you approve the booking:

1. Find the booking in the list.
2. In the **Status** column, click the dropdown (it will say *pending*).
3. Choose **Confirmed**.

Changing **Pending → Confirmed** is your "approve" action. That's the whole workflow: booking comes in as Pending → you arrange payment → you switch it to Confirmed.

### The other statuses

The Status dropdown has four options:

- **Pending** — new, awaiting your approval/payment (as above).
- **Confirmed** — you've approved it and payment is sorted. The customer sees this on their own dashboard.
- **Completed** — mark it this way **after** the tour has happened, to keep your records tidy.
- **Cancelled** — the booking is off. When you pick this, a small box asks you to confirm ("Cancel booking" / "Keep it"). You can always switch it back later if needed.

**Cancelling in Google Calendar also cancels here.** If a booking gets cancelled on the Google Calendar side, the next automatic sync (again, within ~10 minutes) will mark it Cancelled here too. You don't need to do it twice.

### The four tabs

Across the top of the Bookings page:

- **Upcoming** — bookings today or later that aren't cancelled. Your day-to-day working list.
- **Past** — bookings whose date has already passed.
- **Pending** — everything still waiting for your approval. **Check this often** — it's your "to-do" list.
- **Cancelled** — bookings that were called off.

### The Calendar column tags

- **Synced** (green) — fully linked with the calendar system.
- **Via Cal Page** (blue) — came in automatically from the website's booking calendar.
- **Not synced** (grey) — not linked to the calendar (for example a booking added by hand).

### What each row shows

Client name and email, the Tour, the Guide, the Date (and time slot), **Pax** (number of people), the **Total** price in Rands, the Calendar tag, and the Status dropdown.

---

## 4. The other sections

### Clients

Your list of everyone who has signed up.

- **Search** by name or email using the box at the top.
- **Click any client row** to open their details, where you can toggle their **marketing opt-in** and add **tags** (e.g. "VIP") to group people.
- **Export CSV** downloads the list as a spreadsheet file — handy for importing into an email marketing tool. It exports whoever is currently shown, so search first if you only want a subset.

### Guides

The mountain guides shown on your site.

- Click **Add Guide** to create one, or the **pencil** icon to edit.
- Fields: **Display name**, **Bio**, **Photo URL** (a web link to their photo), **Specialties** (comma-separated, e.g. "Scrambling, Trail running, Navigation"), and an **Active** switch.
- Turn **Active** off to hide a guide without deleting them.
- The **trash** icon deletes a guide permanently (it asks you to confirm first).

### Pricing

The tour prices shown on your public site. **Changes take effect immediately.**

- This is a table you edit directly in place. Click into any box to change it.
- Click **Add Tour** to add a new row.
- Columns include **Name**, **Description**, **Price** (per person), **Group** price, **Duration**, difficulty (**Diff.**), **Max** participants, and display **Order** (lower numbers show first).
- The **Active** switch controls whether a tour appears publicly.
- **Important:** after editing a row, click the **Save** (disk) icon on that row to keep your changes. The **trash** icon deletes the tour.

### Routes

Full route/adventure pages on your website. **Only *published* routes appear on the public site.**

- The list shows each route's cover image, name, **Status**, price, order, and when it was last updated.
- Click **New Route**, or a route's name/pencil icon to open the **route editor**.

**In the route editor you can set:**

- **Name** and **Slug** (the web address ending, filled in automatically from the name).
- **Description**, **Difficulty**, **Duration**, **Distance**, **Elevation**, **Price**, **Meeting point**, and **Highlights** (short bullet points — type one and press Enter, up to 12).
- **Location** — a map where you drop a **pin** for the route (and optionally the meeting point).
- **Images** — upload photos for the route. *You must save the route as a draft first, then the image uploader appears.*

**Publishing controls (bottom bar):**

- **Save draft / Save** — saves your work without putting it live.
- **Publish now** — makes the route live on the site.
- **Schedule** — pick a future date and time for it to go live automatically.
- **Hide** — takes a published route off the site (you can **Unhide** later).
- **Preview** — opens the page as it will look, even before publishing.
- **Delete** — removes the route and its page (its history is kept in the version log).
- **Version history** lets you look back at and **restore** earlier versions of a route.

### Specials

Homepage promotions. **Only one special can be active at a time** — turning one on automatically turns any other off.

- Click **New Special** to create one, or the **pencil** to edit.
- Fields: **Title**, **Description**, **Image URL**, **Discount %**, **Valid from**, and **Valid until** dates.
- The **Active** switch (on the card or in the form) puts it live on the homepage.
- The **trash** icon deletes it.

### What's New

Your news/updates posts. **The latest 3 published posts show in the "What's New" area on your homepage.**

- Click **New Post** to write one, or the **pencil** to edit.
- Fields: **Title**, **Body**, an optional **Image**, an optional **Linked route** (to point readers at a route page), and a **Status**.
- The **trash** icon removes a post.

---

## 5. Draft vs Published vs Hidden (content publishing)

For **Routes** and **What's New** posts, each item has a status shown as a coloured tag:

- **Draft** (grey) — a work in progress. **Not visible** to the public. Save things as drafts while you finish them.
- **Published** (blue/teal) — **live** and visible on the website.
- **Scheduled** (gold) — published, but set to appear at a **future date/time** you chose. It goes live by itself.
- **Hidden** (red) — was published, now taken **off** the site. You can bring it back with **Unhide**.

The simple rule: **if it isn't Published (and past its scheduled time), the public can't see it.** So you can prepare things quietly, then flip them live when ready.

---

## 6. If something looks wrong (FAQ)

**A new booking hasn't shown up.**
Give it about **10 minutes** — website bookings sync in automatically but not instantly. Refresh the page. Also check the booking was actually made through your website's booking calendar (bookings made another way won't flow in on their own). Look in the **Pending** tab — new bookings land there first.

**I can't sign in / I don't see the admin menu.**
You must be signed in with the **info@summitfitadventures.com** Google account. If you signed in with a different Google account you'll only see the customer dashboard, not the admin console. Sign out and back in with the correct account.

**A customer cancelled but the booking still shows here.**
If it was cancelled in Google Calendar, wait for the next sync (~10 minutes) and it will update to **Cancelled**. Or just set the Status to **Cancelled** yourself.

**I edited a price/tour but the site didn't change.**
On the **Pricing** page you must click the **Save** (disk) icon on that row. Pricing changes then apply immediately — refresh the public page to see them.

**I published a route but it's not on the site.**
Check its status tag really says **Published** (not Draft, Scheduled, or Hidden). If it's **Scheduled**, it won't appear until the date/time you set.

**I want to take something off the site without deleting it.**
Use **Hide** (for routes) or turn the **Active** switch **off** (for guides, specials, tours). Nothing is lost, and you can turn it back on anytime. Only use **Delete** when you're sure — it's permanent.

**What do customers see?**
When a customer signs in, they get their own simple dashboard: an **Overview**, **My Bookings** (their tours and each one's status), and **My Account** (name, email, marketing preference). They cannot see anyone else's information or any admin tools.

---

*Questions or something not covered here? Note it down and your web developer can help.*
