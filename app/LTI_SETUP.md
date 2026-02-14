# LTI 1.3 (School Integration)

LTI 1.3 is a standard for integrating external tools into a Learning Management System (LMS).
It must be installed by a school administrator.

## What we can receive
- Course context (course id, name)
- User identity mapping
- Deep links to specific content
- Optional grade passback (future)

## Current status
This is a placeholder path. We do not accept real launches yet.

## Planned endpoints
- `/lti/login` – LTI login initiation
- `/lti/launch` – LTI launch handling

## Data storage
Launch context will be stored server-side and linked to the user id mapping.
