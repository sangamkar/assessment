# Learning Quest: what we have built

*Status as of 20 October 2026*

Learning Quest is a private learning app for Aarav, a kindergartner in Forsyth County, Georgia. It teaches, practises and assesses the skills behind i-Ready, gifted screening, olympiads and STEM challenges. It is built to grow with him from Kindergarten through Grade 2 and beyond. If the family moves, an India (CBSE/NCERT) track with Hindi and Kannada is ready.

- **Live app:** https://sangamkar.github.io/assessment/ (protected by the classroom passcode)
- **Code:** https://github.com/sangamkar/assessment
- **Works on:** any modern browser (Chrome, Firefox, Safari, Edge), on a phone, tablet or laptop.

---

## 1. At a glance

| | |
|---|---|
| Skills (topics) | **108**, from Kindergarten to Grade 2 |
| Subjects | Math, Reading and writing, Science & STEM, Social Studies & Geography, Reasoning & Puzzles, Hindi, Kannada |
| Written questions | **534**, every one reviewed against 11 quality rules |
| Generated questions | 56 skills create fresh questions on the fly (counting, adding, time, money, place value, letters, etc.), so they never run out |
| Assessments | Adaptive check-ups, "Find his level" placement, 3-question skip tests, and a **mock i-Ready** for math and reading |
| Brain games | Mystery Word (hangman), Number Path (LinkedIn Zip style), Sentence Builder |
| Curricula | USA · Georgia + i-Ready (default) and India · CBSE/NCERT |
| Audio | Every question is read aloud; designed for a child who is still learning to read |

---

## 2. How Aarav uses it (kid screen)

**Home screen**
- **Today's Quest (8 questions):** the main daily activity. Each day it picks math, reading and one rotating subject, plus a review question and a puzzle. Topics you pin in the grown-up area come first.
- **Islands:** one per subject: ⛰️ Number Mountain, 🌳 Story Forest, 🔬 Science Lab, 🧭 World Explorer, 🧩 Puzzle Cave, plus Hindi and Kannada when they are switched on. Each island is a map of topic "stones":
  - 🔒 locked: needs the earlier topics first
  - plain stone: ready to start
  - ⭐⭐⭐: in progress, shows his current level (1–3)
  - ⭐: mastered
  - ⚡: skipped because he already knew it
  - ↻: due for a review
- **⚡ Skip ahead** (on each island): tap it, then tap a topic. He gets 3 hard questions; all 3 right and the topic is skipped and the next ones unlock. Finished topics are greyed out in this mode.
- **🧩 Brain Games**: three thinking games that get harder as he wins.
- **⭐ Stars and a day streak** for motivation.

**Inside a practice session**
- 🔊 The question is read aloud; tap the speaker to hear it again.
- He taps an answer, then **✓ Done**.
- Wrong answer: a hint and a second try. Still wrong: a short "let's learn it" explanation.
- New topics start with a short picture intro before the first question.
- Questions never repeat inside a session.

---

## 3. How you use it (grown-up area)

Tap **🔒 Grown-ups** on the home screen and answer the multiplication question. The tabs are:

| Tab | What it's for |
|---|---|
| **Overview** | Progress per subject, recent activity, streak, stars |
| **i-Ready prep** | Set the school test date (early December). See a countdown and a weekly plan. Start or resume a **mock i-Ready**. View past mock reports with an estimated level per domain. Pin the weak areas: **time, money and patterns** |
| **Focus areas** | The mistakes he makes most, by type (e.g. "counts an object twice"), with a concrete tip for each |
| **Check-ups** | Short adaptive tests per subject (12 questions, no hints). Also the **Find his level** placement test, which skips everything he proves he knows |
| **Skill map** | Every topic, with its standard, grade and status. Tick **Knows it** to skip a topic yourself. **Mark all Kindergarten known** does a whole subject at once. 📌 **Focus** pins a topic to the daily Quest |
| **Question bank** | Browse every question with its answer, the misconception behind each wrong choice, and the explanation |
| **Settings** | Child's name and buddy, sound, curriculum (USA / India), Hindi and Kannada on/off, show stretch (higher-grade) topics, unlock all, **backup / restore**, reset |

### Three ways to skip what he already knows
1. **Find his level** (Check-ups tab, or the ⚡ button in Skill map): up to 24 hard questions per subject. It jumps ahead on success and checks back on a miss. Best first step for him.
2. **⚡ Skip ahead** on the kid screen: a 3-question test for one topic.
3. **Knows it** in the Skill map: instant, no test.

A skipped topic comes back once as a review in 2 weeks. If he misses it then, it goes back into normal practice, so a lucky guess fixes itself.

---

## 4. What he learns (skill map)

Grades: K = Kindergarten, 1 = Grade 1, 2 = Grade 2. Topics marked 🇮🇳 appear only with the India curriculum.

| Subject | Areas covered | Skills (K / G1 / G2) |
|---|---|---|
| **Math** | Numbers & counting (to 100+, teens, ten frames, place value to 1000); add, subtract & patterns (number bonds, 2-digit add/subtract, word problems, pattern rules, odd/even, skip counting, equal groups); measurement & data (length, weight, charts, **time** to the hour, half hour and 5 minutes, **coins and money** in $ or ₹); geometry (2D/3D shapes, attributes, position words, composing shapes, halves and fourths) | 44 (22 / 11 / 11) |
| **Reading & writing** | Phonological awareness (rhyme, first/last sounds, blending, segmenting); phonics (letters, CVC words, digraphs, silent e, vowel teams); high-frequency words; vocabulary; comprehension of stories and information texts; reading a passage alone; capitals, punctuation, sentences, grammar | 22 (13 / 7 / 2) |
| **Science & STEM** | Living things, animals and their babies, plants, five senses, materials, pushes and pulls, sky and day/night, rocks and earth, engineering design, weather, life cycles | 12 (10 / 1 / 1) |
| **Social Studies & Geography** | American symbols, holidays, good citizens, community helpers, needs and wants, past/present/future, globes and maps, home address, continents; 🇮🇳 India's symbols, festivals and map | 13 (10 / 3 / 0) |
| **Reasoning & Puzzles** | Odd one out, analogies ("goes together"), picture grids (matrices), what comes next (series), balance puzzles, turn it around (rotation), brain teasers (olympiad-style): the skills behind gifted screening (CogAT-style) and olympiads | 7 (all K) |
| **Hindi** 🇮🇳 | Vowels (स्वर), consonants (व्यंजन), words, numbers, colours | 5 |
| **Kannada** 🇮🇳 | Vowels (ಸ್ವರ), consonants (ವ್ಯಂಜನ), words, numbers, colours | 5 |

All topics map to standards: Georgia GSE and Common Core for the USA, NCERT *Joyful Mathematics* chapters for India.

---

## 5. How the app decides what to teach (the engine)

- **Levels:** each topic has 3 difficulty levels. 2 right in a row → level up; a miss → level down.
- **Mastery:** at least 85% correct over the last 8 tries, including at least 3 at level 2 or higher, spread over at least 3 different days. One good day isn't enough.
- **Spaced review:** a mastered topic comes back after 1, 3, 7, 14 and 30 days so it sticks.
- **Unlocking:** topics unlock when their prerequisites are mastered or skipped.
- **Misconception tracking:** every wrong answer carries a tag such as "reverses teen digits". The Focus areas tab groups them into patterns with a fix.
- **No repeats:** a session never repeats a question; if a topic has few questions, the session is just shorter.

---

## 6. Mock i-Ready

Built to rehearse the school diagnostic before early December.

- **Math:** 32 questions across i-Ready's 4 domains: Number & Operations, Algebra & Algebraic Thinking, Measurement & Data, Geometry.
- **Reading:** 36 questions across 6 domains: Phonological Awareness, Phonics, High-Frequency Words, Vocabulary, Literature, Informational Text.
- **Adaptive like the real test:** it moves up or down a 9-step ladder from Early K to Late Grade 2 as he answers. Domains are mixed, and there are no hints or feedback.
- **Stretch break** every 12 questions. It can be paused and resumed later.
- **Report:** an estimated level per domain (e.g. "Mid Grade 1"), compared with where a kindergartner is expected to be on the test date. A domain is flagged when he hit the top of what the mock can measure.
- **Prep focus:** time, money and patterns can be pinned so they lead the daily Quest.

These are practice estimates, not official i-Ready scores.

---

## 7. Brain Games

| Game | Like | What it builds |
|---|---|---|
| **Mystery Word** | Hangman | Spelling, letter patterns, vocabulary |
| **Number Path** | LinkedIn Zip | Planning, sequencing, spatial reasoning: draw one path through numbers in order, visiting every square |
| **Sentence Builder** | Word tiles | Grammar and sentence structure |

Each game adapts: two clean wins → harder; a loss → easier.

---

## 8. India readiness

Switch it on in **Settings → Curriculum**.
- **India · CBSE/NCERT:** Indian English spelling and voice, ₹ instead of $, and NCERT Class 1 chapter mapping for math.
- **India topics:** national symbols, festivals, map of India, Indian money.
- **Hindi and Kannada** tracks: letters, words, numbers and colours, with native script and audio. If a device has no Hindi or Kannada voice, it reads a romanized version instead and shows a note.
- Background, age/class mapping and the Karnataka Kannada requirement are in `docs/INDIA.md`.

---

## 9. Question quality

Every question follows 11 rules (full list in `docs/VISION.md`). An automatic checker blocks any deploy that breaks them. The main ones:
- Exactly one correct answer, 3–4 choices, shuffled so position gives nothing away.
- Every wrong choice stands for a real mistake a child makes.
- No giveaways: the spoken question, the choice text, the picture, and the name spoken when a picture is tapped must not reveal the answer.
- Reading questions don't read the choices aloud.
- Picture choices for non-readers.
- Every question has a short teaching explanation.

---

## 10. Data, privacy and devices

- **Everything stays on the device.** No accounts, no server, no tracking. Progress is saved in the browser.
- **Each browser keeps its own progress.** Chrome, Firefox, and the phone vs the laptop each have separate progress. To move progress: **Grown-ups → Settings → Backup**, then **Restore** on the other device.
- Clearing the browser's site data erases progress, so take a backup now and then.
- **Passcode:** set from the `CLASSROOM_PASSCODE` repository secret at deploy time. It keeps casual visitors out, but it is not strong security because it ships inside the web page.

---

## 11. How it's built and shipped

- React 19 + TypeScript + Vite + Tailwind, a single web app with no backend.
- Every push to `main` deploys to GitHub Pages automatically, but only after these all pass: the type check, the question checker, and 56 automated tests (mastery, review, placement, mock scoring, no repeats, content rules).
- Before each merge, a full browser run plays every skill, check-up, placement, skip test, mock and game, including on a phone-sized screen.

| Doc | What's in it |
|---|---|
| `docs/VISION.md` | Product vision, design rules for a 5-year-old, question rules, assessment design, roadmap |
| `docs/INDIA.md` | India plan: CBSE/NCERT mapping, languages, sources |
| `docs/PUBLIC-LAUNCH.md` | Checklist if this is ever opened to the public |
| `README.md` | Developer setup, deploy and passcode |

---

## 12. History of what was delivered

| PR | What |
|---|---|
| #1 | Full rebuild: skill map, all questions rewritten, kid UI, mastery engine, grown-up dashboard, India + Hindi + Kannada, Brain Games |
| #2 | Passcode moved to a repository secret |
| #3 | Skip-ahead tools for an advanced learner, Grade 2 content, mock i-Ready, time/money/patterns depth |
| #4 | Fixes: skip-ahead tapping finished topics, repeated questions, picture names giving away answers |
| #5 | 257 new questions so every hand-written topic has at least 10 |

## 13. Open items and next ideas

- **Skip-ahead choice (waiting on you):** should tapping a topic on the kid screen offer an instant "Skip now (grown-up)" option behind the multiplication check, as well as the 3-question test?
- Grow Grade 2 reading and science, and add Grade 1–2 reasoning for gifted screening.
- Sync progress across devices (would need accounts and a server).
- More international curricula (e.g. Singapore) if plans change; see the roadmap in `docs/VISION.md`.
