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
_(none yet)_

## Sisqo review and test results
_(none yet)_

## Ideas and pushback
_(none yet)_

## Open questions for Nima
_(none yet)_
