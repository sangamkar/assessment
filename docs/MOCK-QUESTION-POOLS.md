# Same concepts, different mock questions

Mock i-Ready previously called the same item picker as skill practice. It now
uses a held-out pool while retaining each question's original skill, grade and
actual authored/generated difficulty. These are still this app's practice
estimates, not validated or official i-Ready scores.

## Selection

- A stable question fingerprint combines spoken prompt, visual stimulus and the
  correct answer. IDs, shuffled option order, different distractors and cosmetic
  on-screen captions do not create a new question.
- A deterministic hash reserves approximately one third of authored/generated
  math and assessed reading tasks for mocks. Practice never draws from that
  reservation. Subjects and writing skills without a mock keep their full bank.
- Twenty-six new mock-only items add vocabulary, informational passages, story
  comprehension, independent reading and coin comparisons. These address thin
  reserved pools while using new contexts, not renamed question IDs.
- Mock selection rejects item IDs and fingerprints already present in available
  attempt history or the current mock. Old authored signatures can be recovered
  from IDs; conservative reading-generator ID families cover legacy sight-word
  and letter/sound attempts that predate fingerprint storage.
- New answers save fingerprints. Existing question IDs and saved academic
  progress are retained. Mock adaptation uses the difficulty of the item actually
  served, including any fallback to a nearby difficulty/grade.

If a domain has no unseen reserved item left, the mock pauses. Answers remain in
its resumable run and no incomplete result is scored. It never fills a shortage
with a practice item. An exhausted area needs fresh authored content; deleting
or resetting progress is not the solution. There is a finite reading bank, and
this is not a promise of unlimited new tests. Exposure checks use the app's
existing retained attempt history (up to 6,000 attempts), not a server archive.

This change applies to Mock i-Ready. Short check-ups, placement and skip-ahead
checks still use the teaching/practice bank. Parent question-bank browsing is
not treated as child exposure.

## Verification

Tests enforce disjoint authored pools, generated pool membership, fingerprint
stability, legacy-reading ID handling, full math/reading mocks after simulated
practice, and safe exhaustion. Fresh mock-only items pass the content validator.
The existing mock scoring/coverage tests also remain in the suite.
