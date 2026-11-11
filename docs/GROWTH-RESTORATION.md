# On-screen discoveries

The three activities use only on-screen pieces, drawing, and optional typed reflection. A creation can be saved and reopened in the journal. Older discovery entries remain available as archives: their former offline activity instructions are not restored. Parent observations record trying, assisted, or independent work and do not update academic attempts or mastery.

## Migration and recovery

The state remains under `learning-quest:v1`; the payload is upgraded to version 4 to avoid reusing the previous versions 2 and 3. The active state supplies the profile, academic attempts, skill status, and all other current fields. On the first upgrade only, portfolio records from a valid `learning-quest:v1:before-rollback` copy are merged by ID, with current entries winning conflicts. When both copies have a profile creation timestamp and they differ, the archive is not merged. The original archive is never overwritten by this merge. Previous unknown fields are retained, and later loads of version 4 do not re-import archived entries. Existing backup export includes the portfolio. If storage is full or blocked, the discovery screen warns that edits are only in memory and directs the parent to export a backup.

The retained archive can still be recovered separately if it belongs to a different profile or has conflicting records. Historical stage and support values are retained; new observations do not infer development stages or award mastery. Storage remains device-local.
