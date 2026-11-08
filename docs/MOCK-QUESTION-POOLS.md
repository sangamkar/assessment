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
- Thirty-eight mock-only items add vocabulary, informational passages, story
  comprehension, independent reading, coin comparisons and varied geometry tasks. These address thin
  reserved pools while using new contexts, not renamed question IDs.
- Mock selection first avoids item IDs and fingerprints already present in available
  attempt history or the current mock. Old authored signatures can be recovered
  from IDs; conservative reading-generator ID families cover legacy sight-word
  and letter/sound attempts that predate fingerprint storage.
- New answers save fingerprints. Existing question IDs and saved academic
  progress are retained. Mock adaptation uses the difficulty of the item actually
  served. Selection prefers the nearest available grade, including familiar tasks
  from earlier tests that have not been used in this sitting. Only when that grade
  runs out of unused tasks does selection try the next nearest grade in the same
  domain, before repeating within the test. The actual served grade/difficulty is
  retained; a fallback is not evidence of higher ability. Repeated items remain flagged.

If a domain has no unused reserved item left, a within-test repeat is allowed so
the full test can finish. Repeated authored tasks prefer the least-used question
and then the least-recently used one at equal difficulty. It never fills a shortage with a current practice-pool
item. There is a finite reading bank, not unlimited new tests. Exposure checks
use retained attempt history (up to 6,000 attempts), not a server archive.
A domain with no mock content at all still cannot produce a valid question;
the defensive incomplete-score guard remains for that content error.


This change applies to Mock i-Ready. Short check-ups, placement and skip-ahead
checks still use the teaching/practice bank. Parent question-bank browsing is
not treated as child exposure.

## Verification

Tests enforce disjoint authored pools, generated pool membership, fingerprint
stability, legacy-reading ID handling, full math/reading mocks after simulated
practice, and full-length completion using reserved repeats. Fresh mock-only items pass the content validator.
The existing mock scoring/coverage tests also remain in the suite.

## Corrected content and narration

Array-counting prompts explicitly request small squares, excluding composite
squares. Their original practice/mock assignments are pinned so editing the
wording cannot move a question across pools. Recognizable old ambiguous attempts
are retained with a wording-issue note and excluded from current learning and
misconception summaries; stored assessment totals are not silently rewritten.

Narration returns a cancellation handle for the request that started it. Home
guidance, skill intros, the question player and speaker buttons use that handle
when closing, so cleanup cannot cancel a newer request on another screen.
