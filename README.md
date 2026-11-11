# Learning Quest

A private, audio-first learning app for a kindergartner who is ahead of grade level. It teaches, practises and assesses the skills, and grows with him from Kindergarten through Grade 2.


> New here? Read **[`docs/OVERVIEW.md`](docs/OVERVIEW.md)**. It explains everything the app does in plain English, for parents.

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
- **Brain Games:** Mystery Word (hangman), Number Path (LinkedIn Zip style), Sentence Builder.
- **Two curricula:** USA · Georgia + i-Ready, and India · CBSE/NCERT, which switches to Indian English and ₹ and adds India topics and the Hindi and Kannada tracks.
- **Grown-up dashboard** (🔒 Grown-ups), with these tabs:
  - Overview
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

