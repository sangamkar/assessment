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

The optional schema-3 `brainRuns` field stores seed, fixed level, current round,
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

## Learning workshop

Five more games bring the catalog to 13. All are on-screen, use four-round sets, support three game difficulty bands, save on this device and in schema-3 backups, and record independent/assisted/skipped results without awarding academic mastery.

- **Shape Builder:** choose squares or right triangles, rotate triangles, place or erase pieces on a 4×4 mosaic. Match rocket, boat, house and butterfly models (including mirrored versions). Level 1 supplies all outlines; level 2 supplies square outlines; level 3 uses the separate model only. Exact cells and orientations matter.
- **Clock Quest:** set hour and minute controls and watch both analog hands move. Whole hours → half-hours → quarter-hours. This teaches clock reading; it does not yet teach elapsed time or AM/PM.
- **Pattern Machine:** supply the next two shapes in AB → AAB/ABB → ABC/ABAC repeating patterns. Shape identity, not color alone, carries the rule. Undo, explanations and hints are available.
- **Sound Switch:** substitute the first → last → middle sound of curated short words. One spoken mission names the starting and target pictures. Tap a replacement letter for immediate feedback. A correct swap transforms the picture. The mission also has a text version. Letters remain visible, so this combines sound substitution with phonics rather than measuring unaided phonemic awareness. Device speech quality/pronunciation varies; no microphone or recording is used. Six word pairs per level can recur.
- **Water Pipes:** rotate straight and elbow pipes to link a fixed tap to a fixed flower on 3×3 → 4×4 → 5×5 grids. Water flows after every turn, and completing the route grows a flower. The opening level-one round highlights one pipe and records the guided move as assisted. Water only succeeds through reciprocal pipe openings; touching the destination without a connected route never counts. Any working route is accepted. Skip displays a solved route. Every generated board is solvable by rotating existing pieces and starts unsolved. No time limit or water-loss penalty.

Browser QA fixture (Vite only): `/tests/workshop-preview.html`. It uses isolated `workshop-qa` data, never the child's application state. It is not an entry point in the Pages build. Automated coverage is in `tests/workshop.test.tsx`.
