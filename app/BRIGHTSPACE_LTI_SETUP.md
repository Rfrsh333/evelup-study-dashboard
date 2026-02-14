# Brightspace LTI 1.3 Setup

## Tool registration steps
1. Register LevelUp as an LTI 1.3 tool in Brightspace.
2. Configure the tool redirect URLs for `/functions/v1/lti/login` and `/functions/v1/lti/launch`.
3. Add the platform JWKS, issuer, and client id to your secrets.

## Required claims
- `https://purl.imsglobal.org/spec/lti/claim/deployment_id`
- `https://purl.imsglobal.org/spec/lti/claim/context`
- `https://purl.imsglobal.org/spec/lti/claim/roles`
- `sub`, `iss`, `aud`

## Required scopes
- `openid`
- `https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly`
- `https://purl.imsglobal.org/spec/lti-ags/scope/lineitem`
- `https://purl.imsglobal.org/spec/lti-ags/scope/score`
- `https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly`

## Installation by school IT
The school admin installs LevelUp once per institution (platform registration).
All students then launch LevelUp from within Brightspace.

## Security model
- LTI launch is verified with JWT + JWKS.
- No passwords or OAuth tokens are stored client-side.
- Session creation happens server-side after launch.
