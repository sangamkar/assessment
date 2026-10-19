# Learning Quest

Audio-first learning, practice and adaptive check-ups for a kindergartner, built to grow through Grade 2+.
Covers math, reading, science/STEM, social studies & geography, and reasoning puzzles, aligned to
Georgia standards and the i-Ready domains.

- Product vision, design rules and question-writing rules: [`docs/VISION.md`](docs/VISION.md)
- Content (skill map + questions): `src/content/` — one file per subject
- Engine (mastery, spaced review, Quest planner, Check-up): `src/engine/`
- UI: `src/ui/`

```bash
npm install
npm run dev        # http://localhost:3000
npm run validate   # lint every question against the design rules
npm run lint       # typecheck
npm run build
```

Grown-ups: tap **🔒 Grown-ups** on the home screen for the dashboard (progress, focus areas,
check-ups, full skill map, question-bank review, settings and backup).
