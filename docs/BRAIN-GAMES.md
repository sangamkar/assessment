# Vocabulary and number games

Brain Games now has eight games: the three existing games plus five new ones.
All play happens on screen. Filter by words/vocabulary or numbers/maths; Robot
Delivery appears in both. No compulsory timers or external AI service is used.

## New games

- **Word Detective:** two new word meanings followed by two new-context sentence
  rounds using those same words. Three difficulty bands contain 24 authored words
  in total. Prompts include all three initial clues so an early ambiguous clue
  does not force guessing. Optional hints give a definition and initial letter.
- **Target Number:** combine two selected tiles, in order, using addition or
  subtraction. Intermediate results replace their operands. Use every original
  tile exactly once. Any arithmetic solution reaching the target is accepted;
  no string evaluation is used. Undo restores the previous tile set.
- **Connections Junior:** select four of eight words to make a category, then
  find the other category. Twelve authored sets cover concrete categories,
  actions, attributes, synonyms and prefixes. Words are spoken when selected.
- **Balance Lab:** choose a missing addend and watch a virtual balance respond.
  Progress from a simple total to equations on both sides, including subtraction.
  The visual balance is learning feedback, not a hidden-answer test.
- **Robot Delivery:** move with directional buttons, pick up parcels and deliver
  to a station. Tasks combine exact counts with twice-as-many/two-more-than and
  nearer/farther from START. Parcels use both color and B/R labels. Incorrect
  deliveries can be revised, and the last parcel can be returned to its source.

Each set has four rounds. A level stays fixed for that set. New sets use the
existing two-clean-wins level progression, bounded to levels 1–3. A solve after a
hint or failed check is recorded as assisted; a deliberate skip records a loss.
The summary describes both assisted and unassisted solves. Only clean wins earn
stars, following the existing game store. These records do not award academic
mastery or claim to measure broader development.

## Saving

The optional schema-2 `brainRuns` field stores seed, fixed level, current round,
operands/undo history, selected words, found groups, robot inventory/position,
hints, mistakes and round status. Refresh or leave a game and return to continue.
Finished sets show a summary with an explicit new-set action. Save normalization
accepts only bounded, internally consistent session shapes. Backup/Restore
includes unfinished sets. Existing games, airport layouts, academic records and
previous portfolios are retained.

Puzzle logic/content lives in `src/games/brain.ts` and `brainContent.ts`; the
shared interactive player is `src/ui/brain/BrainLab.tsx`. Tests cover arithmetic
solutions across many seeds, both connection groups, contextual vocabulary
review, robot reachability/counts, idempotent round completion and save recovery.
