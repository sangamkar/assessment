# Logic Lab

Logic Lab is available from Brain Games in the learning portal. It uses the portal’s existing mute setting and sound engine, and stores game progress under its own key without changing academic progress or the saved profile. A separate React/TypeScript entry point remains available for local development.

Run `npx vite --config vite.logic-lab.config.ts --host 127.0.0.1` and open `/logic-lab.html`. Build with `npx vite build --config vite.logic-lab.config.ts`. Progress is stored under `logic-lab:progress:v1`; custom JSON test runs are not persisted.

`core/types.ts` defines the module contract. `core/session.ts` owns session progress and completion subscriptions. Each game owns its headless rules and state. `games/gearworks/solver.ts` computes connected gear motion and conflicts; belts may connect any two occupied pegs and rotate in the same direction. Both engines validate the supplied solution when loading custom JSON. Level editor buttons allow editing, trying and exporting either format.

GravityBuilder uses a small purpose-built deterministic fixed-step physics engine, not Matter.js or Box2D. It models a single ball, ramps, bounce pads, directional fan fields, a floor, and a pressure-operated fixed gate. Every simulation uses 1/60-second steps, independent of rendering rate. It is deliberately not a general rigid-body engine. Its level JSON includes a sample solution; a level is rejected if that solution cannot reach its goal within 600 steps. A missed run preserves its sampled trajectory for editing. The simulation is deterministic for identical inputs within the same JavaScript runtime; cross-engine bitwise identity is not guaranteed.

The two hint tiers reveal a piece and then a target. Tap a gear then a peg; belts connect two occupied pegs. GravityBuilder pieces support dragging to snap zones or selecting a piece and tapping a zone. These early starter games do not implement a comprehensive free-form level editor, arbitrary gear sizes, a drag gesture for gear placement, or advanced rigid-body mechanics. The portal passes its existing mute setting to Logic Lab; the local standalone entry has its own sound control. Reduced-motion settings are respected by the CSS animations.

## GearWorks campaign

GearWorks now has 30 playable levels: 10 Starter, 10 Explorer and 10 Master. The original five IDs and layouts are retained, so existing completion records remain valid. GravityBuilder's five starter levels are unchanged.

- Starter: contacts, different sizes, corners and the first direction target.
- Explorer: mixed-size routes, turning parity, shared hubs and separated islands.
- Master: longer plans, spare pieces, multiple branches and limited-reach belts.

Goal arrows show the required rotation; an orange gear merely turning is insufficient when it has an arrow. Selecting a belt and a first peg shows its reach. Remove selected returns a piece to inventory (and disconnects attached belts); Undo restores the previous arrangement. Hints identify blocking pieces and misplaced belts so experimentation remains recoverable. Next puzzle advances after success; all levels remain available for free choice and replay. On narrow screens, the gear board scrolls horizontally to keep adjacent touch targets separated.

Tests load and solve every authored level through the module API, reject pre-solved starting states, check direction and reach rules, and ensure no intended gear is redundant in the no-belt routes. Alternate valid solutions are allowed. These are authored difficulty tiers, not calibrated measures of a child's ability.
