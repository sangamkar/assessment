# Learning Quest

A private, audio-first learning app for a kindergartner's screen time. Interactive
puzzles and a design lab complement academic foundations from Kindergarten
through Grade 2.

**Airport Designer:** build and test a virtual airport across five challenges.
Connect gates, extend runways, route around ponds and revise designs. Layouts,
optional explanations, clues and test history save on the device. This replaces
the earlier offline mission cards. See [the screen-time lab guide](docs/GROWTH.md).

> New here? Read **[`docs/OVERVIEW.md`](docs/OVERVIEW.md)**. It explains everything the app does in plain English, for parents.

**New Brain Games:** Word Detective, Target Number, Connections Junior, Balance
Lab and Robot Delivery join Mystery Word, Number Path and Sentence Builder.
Four-round sets support hints, three difficulty levels and saved unfinished play.
See [Brain Games](docs/BRAIN-GAMES.md).

**Daily habit:** the home screen shows a 7-day strip with a gentle streak (one
rest day a week is forgiven), a *Today's path* (learning → a game → free play) and
a sticker book that spends earned stars on cosmetic stickers; days-in-a-row
stickers are free. Grown-ups → Settings → *Daily routine* sets the daily goal
(1–3 sessions), can keep games locked until it is met, and adds an optional soft
screen-time reminder. The parent area reminds you to back up every 14 days.

**Mock questions are separate from practice:** held-out selection and new reading
contexts test the same skills with different tasks. See [question pools](docs/MOCK-QUESTION-POOLS.md)
for exposure tracking and the repeat fallback when unseen items run out.

## What's inside

- **108 skills across 7 subjects:** Math, Reading & writing, Science & STEM, Social Studies & Geography, Reasoning & Puzzles, Hindi, Kannada. They span Kindergarten, Grade 1 and Grade 2.
- **534 hand-written questions,** plus generators that create fresh questions for 56 skills. Every question passes 11 quality rules.
- **Daily Quest:** 8 questions mixing math, reading, a rotating subject, a review and a puzzle.
- **Adaptive engine:** 3 levels per skill, a mastery rule that needs several days of practice, spaced review (1/3/7/14/30 days) and tracking of common misconceptions.
- **Assessments:**
  - adaptive check-ups
  - **Find his level** placement
  - 3-question **skip-ahead** tests
  - a **mock i-Ready** for math (4 domains) and reading (6 domains), with level estimates from Early K to Late Grade 2
- **Eight Brain Games:** Mystery Word, Number Path, Sentence Builder, Word Detective, Target Number, Connections Junior, Balance Lab, Robot Delivery.
- **Two curricula:** USA · Georgia + i-Ready, and India · CBSE/NCERT, which switches to Indian English and ₹ and adds India topics and the Hindi and Kannada tracks.
- **Grown-up dashboard** (🔒 Grown-ups), with these tabs:
  - Screen-time progress and saved airport designs
  - Academic overview
  - i-Ready prep
  - Focus areas
  - Check-ups
  - Skill map (Knows it / Focus)
  - Question bank
  - Settings & backup
- **Private by design:** no accounts and no server. Progress lives in the browser on each device, and is moved between devices with Backup / Restore.

## Docs

| File | What's in it |
|---|---|
| [`docs/OVERVIEW.md`](docs/OVERVIEW.md) | Everything built so far, how to use it, history and open items |
| [`docs/VISION.md`](docs/VISION.md) | Product vision, design rules for a 5-year-old, the 11 question rules, assessment design, roadmap |
| [`docs/INDIA.md`](docs/INDIA.md) | India plan: CBSE/NCERT mapping, Hindi and Kannada, sources |
| [`docs/PUBLIC-LAUNCH.md`](docs/PUBLIC-LAUNCH.md) | Checklist if the app is ever made public |

## Code layout

| Path | What |
|---|---|
| `src/content/` | Skill map and questions, one file per subject (`math.ts`, `math2.ts`, `reading.ts`, `science.ts`, `social.ts`, `reasoning.ts`, `india.ts`, `hindi.ts`, `kannada.ts`, …), plus `curricula.ts` and `misconceptions.ts` |
| `src/engine/` | `progress.ts` (saved state, mastery, skips), `planner.ts` (Quest, sessions, check-ups, placement, skip tests), `mock.ts` (mock i-Ready) |
| `src/games/` | Brain Game logic (Number Path solver, word and sentence data) |
| `src/ui/` | Screens: Home, Island, Player, Results, Parent dashboard, IReadyPrep, QuestionBank, games |
| `src/utils/audio.ts` | Speech (with romanized fallback for Hindi/Kannada) and sounds |
| `src/components/` | Passcode lock, error boundary |
| `scripts/validate-content.ts` | Checks every question against the quality rules |
| `tests/` | Unit tests (engine, content, placement/skip, mock i-Ready) |

## Develop

```bash
npm install
npm run dev        # http://localhost:3000 (passcode: DEV, or set VITE_CLASSROOM_PASSCODE in .env)
npm run lint       # typecheck
npm run validate   # check every question against the design rules
npm test           # unit tests
npm run build
```

When you add questions, append them to the end of a skill's `items` list. Question ids come from their position, and saved progress uses them.

## Deploy & passcode

Pushing to `main` deploys to GitHub Pages, but only after the typecheck, question validation and unit tests pass.

