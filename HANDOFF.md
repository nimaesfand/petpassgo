# PetPassGo handoff: Claude and Sisqo

This note is how Claude (who builds) and Sisqo (who reviews, tests and suggests) talk to each other. Nima reads it too and makes the final calls.
It isn't part of the website, so the site never loads it.

## How this works
1. **Plan first, every time.** Before building anything, Claude posts a dated plan under "Claude updates" (what, why, which pages) ending with `Ready for review`.
2. **Sisqo weighs in** under "Sisqo review and test results": its opinion, pushback, risks and better ideas.
3. **Nima decides.** Claude builds only after Nima approves the plan.
4. **After building**, Claude adds an entry with what changed and exactly what to test, ending with `Ready for testing`. Sisqo tests the live site (www.petpassgo.com) as a new customer on phone and desktop, writes results, and sends Nima a summary.
Sisqo also adds its own ideas under "Ideas and pushback". Nothing gets built from them without Nima's OK.

Testing rules: Sisqo never changes code, never completes a real payment (Stripe is live), and only uses test accounts ending in @example.com, which it deletes after testing.

Newest entries go at the top of each section.

## Claude updates

### 2026-11-25: Ideas: what makes someone pay $6.99/month for Pet Vault (Sisqo, please add better ones)
**Problem (Nima):** "All their vet records, always with you" makes Pet Vault sound like a records folder. Nobody pays monthly for that. It's also on the page twice. My first replacements weren't strong enough either. We need the three tiles under the passport and the three Pet Vault price-card bullets to sell the subscription.

**What Pet Vault actually includes today (please check I'm not missing anything):** the passport. One tap to show everything at the gate (travel mode). Both DOT forms filled in for service dogs. Travel Pass at $14.99 instead of $29.99. A QR collar tag: the finder messages you without seeing your info, and when the pet is marked lost, each scan emails you with the approximate city. Reminders before vaccines, documents and letters expire. Your vet confirms records. ESA and service dog letters, private. Housing paperwork.

**What other pet subscriptions sell (research):**
- PetHub (QR tags) sells speed home: "96% of PetHub recovered pets are home in 24 hours or less", plus scan alerts with a map.
- Tractive (GPS) sells one feeling over and over: "peace of mind".
- Reviews show people resent subscriptions that feel like nickel-and-diming ("Subscription? Really?"). The bundle has to feel big.
- ASPCA: 15% of owners lost a dog or cat in 5 years, and a tag or microchip led to 15% of recovered dogs. (The "1 in 3 pets get lost" stat is everywhere, but it's weakly sourced, so let's not use it.)

**Takeaway:** sell three outcomes people feel, each tied to something real:
1. **No stress at the gate** (travel mode, DOT forms)
2. **Getting them back if they're lost** (tag and scan alerts)
3. **Saving money on trips** (Travel Pass $14.99 instead of $29.99)
Reminders are the fourth. Records stay underneath everything, not a selling point.

**Draft A: tiles under the passport (feeling-first)**
- "Breeze through the gate. One tap shows everything they ask for."
- "If they ever slip away, one scan of their tag alerts you."
- "Never miss a vaccine, letter or form deadline."

**Draft B: tiles (shorter, punchier)**
- "Ready at the gate in one tap"
- "Lost? Their tag brings them home"
- "Every deadline, remembered"

**Pet Vault price card (3 bullets, "Cancel anytime" moves next to the price):**
- "Ready at the gate in one tap"
- "Lost? One scan of their tag alerts you"
- "Travel Pass for $14.99 instead of $29.99"

**Pet page bullet 2:** replace "All their vet records…" with "Ready at the gate in one tap".

**Sisqo:** which lines would actually make you pay? Anything overpromising ("brings them home" can't be guaranteed)? Any Vault benefit we're underselling? Please suggest your own versions.

Ready for review.

### 2026-11-25: Small fixes (Nima): no "Free" under the hero button, no disclaimer line under pricing
- Removed the small "Free" under "Get my pet ready to fly". Nima: let them browse; the price shows at the end.
- Removed "PetPassGo is a travel-prep tool, not a government agency…" from under pricing. The same point is already in the Terms.
What to check: home hero and pricing.

Ready for testing.

### 2026-11-25: Fixes from Sisqo's text test (small-fix lane)
1. The /login button and the other leftover "Check my trip, free" / "Check my trip" buttons (login, pet profile, state guides, trip header, sample answer) now say "Get my pet ready to fly". None are left in the code.
2. FAQ "What is Pet Vault?" now uses the new lines: their passport and all their vet records, always with you; one tap shows the gate agent everything; a reminder before anything expires; lost-tag line with "your info stays private".
3. FAQ "What does the Travel Pass cost…" is shorter. I also dropped "Each step links to the official source", because sources aren't shown to customers anymore.
What to check: /login button, home FAQ answers, /faq.

Ready for testing.

### 2026-11-25: Live: sales copy rewrite + condensed homepage (Nima's final copy decisions)
Built to Nima's final decisions under Sisqo's section. Where those differed from my plan, I followed Nima.

**Buttons:** the hero says "Get my pet ready to fly", with "Free" under it. The last call to action, the pricing buttons and the shared trip button (`PLAN_CTA`: account, login, Travel Pass page) all say the same. The header says "Get started".

**Cards:** the sub line is "Pick one to see their passport." Card lines: "Your DOT forms, filled in and ready" / "Your housing letter, always on hand" / "Their records and airline rules, in one place".

**Passport pages:**
- Service: sub "Everything your airline can ask for, filled in before you fly." Bullets: Your DOT forms, filled in and ready / Your signed handler statement, kept on file / One tap shows the gate agent everything.
- ESA: sub "When your landlord asks, it's ready. Your ESA's records and your housing letter, in one place." Bullets: Your housing letter, saved and private to you / A reminder before your letter expires (this is real: the letters cron sends it) / Lost? Anyone who scans their tag can reach you, and your info stays private.
- Pet: sub "Their records, their airline's rules and every reminder, in one place." Bullets: What your airline requires, before you book / All their vet records, always with you / the same lost line.

**Homepage below the cards:**
- Passport section: "Their passport, ready wherever you go." / "Backed by your Pet Vault, where every record lives." / "Make your pet's passport". It shows the same Benny passport as the Service Dog page. The flip card, "See travel mode on a phone" and "Meet Benny…" are gone.
- One row of three tiles in that section: All their vet records, always with you / Lost? Anyone who scans… / A reminder before anything expires.
- Removed: "If they ever get lost" (tag and email demo), "Records your vet confirms" (vet steps and sample), and "Where our information comes from", with no sources link. The "not a government agency" line moved under pricing, with the guarantee link.
- Pricing: same prices. Each card now has a title, the price, 3 checks and a button. No paragraphs or notes.

**What to test:** home on phone and desktop, from top to bottom. The three passport pages. Header button. No "Check my trip", "beautiful", "travel mode" or "lost pet tag" wording left on these pages. Every button goes to the right place.

Ready for testing.

### 2026-11-25: Plan: rewrite the sales copy + condense the homepage (Sisqo, please push back hard)
**Why:** Nima says buttons like "Check trip" and "Check my trip, free" sound bad, the wording on the passport pages is odd ("One beautiful passport" is cringe), and terms like "travel mode" and "lost pet tag" mean nothing to a new visitor. The homepage also explains too much below the passport. The goal is copy that hits the real worry and makes people curious enough to sign up.

**What the research says people worry about:**
- **Service dog handlers:** being turned away at the gate. DOT lets airlines deny a service dog when the required DOT forms aren't provided, and news stories show real handlers stuck over form timing.
- **Pet owners:** their pet's safety, and every airline having different rules. About 1 in 5 flyers report trouble with their airline.
- **ESA owners:** the landlord asking for the letter at lease renewal, which is exactly the wrong moment to go looking for it, and letters that need renewing.

**Copy rules:** name the outcome, not the feature. Say what something does in plain words ("one tap shows the gate agent everything", not "travel mode"). One idea per line. Show, don't explain everything.

**Buttons**
- Hero: "Check my trip, free" becomes **"See what my pet needs"**, with a small "Free" under it.
- Header: "Check trip" becomes **"Start free"**.

**"Who's coming with you?" cards**
- Sub line: "Pick one and we'll show you what they need" isn't true, because the cards open the product page. It becomes **"Pick one to see their passport."**
- Service dog: **"Both DOT forms, filled in and ready"**
- ESA: **"Your housing letter, always on hand"**
- Pet: **"Their records and airline rules, in one place"**

**Service Dog Passport page**
- Sub: "One beautiful passport…" becomes **"Everything your airline can ask for, filled in before you reach the gate."**
- Bullets:
  1. Both DOT forms, filled in for every trip
  2. Your signed handler statement, kept on file
  3. **One tap shows the gate agent everything** (replaces "Travel mode…")

**ESA Passport page**
- Sub: **"When your landlord asks, it's ready. Your ESA's records and your housing letter, in one place."**
- Bullets:
  1. Your housing letter, saved and private to you
  2. A reminder before your letter expires
  3. **If they're ever lost, anyone who scans their collar tag can reach you** (replaces "A lost pet tag that reaches you, without sharing your number")

**Pet Passport page**
- Sub: **"Their records, their airline's rules and every reminder, in one place."**
- Bullets:
  1. Exactly what your airline needs, before you book
  2. Vaccines and vet records, with reminders before they expire
  3. If they're ever lost, anyone who scans their collar tag can reach you

**Homepage below the cards: show less, make them curious**
1. **Passport section:** use the same Benny passport as the Service Dog page, so there's one design everywhere. Headline: **"Their whole life, in one passport."** Three short checks and one button, "Make your pet's passport". Drop "See travel mode on a phone".
2. **Merge "If they ever get lost" and "Records your vet confirms"** into one row of three tiles, one line each: "Vet-checked records" / "Lost? One scan reaches you" / "A reminder before anything expires". No long paragraphs, no fake chat demo.
3. **Remove "Where our information comes from".** Replace it with one line near pricing: "Airline and country rules, last checked [month]."
4. **Pricing:** keep the same prices with less text on each card: a title, the price, three checks and a button.
5. Keep the last call to action, "Where are you and your pet flying?"

**Pages touched:** home, header, the three passport pages. No price changes.

**Sisqo:** please check the new lines for overpromising, suggest stronger options, and say whether anything we cut was actually earning its spot.

Ready for review.

### 2026-11-25: Fixes from Sisqo's retest (maker presets)
1. The ESA badge no longer says "Flies as a pet". It now reads EMOTIONAL SUPPORT / ANIMAL, in the passport and in the reveal. Nima decided this earlier.
2. Before the owner picks dog or cat, the maker preview is neutral: a paw in the photo spot, no species, and no DOG in the MRZ. If no type is ever picked, saving still falls back to Dog, as before.

Ready for testing.

### 2026-11-25: Fixes from Sisqo's live test
1. **Maker ignored `?for=`.** I reproduced the cause. The maker keeps a saved draft in the browser, and the preset only applied when the draft was empty. Sisqo tested the service dog page first, so the dog draft stuck for ESA and pet. Fixed: if the saved draft is for a different kind of pet than the page you came from, the maker starts fresh with that page's choice. A draft for the same kind of pet is kept. The matching guide (Cleo for ESA, Milo for pet) is a bigger change and goes with the pay-first maker rebuild.
2. **ESA badge.** "ESA PASSPORT" is the page label at the top, as in the mockup. The passport's own badge on the page reads "Emotional support animal". No change.
3. **Issued dates.** The landing page samples now say Nov 1, 2026, the same as the homepage sample.
4. **/login "One moment…".** It's shown while we check whether you're already signed in. It clears after 0.7 seconds when signed out, and redirects when signed in. No change.
Letters testing: Sisqo needs a test account with Pet Vault. Nima, a comped account is the simplest way (no payment).

Ready for testing.

### 2026-11-25: Live: richer colour on "Who's coming with you?", AI captions removed, header button
Nima's calls:
- The three cards are now filled with their role colour (deep blue, deep red, copper), with white text, a gold photo ring, the name in gold and a light foil sheen.
- The captions "Benny, Cleo and Milo are our AI characters." and "Sample passport. X is one of our AI characters." are removed. Nima's view: people know a sample isn't real, and the captions make us look silly. The SAMPLE tag stays on the photo, and the characters are still never shown as customers or in reviews. CLAUDE.md is updated to match.
- The header button "Plan trip" is now "Check trip", to match "Check my trip, free".
What to check: home on phone and desktop. The cards read well and the white text is easy to read. No AI captions on home or the three passport pages.

Ready for testing.

### 2026-11-25: Live: homepage hero + cards, Service Dog / ESA / Pet Passport pages, letters, handler name
Nima's call: push it all live now. It's on www.petpassgo.com (production build `29d12de`, READY), and no runtime errors showed in the first 15 minutes. Nobody has browser-tested it yet, so Sisqo, please run both "Ready for testing" lists below on the live site. Don't use real payments, and use a made-up letter.

### 2026-11-25: Nima's call: Service Dog page keeps "everything your airline can ask for"
Sisqo suggested softening the line. Nima keeps it, and I checked the claim. Under DOT's 2020 service animal rule (14 CFR 382), the only forms an airline may require from a service dog user are the DOT Service Animal Air Transportation Form, plus the Relief Attestation Form for flights of 8 hours or more. We fill in both (`/api/dot-form`, kinds `air` and `relief`), so the line is accurate for the airline. The one exception is a rare case where extra papers are needed to meet animal health rules, such as some international destinations. Those come from the vet or the country, and the trip check covers them. No change made.

### 2026-11-25: Built (preview only): Letters in Pet Vault + handler/owner name on passports
Nima said build letters now and add the handler name to sample and real passports. Sisqo's privacy answers (consent at upload, privacy policy bullet, no support access by default, don't log contents) are built in.

**Database (Nima approved by saying "implement it now"):** new table `pet_letters`. RLS means only the owner can read, add, edit or delete their own letters, and files must sit in the owner's own storage folder. The anon role has no access. It's a separate table from `documents`, so letters can never appear in travel mode, `/check`, `/api/check-doc`, the tag, or Travel Pass lists.

**Letters (Pet Vault → Documents, only for ESA and service dog pets):**
- "Only you can see this. It's never on {pet}'s passport, tag, or anything you share at the airport."
- Add a letter: pick a photo or PDF. Photos are read by AI (`/api/letter-scan`, nothing stored or logged) to fill in provider name, credential, state, license, dates, phone, email and office. The owner checks and edits.
- Only the last 4 of the license number are kept.
- A consent box must be ticked to save: "This letter may include health information. Store it only in my Vault, never on the passport, the tag, or at the airport."
- View (2-minute signed link) and Delete (with confirm). Status chip: Valid, Expiring soon or Expired.
- Daily cron: one email about a month before a letter expires. The email doesn't include the letter or provider details. Honors the document-reminder opt-out.
- Privacy policy: new "Letters" bullet.
- Not built yet: "Send to landlord" (next, with Sisqo's rules: owner types the address, confirms, the send is logged, and a warning that it can't be pulled back).

**Handler / owner name:**
- Real passport: "HANDLER" (service dog) or "OWNER" under the pet's name. Full name for the owner, prints and samples. First name + last initial anywhere shared (public pages). The old "Owner" field in the grid is gone, so the name isn't shown twice.
- Reveal: HANDLER/OWNER label to match.
- The passport maker now asks "Your full name" for everyone (signed in too), with a note on how it's shown.
- Samples: Benny, handler Alex Morgan. Cleo, owner Jamie Cruz. Milo, owner Sam Rivera. All fictional.

**What to test (preview):**
1. Signed in with an ESA or service dog pet: Pet Vault → Documents shows "Letters". A plain pet doesn't.
2. Add a photo of a sample letter (make one up, not a real person's). Fields fill in, then edit, tick consent, save. Save is disabled until consent is ticked.
3. View opens the letter. Delete asks first, then removes it.
4. Travel mode, `/check`, the tag and Travel Pass never show the letter.
5. The passport shows HANDLER/OWNER under the name. On a public view it's first name + last initial.
6. The landing page samples show the handler/owner line.

Ready for testing.

### 2026-11-25: Built (preview only): new homepage hero + "Who's coming with you?" cards + ESA and Pet Passport pages
Nima approved: one simple homepage, with the three cards in place of a block that wasn't needed.

**What changed (`pets-alive` preview only):**
- Homepage hero: "Flying with your pet?" + "Find out what your airline, destination and pet need before you book." The button now says "Check my trip, free".
- "Plan my pet's trip" is now "Check my trip, free" everywhere (header, account, login, Travel Pass page). The trip check page title is "Check your trip".
- The "Flying somewhere that needs paperwork?" block (Mexico / Canada / service dog guides) is replaced by "Who's coming with you?" with three cards:
  - My service dog (Benny) → `/service-dog-passport`
  - My emotional support animal (Cleo) → `/esa-passport`
  - My pet (Milo) → `/pet-passport`
- New `/esa-passport` (deep red, Cleo) and `/pet-passport` (copper, Milo). Same layout and price line as the service dog page. The ESA page has "Flying soon? Check your trip for free." which goes to the trip check with ESA picked.
- Passport maker presets: `?for=esa` picks Emotional support animal, `?for=pet` picks Pet.
- Cleo and Milo use line drawings until AI photos are ready.

**Before this goes live:** the ESA page promises letter storage and expiry reminders. Those need the letters feature first. Sisqo's earlier point stands: the ESA page and ESA card don't go live until letters is built.

**What to test** (https://petpassgo-git-pets-alive-nimaesfand-5208.vercel.app):
1. Home: new hero words and button. The three cards sit right after "How it works". Each card opens its page.
2. `/esa-passport` and `/pet-passport`: phone and desktop, sample passport, three lines, button, price line. ESA: badge reads "Emotional support animal", no travel-rights wording, and the "Flying soon?" link goes to the trip check.
3. Each button opens the passport maker with the right choice already picked.
4. No "Plan my pet's trip" left anywhere.

Ready for testing.

### 2026-11-25: Sisqo review list (everything from tonight, in one place)
Nima wants Sisqo's final thoughts on all of these, then he decides and we build. Details are in the entries below.
1. **Homepage picker** "Who's coming with you?": Benny / Cleo / Milo cards linking to the Service Dog page, the ESA page and the trip check. Wording, ESA risk.
2. **Character names**: keep Benny, Cleo and Milo, or swap? Easy to recognise, good for selling, no brand clash.
3. **Service Dog Passport page**: built on preview only. Please test with the steps in "Built: Service Dog Passport landing page".
4. **ESA Passport page**: mockup only. It waits for the letters feature, and gets the "Flying soon? Check your trip for free." line.
5. **Letters in Pet Vault**: privacy review still open.
6. **No registry or letter-site links** anywhere (Nima's decision). `?src=` is for our own ads only.
7. **Mockup updates**: calm icons on the landing pages, reflective copper Travel Pass header.
8. **Printed passport booklet**: research only, please assign a bot. The cover must be PetPassGo's own design, no government look. The service dog signature page uses the same wording as the online handler statement. The ESA page is cute, nothing legal.

Ready for review.

### 2026-11-25: Idea from Nima for future research: a printed passport to sell (Sisqo, please assign a bot)
**What Nima wants:** a real printed passport booklet that matches our digital passport, sold for a good price. It gives people something physical to hold, like the kits registries sell, and works as a keepsake.
- Inside, the service dog version has a page where the handler signs a statement attesting to the dog's training and behavior. It's the same kind of statement they sign online, and they take responsibility for it.
- The ESA version gets something cute on that page instead. No legal-sounding wording, nothing about travel rights.

**Sisqo: please have a bot research this for later. Not building now.**
1. Who can print a small run of booklets on demand with full colour, gold foil, a hologram sticker, and shipping straight to the customer. Unit cost at 1, 100 and 1,000 copies, plus shipping time.
2. What similar keepsake pet passports sell for, and what price would make good money for us. Nima approves the final price.
3. Rules: how close a booklet can look to a real passport. It must not look like a U.S. or any government passport or ID: no government seals, eagles or "United States" wording. Our standing rule holds too: never "official", "certified", "registered" or "approved".
4. Whether the signed service dog page creates any legal risk for us, and the simplest safe wording.
5. How it would fit in: an add-on at checkout, or a Pet Vault perk.

**Claude's notes:**
- The digital passport may look like a real passport, but a printed booklet is riskier. A cover that looks too close to a government passport could cause trouble, so the cover should clearly be PetPassGo's own design.
- The service dog signature page should use the same wording as the online handler statement, so the two never say different things.

### 2026-11-25: Plan + mockup: homepage picker "Who's coming with you?" + character names
**Nima decided:**
- No links to registry or letter websites anywhere, on our site or theirs. Drop the "registry kit links" idea from the landing-page plan above. `?src=` stays only for our own ads (Google, Instagram).
- People reach the Service Dog and ESA pages from the homepage instead.

**Picker (mockup: canvas `HomePicker`, repo `design/mockups/HomePicker.dc.html`):**
- Right under the homepage hero. Headline "Who's coming with you?", small line "Pick one and we'll show you what they need."
- Three tappable cards, each with its character and badge colour:
  - My service dog (Benny, blue): "The DOT form, ready for every trip" → `/service-dog-passport`
  - My emotional support animal (Cleo, red): "Their passport and your housing letter" → `/esa-passport`. Until that page is built: free trip check with ESA picked.
  - My pet (Milo, orange): "Check your trip, free" → free trip check.
- Caption: "Benny, Cleo and Milo are our AI characters."
- The ESA page gets one line, "Flying soon? Check your trip for free.", so an ESA flyer isn't stuck, without implying travel rights.
- Replaces the "Made for service dogs and ESAs too" strip in the plan above.

**Character names: Sisqo, please weigh in.** Proposed: Benny (golden retriever, service dog), Cleo (Maine Coon, ESA), Milo (dachshund, pet). Nima wants names that are easy to recognize anywhere, easy to say, and good for selling. Are these the best three, or would you swap any? Things to think about: popular pet names in the U.S., easy to tell apart, no clash with a well-known brand or character. Milo is also the name of Nima's own dachshund.

**Photos:** only Benny has a photo. Cleo and Milo use line drawings until image generation is set up (Nima is adding the FAL key).

**Sisqo, please check:** wording, whether ESA as a homepage choice could read as travel rights, and the names.

Ready for review.

### 2026-11-25: Built: Service Dog Passport landing page (preview only)
Nima picked the order: Service Dog page first, then the letters feature, then the ESA page. The homepage strip waits until both pages exist.

**What changed (preview branch `pets-alive` only, not on the live site):**
- New page `/service-dog-passport`, built from the mockup: deep blue, sample passport for Benny (labeled as an AI character), three lines, one button "Get your Service Dog Passport", and "$6.99 a month. Cancel anytime."
- The button opens the current passport maker with Dog + Service animal already picked (`/passport/create?for=service`). Until the pay-first maker is built, this is today's flow.
- `?src=` is passed through to the button and recorded in analytics (for example `?src=registry`). Only letters, numbers, `-` and `_` are kept.
- Not in the menu. Added to the sitemap so Google can find it.

**What to test** (https://petpassgo-git-pets-alive-nimaesfand-5208.vercel.app/service-dog-passport):
1. Phone width: headline, sample passport, the three lines, then the button, all in one screen-long page. The service badge and the paw seal shine. The three icons don't.
2. Desktop: text on the left, passport on the right.
3. Open `/service-dog-passport?src=registry`, tap the button: it should go to `/passport/create?for=service&src=registry`, with Dog and Service animal already picked.
4. Try `?src=<script>`: the button link should have no `src`.
5. Wording check: no "official", "certified", "registered" or "approved". The caption says Benny is an AI character.
6. "Log in" goes to `/login`. The logo goes home.

Ready for testing.

### 2026-11-25: Landing page buttons renamed + Nima approved building
- Buttons now say "Get your Service Dog Passport" and "Get your ESA Passport" (was "Make your dog's..."). It's shorter, fits on one line, still a clear action, and "your" makes it personal. Nima chose this.
- Nima approved building the Service Dog Passport and ESA Passport landing pages. Before I start, I'm checking with Nima what goes first: the ESA page sells the housing letter, and the letters feature isn't built yet.
- Sisqo: please still review the wording and guardrails in the plan below. I'll build on the preview branch first, so you can test before it reaches the live site.

### 2026-11-25: Mockup update (Nima's feedback)
- Service Dog and ESA landing pages: the three icons next to the bullet lines are no longer reflective. They're now soft tinted tiles, because Nima found the shine too much there. The shine stays on the role badges and the passport.
- Both landing pages are taller (1260), so the main button is fully visible.
- Travel Pass: the trip header (LAX to CUN) is now reflective copper with a slow glint and a light foil band, to match the badges.
Mockups only. Nothing live changed.

### 2026-11-25: Plan + mockup: Service Dog Passport and ESA Passport landing pages

**What.** Two one-screen landing pages that sell the same Pet Vault ($6.99/mo), each with the role already picked. Not a new product, no new price.
- `/service-dog-passport`: deep blue. "Your partner works hard. Give them papers that look the part." Shows Benny's passport. Three lines: DOT form filled in for every trip; signed handler statement on file; travel mode at the gate. Button: "Make your dog's Service Dog Passport". Under it: "$6.99 a month. Cancel anytime."
- `/esa-passport`: deep red. "Their passport, and your housing letter, always with you." Shows Cleo's passport. Three lines: housing letter stored, private to you; reminder before it expires; lost pet tag that reaches you without sharing your number. Button: "Make your ESA Passport". Same price line.
- Both buttons go into the same pay-first flow (sign up, pay, Benny's steps) with Dog + Service animal or ESA preset, so the role question is skipped.

**Why.** Service dog and ESA owners search for exactly these words, and registry kit buyers already think in these terms. A page that speaks only to them should convert better than the general homepage.

**How people get there.**
- Ads and Google (search terms like "service dog passport", "ESA passport").
- Registry kit emails and pages link here with a tracking code (`?src=registry`) so we can see what sells.
- One small strip on the homepage: "Made for service dogs and ESAs too", with two links.
- Not added to the main menu (keeps the 4-screen site).

**Guardrails.**
- No "official", "certified", "registered", "approved" anywhere.
- ESA page never says or hints that an ESA flies free or has travel rights. It is about housing letters and records.
- Benny and Cleo captioned as AI characters on the sample passport.
- Housing letter wording depends on the letters feature (plan above). If that isn't built yet, the ESA page waits or drops those two lines.

**Pages touched.** Two new pages, the homepage strip, the passport maker (read the preset), analytics (src tag).

**Mockups.** Canvas (`ServiceLanding`, `ESALanding`) and repo `design/mockups/ServiceLanding.dc.html`, `ESALanding.dc.html`.

**Sisqo, please check:** wording on both pages (strong but honest), anything that overpromises, whether the ESA page could read as travel rights, and whether the homepage strip breaks the "one main button" rule.

Ready for review.

### 2026-11-25: Plan + mockup: letters in Pet Vault (ESA housing letters, PSD/service dog housing or travel letters)
Nima's idea. Not built yet. Registry customers often lose their letter in email and ask for it again.

- In Documents, owners snap or upload their ESA housing letter, or a PSD/service dog housing or travel letter. We read and save: provider name, credential, license number (shown as the state and last 4) and state, issue and expiration date, provider phone, email and office address. The letter file is stored with it.
- Reminder a month before it expires ("so you're never caught without one when a lease comes up"). "Send to landlord" shares it by email when the owner chooses.
- **Private by design:** letters are health information. Never on the passport, the QR/tag, travel mode, /check, or anything shared at the airport. Owner-only, and said plainly on the screen ("Only you can see this").
- Wording rules: we store the letter; we never say it makes a pet registered, certified or official. ESA letters are framed for housing only (ESAs fly as pets). No letters are sold on PetPassGo.
- Sales angle: the strongest reason for ESA owners to keep Pet Vault, and the answer to "I lost my letter."
- Mockup: new artboard "Cleo's housing letter (ESA)" (design/mockups/VaultLetter.dc.html). Provider details are [placeholders].

Questions for Sisqo: anything in privacy law or our privacy policy we must add for storing letters that mention a disability (consent wording, deletion, encryption at rest, who at PetPassGo can see them); is "Send to landlord" OK as an owner-initiated email with the letter attached or as a link.

Ready for review.

### 2026-11-25: Mockups updated with Sisqo's fixes + Nima's answers
Nima: passport direction approved; Plan a trip leads (trips bring people in, Pet Vault keeps them); ESA badge drops "Flies as a pet"; no "SAMPLE" stamp on the homepage (a "Meet Benny, our AI guide" line covers the AI-character rule); keep rabies on the homepage card, shown as "Good until 2027".
Changes on the canvas (source in design/mockups/):
- Main passport: SAMPLE tag moved onto the photo corner (no longer covers the number); paw mark inside the hologram.
- New: PassportPhone (Benny, service dog, phone size) and PassportESA (Cleo, Maine Coon, deep red reflective "EMOTIONAL SUPPORT ANIMAL" badge, no travel wording, photo slot).
- New: Pay ("Start Pet Vault"): $6.99 today, "Then $6.99 a month. Cancel anytime.", name/email/password, unticked renewal box with the full wording, "Continue to payment · $6.99", "Already have an account? Log in".
- Home: "Meet Benny, our AI guide" line, rabies "Good until 2027", paw in hologram.
- Vault: fuller screen (passport, health rings, documents wallet, Benny's people, lost pet tag, birthday and weight), paw in hologram.
Next: Nima signs off on the mockups, then Claude builds the 4-screen site to match.

Ready for review.

### 2026-11-25: Design mockups for review (passport, Home, Travel Pass, Pet Vault)
Nima asked Sisqo to check these. Nothing on the live site changed. The canvas is on claude.ai (private to Nima; he can share the link or screenshots). The source of each screen is in the repo at design/mockups/ (Main = passport, Home, TravelPass, Vault; the image is Benny's photo from public/images/hero-golden-retriever.jpg).

1. **Passport (Main):** Benny's sample data page: guilloche background, navy cover band with gold trim, deep blue reflective SERVICE DOG badge under the photo with a slow glint, a holographic seal on the photo corner, orange ISSUED stamp, fields (species, breed, sex, born, weight, training "Task trained", microchip last 4, owner, issued), machine-readable lines. Number PPG-SAMPLE and a small SAMPLE ribbon. Role shows once.
2. **Home (phone):** tilted passport as the hook, "Bring them along.", one sentence ("Everything your pet needs to fly, and everything about your pet, in one place."), two buttons: Plan a trip (orange), Start Pet Vault (white), "Checking your trip is free".
3. **Travel Pass (phone):** orange trip header (LAX → CUN, Dec 20, Delta, 25 days to go), one "Next up" card with one button, "Your steps 2 of 6" with progress and 4 rows, "Open travel mode".
4. **Pet Vault (phone):** Benny's card (photo, name, breed/age, SERVICE DOG badge, See Benny's passport), one big "Snap a record: take a photo, we read the dates for you", one reminder line, 4 tiles (Records, Documents, Vet, Lost pet tag), "Plan a trip with Benny".

Sample details (dates, clinic, steps) are placeholders to show layout. Asking Sisqo: does each screen follow the simplify rule; anything that overpromises (for example "Snap a record" wording vs. what the record check does today); anything missing that a buyer needs to trust it.

Ready for review.

### 2026-11-24: Before/after: passport maker + keep page (with Nima's Nov 24 decisions)
Not built yet. Uses Nima's decisions relayed by Sisqo: email + password sign-up, no 7-day draft, $6.99 paid before making the passport, Travel Pass ($21.98) includes the first month of Pet Vault, visuals first.

**Before:** /passport/create lets anyone make a passport free → reveal → "Keep" page (4 locked cards, 9-item list, dark locked passport, "we hold it 7 days", "no password needed", "we emailed it") → pay later.

**After (one path for everyone):**
1. **/passport/create start screen:** the SAMPLE passport (Benny, number PPG-SAMPLE, a "SAMPLE" ribbon), headline "Make your pet's passport", one sentence ("Pet Vault keeps everything for your pet in one place: the passport, records, vet and documents, and lost pet help."), three icons (Records and documents in one place · Reminders before anything expires · Lost pet QR tag), one button "Start · $6.99/mo". Small line: "Cancel anytime."
2. **Account:** email + password (+ first and last name). Email already has an account → "Log in instead".
3. **Pay:** the unticked renewal box ("Start Pet Vault at $6.99 a month. It renews every month until I cancel...") → Stripe $6.99/mo. Members and people with a paid Travel Pass skip steps 1-3.
4. **Benny's steps (same feel, with fixes)**, saved straight to the account, no draft:
   - Breed: type to search and pick from the list, placeholder follows the animal (cat: "Like Maine Coon"), plus "Mixed or not sure" and "My breed isn't listed" (short typed name).
   - Photo: crop and zoom before saving.
   - Sex: Male / Female.
   - Service dogs: the same extra steps; promise error says "Check the box to sign."
   - Browser Back goes to the previous step (steps become history entries).
5. **Reveal** → "Open [Name]'s Vault".
Removed: free drafts, the keep page and its 7-day hold, draft emails, "No password needed", "We also emailed it". Old /passport/keep links show "Log in to see your passport" (no drafts are kept going forward).

**Passport look (all versions):**
- Role shows once: only the reflective badge under the photo. Remove the flat pill next to the name (that's the flat navy/red pill Sisqo and Nima saw).
- Service dog: deep blue reflective. ESA: deep red reflective, label "EMOTIONAL SUPPORT ANIMAL". Nima earlier asked for "Flies as a pet" under it; Sisqo says no travel wording. Claude keeps "Flies as a pet" unless Nima says otherwise (it limits rights, it doesn't claim any).
- One clean hologram; drop the faint ghost photo square.
- Real passport number only after payment; the sample uses PPG-SAMPLE.

**Also in this pass:** LAX→JFK service result: remove the "Your Travel Pass walks you through each one" banner line for the Vault-only box, and make the box button blue to match; remove the hidden "See every step" button on /mexico and /canada; delete test account 6dpq5mtb+batch2@mail.grokbot.com.

**Claude's one concern (Nima decides):** asking $6.99 before people see their own pet's passport removes the "wow" moment that sells it. The sample passport has to do that job, so it must look great. If sales are slow, an easy test later is letting them add just the name and photo before paying.

Ready for review.

### 2026-11-24: Plan: simplify everything (Nima's walk-through) — freeze new features
Nima went through the passport maker and the keep page and isn't happy: too much going on, too many layers, too much to read, and Pet Vault reads like a travel product. Not built yet.

**The two products, in one line each (Nima):**
- **Travel Pass** guides you through your trip.
- **Pet Vault** is everything for your pet: documents, vet, records, grooming and trainer info, snap a photo of records and AI organizes it, lost pet help.

**Rule for every screen from now on:** one headline, at most two short sentences, at most three bullets, one main button. No nested lists, no "see everything" expanders, no locked-feature walls. No new features until the simplify pass is done.

**Passport maker fixes (from Nima's test):**
1. Breed: placeholder follows the animal (cat: "Like Maine Coon or Mixed", dog: "Like Dachshund or Mixed"). Breed must be picked from the list (type to search), plus "Mixed or not sure", so nothing gets typed wrong onto the passport.
2. Photo: add crop (drag to position, pinch or slider to zoom) before saving.
3. Sex: "Male" / "Female" instead of boy / girl.
4. Things Claude sees wrong on the finished passport: the ESA/service label shows twice (pill next to the name and badge under the photo: keep only the badge under the photo); the hologram and the faint "ghost photo" read like a broken image (keep one clean hologram, drop the ghost square); "PPG-PREVIEW" and "PPGPREVIEW" in the passport number and the code lines look unfinished (show a real-looking number for the preview); owner shows first name only (ask full name or show it as "Nima" without the OWNER label until we have it).
5. Keep page: the passport turns almost black and unreadable behind a lock. Show it clearly instead, with a soft "Not kept yet" ribbon.

**Keep page, rewritten short (Pet Vault, not travel):**
- Headline: "Keep [Name]'s passport"
- One sentence: "Pet Vault keeps everything for [Name] in one place: records, vet, documents and lost pet help."
- 3 icons max: "Snap a record, we organize it" (the AI record import already exists), "Reminders before anything expires", "Lost pet QR tag".
- Button: "Keep [Name]'s passport · $6.99/mo". Small line: "Cancel anytime. We hold it for 7 days."
- Remove the 4 locked cards and the 9-item "See everything" list.

**Then, one screen at a time, same rule:** trip result, account home (pet page), Pet Vault page, homepage. For each, Claude posts a before/after list here first.

**Ask for Sisqo:** do a full phone walk-through of the site and list every screen that breaks the rule (too much text, more than one main button, extra layers or pages that open more pages), with a screenshot or the exact URL. That list becomes the order of work.

Ready for review.

### 2026-11-23: Built: Sisqo's batch 1 fixes, renewal reminders, batch 2 content trims (live)
Fixes from Sisqo's batch 1 test:
- **Simple service dog trip (was FAIL):** the Pet Vault DOT box now shows for a service dog on any U.S. flight that isn't to or from Hawaii (the old check relied on "easy trip", which service dog trips never are because of the DOT step). Mexico, Canada and Hawaii still get the Travel Pass card.
- Pet Travel Pass card no longer lists "DOT form filled in for service dogs" (only shows for service dogs, as "DOT form filled in for every trip").
- **Sticky header on the homepage:** the homepage wrapper used overflow-x: hidden, which stops sticky. Now overflow-x: clip. Other pages were already fine.
- **Phone logo showing only "Go":** the full PetPassGo wordmark now shows down to 330px wide.
- **Pale badge:** the code on main uses the deep blue reflective badge (.ppg-badge-service). Sisqo, please hard-refresh and recheck; if it's still pale, send the page and a screenshot.

Renewal reminders (in the daily cron, /api/cron/reminders, 9am PT):
- Before the first renewal: one email 0 to 3 days before it, "Pet Vault renews on [date]", $6.99/month until canceled, what's included, direct cancel link.
- Yearly: one reminder a year after that, same terms and cancel link.
- Only active members with a Stripe subscription. Each sent once (new table membership_notices, unique per member and kind; Nima approved the migration).

Batch 2 trims:
- /mexico and /canada: "What you'll need" shows the list of requirements by phase (titles only), no step-by-step bodies, no timing tips box, no source links, no "rules change" footer. Still shows "Last checked". Travel Pass box shows $14.99 per trip with Pet Vault. Page titles say "what you need" instead of "every step".
- State guides (/guides/*): source links removed; meta description no longer says "with official sources".
- Homepage "Where our information comes from": "Checked against the rule makers" (no "every rule links"). Sample answer says "Checked Nov 2026" instead of a source.
- Airline pages were already short. Inside the paid Travel Pass, sources stay (paid customers).

For Sisqo: please set up the monthly re-check of the rules and the "Last checked" month on /service-dog, /mexico, /canada and the state guides, and send Claude the list of anything that changed.

What to test:
1. Service dog, LAX→JFK Delta: blue "Your dog flies with you at no charge" box with "Get it filled in with Pet Vault · $6.99/mo"; LAX→HNL and LAX→MEX: Travel Pass card.
2. Pet dog paperwork trip: card has no DOT line.
3. Homepage on phone: header stays on top while scrolling; full logo shows.
4. /mexico and /canada on phone: short, no sources, list of what you'll need, $14.99 with Pet Vault.
5. Plus last round's list for the passport maker service steps (not tested yet).

Ready for testing.

### 2026-11-23: Built batch 1 (part 2): service dog steps in the passport maker + trainer wording (live)
Nima: trainer choices are "Owner trained", "Dog trainer", "Trained in a program". Dog trainer = name + business; program = program name. Word filter still applies.

Passport maker (/passport/create), service dog only, after the birthday step and before the email/finish step (same reveal for everyone after):
- Step: weight (lb, a guess is fine).
- Step: who trained them (the 3 choices + name fields).
- Step: what they help with (grouped task chips, at least one).
- Step: vet name, clinic phone, rabies good-until date ("I'll add this later" allowed).
- Step: "Your service dog promise": a friendly blue card with 3 lines (trained to do tasks for my disability; well-behaved, house trained, stays with me; false statements can lead to fines and other penalties under federal law), one "All of this is true. I agree to the Terms" box, and a signature (full name). Step counter becomes "of 12" for service dogs, "of 7" for others.
Saving:
- Members (and people with paid trips) save straight to the account: weight, vet, rabies record, then the signed statement through /api/service-statement (passport shows the blue badge, "Task trained").
- Everyone else: kept with the 7-day passport (data.service, plus when/where it was signed). When they pay and keep it, the pet gets weight, vet, rabies, training, and the signed statement is recorded with the original signing time.
- Starting from /service-dog → Check my flight → "Get it filled in with Pet Vault" opens the maker as Dog + Service animal.
Also: /assessment?pet=service and the new service result from part 1.

Not tested by Claude in a browser yet (no browser available this session). Build passes.

What to test:
1. /passport/create?for=service (logged out): goes straight to name; after birthday you get the 5 service steps; counter says "of 12". Try typing "Certified Trainer" as the trainer: blocked. Promise step: can't continue without the box and a first + last name. Reveal shows the blue SERVICE DOG badge with "Handler statement signed" and "Task trained".
2. Same flow as a pet: still 7 steps, no service steps.
3. Back button walks back through the service steps correctly; refreshing mid-way keeps your place.
4. If you can use a member test account: finish as a member, then check the pet page shows the signed statement and the DOT form button.

Still to do: renewal reminder emails (3 days before first renewal, yearly); batch 2 content trims.

Ready for testing.

### 2026-11-23: Built batch 1 (part 1): pricing A, renewal consent, simpler menu, one service dog page, training fix (live)
Nima approved after Sisqo's review. Changes from Nima on that review: trainer chips read "Owner trained" / "A trainer or program"; no source links for customers, only "Last checked [month]" (Sisqo: please set up a monthly re-check of the rules and the "last checked" month); no disclaimers we don't need ("you don't need us to fly" etc. is not added anywhere).

What changed:
1. **Training (Nima's earlier decision, which Claude missed):** "Owner trained" or "A trainer or program" with typed name + business. A word filter blocks certified, registered, official, approved, licensed, accredited, verified, government, federal, ADA. Program list and "Owner says a service dog program..." removed. Added Nima's tasks (POTS, asthma, back-watching, dissociation, leading home, standing up, wheelchair, carrying, undressing, home sounds, curbs, elevators/crosswalks, meltdowns, finding the car). DOT trainer fields: owner = handler's name; trainer = "name, business".
2. **Pricing A:** Travel Pass is $14.99 with Pet Vault ($21.98 first trip). Standalone $29.99 retired in UI and checkout; an old "pass" request starts Pet Vault + pass ("join") for non-members, member price for members. Old paid trips untouched. Stripe price `ppg_travel_pass_2999` not deleted. Copy updated on homepage cards, /travel-pass, FAQ, terms, guarantee, Benny list, chat prompt.
3. **Renewal consent:** every Pet Vault checkout (assessment paywall, account, join, passport keep, guest email step) shows an unticked box: "Start Pet Vault at $6.99 a month. It renews every month until I cancel, and I can cancel anytime in my account." Checkout is blocked until ticked. Stripe Checkout shows the same line by the Pay button. The subscription stores renew_consent_at + renew_terms in Stripe metadata (kept with the subscription). Purchase email now says it renews at $6.99/month until canceled with a direct link to account Billing.
4. **Menu:** guests see Pet Passport, Pet Vault, Help (FAQ, Contact), Log in, and the Plan trip button. Members: My Trips, My Pets, Passport, account menu with Help & FAQ and Contact. Airlines, Blog, Community, Discover are out of the menu (pages still work).
5. **One service dog page (/service-dog):** short. Hero "Your service dog flies with you, free." → "Check my flight". What the airline can ask for (3 cards) + "Last checked November 2026". 3 steps. Pet Vault $6.99 box. One-line ESA note. No registry box, no source line. /service-dog-kit, /service-dog-kit/start and /service-dog/dot-form now redirect to /service-dog. /signup redirects to /passport/create. Sitemap updated.
6. **Service dog trip result (/assessment):** for a simple service dog trip: "Your dog flies with you at no charge. Your airline can ask for the DOT Service Animal form..." with one button "Get it filled in with Pet Vault · $6.99/mo" → /passport/create?for=service (starts as a dog / service animal). Members get "Open my dog's DOT form". Paperwork trips (Mexico etc.) show the Travel Pass with Pet Vault card.
7. Homepage guarantee "How it works" now links to the FAQ. /guarantee and /welcome stay live (emails link to them).

Not done yet (next): service dog step inside the passport maker before the reveal (Benny collects DOT details + the signed statement, styled friendly); 3-day first-renewal reminder and annual reminder emails; batch 2 content trimming.

What to test:
1. /service-dog on phone: one page, one button repeated, no source links. /service-dog-kit and /service-dog/dot-form land on it.
2. Trip check as a service dog, simple U.S. flight: blue box, one button to /passport/create?for=service, which starts as Dog + Service animal.
3. Trip check, paperwork trip, logged out: one card "Travel Pass with Pet Vault, $21.98 today", renewal box must be ticked before continuing. Stop at Stripe: confirm the renewal line shows by the Pay button. Do not pay.
4. Menus on phone and desktop, logged out and in.
5. Training card: "Owner trained" / "A trainer or program"; typing "Certified Trainer" shows the warning and blocks saving.

Ready for testing.

### 2026-11-23: Plan update: pricing decided (option A), one passport flow, service dog sales path
Replaces the pricing and DOT parts of the "simpler site" plan below. Nima decided. Not built yet.

**Pricing (option A).**
- Free: trip check and simple-flight checklist.
- Pet Vault $6.99/month: passport, records, reminders, lost pet, travel mode, and the DOT Service Animal form filled in for every trip. No separate DOT price.
- Travel Pass $14.99 per trip, with Pet Vault, only for paperwork trips (Mexico, Canada, Hawaii, cargo, connections). $29.99 standalone goes away.
- Later (Nima): push international trips, where the Travel Pass makes money.
- Kept: clear "renews at $6.99/month, cancel anytime" at checkout, one-tap cancel, reminder email 3 days before the first renewal.

**One passport flow for everyone.** Every passport goes through the same Benny steps. A service dog gets one extra step before the reveal (training picks + signed statement), then the same reveal with the blue badge. Buying through the service dog path still makes the passport first.

**Benny collects the DOT details as passport questions** (name, breed, weight, vet, rabies, trainer, tasks), so it never feels like a government form. The sworn part is never hidden: the owner reads and checks the DOT statements themselves before signing, including that false statements are a federal offense. Styled friendly and clean, not scary, not childish.

**Service dog sales path.** /service-dog → "Check my flight" (free) → result: "[Dog] flies with you at no charge. Your airline will ask for the DOT form." One button: "Get it filled in with Pet Vault, $6.99/month" → passport with service dog step → DOT PDF ready to download or email. Mexico, Canada, Hawaii trips also offer the Travel Pass. ESA owners are told kindly their ESA flies as a pet and go to the pet path. Registry kits can link here with a tracking code.

Question for Sisqo: existing Travel Pass buyers who paid $29.99 without Pet Vault: anything we must keep working for them? Also any auto-renew disclosure rules we should meet.

Ready for review.

### 2026-11-23: Plan: simpler site, new pricing, $9.99 DOT form
Discussed with Nima. Not built yet. Two batches.

**Why.** Nima found pages he didn't know existed (/service-dog-kit, its quiz, the DOT guide) that link into each other, repeat themselves, and give away the how-to for free. Rule from now on: tell people *what* they need, never *how* step by step; the how is what they pay for. Every page has one job and one main button. Clean, colorful, simple.

**New pricing (Nima decided).** Pet Vault comes with every purchase.
- Free: trip check and free checklist for simple flights (unchanged).
- Pet Vault: $6.99/month, always included.
- Add-ons at member price: Travel Pass $14.99, DOT Service Animal form $9.99 (new, one trip). So a Travel Pass starts at $21.98 and the DOT form at $16.98.
- The $29.99 standalone Travel Pass goes away.
- Protection: checkout keeps "Pet Vault renews at $6.99/month, cancel anytime"; cancel stays one tap in the account; new reminder email 3 days before the first renewal.

**Batch 1: structure and pricing**
1. Menu: Plan a trip, Pet Passport, Pet Vault, Help (FAQ + contact), Log in. Airlines, Blog, Community, Discover come out of the menu.
2. Service dog: merge /service-dog, /service-dog-kit, /service-dog-kit/start and /service-dog/dot-form into one short /service-dog page. Drop the word "kit". Old URLs redirect. No separate quiz: the trip check already handles service dogs. Its result page gets one button: "Get the DOT form filled in, $9.99 + Pet Vault". Fix: the quiz counter said "1 of 2" then "2 of 3"; the faint "Service dog" tag (both go away with the merge).
3. DOT form product: owner answers in the app (statement, training picks, trip), attests and signs, gets the filled PDF by download or email. One-time $9.99 per trip plus Pet Vault. Members who already have Pet Vault pay $9.99 only. (Today members get it included; Nima: does an existing member pay $9.99 per trip too, or stay included? Claude suggests: stays included for members already paying, $9.99 is for new buyers, since the $6.99 is what we want.)
4. Hide for now: /community, /discover, /business (flags), /sandbox (noindex, not linked). Merge /guarantee into the FAQ; /welcome, /signup and /join fold into the passport maker and login (old URLs redirect).
5. Pricing everywhere: remove $29.99 (homepage cards, /travel-pass, FAQ, emails, checkout, Stripe price for the standalone pass retired, not deleted).

**Batch 2: trim content**
6. DOT guide: cut to what the form is and when airlines ask, then "We fill it in for you". One source line, no download button.
7. Google pages (/airlines/*, /guides/*, /mexico, /canada, blog): keep them for free traffic, but short: what's required (answer the question), then "Check your trip". No step-by-step, no deadlines and order of steps.
8. /travel-pass and /pet-vault: remove repeated sections and the extra buttons that scroll to content right below.

Pages: app/page.js, components/SiteHeader.js, app/service-dog*, app/assessment, lib/pricing.js, app/api/stripe/checkout, app/api/dot-form, components/pets/TrainingCard.js, app/faq, lib/faq.js, app/travel-pass, app/pet-vault, app/guides, app/airlines, app/mexico, app/canada, next.config.js (redirects), emails.

Questions for Sisqo: (a) anything in batch 1 that breaks existing paid customers or links in sent emails; (b) which Google pages actually get traffic (Search Console isn't set up yet, so say if you can't tell); (c) the renewal reminder email and any rules on auto-renew disclosures we should meet.

Ready for review.

### 2026-11-23: Small fix: removed "See how it works" from the homepage hero (live)
Nima's call: it only scrolled to the section right below. The hero now has one button, "Plan my pet's trip". People scroll to the passport section themselves.
What to check: homepage hero on phone and desktop: one button, spacing looks right.

Ready for testing.

### 2026-11-22: Small fix: header stays at the top (live)
Nima saw no menu after scrolling on his phone. The header now sticks to the top on every page, so the menu (Log in, FAQ, Blog, Contact) is always one tap away. Anchor links stop below it.
What to check: phone, scroll any page: header stays; menu opens; nothing hides under it (account page, trip pages, assessment).

Ready for testing.

### 2026-11-22: Passport look: reflective badges, hologram back, short training line (live)
Nima's decision (a look change he asked for directly; Sisqo's earlier hologram concern noted, Nima chose to keep it).
- Service dog badge: deep royal blue, metallic gradient, white text, a soft glint that sweeps across every few seconds. ESA badge: same in deep red. On the passport and the sample reveal.
- Hologram is back under the badge, with the faint ghost photo beside it.
- Training on the card is one short line: "Task trained" for a service dog with a signed statement, otherwise the top 2 levels. Who trained, where and tasks only appear on the check page behind the QR, when the owner shares them.

What to check: homepage and /pet-vault sample passports on phone and desktop: badge looks deep blue and reflective, hologram shows, Training is one short line, the glint is smooth (no lag), and it stops with "reduce motion" turned on.

Ready for testing.

### 2026-11-22: Built: training pick-lists + Sisqo's small fixes (live)
Nima approved with Sisqo's changes. "Other task" is a checkbox only (they describe it on the airline's form). Test account 6dpq5mtb+build-test@mail.grokbot.com deleted.

What changed:
1. **Tasks**: 30 specific tasks in 6 groups (Psychiatric, Medical alert, Mobility, Hearing and vision, Autism support, Other), including Sisqo's adds (allergen detection, migraine alert, interrupting PTSD or self-harm behavior, counterbalance). Old saved task groups still count as their group.
2. **Who trained them**: "I trained them", "A professional trainer" (no name field), or "A service dog program" with a dropdown of the 18 programs (current official names) plus "Another program". No ADI.
3. **Where**: dropdown of states, DC, Puerto Rico, Canada, Mexico, "Outside North America".
4. **Public (passport for others, /check)**, only when the owner shares: "Owner says a service dog program trained them" (never the program name), "Trained by: a professional trainer" or "the owner", the state, and task groups only. The owner sees the program name and every task.
5. **Old typed answers**: kept in the record, shown to the owner only, with a yellow note: "You typed ... before. Only you see that. Pick from the lists above to show it on the passport." Past signed statements are untouched.
6. **Statement API**: accepts all task keys (no cutoff at 7), requires a program pick when "A service dog program" is chosen, and no longer needs a typed trainer name. The sign button stays off until a task and (if needed) a program are picked.
7. **DOT form trainer fields**: owner = handler's name; professional trainer = "Professional trainer" (or their old typed name); program = the program's official name; "Another program" = "Service dog program".
8. **Training levels**: hint added: "This is what you tell us: PetPassGo doesn't test or certify training." CGC label is now "AKC Canine Good Citizen title".
9. **Small fixes**: /check invalid-link text now says shared codes last 24 hours or until the owner stops sharing. /pet-vault static sample shows "Handler statement signed". Trip header on phones puts the pet name and route on two lines. Pass tabs wrap instead of scrolling, so "Arrival" fits. On phones the contact bubble fades out when it would sit on a button or link, and comes back when it's clear.

What to test:
1. Phone: homepage, scroll past "Plan my pet's trip": the bubble should fade out while it overlaps the button.
2. /pet-vault sample: "Handler statement signed" before and after the reveal.
3. /check/not-a-real-token: new wording.
4. Training card and statement need a signed-in account with a dog (free account works for the card): pick tasks, program, state; sign; check the passport shows group names only to others. If you can't, skip and say so.
5. Trip page at 390px (any trip): pet name and route on separate lines, all 5 tabs visible.

Ready for testing.

### 2026-11-22: Plan: training, trainer and tasks become pick-lists (no free text)
Discussed with Nima. Not built yet.

Why: trainer name and "where trained" are free text today, so people can type anything, including "certified" or "registered", and it shows on the passport. Tasks are only 7 broad groups.

1. **Tasks: specific picks, grouped.** Nothing typed; "Other task" if theirs isn't listed.
   - Psychiatric (PSD): deep pressure therapy; interrupting anxiety or panic; grounding (nudge, lick, lean); waking from nightmares; room search before entering; creating space in crowds; guiding to an exit; medication reminders; turning on lights.
   - Medical alert: blood sugar alert; seizure alert or response; cardiac alert; bringing medication or a phone; getting help.
   - Mobility: retrieving dropped items; opening doors; balance and bracing; pressing buttons.
   - Hearing and vision: sound alerts (alarms, doorbell, name); guiding around obstacles; finding doors and seats.
   - Autism: tethering to prevent bolting; calming pressure.
   Existing saved tasks (old 7 groups) map to their group, so nothing breaks.
2. **Trainer: picks only.** "I trained them", "A professional trainer" (no name field), or "A service dog program" with a list of well-known programs plus "Another program". The typed trainer name is removed; existing typed names stop showing.
3. **Where trained: dropdown.** U.S. states, Canada, Mexico, "Outside North America". Existing typed values stop showing unless they match.
4. **Passport and /check:** tasks show as group names only (for example "Psychiatric tasks, Mobility tasks"), and only when the owner turns on sharing. The detailed task list stays in the owner's account.

Pages: lib/training.js, components/pets/TrainingCard.js, app/api/service-statement/route.js, components/PetPassport.js, app/check/[token]/page.js, components/home/HomePassport.js (sample).

Question for Sisqo: which programs belong on the list? Claude's draft: Guide Dogs for the Blind, The Seeing Eye, Guide Dog Foundation, Canine Companions, NEADS World Class Service Dogs, Paws With A Cause, Dogs for Better Lives, 4 Paws for Ability, Freedom Service Dogs, K9s For Warriors, America's VetDogs. Please check each is a real, current U.S. program.

Ready for review.

### 2026-11-22: Built: passport cleanup, pricing cards, tap-to-open documents, travel mode, confirm-email fix (live)
Nima approved the plan with Sisqo's changes. Test account 6dpq5mtb+fix-test@mail.grokbot.com deleted. Database: added pets.checkin_epoch (Nima approved).

What changed:
1. **Confirm-email bug.** The free-checklist trip is now also saved on the account at sign-up (user metadata) and restored after login, so it survives confirming in another browser or app. /login now continues on its own when you're already signed in (that was the "F" avatar: you were signed in but the page still showed the form). Confirm link goes to /login?confirmed=1, which shows "Your email is confirmed. Log in to pick up where you left off." if you're not signed in.
2. **Passport.** Training, trainer and tasks are one "Training" field. The owner sees it all; everyone else sees only the training level unless the owner turns on "Show training details" (same switch as before, now also on the signed card). Under the photo: a plain label "SERVICE DOG / Handler statement signed" (blue) or "EMOTIONAL SUPPORT / Flies as a pet" (red). No shield, ring or date. Rainbow dot removed.
3. **/check and travel mode.** Service dog row says "Service dog, handler statement signed." Trainer and tasks only if the owner shares them. Rabies certificate, health certificate, DOT form and any other travel-type upload (vaccines, airline form, microchip record) are tappable: a fresh 5-minute link is made on each tap and the file opens full screen with Close and "Open file". On iPhone, PDFs show an "Open file" button instead of an embedded PDF. Uploads typed "Other" never show. Line added: "Anyone who can see this screen can open these files." robots.txt now disallows /check/ and the page sends no referrer.
4. **Travel mode timer.** No countdown: it says "Open for your trip". The link lasts until 2 days after the trip's last flight (at least 24 hours, at most 30 days). The "Someone needs a copy?" QR lasts 24 hours, with a "Stop sharing" button that turns off every shared link for that pet right away.
5. **Sample passport on /pet-vault.** No share button. "This is a sample passport", "Make your pet's passport" and "Close". Faster, no falling gold bits. Rainbow sheen animation turned off site-wide.
6. **Pricing (homepage "What it costs").** Free: $0, three checkmarks, "No card needed" box. Pet Vault: "Make the passport free. We hold it for 7 days. Keep it for $6.99 a month."
7. **Lost pet.** "Your contact info stays private." "...with the approximate city they came from." The Publish lost poster form now explains scan emails and that the city can be off.
8. **Contact bubble** hidden from the account dock on phones (Contact support is in the Account menu).

What to test (phone and desktop):
1. Free checklist sign-up with your tagged inbox, confirm the email in a different browser/profile, then log in in the original one: the LAX→JFK trip and the Benny box should appear. Also try confirming in the same browser.
2. Visit /login while signed in: it should go to your account, not show the form.
3. /pet-vault "See a sample": Benny as service dog, label under photo, no share button, smooth.
4. Homepage pricing cards and lost-pet text.
5. Travel mode and /check: needs a pet with uploaded documents, so it needs a Pet Vault account; if you can't, check that a bad or old /check link shows the closed or invalid message.
6. Account on phone: contact bubble no longer covers the shortcut cards.

Ready for testing.

### 2026-11-22: Plan: passport cleanup, pricing cards, tap-to-open documents
Discussed with Nima. Not built yet.

1. **Service dog info on the passport.** Training, trained by and tasks grouped into one short "Training" block. Hidden from the public check page (/check) by default; the owner can turn on "Show training on the passport." The handler statement date comes off the passport (it still says "Handler statement signed"); the date stays in the owner's records.
   Why: it's cluttered, and training details are private unless the owner chooses to share.
   Pages: components/PetPassport.js, components/pets/TrainingCard.js, app/check/[token]/page.js.
2. **Empty space under the passport photo.** Move the blue service dog / red ESA seal there, under the photo. Regular pets keep it clean. Remove the small rainbow dot.
   Pages: components/PetPassport.js, components/PassportReveal.js.
3. **Homepage sample passport (the "Passport issued" reveal).** Benny as a service dog (already fixed). Remove "Share Benny's passport"; buttons become "Make your pet's passport" and "Close". Copy says it's a sample. Cut the heavy effects so the stamp animation runs smoothly.
   Pages: components/VaultPreview.js, components/PassportReveal.js.
4. **Lost-pet wording.** "Your email stays private" becomes "Your contact info stays private." The alert line says "with roughly where the scan happened" instead of "the area they came from".
   Pages: homepage Pet Vault section and lost-pet copy.
5. **Pricing cards ("What it costs").** Free: a $0 tag, three short checkmarks, and a "No card needed" box. Pet Vault: a box like Travel Pass's guarantee: "Make your pet's passport free. Pay only to keep it." Travel Pass card stays as is.
   Pages: app/page.js (homepage pricing), components/HomePricing.js if used elsewhere.
6. **Tap to open documents in Gate Ready / travel mode.** Any row with a file (health certificate, DOT form, rabies certificate, vaccine records) becomes tappable, with a "Tap to open" tag. It opens full screen on the same page with a big Close button, so it's easy to hand to an agent. An "Other documents" section lists anything else on file (import permit, vet letter).
   Pages: app/check/[token]/page.js.

Separate, needs Nima first: text alerts for lost-pet scans (Twilio account, about $2/month plus about 1 cent per text, one-time carrier registration about $20, 1 to 3 weeks to approve).

Ready for review.

### 2026-11-22: Small fix: Benny shown as a service dog everywhere
Benny is our service dog character. The homepage "See a sample" passport reveal showed him as PET, and the demo account had him as a pet. Both now say service dog.
What to check: homepage Pet Vault section, open the sample passport: Benny shows the blue SERVICE DOG badge, not PET. Tell me if you see Benny as a pet anywhere else on the site.

Ready for testing.

### 2026-11-22: Fixes from Sisqo's DOT test (live)
Nima approved: free trips show free first; small fixes go straight in. Test account 6dpq5mtb+dot-test@mail.grokbot.com deleted.

What changed:
- Trip result (/assessment last step): nothing about price shows until the result loads. Simple trip = free box only. Paperwork trip = "This trip needs paperwork" then the Travel Pass price.
- Free checklist sign-up: after "check your email", the Create button is gone. If the confirm link comes back without a login, the sign-in box opens with "Your email is confirmed. Log in to get your free checklist."
- Logged-in free result no longer says "Make an account".
- Contact bubble: hidden on phones on /assessment, /passport/create, /passport/keep and the kit quiz; smaller on other phone pages, with room at the bottom so it doesn't cover the last text.
- Trip fact tiles: fee and steps side by side, carrier full width, words no longer split mid-word.
- Pass tab "Destination" renamed "Arrival" so it fits.
- "Last question" text changed to "Almost done."
- /service-dog/dot-form top button goes straight to /passport/create. /service-dog and /service-dog-kit: the guide link is now a button.

Not changed (couldn't reproduce or find yet):
- "Yes, I have my ticket" needing two taps: Continue needs both cities filled, which is expected. Sisqo, if it happened with cities filled, send the exact steps.
- Trip title cut at "LAX → …" and breed rule cut at "confirm with Del…": send the page and screen width and I'll fix.

Preview and Stripe: preview has its own Stripe key, set before the live switch, so it's probably test mode, but I can't read it to confirm. Preview uses the same database and email as live, so test accounts and emails there are real.

What to test (phone and desktop):
1. Free trip (LAX to JFK, Delta, small dog in cabin): only the free box shows, never a price first.
2. Paperwork trip (e.g. LAX to Cancun): "This trip needs paperwork", then the price.
3. Free checklist sign-up with your tagged inbox: button hides after submit; confirm link gets you to your trip, or to login with the confirmed note.
4. Contact bubble on phone: gone in the quiz and passport maker; doesn't cover text elsewhere.
5. DOT guide buttons on /service-dog-kit, /service-dog and /service-dog/dot-form.

Ready for testing.

### 2026-11-22: DOT form guide, member auto-fill, checklist ending, Benny on sample passport (already live)
Nima approved this before the handoff process started, so it went out without a plan entry. Logging it so it gets tested.

What changed:
- New free guide: /service-dog/dot-form (when airlines can ask for the DOT Service Animal form, sections A to E in plain words, common mistakes). Linked from /service-dog and /service-dog-kit.
- Pet Vault members who signed the service dog statement get the DOT form filled in from their passport. It's on the pet's page under the training card, with Download and Email buttons. Non-members see links to join and to the free guide instead.
- The free checklist welcome on /account now ends with Benny: "Want this saved in [pet]'s passport?" The button says "Make your pet's passport" (no pet yet, goes to /passport/create) or "Unlock [name]'s full passport" (has a pet, goes to /join).
- Homepage sample passport shows Benny's photo instead of the line drawing.

What to test:
1. /service-dog/dot-form on phone and desktop: page loads, both buttons at the top work (DOT's form link opens the government PDF page; "Have it filled in for you" goes to /passport/create). Nothing says "official", "certified" or "registered" about us.
2. /service-dog and /service-dog-kit: the new link to the guide is there and works.
3. Homepage: the sample passport shows Benny's photo, and the rest of the passport looks right.
4. Free checklist (as a new, logged-out visitor, without paying): run a free trip check for a simple U.S. flight, get the free checklist, and check the box at the end shows Benny and the right button for an account with no pet.
5. Not testable without a paid member: the member DOT download/email. Skip it, and say so in the results.

Ready for testing.

## Sisqo review and test results

### 2026-11-25: Sisqo live test of sales copy rewrite (81ecbc5), text check
I checked the live page text on home, the three passport pages and /login.

**Passed:** hero "Get my pet ready to fly" (4 places), header "Get started", "Pick one to see their passport.", all three card lines, all three passport-page subs and bullets as Nima decided, "Their passport, ready wherever you go." + "Backed by your Pet Vault, where every record lives.", the 3 tiles, "info stays private", no sources section, "not a government agency" line under pricing. None of "Check trip", "Start free", "Vet-checked", "beautiful" or "lost pet tag" remain on home or the passport pages.

**Still to fix:**
1. **/login** button still says **"Check my trip, free"**. Nima rejected this. It should match "Get my pet ready to fly".
2. **Homepage FAQ "What is Pet Vault?"** still uses the old wording: "vet-confirmed records", "travel mode with all their documents on one screen", "lost pet alerts with a QR tag". Please reword it to match the new lines ("All their vet records, always with you", "One tap shows the gate agent everything", "Lost? Anyone who scans their tag can reach you, and your info stays private") and keep it short.
3. Minor: the Travel Pass FAQ answer on home is still one long paragraph. Shorten it to match the compact pricing cards.

**Not tested:** visual layout on phone and desktop, and where each button goes (this was a text-only check).

### 2026-11-25: Nima's final copy decisions (replaces my earlier copy review where they differ)
Nima went through my review and decided:
- **Hero button:** "Get my pet ready to fly" (no "Check my trip"). Small "Free" under it is fine.
- **Header button:** "Get started" (not "Start free", not "Check trip").
- **Service dog:** "Your DOT forms, filled in and ready" (drop "Both"). Sub: "Everything your airline can ask for, filled in before you fly." No need to mention 48 hours or 8+ hour flights up front; customers get those details after paying.
- **Pet bullet 1:** Nima's call between "What your airline requires, before you book" and keeping "Exactly…"; Sisqo suggests "requires".
- **Drop "Vet-checked records".** Use "All their vet records, always with you."
- **Lost pet line:** "Lost? Anyone who scans their tag can reach you, and your info stays private." ("info", not "number", since contact may be email or text.)
- **No sources link and no sources section.** Nima: customers don't want to verify sources. Remove "Where our information comes from" with no replacement link. (The "last checked" line is optional; skip it unless it updates itself.)
- **Benny's passport on the homepage is fine**, because the three category cards come first.
- **Homepage passport headline:** "Their passport, ready wherever you go." Under it: "Backed by your Pet Vault, where every record lives." (Later: "Add it to Apple Wallet" once Wallet is built.) The passport is the eye-catcher that gets them in; the Vault holds everything.
- **Tone:** sell the feeling (no worry at the gate, proud of how it looks), not the feature list.

Everything else from my earlier review stands. Ready for Claude.

### 2026-11-25: Sisqo review of the sales copy and condensed homepage plan
The direction is right: outcomes instead of feature names, and less homepage. Most lines are better than what's there now. Here's my pushback, most important first.

**Overpromising (please fix before shipping)**
1. **"Both DOT forms, filled in and ready" / "filled in for every trip".** The relief form is only needed on flights of 8 hours or more, so "both" doesn't fit most trips. Also, many airlines want the forms submitted ahead of time (up to 48 hours) through their own website, and a passport doesn't send them. Suggest: **"Your DOT forms, filled in and ready to send"** and bullet 1: **"DOT forms filled in for each trip, including the relief form for long flights."**
2. **"…filled in before you reach the gate."** This hints that showing up at the gate is enough, and with a 48-hour airline deadline it isn't. Suggest: **"Everything your airline can ask for, filled in before you fly."** (This keeps Nima's line.)
3. **"Exactly what your airline needs, before you book".** "Exactly" is a promise we can't guarantee when airlines change rules. Suggest: **"What your airline requires, before you book."**
4. **"Vet-checked records".** This is only true if every record shown has actually been confirmed by a vet. If confirmation is optional, use **"Records your vet can confirm"**.
5. **ESA "A reminder before your letter expires".** Only promise this if the letters feature actually sends that reminder. It isn't tested yet, because letters is still waiting on a test account with Vault access.

**Conflicts with Nima's decisions**
6. **Header "Start free".** Nima decided: no free anything, and passport sign-up is paid. "Start free" reads like a free account or trial, and people will feel misled at the $6.99 screen. The free part is the requirements check, so the header should say that: **"See what my pet needs"** (same as the hero), or simply "Get started".

**Cuts that were earning their spot**
7. **"without sharing your number".** That's the one privacy benefit in the lost-pet line and the thing that sets it apart from an engraved tag. Keep it short: **"Lost? One scan reaches you, and your number stays private."**
8. **"Where our information comes from".** Removing the section is fine, but keep the sources reachable. Make the "last checked [month]" line a link to a sources page. That's a trust signal for rule accuracy and helps SEO. Also, the month has to update automatically or be dropped. A stale month looks worse than no month.

**Smaller notes**
9. **"Their whole life, in one passport"** is vague and a bit much. Suggest **"Travel, health and ID, in one passport."**
10. **Benny's service dog passport on the homepage** may tell ESA and pet visitors this is only for service dogs. Consider the plain Pet passport, or the colour of whichever card they hovered or picked last.
11. **ESA sub "When your landlord asks, it's ready."** It's strong, so keep it. "Saved and private to you" is fine. Maybe add "you choose who sees it", since they'll be sharing it with a landlord.
12. **Hero "See what my pet needs" with "Free" under it** is good. Keep it.

Everything else is approved: card sub line, Pet sub, "One tap shows the gate agent everything", tile merge, pricing trim, dropping the chat demo and "See travel mode on a phone".

Reviewed.

### 2026-11-25: Sisqo retest: ESA badge and neutral maker preview (4191f52)
**Pass:** the ESA badge reads EMOTIONAL SUPPORT ANIMAL, with no "Flies as a pet" anywhere. For both for=esa and for=pet the preview stays neutral until a choice is made (paw, "Your pet", no species, no DOG or CAT in the MRZ). Picking "It's for my cat" switches the preview to Cat/CAT and asks "What's your cat's name?". All fixed.
Still open: the letters test, which waits on a comped test account from Nima, and the phone-width check.
### 2026-11-25: Sisqo retest: maker presets and sample dates (3405d00)
**Pass:** sample issue dates read Nov 1, 2026 on home and all three passport pages. The maker preset now works and switches cleanly in one tab (service, then esa, then pet, then esa): SERVICE DOG badge with "Statement not signed yet", EMOTIONAL SUPPORT badge, and PET label. Nothing carries over between loads.
**Fix:**
1. The ESA preview badge shows "Flies as a pet". Nima decided ESA has no "Flies as a pet", so please remove it.
2. With for=esa or for=pet the preview still defaults to species Dog, with DOG in the MRZ, before the user picks dog or cat. Show a neutral preview until they pick. Minor.
### 2026-11-25: Sisqo test: role-colour cards, AI captions removed, "Check trip" (da36482)
**Pass:** cards are navy, deep red and copper with white text, gold rings and gold names; text readable, nothing cut off; no AI captions on home or the three passport pages; SAMPLE tag still on the photos; home header reads "Check trip".
**Small fixes:**
1. /login header still reads "Plan trip". It should be "Check trip" everywhere.
2. Milo's card reads more brown than copper, and its body text sits on the light end of the gradient. Still readable, but a bit weak.
3. The gold names are small. Make them a touch bigger.
4. Cleo's title wraps to two lines, so its card is taller than the others.
5. Only Benny has a real photo. Cleo and Milo still use line icons, so the set looks uneven until their photos are ready.
Phone width not checked yet.
### 2026-11-25: Sisqo live test: homepage cards, ESA, Pet and Service Dog Passport pages (desktop, signed out)
Nima pushed live and asked for a test while live. No sign-up or payment.
**Pass:** hero wording and "Check my trip, free" button; "Who's coming with you?" sits after "How it works"; Benny/Cleo/Milo cards open the right pages; no travel-rights wording on /esa-passport; "Flying soon?" goes to /assessment?pet=esa; HANDLER Alex Morgan / OWNER Jamie Cruz / OWNER Sam Rivera on samples; no "Plan my pet's trip" left.
**Fix:**
1. Passport maker ignores `?for=`. `/passport/create?for=esa` and `?for=pet` both open "Step 1 of 7, Benny / AI guide, What's your dog's name?" with SPECIES Dog, same as `?for=service`. A cat ESA owner is asked for their dog's name. The type should be preset and the guide should match (Cleo for ESA, Milo for pet).
2. /esa-passport badge reads "ESA PASSPORT", not "Emotional support animal" as planned. Minor, Nima's call.
3. Homepage sample passport says ISSUED NOV 1, 2026; the landing pages say NOV 25, 2026. Make them match.
4. /login shows "One moment..." under "Welcome back" while loading. Check it clears.
**Not tested yet:** phone width, and letters. Letters needs a signed-in account with an ESA or service dog pet, which needs the $6.99 payment; Sisqo can't complete live payments. Needs a comped test account or a Stripe test path.
### 2026-11-25 (1:28 AM PT): Homepage picker, names, no registry links, printed-passport idea: review

Looked at the three docs-only commits since 48a62b3 (d70923f, 02accf4, 938f3ae). Rendered the new HomePicker mockup (390×560). Nothing on the live site changed, and there is no new production build to curl.

**Nima's new decisions, which stand.** No links to registry or letter websites, on our site or theirs. Drop the kit-link idea. `?src=` is only for PetPassGo's own ads. People reach the Service Dog and ESA pages from the homepage picker, not from a small strip.

**Homepage picker.** Clear and easy to scan: "Who's coming with you?", three role cards with distinct colours, and "Benny, Cleo and Milo are our AI characters." The ESA card copy ("Their passport and your housing letter") is housing-first and does not imply travel rights. "Flying soon? Check your trip for free." is fine as a secondary line on the ESA page itself, once that page exists.

Top pushback: until the ESA page is built, do not send the ESA card to the free trip check. That turns an ESA choice into a flight flow and is the one place this could be read as travel rights. Leave the ESA card off, or have it go to a short "housing letters — coming soon" note, until letters and the ESA page are live. Also, this picker sits under a homepage that already has a large passport and two buttons ("Plan a trip", "Start Pet Vault"). That's a lot. I'd let the picker replace those two hero buttons, not stack under them.

**Names.** I'd keep Benny, Cleo and Milo. They're short, easy to say, easy to tell apart (different first letters, different animals, different roles), and they sound like real pets. No clash that would make me swap one. Two notes for Nima: Milo is also his own dachshund — in public copy, treat the character as an AI pet, not as his dog, and don't use family photos for the character. (Milo is also a well-known chocolate drink outside the U.S., and the cat in *Milo and Otis*; neither is a reason to change it.) Cleo and Milo still need real sample photos, like Benny, before this ships.

**Letters privacy.** My earlier answers still stand (consent at upload, a privacy-policy bullet, deletion, no staff browsing, owner-confirmed "send to landlord"). No change.

**Service Dog page.** Already reviewed in my 1:16 AM PT entry. Preview was 403 from here; source review and the open issues (button still goes to the free maker; `for=service` doesn't skip those questions; soften the airline line) are unchanged. A browser test is still needed by someone who can open the preview.

**Printed passport.** Agree this is research only, not for this build. I'll have a separate research task queued for later — not tonight. Starting guardrails: the cover must be clearly PetPassGo, not a government passport (no eagles, seals, or "United States"); never official/certified/registered/approved; the service dog signature page must use the exact online handler-statement wording; the ESA page stays cute and non-legal, with no travel-rights wording; Nima sets the price.

### 2026-11-25 (1:16 AM PT): Mockup updates, landing pages, letters plan, and Service Dog preview: review

Looked at everything on main since my last review (d77822d): nine commits, ending at 5b598e3 (Nov 25, 1:10 AM PT). Rendered the current mockups in `design/mockups/` at their designed sizes (phone 390px, desktop passport 1040×700). Also read the new plans and the Service Dog page source on branch `pets-alive` (55294b2, 87ad1b4).

**Nima's decisions, which stand.** Passport direction approved. "Plan a trip" leads on the homepage. ESA badge drops "Flies as a pet." No SAMPLE stamp on the homepage; a "Meet Benny, our AI guide" line is enough. Keep the role badges and passport shine; landing-page icons stay calm (soft tiles). Buttons say "Get your Service Dog Passport" / "Get your ESA Passport." Build order: Service Dog page first, then letters, then the ESA page; the homepage strip waits until both pages exist. A later "one passport everywhere" change uses the same fields and holograms on Home, Vault, and the phone passport, which also dropped the earlier "Good until 2027" rabies line from the homepage card.

**Earlier fixes (from my last review).** All of these are in good shape, with Nima's overrides honored:
- SAMPLE no longer covers the number. The tag sits on the photo; PPG-SAMPLE is fully readable in the header.
- A real phone layout exists (PassportPhone). Fields are readable; the hologram sits in the card's bottom-right corner with space left in the code line.
- Homepage: no SAMPLE stamp on the photo, as Nima asked. The number is still PPG-SAMPLE, plus "Meet Benny, our AI guide." Rabies is no longer on that card (same fields as the issued passport).
- ESA badge is deep red and reflective, labeled "EMOTIONAL SUPPORT ANIMAL," with a heart (not a shield) and no travel-rights wording.
- The hologram has a paw mark, and a light foil wash was added. It now reads as a seal.
- Pay screen: "$6.99 today," "Then $6.99 a month. Cancel anytime.", name / email / password, unticked renewal box with the full wording, "Continue to payment · $6.99," and "Already have an account? Log in."
- Homepage primary button is "Plan a trip" (orange), with "Start Pet Vault" as the second button, as Nima decided.

**Verdict on the mockups.** These are ready to build from for the passport, the phone and ESA versions, the pay screen, and the Service Dog landing. The passport looks like a product now. A few wording and flow issues should be fixed before ads or the ESA page go out (below).

**Service Dog and ESA landing pages.** Strong, compact, and clearly the same $6.99 Vault, not a new product. ESA copy stays on housing letters, reminders, and the lost-pet tag — no flying rights. Captions correctly say Benny and Cleo are AI characters. Two wording nits on the Service Dog page: "Give them papers that look the part" is punchy and fine if the sample stays clearly labeled; "everything your airline can ask for ready to go" overpromises (airlines can ask for a health certificate and other papers we don't issue). Softer: "the DOT form and your handler statement, ready when you fly." Cleo is still an empty photo slot; a real sample photo, like Benny's, would sell the ESA page better. The landing mock is 1260px tall, so on a phone you scroll to the button — that's all right if the headline and passport are the first screen.

**Letters in Pet Vault.** Good idea, and the privacy line on the mock ("Only you can see this. It's never on Cleo's passport, her tag, or anything you share at the airport.") is the right promise. License shown as state + last 4 is good. Answers to Claude's questions: treat letters as sensitive (they can include health or disability information). At upload, get a short consent ("This letter may include health information. We store it only in your Vault, never on the passport, the tag, or at the airport."). Add a specific bullet to the privacy policy. Keep the existing deletion rule (owner can delete in the app; account deletion removes uploaded documents within 30 days). Encrypt at rest (Supabase already does). Don't log letter contents, and don't let support tools open them by default. "Send to landlord" is fine if the owner types the address, confirms what will be sent, and we record the send in their account. Warn that a sent letter can't be pulled back. A short-lived link or an attachment both work; don't add anyone else on the email and don't include extra records they didn't pick. Don't sell letters, and never call them official or certified — the plan already says this.

**Fuller Vault and Travel Pass.** The logged-in Vault looks rich (passport, health rings, documents, people, lost-pet tag, birthday). It's also 1820px tall, which is more than two phone screens and busier than the simplify rule. For the first build pass, keep the passport plus the next reminder and one main action on the first screen; put people, birthday, and extra tiles further down. Don't take all of this as new work until the 4-screen site and pay-first maker are done. Travel Pass header is now reflective copper and looks better. It still says "2 of 6 done" and lists only four steps.

**Service Dog page on the preview (Ready for testing).** I could not load https://petpassgo-git-pets-alive-nimaesfand-5208.vercel.app/service-dog-passport — curl returned 403 (`x-vercel-mitigated: deny`), and the Vercel connector is still forbidden for team nimaesfand-5208 (same as Nov 23). I reviewed the source on `pets-alive` instead. What the code does well: no "official / certified / registered / approved" in the copy; "Sample passport. Benny is one of our AI characters."; price from `PRICES.member`; logo goes home; "Log in" goes to `/login`; `?src=` keeps only letters, numbers, `-` and `_` (a `?src=<script>` value would be dropped); the page is in the sitemap and not in the menu; desktop layout (from 900px) is text on the left and the passport on the right, as described.

What will not fully match the test notes until it's fixed:
1. The button goes to today's passport maker (`/passport/create?for=service`), which is still the free draft with "We'll hold it for 7 days," not the $6.99 pay-first screen. Claude flagged this. Don't send paid traffic to this page until pay-first is built, or people will see a different offer than "$6.99 a month."
2. `for=service` pre-fills Dog + Service animal, but it does not skip those questions. The maker still starts at "It's for my dog," and the role step still appears. A leftover draft in localStorage can also block the preset (the code only fills those fields if both are empty).
3. `src` is recorded on the landing page and passed in the button URL, but the maker does not store it. That's fine for a first test; if we want to know which visits pay, it needs to be carried into checkout later.

**Browser tests still needed** (someone who can open the preview): the six items Claude listed (phone, desktop, `?src=registry` on the button, `?src=<script>` stripped, wording, logo and Log in), plus: does the first phone screen show the headline and passport without clipping the badge or paw seal; after tapping the button, are Dog and Service animal actually selected, and does a leftover draft get in the way; confirm you still land in the current free maker, not a pay wall.

**Left for Nima.**
1. Soften "everything your airline can ask for ready to go" before this page is promoted? I recommend yes.
2. Hold ads and kit links until the pay-first maker is live? I recommend yes.
3. Should `for=service` skip the animal and role questions, as the plan said, rather than only pre-filling them?
4. Add a Cleo photo before the ESA page is built?
5. For the first Vault build, start from the simpler earlier screen, or from this long 1820px dashboard?

The live site at www.petpassgo.com was not changed. No payment was made.

### 2026-11-25: Design mockups (passport, Home, Travel Pass, Pet Vault): review

Looked at the four HTML mockups in `design/mockups/` from commit c945b93 (Nov 25, 12:11 AM PT). Nothing on the live site changed. Rendered them locally (Benny's photo in place of the canvas blob) at the designed sizes: passport 1040×700, Home / Travel Pass / Pet Vault at 390×844. Also read the Nov 24 before/after for the maker and keep page (0752dc5), which these screens sit with.

**What they show.** The passport is a landscape cream card with a navy cover band, gold trim, a large "Benny", an orange ISSUED stamp, fields, machine-readable lines, number PPG-SAMPLE, a gold SAMPLE ribbon, one Service Dog badge under the photo (no pill next to the name), a holographic disc on the photo corner, and the line "Handler statement signed." Home (phone) uses a tilted mini passport as the hook, "Bring them along.", one sentence, two buttons (Plan a trip, Start Pet Vault), and "Checking your trip is free." Travel Pass (phone) has an orange LAX → CUN header, a "Next up" vet-visit card, a 2-of-6 step list, and "Open travel mode." Pet Vault (phone) has Benny's header and badge, "See Benny's passport", a large "Snap a record" card, one reminder, four tiles, and "Plan a trip with Benny." There is no ESA passport, no phone layout of the full passport, and no start / sign-up / pay screen.

**Verdict.** The visual direction is strong. The passport finally looks like something people would pay for, and the Service Dog badge has the deep-blue reflective glint Nima asked for — that part is a clear step up from the flat navy pill. Do not build from these as-is. The SAMPLE ribbon covers the passport number, there is no phone version of the full passport, the ESA badge is missing, and the $6.99 pay-first start screen from the Nov 24 after is not in the set.

**Against Nima's decisions.**
- **Passport look.** Role shows once, under the photo. The badge is deep blue with a real highlight, not flat. "Handler statement signed" is the right kind of wording (a statement, not a certification). The hologram is a blank pastel disc — it does the job of dropping the old ghost-photo square, but it reads more like a sticker than a nice seal. The gold SAMPLE ribbon is the right idea, but it cuts through "PPG-SAMPLE" so the number reads as "PPG-SAMP". The "PASSPORT ISSUED" label above a sample card is also a mixed signal.
- **ESA.** Not mocked. The Nov 24 before/after still says Claude will keep "Flies as a pet" unless Nima says otherwise. Nima already decided: deep red, label "Emotional Support Animal", no travel-rights wording. That still stands.
- **Sample before paying.** The desktop passport is marked SAMPLE / PPG-SAMPLE (once the ribbon is moved). The homepage phone teaser is not: no SAMPLE ribbon, no PPG-SAMPLE, and it shows "Rabies: Current" as if it were a live record. That teaser is the pre-signup hook, so it needs to be clearly a sample, with less personal/health detail.
- **Pricing and pay-first flow.** None of these four screens show $6.99, $21.98, or "Then $6.99/mo, cancel anytime." The written after correctly drops the 7-day hold and the keep page. Those buy screens still need a mockup before anyone builds them.
- **Compact rule.** Home has two equal-weight buttons, which breaks "one main button." Travel Pass and Vault are logged-in dashboards, so more than one action is fair, but each still has two strong buttons competing (Find a vet / Open travel mode; Snap a record / Plan a trip).
- **Nov 23 bugs** (Back in the maker, JFK Travel Pass banner, orange vs blue button, promise-step wording, hidden "See every step") are listed in the written after and are not in these pictures, which is fine.

**Overpromise.** "Take a photo. We read the dates for you" is closer to the truth than "Snap a record, we organize it." The existing document check can read rabies dates and a signature off a photo of a health paper, but only when that feature is turned on, and the API returns a check result — it does not, today, file a record into the Vault. Only use that line if the next build actually saves the dates. "Find a vet near me" is fair: a vet search already exists in the pet extras. Don't ship it as a new product, just open that search.

**Top fixes before build.**
1. Move the SAMPLE ribbon (or put a clear SAMPLE label next to the number) so PPG-SAMPLE is fully readable.
2. Design the full passport for a phone. The current card is about 860px wide. Scaling it down to 390px would make the fields too small to read. The homepage mini card is a teaser, not the issued page.
3. Mark the homepage teaser as a sample (PPG-SAMPLE + ribbon) and drop "Rabies: Current" from it.
4. Add an ESA passport: deep red reflective badge, "EMOTIONAL SUPPORT ANIMAL", no "Flies as a pet" or other travel wording.
5. Give the hologram a simple mark (a paw or a small PPG monogram) so it looks like a seal, not a blank pastel sticker.
6. Mock the start → email + password → pay path: $6.99/mo up front, the unticked renewal box, "Cancel anytime," and for Travel Pass, "Includes your first month of Pet Vault. Then $6.99/mo, cancel anytime."
7. On Home, pick one primary button. If both products stay on the screen, make Vault clearly secondary, and put the price near the Vault action.
8. On Travel Pass, don't say "2 of 6 done" and then list only four steps.

**Decisions for Nima.**
1. Is this passport direction close enough to approve, if Claude fixes the SAMPLE overlap, adds a phone layout, and puts a simple mark in the hologram?
2. Please reconfirm ESA: no "Flies as a pet." (This was already decided.)
3. Should Home lead with "Plan a trip" (travel first) or "Start Pet Vault" (the $6.99 passport)? The mock leads with the trip.
4. Claude's earlier concern still stands: paying before someone sees their own pet's passport means the sample has to do the selling. The desktop sample is close; the phone teaser is not there yet.

Ready for Claude to revise the mockups. Not ready to build, and no browser test of the live site is needed for this set.

### 2026-11-24 (8:55 PM PT): Nima clarified Travel Pass + Vault (replaces point 3 "Sisqo is confirming" below)

- **Travel Pass = $14.99 + $6.99 = $21.98 at checkout, and includes the first month of Pet Vault.** Pet Vault alone is $6.99/mo up front.
- After the first month, Vault renews at $6.99/mo unless they cancel. Keep the unticked renewal consent box, the renewal line on Stripe, and the confirmation email with a cancel link.
- Sisqo note: many people book trips more than a month ahead, so say plainly at checkout: "Includes your first month of Pet Vault. Then $6.99/mo, cancel anytime." Don't say "Vault until your trip is over."

### 2026-11-24 (8:55 PM PT): Nima's decisions on the simplify plan + sign-in (relayed by Sisqo)

Nima approved going ahead with the simplify plan and made these decisions (his words, lightly cleaned up):
1. **Sign-in: email and password.** Passport makers create an account with email + password. Remove "No password needed" and the "we emailed it" line on step 12.
2. **No 7-day anything.** No "we hold it for 7 days," no free week, no free draft period.
3. **$6.99 right away to proceed.** Pet Vault ($6.99/mo) is paid up front to make the passport and use the Vault. Nima: "Unless they get trip pass they get the vault until their trip is over." Sisqo is confirming the exact meaning with Nima. Don't build that rule until it's confirmed.
4. **The passport is the dog's Vault + Travel Pass info + ID.** Keep everything very simple, with very little info, especially free info, until the person has signed up and logged in.
5. **Visual quality is the priority, especially the passport.** It needs nice holograms (the deep blue reflective look, not the current flat navy pill) and nice color badges for **Service dog** and **ESA**.
6. Goal: get this polished so the site can launch and start selling.

**Sisqo notes / pushback for Claude:**
- **ESA badge wording:** since DOT's 2021 rule, US airlines treat ESAs as pets. The ESA badge must not suggest cabin, free or service animal flying rights. Use a distinct color with a plain "Emotional Support Animal" label and no travel-rights wording, and keep ESA trips on pet rules in the trip check.
- **Pay first, but show a sample:** before the $6.99 step, show a clearly marked SAMPLE passport (PPG-SAMPLE number, sample dog) so buyers see what they're paying for. Their own pet's details are only entered after payment, or after sign-up and payment, in that order. Keep the existing-member email check (log in instead of buying again) and the unticked renewal consent box.
- Still fold in the open Nov 23 bugs: flat badge, Back leaving the maker, the JFK banner mentioning Travel Pass, orange vs blue button, "Check each line" with one box, and the hidden "See every step" on /mexico and /canada.
- Post the before/after for the passport maker + keep page first, as the plan says. Sisqo will do the full phone walk-through once that's live.

### 2026-11-24: Plan: simplify everything: review
Read the Nov 24 plan against Nima's walk-through and against Sisqo's Nov 23 (12:20 PM PT) live test. The simplify rule is the right direction. Nima decides.

**Agree.** One headline, at most two short sentences, at most three bullets, one main button, no nested lists or "see everything" expanders, and no new features until this pass is done. Start with the passport maker and the keep page, then do the trip result, account home, Pet Vault page, and homepage one screen at a time, with a before/after posted here first. The two product lines are clear and match option A: Travel Pass guides the trip; Pet Vault is the pet's records and documents at $6.99/mo. Removing the four locked cards and the nine-item "See everything" list on the keep page will help a lot. Showing the passport clearly, with a soft "Not kept yet" ribbon, is better than darkening it behind a lock. Male/Female, a photo crop before save, and keeping only the badge under the photo (drop the extra pill next to the name, and drop the ghost square that looks broken) all sound right.

**Keep-page wording — concern.** The proposed small line, "Cancel anytime. We hold it for 7 days," is easy to misread as a 7-day membership or a free Vault trial. It isn't: the draft passport is held for 7 days, and Pet Vault starts when they pay. I'd use: "Your draft is free for 7 days. To keep it, Pet Vault is $6.99/mo, cancel anytime." Put the price on the button as planned ("Keep [Name]'s passport · $6.99/mo"). Don't imply they already have Vault for a week.

**Don't sell features that aren't this product.** The Vault one-liner mentions "grooming and trainer info." Grooming in the code is a Discover business category, not a Pet Vault tool, and Discover is hidden. Trainer info belongs on the pet, but it isn't a Vault selling point in the way records and the lost-pet tag are. "Snap a record, we organize it" overstates what exists today: there is a photo check that reads key details from a certificate to help you prep, and it is not a certification. Don't promise that the AI files and organizes the record into the Vault unless that's already how it works. Stick the three keep-page icons to things that are real: reminders, the lost-pet QR tag, and either "Records and documents in one place" or a careful line about snapping a certificate to read the dates.

**Breed list.** Typing to search plus "Mixed or not sure" is good, and a cat-specific placeholder is good. Don't make the list a closed door. If someone's breed isn't in it, they need "My breed isn't listed" (a short typed name), or they will pick the wrong one and it will print on the passport.

**Preview passport number.** "PPG-PREVIEW" looks unfinished, but a real-looking number on an unkept draft can look official. Use a clearly marked sample, such as PPG-SAMPLE, not something that could pass for an issued ID.

**Open items from the Nov 23 test that this plan does not mention.** These should be fixed in the same pass, while Nima and Claude are already in the passport maker:
1. The service badge is still a flat navy pill with a small rainbow dot, not the deep blue reflective badge. Nima is looking at that passport now.
2. Browser Back leaves the maker (from step 8 it went back to Canada, not step 7). Steps should be history entries so Back goes to the previous step.
3. The LAX to JFK service-dog result still has a green banner that mentions Travel Pass, which is wrong for a Vault-only trip. The box is blue and the button is orange; confirm if that was intended.
4. The promise step has one checkbox, but the error says "Check each line to sign."
5. Step 12 says no password is needed, then "We also emailed it to [email]," without saying what was emailed.
6. A hidden "See every step" button is still in the markup on /mexico and /canada. Remove it.

**Sign-in is still open, and it blocks testing.** The maker still doesn't ask for a password, so Sisqo couldn't log into the account it created and couldn't test the training card or the logged-in menus. How should a passport-maker user get back in later: an emailed sign-in link (Sisqo's suggestion), set a password on the last step, or only after they buy Vault? This also decides the step 12 copy. Nima needs to answer before, or as part of, this pass. Until then, users who leave and come back may not be able to reach their draft.

**The full phone walk-through Claude asked for.** I'll do that as its own pass once Nima approves the rule, with URLs and screenshots, and that list can be the order of work after the maker and keep page. Screens already known to break the rule: the keep page (locked cards plus a nine-item expander), the service-dog trip result (banner plus a second product message), and the maker (Back, step 12, and the promise-step wording).

For later screens, keep Nima's earlier calls: option A pricing, compact pages, plain names, "Last checked [month]" only (no source links for customers), and no extra disclaimers.

Ready for Nima to decide.

### 2026-11-23 (12:20 PM PT): Sisqo test results, batch 1 fixes + batch 2 trims (tested live at eaadf13)

Screenshots are in Sisqo's /workspace/petpassgo-review/2026-11-23-batch2/. No payment was made.

**Passes**
- Service dog LAX to JFK on Delta now shows the "Get it filled in with Pet Vault · $6.99/mo" box, with no "This trip needs paperwork" and no $21.98. LAX to HNL (Delta) and LAX to MEX (Aeroméxico) show the Travel Pass card ($14.99 + $6.99 = $21.98).
- The pet dog's Mexico paperwork card no longer has a DOT form line.
- Phone homepage (375 px): the header stays on top and the full PetPassGo logo shows.
- /mexico and /canada are short on the phone and show "$14.99 one trip, there and back, with Pet Vault ($6.99/mo)."
- Service passport maker: the counter says "of 12," "Certified Trainer" is blocked with a clear message, and the promise step needs both the box and a first plus last name. Refreshing mid-flow keeps your place.
- The pet passport maker has 7 steps.

**Fails / fixes needed**
1. **The badge is still not the deep blue reflective one.** After finishing and a hard refresh (Ctrl+Shift+R), the service badge is a flat navy "SERVICE DOG / Handler statement signed" pill with a small rainbow dot and an orange ISSUED stamp.
2. **Browser Back leaves the passport maker.** From step 8, Back went to the previous page (Canada), not step 7, because the steps aren't history entries. Forward returned to step 8. Please make Back go to the previous step.
3. **The LAX to JFK service dog result has mixed messages.** The green banner above the Vault box still says "Your Travel Pass walks you through each one," which is wrong for a Vault-only trip. Also, the box border is blue but the button is orange. Was that intended?
4. **Promise step wording.** There's only one checkbox, but the error says "Check each line to sign." It should say "Check the box to sign," or the step should have one box per line.
5. **Step 12 contradicts itself.** It says no password is needed, then "We also emailed it to <email>." Say clearly what was emailed (the passport? a sign-in link?).
6. **Leftover on /mexico and /canada.** The "See every step" button (href #steps) is still in the markup, hidden. Please remove it, since the step-by-step was removed.

**Couldn't test: the training card on a saved pet and the logged-in menus.** The passport maker never asks for a password ("No password needed"), so there's no way to log into the account it creates (6dpq5mtb+batch2@mail.grokbot.com). The trainer options inside the maker are right (Owner trained / Dog trainer (name + business) / Trained in a program). How should a passport-maker user get into their account later: a magic link, set a password on step 12, or only after buying Vault? Until that's answered, I can't reach the training card or the logged-in menus. Please also add that test account to the cleanup list.

**Monthly rules re-check:** it already exists. It runs on the 1st of each month around 9 AM PT, starting Dec 1, 2026, and posts its findings here asking you to update "Last checked."

### 2026-11-23: Built batch 1 (part 1): pricing A, renewal consent, menu, service dog page, training fix: test results
Tested the live site at 8964e4a (before 701891b/edc6bb5 went live), logged out, phone (375px) and desktop. No payment and no card entered. No test account was created (see 5).

1. **/service-dog and redirects: pass.** Hero says "Your service dog flies with you, free.", "Check my flight" appears twice, there are 3 cards, and "Last checked November 2026" shows. No source links, no "kit", no certified/registered/official. /service-dog-kit, /service-dog-kit/start and /service-dog/dot-form all go to /service-dog. /signup goes to /passport/create. /guarantee loads. /welcome with no session shows "We couldn't find that payment", which is fine. Small thing: on phones the header logo shows only "Go".
2. **Service dog trip result: FAIL.** LAX to JFK, Delta, direct, service dog, via /assessment?pet=service. The top is right ("Yes, your service dog can fly this trip", "No charge", DOT form step). But it then says **"This trip needs paperwork"** and shows the Travel Pass card ("$21.98 today", "Get my Travel Pass · $21.98"). The "Get it filled in with Pet Vault · $6.99/mo" button to /passport/create?for=service is missing. A simple U.S. service dog flight is being sold the paperwork pass.
3. **Paperwork trip with renewal consent: pass.** LAX to MEX, Aeromexico, pet dog in cabin. One card says "Travel Pass with Pet Vault … $21.98 today". The renewal box starts unticked, and continuing without ticking it shows "Tick the box to start your access now. Checkout stays closed until you do." Stripe shows "$21.98, then $6.99 per month" and above Subscribe: "Pet Vault renews at $6.99 USD a month until you cancel. Cancel anytime in your PetPassGo account." Stopped there. Odd copy: this pet-dog card lists "DOT form filled in for service dogs", which is out of place for a pet.
4. **Menus: pass logged out.** Phone menu has Plan a trip, Pet Passport, Pet Vault, Help & FAQ, Contact us, Log in, Plan my pet's trip. Desktop has Pet Passport, Pet Vault, Help, Log in, Plan trip. The footer still links Airlines and Blog, which is fine if intended. **Header did not stay at the top** when scrolling the homepage on phone (the 2026-11-22 sticky-header fix). Logged-in menus were not tested.
5. **Training card: not tested.** /login has no sign-up, and the only way to make an account is the Benny passport maker, so I didn't get a signed-in dog this round. 701891b changed the trainer options again, so I'll test the current version next round through the passport maker.
- **Homepage:** one main button, "Plan my pet's trip", plus a "How it works" link. The sample passport badge looked like a pale blue "SERVICE DOG / Handler statement signed" pill, not the deep blue reflective badge with hologram from the 2026-11-22 passport look entry. Claude, please confirm which is live.

**For Claude:** fix 2 (simple service dog trip should get the Pet Vault DOT button, not the Travel Pass); check the sticky header and the passport badge look; drop "DOT form filled in for service dogs" from the pet card; phone logo "Go".
Next for Sisqo: service dog steps in the passport maker (edc6bb5) plus the training card and logged-in menus.
Screenshots: /workspace/petpassgo-review/2026-11-23-batch1/

### 2026-11-23: Plan: simpler site + pricing option A: review
Read both "Ready for review" plans. The 2026-11-23 option A update replaces the pricing and DOT parts of the simpler-site plan. Leftover $9.99 copy in plan 1 (the result button "Get the DOT form filled in, $9.99 + Pet Vault", item 3 about a $9.99 DOT product, and "DOT form at $16.98") must be rewritten to option A before building, or that wording will ship by mistake. Nima decides.

**Existing paid customers (Claude's question).**
I queried the live database with read-only counts (no account records were changed; the family household account was not opened or edited). There are no outside customers who paid $29.99 for a standalone Travel Pass. The only Travel Pass-shaped rows are two internal plus-tagged @petpassgo.com test accounts, each with a $0 "pass" purchase. There are no outside Pet Vault subscribers. The only active memberships are the owner's (no Stripe subscription id on the row) and one household/family account with a real Stripe Vault subscription and a $6.99 renewal. There is also one unused gmail signup with no payments. So there is no live $29.99 customer to migrate, but the code still has to treat already-paid trips as paid.

What must keep working: access is already based on `trips.paid` (and the 7-day window after the flight, or an active Vault membership), not on whether $29.99 is still for sale. Leave those paid flags alone. Retire the standalone Stripe price (lookup key `ppg_travel_pass_2999`); do not delete it. The webhook unlocks trips and memberships from session metadata and subscription events, not from "is this the current price," so it should keep handling old sessions and invoices as long as the old price still exists. `plan: "pass"` in checkout should stop being offered, but historical `pass` metadata must still be recognized. Standalone-pass holders today keep trip tools until 7 days after they fly even if they never join Vault (`vaultIsOpen` / `tripAccessOpen`). That window should stay.

**Links in sent emails.**
These need a redirect, not just a menu change, or old email links will 404:
- `/guarantee` is in the purchase confirmation email ("Terms: …/guarantee"). If it folds into the FAQ, redirect the old URL, including the guarantee terms people were emailed.
- `/welcome` is the Stripe success URL for guest checkout (`/welcome?session_id=…`), where the buyer sets a password. If that page is folded into login or the passport maker, the redirect must keep the `session_id` query or paid guests cannot finish their account.

No sent-email templates currently link to `/service-dog-kit`, `/signup`, `/join`, `/community`, or `/travel-pass`. `/signup` confirmations already go to `/login`. Other emails point at `/account`, `/passport/keep`, `/vet-verify/…`, `/contact`, and (for business listings) `/discover/…` and `/business/…`. If Discover/business are only hidden from the menu, keep those URLs working for the emails already sent. There are no redirects in `next.config.mjs` today (the file is essentially empty of redirects), so batch 1 has to add them.

**Google traffic.**
I could not tell. Search Console is not set up, and a Vercel Web Analytics query for this project was refused (not authorized for the team). Until someone can see actual search landing pages, don't strip the Google pages down to a teaser.

**Auto-renewal rules (research, not legal advice).**
Pet Vault is a monthly auto-renewing subscription sold online, so California's Automatic Renewal Law (Bus. & Prof. Code §§ 17601–17602, as amended by AB 2863; the new duties apply to contracts entered into, amended, or extended on or after July 1, 2025) and the federal Restore Online Shoppers' Confidence Act (ROSCA, 15 U.S.C. § 8403) both apply, including for California buyers.

At checkout, before billing details: clearly and conspicuously, next to the consent, say that Pet Vault renews until the customer cancels, the amount ($6.99) and frequency (monthly), the term, and how to cancel. Get express affirmative consent to those renewal terms, not only to "Pay." Keep a record of that consent for at least three years, or one year after the membership ends, whichever is longer. If Travel Pass is sold only with Vault, say plainly that they are starting a monthly membership, not a one-time $21.98 charge.

In the confirmation email (this is the acknowledgment the customer keeps): repeat the renewal terms, the cancellation policy, and how to cancel, in a form they can save. Today's purchase email already says they can cancel online anytime in account Billing and keep access through the period paid; add the $6.99/month renews-until-canceled line and a direct link to cancel. A Stripe payment receipt is not enough on its own; Stripe receipts confirm the charge and may not include the renewal terms and cancel instructions (see Stripe's own receipts docs). ROSCA also requires a simple way to stop recurring charges. California requires online cancel at will, without extra obstructive steps, via a prominent account link/button (or an immediately usable cancel email). The plan's one-tap cancel in the account matches that; keep it.

Reminders: a 3-day email before the first $6.99 renewal is a good idea, especially for people who only wanted one trip, but California does not require that reminder for a regular monthly plan at full price. The 3-to-21-day notice is only for a free trial or discounted price lasting more than 31 days. The 15-to-45-day notice is for plans with an initial term of one year or longer. Pet Vault is neither, unless you later add a long trial or an annual plan. A price increase needs notice 7 to 30 days before it takes effect, plus how to cancel.

An annual reminder (product, charge amount and frequency, how to cancel) is the safer course for Vault members. The California Attorney General's Sept. 4, 2025 consumer alert describes an annual reminder for auto-renewal or continuous-service plans. The statute says "annual automatic renewal agreement or continuous service agreement," which some readers might take more narrowly; I would still send the annual reminder.

The FTC's 2024 "click-to-cancel" / Negative Option Rule was vacated in full by the Eighth Circuit on July 8, 2025 (Custom Communications, Inc. v. FTC) and is not in force. ROSCA itself was not vacated; the FTC is still enforcing it, and in 2026 started a new rulemaking. Don't weaken cancel or disclosure because the 2024 rule was struck down.

**Pricing and copy.**
Option A is coherent, and $21.98 for the first paperwork trip is less than the old $29.99 standalone, but only if checkout cannot be mistaken for a one-time fee. After that, $6.99/month continues until they cancel. Say that clearly. If they cancel Vault after buying, a paid Travel Pass should still cover that trip through the existing 7-day window; don't take the trip away.

The DOT form is free from the U.S. DOT. PetPassGo is selling to fill it in from the passport, not the form itself, and not a certification. The owner still reads and checks the DOT statements and signs their own name, including that false statements are a federal offense. Copy must never say the DOT form costs money, that you have to use PetPassGo to fly with a service dog, or that the dog is certified, approved, registered, or official.

**"Tell what, not how" on the Google pages — concern.**
I agree with cutting the step-by-step "how" that duplicates a paid checklist, but a useful free page should still answer the question: what is required, a link to the official source, and when it was last checked, then "Check your trip." If those pages become a tease, they will feel like withholding and can hurt search quality. We don't have traffic data to know which pages matter, so trim carefully, don't empty them.

**Service dog path, ESA, registry kits.**
One passport flow, with a service dog step before the reveal, is a good simplification. ESA owners should be told kindly that an ESA flies as a pet (airline pet rules and fees, not as a service dog) and then follow the pet path; no official-sounding language. A tracking code on registry-kit links is fine (a simple `?ref=` or UTM). Don't imply PetPassGo is a registry or is in partnership with one.

**Menu and hidden pages.**
The shorter menu is fine. Hide /community, /discover, /business behind flags if they aren't ready, but don't break URLs that emails already use. /sandbox should stay noindex and unlinked. Add the redirects in the same batch as the menu change.

**Training pick-lists — mismatch for Nima to confirm.**
On Nov 22 (HANDOFF Ideas, commit e0e6313, 01:11 UTC Nov 23), Nima decided the training organization is typed in by the owner: no program dropdown; the trainer is "I trained them myself" or a typed trainer name and business. About three hours later, the live build (cfe192e, 04:31 UTC Nov 23) shipped "A professional trainer" with no name field and "A service dog program" with a dropdown of 18 programs, and the log says "Nima approved with Sisqo's changes," including the public line "Owner says a service dog program trained them," which Nima had said he didn't like. I checked the live code (`lib/training.js`, TrainingCard.js): the dropdown and the "no name" professional-trainer option are what shipped. Either Nima changed his mind with Claude after the Ideas note, or that decision was missed. Nima should confirm which behavior should stay. I have not tested that build in the browser.

**Not tested yet (testing is next, not part of this review):** the training pick-lists build, the passport look (reflective badges and the hologram), the sticky header, and removing "See how it works" from the hero. All are marked Ready for testing.

Ready for Nima to decide.

### 2026-11-22: Built: passport cleanup, pricing, tap-to-open, travel mode, confirm-email fix: test results
Tested live at phone width (~390px, Chrome device mode) and desktop (1280px). Screenshots on Sisqo's computer under `/workspace/petpassgo-review/2026-11-22-build/`. No payment made.

**1. Confirm-email fix: PASS (the bug from the last round is fixed).**
- Signed up logged out from a free LAX→JFK Delta trip as 6dpq5mtb+build-test@mail.grokbot.com. Sign-up button hides; "check your email" shows. Email arrived; link now redirects to /login?confirmed=1.
- Confirmed in a separate Incognito window: it flashed /login?confirmed=1 ("One moment…"), then went straight to /account **already signed in**, with the free checklist, 4 steps and the Benny box. So the "Your email is confirmed. Log in…" note never shows in that case, which is fine because the user is already in. (The note would only matter if the link arrives without a session.)
- Original window, logged in: landed on /account?free_trip=1 then /account with "Your free checklist is ready", 4 steps, "Your pet flies in 21 days", and the Benny box. No "Make an account". /account?tab=trips shows "Your pet · LAX → JFK / Dec 13, 2026 · Delta". The trip survived.
- Small: on phones the trip card title truncates to "Your pet · LAX …" and the tab row clips "Arrival" to "A". The Benny box headline says "your pet's passport" (no name, since the quiz doesn't ask for one).

**2. /login while signed in: PASS.** It goes to /account after a short "Loading…", and no form shows.

**3. /pet-vault sample: PASS.** "See a passport come together" runs through PRINTING → CHECKING → PASSPORT ISSUED. Benny shows with a plain light-blue "SERVICE DOG / Handler statement signed" label under the photo, with no shield, ring or date. It says "This is a sample passport", and the buttons are "Make your pet's passport" and "Close". There's no share button, no gold bits and no rainbow dot. The homepage flip passport uses the same label.
- Note: the static sample on /pet-vault before the reveal still says "Statement not signed yet", which contradicts the finished reveal.

**4. Homepage pricing and lost-pet copy: PASS.** The Free card shows $0, three checkmarks and the green "No card needed" box. Travel Pass shows $29.99, or $14.99 with Pet Vault. Pet Vault shows $6.99 a month with "Make the passport free. We hold it for 7 days. Keep it for $6.99 a month." The cards sit three in a row on desktop. The lost-pet section reads "Your contact info stays private." and "approximate city."
- On phones, the contact bubble sits over the Travel Pass "Plan my pet's trip" button when scrolled there.

**5. /check and travel mode: PARTLY TESTED.** Without a Pet Vault account with documents, tap-to-open and the travel-mode timer couldn't be tested. Bad and old links (`/check/not-a-real-token`, `/check/SAMP-LE7K-Q3XA`) show "This check-in link isn't valid", which is good. But the message still says **"Codes last 30 minutes,"** which is now wrong with the new trip-length link and the 24-hour QR. robots.txt has `Disallow: /check/`.

**6. Contact bubble on /account (phone): PASS.** It's gone from the account page and no longer covers the shortcut cards.

**For Claude, most important first:** (1) change "Codes last 30 minutes" on the invalid /check page; (2) "Statement not signed yet" on the static /pet-vault sample; (3) the trip card title and "Arrival" tab clipping at 390px; (4) the homepage bubble over "Plan my pet's trip" on phones.

**Test accounts to delete (Claude):** 6dpq5mtb+build-test@mail.grokbot.com (first name "Build", one trip LAX→JFK Dec 13, no pet).

### 2026-11-22: Plan: training, trainer and tasks pick-lists: review
Read against the current code on main (lib/training.js, TrainingCard.js, the service-statement API, PetPassport.js, /check, HomePassport.js, and the DOT form filler). Direction is right: free-text trainer and "where trained" fields are how "certified" or "registered" can end up on the passport. Nima decides.

**1. Picking a named program — concern.**
Yes, a pick list lets someone claim Guide Dogs for the Blind (or any other school) trained their dog when it didn't. Putting that name on the passport or the gate page reads like an endorsement, which breaks the owner rule: never imply official status. Don't use program logos.

What I'd do: keep the list for the owner's records, but label it clearly as "Owner says trained by …" everywhere it appears. On the public passport and /check, even when sharing is on, I'd only show "Owner says a service dog program trained them," not the school name. The named program can still fill the DOT form's "Name of Task Trainer or Training Organization" field, with a preview and a reminder that the handler is attesting this is true. "Another program" should stay nameless (no free text). The homepage sample should keep a fictional name ("Sample Service Dog Program"), not a real school.

**2. Task picks — agree, with a few adds and a clear "Other".**
The grouped list is a solid upgrade over today's seven broad groups. I'd add: allergen detection, migraine alert, behavior interruption for PTSD or self-harm (not the same as interrupting anxiety or panic), and counterbalance (or rename the mobility item "Balance, bracing, or counterbalance"). "Other task" needs a clear rule: if nothing can be typed, the owner still has no way to record what the task is, and the DOT form can't describe it. Either allow a short description only for Other, with a filter that blocks words like certified, registered, approved, and official, or make it obvious that "Other" is just a checkbox and they describe the task themselves on the airline form.

On the public passport and /check, showing group names only when the owner turns on sharing is the right call.

**3. Old typed values that "stop showing" — concern.**
Don't silently drop what an owner already entered, and don't delete it from the record. Keep the stored trainer name and location. Show them only to the owner, with a prompt to re-pick from the list if they want that information on the passport. Unmatched free text should stay off the public passport and /check, which is the point. "San Diego, CA" will not match a state dropdown unless you parse it, so this will hit real accounts (and the Benny sample, which uses that location). Past signed statements in `service_dog_statements` should be left as they were.

**4. "Training level" — it's already defined; this plan doesn't need to change it.**
`TRAINING_LEVELS` in lib/training.js is the chip list: house, crate, leash, basic obedience, AKC Canine Good Citizen, public access, and "trained to do tasks for a disability." Those are owner-stated, except CGC, which is a real AKC title someone could also claim falsely. "Public access trained" can sound official too (ADI has a Public Access Test). Same rule: this is what the owner told us, not a certification. Leave the levels as they are unless you want to add the same "owner-stated" caution on CGC and public access.

**5. DOT auto-fill and the statement API — concern, they will break unless updated together.**
The statement API today only allows the seven old task keys and silently keeps the first seven (`slice(0, 7)`). The new list is much longer; a dog with several psychiatric tasks would lose some of them. It also requires a typed `trainer_name` whenever the trainer isn't the owner. If "A professional trainer" has no name field, signing will fail until that rule changes: require a program pick (including "Another program") when they choose a program, and don't require a name for a professional trainer.

DOT auto-fill uses `pet.training.trainer_name` for both trainer fields on the air transportation form. It does not fill a task description today. If `trainer_name` goes away, those fields will come out blank unless you map "I trained them" to the handler's name (already the case), "A professional trainer" to that phrase, and a program pick to the program's official name. Do that in the same change, and show a preview.

`tasksLine` and `trainedByLine` must understand both old group keys and the new specific keys so existing passports don't go blank.

**Programs on the list (Claude's question).**
All 11 in the draft are real, currently operating U.S. programs. Official sites and name notes:

- Guide Dogs for the Blind — https://www.guidedogs.com/ (campuses in San Rafael, CA and Boring, OR; also serves Canada)
- The Seeing Eye — https://www.seeingeye.org/ (Morristown, NJ)
- Guide Dog Foundation (Guide Dog Foundation for the Blind, Inc.) — https://www.guidedog.org/ (Smithtown, NY)
- Canine Companions — https://canine.org/ (formerly Canine Companions for Independence; legal name is still Canine Companions for Independence, Inc.)
- NEADS World Class Service Dogs — https://neads.org/ (formerly National Education for Assistance Dog Services, and later Dogs for Deaf and Disabled Americans; Princeton, MA)
- Paws With A Cause — https://pawswithacause.org/ (formerly Ears for the Deaf, renamed in 1989; Wayland, MI)
- Dogs for Better Lives — https://dogsforbetterlives.org/ (formerly Dogs for the Deaf)
- 4 Paws for Ability — https://www.4pawsforability.org/ (Xenia, OH)
- Freedom Service Dogs of America — https://freedomservicedogs.org/ (Englewood, CO)
- K9s For Warriors — https://k9sforwarriors.org/
- America's VetDogs — https://www.vetdogs.org/ — created by the Guide Dog Foundation in 2003; a separate 501(c)(3) since 2006. They are sister nonprofits and share staff and the Smithtown, NY campus. List both, with a short note that they're related.

Use the current official names on the pick list (Canine Companions, not CCI; Dogs for Better Lives, not Dogs for the Deaf).

Notable missing programs I also verified:

- Leader Dogs for the Blind — https://www.leaderdog.org/ (Rochester Hills, MI)
- Guiding Eyes for the Blind — https://www.guidingeyes.org/ (Yorktown Heights, NY)
- Canine Partners for Life — https://k94life.org/ (Cochranville, PA)
- Can Do Canines — https://candocanines.org/ (New Hope, MN)
- Patriot PAWS Service Dogs — https://patriotpaws.org/ (Rockwall, TX)
- Susquehanna Service Dogs — a program of Keystone Human Services, official page https://www.khs.org/what-we-do/assistance-dogs/ (Grantville, PA). susquehannaservicedogs.org does not resolve.
- Guide Dogs of America | Tender Loving Canines — https://www.guidedogsofamerica.org/ (Guide Dogs of America and Tender Loving Canines merged in 2020; still operating)

Don't add Assistance Dogs International to the trainer list. ADI is an accrediting coalition, not a school that trains a person's dog. Its member directory is a fine way to choose which programs to include, but picking "ADI" would imply official status.

Ready for Nima to decide.

### 2026-11-22: Fixes from Sisqo's DOT test + Benny as service dog: test results
Tested live (www.petpassgo.com), logged out unless noted, at phone width (~390px, Chrome device mode) and desktop (1280px). Screenshots on Sisqo's computer under `/workspace/petpassgo-review/2026-11-22-fixes/`. No payment made.

**1. Free trip (LAX→JFK, Delta, one way, 2026-12-13, one dog, cabin): PASS.** Result opens with only the green "This is a simple flight" box; no "Choose your pass" or price above it. "$0 Your checklist is free" sits below the trip card. Step 6 now reads "Almost done. Then you'll see what this trip needs." Title wraps cleanly at 390px ("Los Angeles → / New York / Delta"), no "LAX → …" or "Del…". Carrier copy and fee/steps/carrier tiles no longer split mid-word. This result has no Pass tab, so the "Arrival" rename wasn't visible here.
- "Yes, I have my ticket": one tap works, with or without cities filled. The earlier two-tap report was a missed tap: the card shifts when a choice changes, so a quick second tap can land on the wrong spot. Not a bug; closing it.

**2. Paperwork trip (LAX→CUN, Delta, cabin): PASS.** "Yes, your dog can fly this trip", then the trip card (Los Angeles → Cancún, Delta), then "This trip needs paperwork", then Travel Pass $29.99 and "Or join Pet Vault + Pass · $21.98".

**3. Free checklist sign-up: FAIL (trip lost).**
- PASS: after submit the "Create free account" button is gone; banner says "Check your email… It brings you right back to your trip." Confirm email arrived from hello@petpassgo.com.
- FAIL: the confirm link (redirect_to=https://www.petpassgo.com/login) landed on `/login#`, logged out, with the plain "Welcome back / Log in to see your pet's profile and trips." The "Your email is confirmed. Log in to get your free checklist." note did not show. The header showed an orange "F" avatar while the form was logged out (inconsistent state).
- FAIL: after logging in, /account showed "Good afternoon, Fix", no pet, and **no trip, no free checklist, no Benny box**. Travel tab: "No trip yet". Opening /assessment restarted at Step 1 of 6. So the LAX→JFK trip from before sign-up was not saved to the account. (In the earlier DOT test the trip did save; this looks like a regression from the change.) The promise "brings you right back to your trip" isn't kept.
- Also: the contact bubble overlaps the lower shortcut cards on /account at 390px.

**4. Contact bubble on phone: PASS.** Hidden on /assessment, /passport/create, /passport/keep and /service-dog-kit/start. Shown and smaller (46×46 vs 56×56 desktop) on homepage, /service-dog, /service-dog/dot-form, /service-dog-kit; at the bottom it no longer covers the last line. Mid-page it still floats over content (e.g. lower edge of Benny's passport), and on /account it covers shortcut cards.

**5. DOT guide buttons: PASS.** /service-dog/dot-form "Have it filled in for you" goes straight to /passport/create in one tap. /service-dog and /service-dog-kit have a pill button "How to fill out the DOT form" to /service-dog/dot-form.

**6. Benny as service dog: PASS.** Homepage flip passport shows the blue SERVICE DOG badge. Also SERVICE DOG on /service-dog-kit; no PET badge found anywhere.

**For Claude, most important first:** (1) pre-sign-up trip not saved after confirm + login, and the confirmed note not showing; (2) "F" avatar showing while logged out on /login; (3) contact bubble over /account shortcut cards on phones.

**Test accounts to delete (Claude):** 6dpq5mtb+fix-test@mail.grokbot.com (first name "Fix", no pet, no trip).

### 2026-11-22: Plan: passport cleanup, pricing cards, tap-to-open documents: review
Read against the current code on main and the live homepage (www.petpassgo.com). Direction is good. A few items should change before building. Nima decides.

**1. Hiding training from /check — concern.**
/check (and travel mode) is what a gate agent sees. Airlines can ask whether a service dog is trained to do tasks; they should not need the trainer's name, city, or the task list. Hiding everything by default goes too far. Always show a short line for service dogs, like "Service dog, handler statement signed." Keep trainer, location, tasks, and training levels off unless the owner turns on sharing. The DOT form stays the real document and should stay visible and tappable. Taking the date off the public passport is fine.

There is already a "Show these tasks on the passport" toggle (`show_tasks` in TrainingCard). Don't add a second overlapping switch; fold it into one control. Grouping Training / Trained by / Tasks into one block on the owner's passport is a good cleanup.

**2. Tap-to-open documents — agree, with privacy limits.**
This is the right way to hand a phone to an agent, better than today's "View the certificate ↗" new tab. The page is already noindex, and files are already served with 30-minute signed URLs from the private `pet-documents` bucket. Before building:

- Travel mode lasts 24 hours (not 12). Anyone who has the link or the unlocked phone can open every file for that whole window. When the owner opens travel mode, say so in one line: anyone who can see this screen can open the files.
- Signed URLs expire in 30 minutes, so a file opened later in a long travel-mode session can break. Mint a fresh short-lived URL when the row is tapped, after checking the token is still valid. Don't put every file URL into the first page load.
- Add `Disallow: /check` to robots.txt (today only the meta tag blocks indexing). Use a strict referrer policy on that page.
- "Other documents" should not dump every leftover file. Import permits and vet letters often have an address or phone. Current upload types are Rabies, Other vaccines, Health certificate, Airline form, Microchip record, and Other — there is no "import permit" or "vet letter" type yet. Only list extra files the owner has marked okay to show at the gate, or stick to the travel docs (health certificate, DOT form, rabies, vaccines).
- iOS: don't rely on a PDF in an iframe; Safari often shows a blank page. Photos can open full screen with a big Close button. For PDFs, use a native open or a real PDF viewer, and always keep an "Open file" fallback. This has to be tested on an iPhone.

**3. Seal under the photo — concern.**
Agree with removing the small rainbow hologram (the HoloSeal under the photo, and the same 26px circle on the PassportReveal). Regular pets should stay clean.

Do not move the current blue/red RoleSeal (shield, gold ring, gradient, "SERVICE DOG" / "HANDLER STATEMENT · DATE") into that photo column. That's exactly where a real passport puts a security hologram, and it will look more official, not less. Owner rule: never certified, approved, registered, or official, and no official-looking certificate. Use a plain text chip under the photo, such as "Service dog · handler statement signed" (no date, no shield, no gold ring). ESA can stay "Emotional support · flies as a pet." Keep the PetPassGo ISSUED stamp as it is; it's already branded.

**4. "Make your pet's passport free. Pay only to keep it." — agree, if the 7 days are in the box.**
This matches how /passport/create works: no card to make the draft, they enter an email, the passport is issued, and it's held for 7 days (`DRAFT_DAYS`). If they don't start Pet Vault at $6.99/mo, the draft expires and they have to make it again. Members already in Vault skip the draft and save straight to the account. The pricing box must say the 7-day hold and the $6.99/mo price, or "pay only to keep it" sounds like a free passport forever. "No card needed" belongs on the Free checklist card only, which is correct.

Live "What it costs" is rendered from `PRICE_CARDS` in `app/page.js`. `components/HomePricing.js` does not exist; `components/home/HomePricing.js` is unused. Don't treat that file as live.

**5. Lost-pet wording — agree, with one honesty tweak.**
"Your contact info stays private" is better, and matches the default (private messages; showing a phone is opt-in). "With roughly where the scan happened" is more accurate than "the area they came from." Scan location is real: only while the pet is marked lost, a coarse city/region/country from Vercel's IP headers, no IP or precise location stored, at most one email an hour, records deleted when marked reunited. The privacy policy already says this. The city can be wrong (VPN, mobile carrier). Say "approximate city" on the homepage, and add one line on the "Publish lost poster" form so the owner sees it before they turn alerts on. That form does not mention scan alerts today.

**6. Sample "Passport issued" reveal — agree, but it's on /pet-vault, not the homepage.**
The "Share Benny's passport" button is on /pet-vault (`VaultPreview` opens `PassportReveal` without `preview`). The homepage uses `HomePassport` (tap to flip only). Fix the reveal on /pet-vault: mark it a sample, buttons "Make your pet's passport" and "Close," and cut the heavy gold-bits effect so the stamp stays smooth. The real create-passport reveal should keep its current "See [name]'s passport" path (`preview={!reveal.petId}`).

**7. Twilio texts — don't block this plan.**
Email alerts for lost-poster views already work (one per hour, with the approximate area). Ship that clearly first. U.S. application-to-person texts need A2P 10DLC (brand and campaign registration, about 1–3 weeks, the fees Claude listed, plus the owner's phone and consent). I wouldn't start that until the rest of this is live and email is clearly useful. Push can wait too.

Ready for Nima to decide.

### 2026-11-22: DOT form guide, member auto-fill, checklist ending, Benny on sample passport: test results
Tested on the live site, logged out unless noted, at phone width (390–400px, Chrome device mode) and desktop (1280px). Screenshots are on Sisqo's computer under `/workspace/petpassgo-review/2026-11-22-dot/`; ask Nima if you need any of them.

**1. /service-dog/dot-form: FAIL (one bug).**
- The page loads and reads well at both widths. Nothing calls PetPassGo, the passport or a pet official, certified, registered or approved. The only such words are "PetPassGo doesn't certify or register service dogs," plus sentences about the DOT form itself being an official government document, which is accurate.
- "Get the free form from DOT" opens https://www.transportation.gov/individuals/aviation-consumer-protection/service-animals/Air_Transportation_Form in a new tab (DOT's form page, which links the PDF). Fine.
- **Bug:** the top "Have it filled in for you" button doesn't go to /passport/create. It only jumps down the page to `/service-dog/dot-form#filled-in`, and "Make my dog's passport" in that section then goes to /passport/create. That's two taps instead of one.
- At 390px the floating contact button covers card text, the "Section by section" heading, the right side of "See the Service Dog Travel Kit" (where "Kit" wraps onto its own line) and the source line.

**2. /service-dog and /service-dog-kit links: PASS, but hard to find.**
- /service-dog: the only guide link is the last sentence of "Emotional support animals," near the bottom ("How to fill out the DOT form, section by section."). It goes to /service-dog/dot-form.
- /service-dog-kit: the link is the two words "Here's how" in "Prefer to fill in the form yourself? Here's how." under "The 4 things airlines check." It goes to /service-dog/dot-form.
- Suggestion: make both of these buttons, not body-text links.

**3. Homepage sample passport: PASS.** Benny's photo (golden retriever in a harness at an airport), "ISSUED NOV 1, 2026" stamp, service dog badge, breed, training and code SAMP-LE7K-Q3XA all look right. "Flip to the QR side" works at both widths. At 390px the contact button covers "Golden Retriever" and the flip control until you scroll. On desktop it nicks the bottom of the passport.

**4. Free checklist ending: PARTLY PASS.** Tested with a real inbox (Sisqo's), so emails were checked too.
- The quiz used: Dog, Pet, has ticket, LAX to JFK one way on 2026-12-13, Delta, direct, one pet, in the cabin.
- **Paid screen first:** right after "See my trip," the first thing on screen was "Choose your pass" ($29.99 Travel Pass, "Or join Pet Vault + Pass · $21.98") with no free option visible. The free result ("This is a simple flight … Your checklist is free $0 … Get my free checklist") showed after that. For a free trip, someone could pay without realizing it's free.
- **Email confirmation is required before the free checklist.** The welcome email ("Confirm your PetPassGo account" from hello@petpassgo.com) arrived within seconds, which is good.
- **Confirm link doesn't keep its promise.** The site says "It brings you right back to your trip," but the link (redirect_to=/login) left the browser logged out on /assessment, showing the saved quiz result. I had to log in myself to reach the trip.
- After logging in, /account showed the trip (Dec 13, Delta, 0 of 4 steps, no pet), but no Benny box. The box only appeared after rerunning the quiz while logged in and tapping "Get my free checklist." Even logged in, that result still says "Make an account and we'll show you how to do each step."
- **Benny box:** the headline is "Want this checklist saved in your pet's passport?" (the plan said "Want this saved in [pet]'s passport?"; there's no pet name because the quiz never asks for one). The body reads "With a reminder before the flight, and everything on one screen at the gate. Pet Vault, $6.99 a month. Cancel anytime." The button "Make your pet's passport" goes to /passport/create. Correct for an account with no pet.
- I couldn't test the "Unlock [name]'s full passport" (/join) version, because the quiz doesn't create a pet.

**5. Member DOT download/email: NOT TESTED.** It needs a paid Pet Vault member, and Sisqo doesn't pay.

**Other issues, most important first**
1. The floating contact button covers live text and buttons at phone width on every page tested (the quiz's "Other / not sure yet" airline and hold option, checklist rows, "Age rule," bottom nav).
2. Phone text breaks: the carrier copy wraps mid-word ("ventilat / ed"), the carrier tile reads "Soft-side / d kennel," the Destination tab clips to "De," the trip title cuts off at "LAX → …" and a breed rule cuts off at "confirm with Del…".
3. "Last question, then you'll see what this trip needs" appears before the direct-or-stop question, so it isn't actually the last question.
4. "Yes, I have my ticket" needed two taps to enable Continue.
5. After submitting sign-up, the button still says "Create free account" next to the "check your email" message.
6. The empty passport on /passport/create still uses the line drawing until a photo is added (just noting it; separate from the homepage).

**Test accounts to delete (Claude):** 6dpq5mtb+dot-test@mail.grokbot.com (first name "Dot", one trip LAX→JFK Dec 13, no pet). Sisqo now uses real tagged addresses on its own inbox, so no more @example.com bounces.

### 2026-11-22: Sisqo on the open questions
1. **Test emails:** agree with switching. Sisqo uses tagged addresses on its own inbox (6dpq5mtb+<tag>@mail.grokbot.com), so it can confirm emails arrive and check their content. Claude deletes the test accounts Sisqo lists.
2. **Preview before publishing:** yes, for anything customers see or pay for. Before Sisqo tests a preview, confirm (a) checkout and emails on preview are safe (Stripe test mode, or clearly not live), and (b) whether the preview is behind Vercel login, in which case send a share link. Small fixes can still go straight to live with a check afterward.
3. **Checking each other's claims:** agree. Bug reports include the page, steps, screen size and screenshot. Neither side marks a fix done until the other has seen it working on the live site.


## Ideas and pushback

### 2026-11-22: Nima's decisions on the pick-list plan + more tasks for the list (from Sisqo)
**Nima decided (relayed by Sisqo):**
- Training organization is typed in by the owner, not picked from a list of programs. No program drop-down.
- Drop the "Owner says a service dog program trained them" wording idea; Nima doesn't like how it looks.
- Old typed values vanishing is fine: there are no real customers yet, so no migration or re-pick prompt needed.
- Trainer: owner picks "I trained them myself" (self-trained) or enters the trainer's name and business.
- Still needed in the same change (Sisqo): the service-statement API and DOT auto-fill must accept the new task keys and the new trainer fields, or the DOT form can come out blank or wrong.

**More tasks to add to the pick-list (Claude, use whatever fits the groups):**
- Medical alert: allergen detection (peanut, gluten, etc.); migraine alert; low blood pressure / fainting (POTS) alert; asthma alert; alerting another person in the home.
- Psychiatric: interrupting self-harm or repetitive behaviors; blocking people from crowding the handler; watching the handler's back in public; room checks (PTSD); alerting to dissociation; leading the handler home.
- Mobility: counterbalance; help standing up; pulling a wheelchair; carrying items; turning lights on and off; helping take off clothes or shoes.
- Hearing: alerting to a phone ringing, a baby crying, or a kitchen timer.
- Vision: stopping at curbs and stairs; finding elevators or crosswalks.
- Autism: interrupting meltdowns; leading the handler home.
- Other: finding the car.

_(none yet)_

## Open questions for Nima

### 2026-11-22: Points from Claude for Sisqo to weigh in on
Nima asked Sisqo to give its thoughts on these. Nima makes the final call.

1. **Test emails to @example.com.** The site sends real emails on sign-up, passport drafts and checklists. Emails to @example.com bounce, and a lot of bounces can push PetPassGo's real emails (receipts, passport links) into customers' spam. Claude suggests test addresses that actually receive mail instead, like a petpassgo.com address that forwards to a test inbox, or plus-addresses on one test inbox. Also: deleting test accounts needs admin access. Claude suggests Sisqo lists the test accounts it made in its results, and Claude deletes them.
2. **Test on the preview before publishing.** Today, changes go live and then get tested, so customers can see a bug first. Sisqo has Vercel access, so Claude suggests: Claude builds on the preview branch, posts the preview link with "Ready for testing", Sisqo tests the preview, and Claude publishes only after it passes. A quick check on the live site after publishing still makes sense.
3. **Check each other's claims.** Nima's rule: anything Claude or Sisqo says gets double-checked before acting on it. If Sisqo reports a bug Claude can't reproduce, Claude says so here with what it tried, and the reverse. Nima decides.

### 2026-11-22: Decided by Nima
- **How Grok (Sisqo) gets plans.** Nima and Claude talk a change through first. Once they agree, Claude posts the plan here ending with `Ready for review` and tells Nima. Nima then asks Sisqo to check HANDOFF.md and give feedback. Claude builds only after Nima approves. Most planning happens between Nima and Claude; Sisqo is the second set of eyes that catches what they miss or flags a wrong direction.
- **Small-fix lane (approved).** Wording fixes, broken links and clear bugs go straight in without a plan, but each one is still logged under "Claude updates" with what to check. Anything new, any pricing change, or anything that changes what a customer sees or pays goes through the full plan process.
