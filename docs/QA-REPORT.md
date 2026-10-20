# QA report: system test, kid and grown-up profiles

*Run on 20 October 2026, against `main` at 809369c.*

**Verdict:** works end to end on a laptop. On a **phone** the answer cards are broken, and there is **one dead-end screen** (Hindi/Kannada check-up on a US profile). Most of the remaining findings are India-English gaps.

## What was tested

| Area | Coverage |
|---|---|
| Build gates | `lint`, `validate`, `test` (56 unit tests), `build`: all pass |
| Kid profile, USA | Every visible skill (95) opened from its island and played to the end on a 390 px phone screen: intro, questions, hint, "Let's learn it", results |
| Kid profile, India | Every visible skill (105), including Hindi and Kannada, played the same way. Run both with Hindi/Kannada voices and without them (romanized fallback) |
| Kid flows | Passcode, first-run setup, reload persistence, locked stones, Skip ahead (3-question test), Today's Quest, stop/keep-going dialog, results and stars, Brain Games (all 3) |
| Grown-up profile | Gate (wrong/right/back), all 7 tabs at 1280 px and 390 px, Question bank (all 108 skills), Skill map (Knows it, Focus pin, Mark all K), check-ups for every subject, Find his level, mock i-Ready Math (pause → resume → finish) and Reading, backup/restore (valid and invalid file), reset, switching to India + Kannada |
| Content | All 534 written questions plus 33,600 generated samples (200 per skill per level), checked for code leaks, punctuation, answer-key/explanation mismatch, giveaways, language script, romanized fallback and India localization |

In total: 1,418 questions answered in the browser, 4,904 spoken lines captured and checked, and 217 sessions finished. No JavaScript errors and no `undefined`/`NaN` on screen or in speech.

## Findings

### High

1. **Answer cards overflow on phones.** At 390 px the choice grid is always 3 columns, and the text choices use `text-4xl` for anything up to 14 characters. Words spill into the neighbouring cards ("Wednesday", "Australia", "Antarctica", "quadrilateral", "pentagon"). Counting pictures (ladybugs, stars) also spill into the next card, so a child cannot count them and taps can land on the wrong card. Seen in: `m.numerals`, `m.compare`, `m.timepatterns`, `m2.shapes`, `ss1.continents`, `ss1.home`, `r1.sentence`, `s.earth`, `ss.time`, `ss.holidays`, `m.position`, `in.map`, `s1.weather`, and the mock i-Ready. The `m2.oddeven`, `m2.groups`, `m.add`, `m.compare` and `q.oddone` intros also scroll sideways. Code: `src/ui/Player.tsx:139` and `:246`.
2. **Blank screen with no way out.** On a US-only profile, Check-ups → *Start a Check-up* lists Hindi and Kannada. Tapping either opens a white page with no buttons: there are no visible skills, so the first question is `null` and `Player` renders nothing. The *Find his level* list already hides them. Code: `src/ui/Parent.tsx` (Checkups), `src/App.tsx` (startCheckup).

### Medium: India profile

3. **India-only profile still gets US social studies.** It shows American symbols and US holidays (Veterans Day, Presidents Day, Labor Day), because `ss.symbols` and `ss.holidays` have no `regions`.
4. **US money and grades in shared questions.** `ss.needs.9` says "ten dollars… five dollars", and `ss.time.9` says "first grade". Parent tips for `q.balance` and `s.stem` mention pennies.
5. **Picture text and choice text are never localized.** `localize()` is applied only to the prompt, explanation and hint. India children still see "Favorite pets" (graph title), "color" and "favorite" in read-alone passages, and US spellings on choice buttons.
6. **`localize()` drops plurals for metres.** `meters` → `metre`, so "5 meters" becomes "5 metre" (`src/content/curricula.ts`, the `meters?` rule).

### Low

7. India copy:
   - "Let's practice!" on every intro (India: *practise*)
   - "Mark all Kindergarten known" and "Math" in the dashboard
   - "fall" as a season
   - "mom"
   - Question bank shows US text
8. Passcode screen is titled "Assessment Hub", not "Learning Quest".
9. Clearing the child's name in Settings leaves "· Parent dashboard" and the kid home says "Hi, !". Nothing requires a name there.
10. Parent copy hard-codes "his/he" ("Find his level").
11. The Quest's review question can come from a skill that is currently hidden, such as a language that was switched off (`buildQuest` uses `ALL_SKILLS` for the review pool).
12. Overview "Skills mastered" counts hidden skills in the numerator but only visible skills in the denominator.

### Checked and fine

- Passcode is case- and space-insensitive. A wrong code is rejected.
- Setup blocks empty and whitespace-only names.
- Auth and profile survive a reload.
- Locked stones explain themselves aloud.
- The skip test asks exactly 3 questions.
- The Quest asks 8 questions. The stars shown on Results match the home counter.
- Check-ups and mocks give no hints.
- The mock resumes at the right question and shows the stretch break every 12 questions.
- Backup downloads and restores, and a bad file is rejected.
- Reset clears progress.
- Switching to India adds the Hindi/Kannada islands.
- Hindi/Kannada use the correct scripts and every choice has a romanized fallback.
- The "no voice" note appears on devices without the language.
- No answer-key errors were found in the 534 written questions or the generated samples.
