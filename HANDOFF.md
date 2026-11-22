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
