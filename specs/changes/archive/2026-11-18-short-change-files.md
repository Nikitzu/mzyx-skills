---
area: pipeline
---

# Change: short change files

## Why

A change folder made every path long (`specs/changes/arg-262-geofence-engine/change.md`) for no gain over one file. A change is now one file named after the ticket, with its tasks file beside it, and both move into the archive together. Folders from 0.8 keep working so changes in flight do not break.

## Renamed

- Change folder → Change file

## Modified

### Change file
WHEN `/spec` starts work THE SYSTEM SHALL create `specs/changes/<name>.md`, where `<name>` is the ticket ID in lower case when there is one, with front matter naming its `area`, a `## Why` section, and one or more of `## Added`, `## Modified`, `## Removed` and `## Renamed`.

### Commit the change
WHEN the user approves a change THE SYSTEM SHALL commit the change file and SHALL NOT move or rename it.

### Tasks file
WHEN `/plan` runs THE SYSTEM SHALL write the change's checklist to `specs/changes/<name>.tasks.md` and add `specs/changes/*.tasks.md` to `.gitignore`.

## Added

### Archive moves both files
WHEN `archive.mjs` archives `specs/changes/<name>.md` THE SYSTEM SHALL move it and `specs/changes/<name>.tasks.md`, if present, to `specs/changes/archive/<date>-<name>.md` and `<date>-<name>.tasks.md`.

### Change folders still work
IF a change is a 0.8 folder `specs/changes/<name>/change.md`, THEN THE SYSTEM SHALL validate it against the same living spec and archive it as a folder.

## Clarifications

- One file per change, named by ticket ID, no folder (user, 18 Nov).
