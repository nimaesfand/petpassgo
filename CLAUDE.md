# Working on PetPassGo

Read this every session before doing anything else.

## Start of every session
1. `git pull` on `main`, then read `HANDOFF.md` at the repo root from top to bottom.
2. Look for: Sisqo's reviews of my plans, Sisqo's test results, Nima's decisions, and open questions.
3. Fix or answer anything Sisqo flagged before starting new work. If I disagree with Sisqo, I explain why in HANDOFF.md. Nima decides.

## The process, every time
1. **Plan first.** Before building anything, add a dated plan at the top of "Claude updates" in HANDOFF.md: what I want to change, why, and which pages it touches. End it with `Ready for review.` Then stop. Don't build yet.
2. **Sisqo reviews** the plan (opinion, pushback, ideas). **Nima makes the final decision.**
3. **Build only after Nima approves.**
4. **After building**, add an entry at the top of "Claude updates" with what changed and exactly what to test (pages, steps, what should happen). End it with `Ready for testing.` Sisqo tests the live site and writes results in HANDOFF.md.

## Small-fix lane (approved by Nima)
Wording fixes, broken links and clear bugs can go straight in without a plan. Still log each one under "Claude updates" with what to check. Anything new, any pricing change, or anything that changes what a customer sees or pays goes through the full plan process.

## Check claims, both ways
Anything Sisqo reports (or I claim) gets checked before acting on it. If I can't reproduce what Sisqo found, I say what I tried in HANDOFF.md. Nima makes the final call.

## HANDOFF.md rules
- Only add to it. Never delete or rewrite Sisqo's entries.
- Newest entries go at the top of each section. Date every entry.
- Plain wording, no fluff.

## Standing rules for the site
- Never call a pet, the passport or anything we sell "official", "certified", "registered" or "approved". The DOT form may be described as the government's form.
- The passport may look like a real passport (ISSUED stamp, passport number). The "not a real passport" note lives only in the FAQ and terms.
- Service dog / PSD seal is blue. ESA seal is red and says it flies as a pet.
- Benny, Milo and Luna (renamed from Cleo, Nov 25) are our characters: never shown as real customers, never in reviews or testimonials. Sample passports are marked SAMPLE. No "AI character" captions on the site (Nima, Nov 25). No fake testimonials. Don't name competitors negatively.
- Pet Vault is $6.99/month, monthly only. Travel Pass is $14.99 and always comes with Pet Vault (first trip $21.98). The standalone $29.99 pass is retired (Nima, Nov 23): never show $29.99 to customers.
- Nothing is free (Nima, Nov 25). Never say "free" to pet owners. Only exception: the My pet page line about checking a small pet's cabin trip. The service dog line "flies with you, free" is a fact about airlines and stays. Business listings for businesses and vets stay free. Simple trips (small pet in the cabin, inside the U.S.): the step-by-step checklist comes with Pet Vault, no Travel Pass. Harder trips need a Travel Pass. Everything needs an account, and accounts start with Pet Vault (Nima, Nov 25). Lost flyer reward: whatever the owner types, nothing by default.
- Pet Vault starts with making the passport, then paying to keep it. No 7-day hold: they keep it then and there, or start over (Nima, Nov 25).
- No "coming soon" anywhere. Hide a feature until it works.
- Airport help is AI only. Nima can't personally message customers.
- I never enter passwords, keys or tokens. Nima adds secrets in Vercel himself.
- Nima approves purchases, ad spend and database migrations.
- Keep admin@petpassgo.com private.
- Stripe is live: never complete a real payment while testing.
