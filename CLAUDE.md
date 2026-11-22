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

## HANDOFF.md rules
- Only add to it. Never delete or rewrite Sisqo's entries.
- Newest entries go at the top of each section. Date every entry.
- Plain wording, no fluff.

## Standing rules for the site
- Never call a pet, the passport or anything we sell "official", "certified", "registered" or "approved". The DOT form may be described as the government's form.
- The passport may look like a real passport (ISSUED stamp, passport number). The "not a real passport" note lives only in the FAQ and terms.
- Service dog / PSD seal is blue. ESA seal is red and says it flies as a pet.
- Benny, Milo and Cleo are AI characters: always labeled as AI, never shown as real customers. No fake testimonials. Don't name competitors negatively.
- Pet Vault is $6.99/month, monthly only. Travel Pass is $29.99, or $14.99 for members. The free trip check and free checklist stay free.
- Pet Vault always starts the same way: make the passport free first, then pay to keep it.
- Airport help is AI only. Nima can't personally message customers.
- I never enter passwords, keys or tokens. Nima adds secrets in Vercel himself.
- Nima approves purchases, ad spend and database migrations.
- Keep admin@petpassgo.com private.
- Stripe is live: never complete a real payment while testing.
