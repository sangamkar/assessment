# Going Public — Checklist (later)

**Status: private.** The app is for one child. This file records what must be true before
anyone outside the family uses it, so today's decisions don't block that path.

## Already in place
- Content is data (skills, items, curriculum overlays), not code.
- No child data leaves the device; the child's name is entered at runtime, never stored in the repo.
- Standards are referenced by code or chapter name only (no copied syllabus text).
- Parent area behind a grown-up gate.

## Keep private for now
- The GitHub Pages URL is reachable by anyone who has it. The classroom passcode is checked
  in the browser, so it is a door lock, not real security. Keep the URL unshared, and keep
  the repository private if possible.

## Before a closed trial (10–20 families)
1. Parent accounts + cloud sync (e.g. Supabase) with multiple children per parent.
2. Privacy: a plain-language privacy policy; verifiable parental consent (US COPPA); India DPDP
   Act 2023 (verifiable consent for under-18s); Singapore PDPA / UK-EU GDPR if offered there.
   Collect the minimum: first name, birth month/year, progress. No ads, no third-party trackers.
3. Data export and delete-my-child's-data on request.
4. Human-recorded audio for phonics and Hindi; content review of every item by a second educator.
5. Wording: describe check-ups as "diagnostic-style practice". Do not use i-Ready, CogAT,
   CAT4 or Olympiad trademarks in marketing or imply affiliation.

## Before public launch
1. Measure outcomes from the trial (mastery growth, check-up gains, weekly use).
2. Installable web app (PWA) first; App Store / Play Store wrappers later (store rules for
   kids' apps apply: no external links or purchases without a parental gate).
3. Accessibility review (contrast, motion, screen reader for the parent area).
4. Pricing decision (free core, paid parent insights?) — only after the trial.
