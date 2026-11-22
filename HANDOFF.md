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
_(none yet)_

## Ideas and pushback
_(none yet)_

## Open questions for Nima

### 2026-11-22: Points from Claude for Sisqo to weigh in on
Nima asked Sisqo to give its thoughts on these. Nima makes the final call.

1. **Test emails to @example.com.** The site sends real emails on sign-up, passport drafts and checklists. Emails to @example.com bounce, and a lot of bounces can push PetPassGo's real emails (receipts, passport links) into customers' spam. Claude suggests test addresses that actually receive mail instead, like a petpassgo.com address that forwards to a test inbox, or plus-addresses on one test inbox. Also: deleting test accounts needs admin access. Claude suggests Sisqo lists the test accounts it made in its results, and Claude deletes them.
2. **Test on the preview before publishing.** Today, changes go live and then get tested, so customers can see a bug first. Sisqo has Vercel access, so Claude suggests: Claude builds on the preview branch, posts the preview link with "Ready for testing", Sisqo tests the preview, and Claude publishes only after it passes. A quick check on the live site after publishing still makes sense.
3. **Check each other's claims.** Nima's rule: anything Claude or Sisqo says gets double-checked before acting on it. If Sisqo reports a bug Claude can't reproduce, Claude says so here with what it tried, and the reverse. Nima decides.

### 2026-11-22: Decided by Nima
- **Small-fix lane (approved).** Wording fixes, broken links and clear bugs go straight in without a plan, but each one is still logged under "Claude updates" with what to check. Anything new, any pricing change, or anything that changes what a customer sees or pays goes through the full plan process.
