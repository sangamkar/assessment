# Learning Quest — Product Vision & Design Rules

A learning, practice and assessment app for one kindergartner (and later, any
child), built to grow with him from K through Grade 5.

## 1. Goals

| Goal | What it really measures | How the app serves it |
|---|---|---|
| **i-Ready Diagnostic** (Math + Reading) | Grade-level achievement, adaptive | Skill map aligned to i-Ready domains + Georgia standards; adaptive **Check-up** mode that mimics i-Ready's no-feedback format |
| **Gifted screening** (Georgia multiple-criteria: mental ability, achievement, creativity, motivation) | Reasoning, not memorized facts | **Puzzle Cave**: classification, analogies, matrices, series, quantitative balance, spatial — built as *reasoning practice*, never test-item drilling |
| **Olympiads** (e.g. Math Kangaroo from Gr 1) | Non-routine multi-step problem solving | "Brain Teaser" skills with hints and an explanation for every answer |
| **STEM challenges** | Curiosity, design, explaining thinking | Science Lab skills now; off-screen build/test/improve project cards next (roadmap) |
| **Science, Social Studies, Geography** | Content knowledge + vocabulary (which drives later reading comprehension) | Science Lab and World Explorer islands aligned to Georgia GSE |

## 2. Core model: one skill map, many uses

```
Skill map (K → Gr 5)  ──►  Items (hand-written or generated)  ──►  Modes
  subject · strand          tagged to ONE skill                    Learn (intro slides)
  grade · standards         difficulty 1–3                          Practice (Today's Quest)
  prerequisites             misconception tag per wrong choice       Check-up (adaptive, no feedback)
  parent tip                explanation for feedback                 Parent dashboard
```

* **Skills are data, not code.** Adding Grade 1 or a new subject = adding a file in
  `src/content/`. Nothing in the engine or UI names a specific subject or grade.
* **Prerequisites** create the "ready to learn next" list: a skill unlocks when all
  of its prerequisites are being practised or mastered.
* **Two kinds of items**
  * *Generators* for procedural math (counting, comparing, adding, number bonds…):
    correct by construction, endless fresh practice, distractors computed from
    known misconceptions (off-by-one, added instead of subtracted, counted by 1s
    instead of 10s…).
  * *Hand-written items* for concepts and content (shapes, phonics, stories,
    science, social studies, reasoning).

### Standards

Math uses the **Georgia K-12 Mathematics Standards (2023)** codes, verified through
the Learning Commons standards service: `K.NR.1–5`, `K.PAR.6`, `K.MDR.7`, `K.GSR.8`,
and Grade 1 `1.NR.1`, `1.NR.2`, `1.PAR.3`, `1.GSR.4`, `1.MDR.6`.

Reading uses Common Core foundational/literature/informational codes (`RF.K.2a` …),
which map closely to Georgia's ELA standards and to the i-Ready reading domains.
Science and Social Studies use Georgia GSE codes (`SKL1`, `SSKG2` …).
**TODO:** cross-check the ELA, Science and SS codes against the current GaDOE
documents before relying on them for reporting.

## 3. Design rules for a 5-year-old

1. **Audio-first.** Every prompt is spoken automatically and can be replayed with
   the big speaker button. A question is never blocked by reading, unless reading
   is the skill being measured.
2. **Pictures over words.** Choices are pictures, numbers or shapes. Words appear
   only when the skill is about words.
3. **Tap to choose, then press Done.** This mirrors i-Ready, prevents accidental
   answers, and lets him hear a choice's name before committing.
4. **Short sessions.** Today's Quest = 8 questions (≈10 minutes), ending on a success.
5. **Feedback that teaches.** Wrong first try → a hint and the wrong choice fades
   out, try again. Wrong second try → the right answer is shown and *explained*.
   Only first-try answers count toward mastery.
6. **Effort rewards, not speed.** Stars for finishing and for careful work; no
   timers in practice.
7. **Mastery means it stuck.** A skill is *mastered* when, across its recent
   attempts, accuracy ≥ 85% at difficulty ≥ 2 **with correct answers on at least 3 different days within the last 3 weeks**.
   Mastered skills come back as spaced review (1, 3, 7, 14, 30 days).
8. **Mixed review.** Each Quest mixes the focus skill with 2 review items and 1
   stretch item.
9. **Grown-up gate.** The parent area sits behind a simple adult-only check.

## 4. Rules every question must follow

These rules come from auditing the original 127-item bank. The validator
(`npm run validate`) enforces the ones a script can check.

| # | Rule | Problem found in the old bank |
|---|---|---|
| Q1 | **No answer giveaways in choice text.** | `'Dogs (5 votes - tallest bar)'`, `'3 more students (5 - 2 = 3)'`, `'pig (does NOT rhyme with fan and pan)'`, `'2 chicks (that is the sheep count)'` |
| Q2 | **The spoken prompt must not answer the question.** | "Which is longer: the **long** yellow pencil or the **short** red crayon?"; "How many more…? **Five minus two.**" |
| Q3 | **Don't read the choices aloud when reading is the skill.** | Sight-word items said "Choose *see*, *you*, or *he*", which turned reading into listening |
| Q4 | **Picture choices for non-readers.** | "What makes a square a special type of rectangle?" with sentence-long text answers |
| Q5 | **Every wrong choice maps to a real misconception** (accurate tag). | Counting dots tagged `side_counting_error`; skip-counting tagged `attribute_misunderstanding` |
| Q6 | **3–4 choices; no position bias.** Choices are shuffled; numeric choices are sorted ascending. | Correct answer was choice #1 in most items; many items had only 2 choices (50% guess rate) |
| Q7 | **One skill per item**, matching its standard and grade. | Grade 1 standards (`1.MD.B.3` telling time) mixed into K without a stretch flag |
| Q8 | **Visual stimulus must match the question** and must not label the answer. | Measurement visual labelled "Yellow Pencil (18 cm long)" |
| Q9 | **Unambiguous single answer.** | "Two right triangles make… *A Square or Rectangle*"; window shape "Square" for a four-pane window |
| Q10 | **No isolated phonemes via text-to-speech.** Speech engines can't say /b/ cleanly, so sound items use picture words ("starts like 🐻 bear"). | "Is it /b/, /d/, or /m/?" was read aloud as "slash b slash" |
| Q11 | **Every item has a teaching explanation** used as feedback in practice. | None existed |

## 4a. A child who is ahead

Aarav already counts and writes past 100, adds 2-digit numbers, reads storybooks alone and
writes sentences, so the app must never make him grind through basics:

| Tool | Who uses it | What it does |
|---|---|---|
| **Find his level** (placement) | Parent, per subject | Tests upward through each strand with 2 hard questions per step, jumping 2 skills on a pass, backfilling once on a miss; max 24 questions. Passed skills are skipped. |
| **⚡ Skip ahead** | Child, on any stone (even locked) | 3 hard questions; all right → skipped. |
| **Knows it** / **Mark all Kindergarten known** | Parent, Skill map | Skip by judgement, one skill or a whole grade band. |

Skipped skills count as mastered (they unlock what comes next) but return **once** as a review
two weeks later; a miss puts them back into practice. Guesses and over-generous ticks self-correct.

The ceiling was raised to match: **Grade 2 math** (place value to 1,000, 2–3-digit addition and
subtraction with regrouping, skip counting, odd/even, equal groups, time to 5 minutes, US coins,
two-step word problems) and **reading he does himself + writing** (vowel teams, independent
passages, capitals, end punctuation, complete sentences, grammar), plus the **Sentence Builder** game.

## 4a-2. Mock i-Ready and test prep

Next school i-Ready: early December. The **i-Ready prep** tab gives:

* **Mock i-Ready** (Math ~32 questions, Reading ~36): read aloud, no feedback, adaptive *within each
  i-Ready domain* on a 9-step ladder (K / Grade 1 / Grade 2 × difficulty 1–3), big steps first and
  then small ones. A stretch break every 12 questions; he can stop and resume another day. The
  result is an estimated level per domain ("Mid Grade 1"), compared with where a Kindergartner is
  expected to be at the test date, with a history table to show growth. When he answers the hardest
  questions the app has in a domain, the label gets a “+” (the real level may be higher). These are
  estimates from the app’s own questions, **not** i-Ready scale scores.
* **Test date + schedule:** countdown; baseline mock now, a mid-point mock 3 weeks out, a final mock
  1 week out, and a rest day before.
* **Focus pins:** one pinned skill leads every daily Quest, rotating. One tap pins **time, money and
  patterns** (his weaker areas): Day and week (K.PAR.6), Tell time, Time to 5 minutes, Coin names
  (1.MDR.6), Coins, Patterns, Pattern rules (1.PAR.3) and Growing patterns.

## 4b. Brain Games

Games are learning in disguise. Each one targets named skills and adapts on its own
level (two clean wins → harder, a loss → easier, solving with many hints → no change).

| Game | Like | Builds | Levels |
|---|---|---|---|
| **Mystery Word** | Hangman, without the hanging: a flower loses petals | Phonics encoding: hear each sound, pick its letter, left to right (RF.K.2, RF.K.3) | CVC → blends/digraphs/long vowels → 5-letter words; extra tiles include look-alike letters (b/d, m/n) |
| **Sentence Builder** | Word-order puzzles | Writing: build a heard sentence word by word; capital first, end mark last; level 3 adds grammar traps (ran/run, mice/mouses) | 3–4 words → 5–6 → 7–8 with a trap tile |
| **Number Path** | LinkedIn *Zip* | Number order (K.NR.2), planning ahead, spatial reasoning (gifted/Olympiad thinking) | 3×3 → 4×4 → 5×5 grids, more numbers |

Puzzles are generated, and the validator proves every generated Number Path is solvable.
Ideas for next games: *Shape Sudoku* (4×4 with pictures), *Odd-one-out Connections*
(group 8 pictures into 2 sets of 4), *Hindi Mystery Word*.

## 5. Assessment design (Check-up)

* One subject at a time; 2 items per strand, adaptive within the strand
  (correct → harder, wrong → easier), no feedback, neutral transitions.
* Report per strand: **Strong / On track / Growing / Needs practice**, the
  misconceptions behind wrong answers, and the next skills to practise.
* Skills answered correctly at difficulty 3 are credited as *practising*, so
  Quests don't waste time re-teaching them.
* This is a practice signal, **not** an i-Ready scale score. The app does not
  invent scale scores or percentiles.

## 6. Ethics of gifted prep

Reasoning skills (patterns, analogies, spatial thinking, flexible classification)
are worth building, and they last. Drilling CogAT/NNAT look-alike items until the
format is familiar can raise a score above true ability and place a child in a
pace that later frustrates him. Puzzle Cave teaches the *thinking*, with varied
formats and explanations. It is not a test simulator.

## 7. Roadmap

| Phase | Scope | Status |
|---|---|---|
| 1. Foundation | Skill map, new item schema, all questions rewritten, validator, kid UI (island map, Quest player), mastery + spaced review, Check-up, parent dashboard, backup/restore | **This change** |
| 2. Breadth | More items per skill (target 8+), drag-and-drop and ordering interactions, tracing letters/numbers, recorded human audio for phonemes | Next |
| 3. Depth | Grade 1 → 2 content, Math Kangaroo-style puzzle track, STEM project cards (photo/voice log), creativity prompts | Later |
| 3b. International | Curriculum overlays: **India (CBSE/NCERT) done** — Hindi Garden, rupees, India general awareness, Indian-English locale. Next: Hindi मात्रा, NCERT EVS, Cambridge Primary. See [INDIA.md](INDIA.md) | In progress |
| 4. Platform | Cloud sync (Supabase/Firebase), multiple children, AI-assisted item drafting with human review, weekly email summary. Public launch only after a closed trial — see [PUBLIC-LAUNCH.md](PUBLIC-LAUNCH.md) | Later |

## 8. Code layout

```
src/content/         skill map + items (one file per subject)
  types.ts           Skill, Item, Visual, Choice
  math.ts reading.ts science.ts social.ts reasoning.ts
  hindi.ts india.ts  region-only skills (shown when India is switched on)
  curricula.ts       curriculum overlays: grade names, locale, standard references
  index.ts           registry + subject metadata
src/engine/          rng, progress store, mastery, Quest planner, Check-up
src/games/           Brain Games logic (word bank, Number Path generator)
src/ui/              kid + parent screens
scripts/validate-content.ts   content linter (npm run validate)
```
