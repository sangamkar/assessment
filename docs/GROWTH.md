# Growth missions: first release

The home screen now starts with a choice of missions. Academic practice, games,
subject islands, placement and i-Ready preparation remain available.

## What is included

- **Run an airport**, **Make a neighborhood**, and **Open a pretend café**:
  four short activities each, across making/thinking, communication,
  independence, movement and cooperation. Most happen away from the screen.
- Each activity has materials, three steps, an example, a clue, another way to
  try, a reflection, parent guidance, supervision requirements and something
  concrete to observe. Related academic practice is optional.
- Children can keep a simple sketch or up to 500 characters of reflection.
  A grown-up can transcribe the child's words. Neither is required.
- Activities save as drafts and resume. Trying again creates a separate entry;
  switching missions retains earlier work. No schedule or daily streak is required.
- **My discoveries** is the child-facing journal. **Grown-ups → Growth review**
  contains observations, history per capability, a journal filter and a monthly
  conversation prompt. The academic overview remains separate.

## What the records mean

`I tried it` is the child's report of an experience, not proof of competence.
There is no automatic mastery, star award, personality score or academic credit
for a growth activity. Opening a coaching prompt does not measure adult help.

Parent observations require written evidence and distinguish support from the
stage observed: Exposure, Exploration, Foundational competence, Independent
application, and Mastery / specialization where useful. Stages describe a
specific capability in context, not a permanent judgment of the child. Earlier
observations remain available even when a later observation is at an earlier
stage. Shared capability names allow observations from different activities
(for example, pretend-trip packing and school-bag packing) to appear together.

Counts reflect app records only. A zero does not mean a child lacks opportunities
outside the app. Keep documenting optional; a brief occasional observation is enough.

## Storage and compatibility

- State schema version 2 adds `growth` to existing progress. Version 1 backups
  are upgraded in place without changing attempts, stars, skills or settings.
- The existing storage key `learning-quest:v1` is retained intentionally so
  existing users' data is discovered. It names the storage location, not the schema.
- Backup / Restore includes mission choices, draft sessions, sketches, reflections
  and observations. Import sanitizes growth records without discarding academics.
- Everything stays in browser storage. There is no photo/voice upload, account,
  cloud sync, AI chatbot or external analytics in this release.
- Storage failures show a banner directing the parent to export a backup while
  the current state is still in memory. Clear browser data only after backing up.
- An older app cannot import a version 2 backup. Keep a pre-upgrade backup if
  testing an older build. Sketches are bounded per session; repeated sessions can
  eventually fill browser storage, making regular backups useful.

## Implementation

- `src/content/missions.ts`: typed activity catalog, five opportunity domains.
- `src/engine/growth.ts`: session lifecycle, parent evidence and import normalization.
- `src/ui/growth/`: mission selection, activity player, drawing pad and portfolio.
- `tests/growth.test.ts`: migration, evidence boundaries, resumption, revisits,
  backup round trips, input normalization and working academic links.

New missions are authored content, not runtime-generated advice. They are designed
for this family's early-elementary context; these activity records are not a
validated developmental assessment.

## Family trial

Choose one mission and try one activity at a time within existing family time.
Over two weeks, notice whether the child chooses to return, contributes his own
ideas, uses a skill with fewer prompts, and whether parent effort stays manageable.
Use that feedback before adding more themes or more complex recording features.
