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
