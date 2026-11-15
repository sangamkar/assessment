# Touch games in Brain Games

## Scope and dependencies

- GearWorks retains its 30 validated levels and headless gear solver. Its board rotates upright when useful, centers/crops unused space, and fits a phone without horizontal scrolling. Children can drag an inventory gear with a visible finger-following preview and magnetic drop, or select a gear and tap a peg. Early instructions use small/medium/large labels, a gesture demonstration and replayable spoken help. Completion starts a propeller animation.
- Water Rescue selectively restores the pipe generator/tracer from PR #16, with a new isolated MiniGameModule and renderer. There are 24 reproducible puzzles: eight each on 3×3, 4×4 and 5×5 boards. Water updates after every turn; hints identify a pipe, then show its desired orientation. Any valid route is accepted.
- Shape Builder selectively restores mosaics, with 18 challenges. Starter uses guides, Explorer uses a reference picture, and Master uses mirrored pictures. The first puzzle needs only four pieces. Drag or tap to place, turn triangles, erase, undo and reset.
- Dots and Boxes supports two people sharing one device or a computer opponent. Draw between neighboring dots, tap two neighboring dots, or tap a line. Choose 2×2, 3×3 or 4×4 boxes. Closing one or two boxes retains the turn; a completed board reports scores without a failure screen. Gentle computer chooses legal moves; Thinking takes boxes and avoids third sides when possible. It is not a minimax opponent. Undo returns to the preceding human decision in computer mode. Pending computer moves stop on exit/reset.

New screens use the existing React/TypeScript application and scoped Logic Lab styles. Three entry cards are added inside Brain Games; global navigation and academic question interaction are unchanged. No daily lock, sticker economy, airport or offline-activity dependency is restored.

## Sound boundary

Games call a small adapter around the existing singleton sound engine. Opening a game or unmuting requests playback directly from a user gesture. Placement, pipe turns, drawn lines and completion request existing feedback sounds. Help uses the existing speech method; mute uses the portal setting and immediately updates the same engine. Gear jam feedback now originates in its input action instead of a render effect, and the standalone per-jam AudioContext is removed.

`src/utils/audio.ts` and academic question-player speech are unchanged. This does not restore any earlier Chrome speech patches or establish that phone Chrome narration is fixed. Automated tests cover muted playback suppression and restricted audio. Chromium touch checks verify playback requests and mute persistence; audible playback on a physical phone remains unverified.

## Saved data

No academic schema migration is needed. New active boards live under separate `learning-quest:tinker:v1:<game-id>` keys. Each stores a validated level/configuration, legal action history and hints used. Loading reconstructs a module by replaying the actions; malformed or impossible histories are rejected and retained until the user starts a replacement game. Storage failures show a message without blocking play.

Puzzle completion/stars use the existing `logic-lab:progress:v1` namespace without replacing prior GearWorks/GravityBuilder entries. Dots scores describe a match, not academic mastery. `learning-quest:v1` and `learning-quest:v1:before-rollback` remain intact; no old removed-game histories are automatically imported from that rollback copy. A selected game can resume through Continue saved game after reload. Existing academic backup/export behavior is unchanged; these separate game saves are device-local and are not added to academic exports by this change.

## Validation

- Typecheck, content validation (156 skills / 336 mock-only items), 211 unit tests and production build.
- Rules: two-box scoring, extra turns, duplicate/invalid line rejection, both computer strategies through all board sizes, undo, adjacent-dot drawing, all 24 water levels, 600 generated pipe routes and all 18 mosaics.
- Persistence: legal replay for each game, hint preservation, corrupt/blocked storage, prior gear stars and untouched academic/rollback keys.
- UI: portal entry points, scoped styles, shared mute and magnetic snapping. Headless Chromium with synthetic touch covers gear drag, puzzle completion, line drawing, computer response, saved-game resume and phone sizing. These are browser interaction checks, not a child usability study or physical phone audio validation.
- Existing main-bundle size warning remains; added game screens are lazy-loaded.
