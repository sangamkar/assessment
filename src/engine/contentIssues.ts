import type { Attempt } from './progress';
const OLD_ARRAY_PROMPT = 'This rectangle is split into rows and columns of equal squares. How many squares are there?';
/** Preserve original records; do not interpret an ambiguous prompt as evidence of a child error. */
export function contentIssue(attempt: Pick<Attempt, 'itemId' | 'question' | 'poolFingerprint' | 'fingerprint'>): string | undefined {
  if (!['m2.shapes.4', 'm2.shapes.8'].includes(attempt.itemId)) return;
  let say = attempt.question?.say;
  if (!say) {
    const fp = attempt.poolFingerprint ?? attempt.fingerprint;
    if (fp?.startsWith('[')) {
      try { say = JSON.parse(fp)[0]; } catch { /* A hash or damaged fingerprint cannot recover the wording. */ }
    }
  }
  if (typeof say !== 'string' || say.toLowerCase() !== OLD_ARRAY_PROMPT.toLowerCase()) return;
  return 'Question wording issue: the original prompt did not say to count only the small squares. Counting larger squares was a reasonable interpretation. This answer is excluded from current learning and misconception summaries. The original answer and stored assessment totals are preserved.';
}
