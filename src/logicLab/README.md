# Logic Lab

This is a separate React/TypeScript entry point; it does not alter the learning portal, its saved data, or its navigation.

Run `npx vite --config vite.logic-lab.config.ts --host 127.0.0.1` and open `/logic-lab.html`. Build with `npx vite build --config vite.logic-lab.config.ts`. Progress is stored under `logic-lab:progress:v1`; custom JSON test runs are not persisted.

`core/types.ts` defines the module contract. `core/session.ts` owns session progress and completion subscriptions. Each game owns its headless rules and state. `games/gearworks/solver.ts` computes connected gear motion and conflicts; belts may connect any two occupied pegs and rotate in the same direction. Both engines validate the supplied solution when loading custom JSON. Level editor buttons allow editing, trying and exporting either format.

GravityBuilder uses a small purpose-built deterministic fixed-step physics engine, not Matter.js or Box2D. It models a single ball, ramps, bounce pads, directional fan fields, a floor, and a pressure-operated fixed gate. Every simulation uses 1/60-second steps, independent of rendering rate. It is deliberately not a general rigid-body engine. Its level JSON includes a sample solution; a level is rejected if that solution cannot reach its goal within 600 steps. A missed run preserves its sampled trajectory for editing. The simulation is deterministic for identical inputs within the same JavaScript runtime; cross-engine bitwise identity is not guaranteed.

The two hint tiers reveal a piece and then a target. Tap a gear then a peg; belts connect two occupied pegs. GravityBuilder pieces support dragging to snap zones or selecting a piece and tapping a zone. These early starter games do not implement a comprehensive free-form level editor, arbitrary gear sizes, a drag gesture for gear placement, or advanced rigid-body mechanics. The host may turn sound off independently of the main portal. Reduced-motion settings are respected by the CSS animations.
