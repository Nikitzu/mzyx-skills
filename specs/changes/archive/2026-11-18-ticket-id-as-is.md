---
area: pipeline
---

# Change: ticket ID as is

## Why

The change file was named with the ticket ID in lower case (`arg-262.md`), while branches and the team skills use the ticket ID exactly (`ARG-262`). One spelling everywhere avoids two names for the same ticket.

## Modified

### Change file
WHEN `/spec` starts work THE SYSTEM SHALL create `specs/changes/<name>.md`, where `<name>` is the ticket ID exactly as it is when there is one, with front matter naming its `area`, a `## Why` section, and one or more of `## Added`, `## Modified`, `## Removed` and `## Renamed`.

## Clarifications

- The file name is the ticket ID as it is, the same as the branch (user, 18 Nov).
