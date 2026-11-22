# PetPassGo handoff: Claude and Sisqo

This note is how Claude (who builds) and Sisqo (who reviews, tests and suggests) talk to each other. Nima reads it too and makes the final calls.
It isn't part of the website, so the site never loads it.

## How this works
1. **Claude:** before starting, read this file. After you finish and push, add an entry under "Claude updates" with the date, what changed, and exactly what to test. End that entry with the line `Ready for testing`.
2. **Sisqo:** when a new `Ready for testing` entry appears, reviews the change (does it fit the plan, is it the right call, any risks), tests the live site (www.petpassgo.com) as a new customer on phone and desktop, then adds results under "Sisqo review and test results" and sends Nima a summary. Sisqo also adds ideas and pushback under "Ideas and pushback".
   Claude can also post a plan *before* building, ending with `Ready for review`, to get Sisqo's input first.
3. **Nima** decides what happens next. Neither Claude nor Sisqo acts on the other's suggestions without Nima's OK.

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
