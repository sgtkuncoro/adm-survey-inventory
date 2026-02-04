# Task: Survey Session & Redirect Handler

**Phase**: 1 - Backend Foundation  
**Priority**: High  
**Status**: ✅ Done

## Overview

Implement the survey session lifecycle: creating sessions when users click "Start Survey", generating signed entry URLs, and handling MC redirect callbacks with signature verification.

## Implementation Details

- **Session Creation**: `createSurveySession` in `apps/worker/src/lib/surveys/session.ts`
- **Redirect Handler**: `apps/worker/src/routes/redirect.ts`
- **Wallet Integration**: `wallet_transactions` table recording on completion.

## Features Implemented

1.  **Session Lifecycle**:
    - Creates `survey_sessions` record (pending).
    - Generates signed entry URL using `url-signer.ts`.
    - Expires sessions after 24h.

2.  **Redirect Handler**:
    - Verifies ED25519 signature from MC.
    - Updates session status (complete, screenout, etc.).
    - Records execution time (`completed_at`).

3.  **Payouts**:
    - Credits user wallet on `complete` status.
    - Records transaction history.
    - Idempotent updates (prevents double counting).

## Verification

- [x] Session creation logic
- [x] Signed URL generation
- [x] Redirect signature verification
- [x] User wallet crediting
