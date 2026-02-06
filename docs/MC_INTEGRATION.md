# Morning Consult Integration

This document describes the integration with Morning Consult's Supplier API.

## Configuration

Stored in `survey_providers` table:
- `api_base_url`: Base URL for MC API.
- `credentials`: API Key (Bearer token).
- `supplier_id`: Your Supplier ID.
- `public_key` / `private_key`: Ed25519 keys for signing/verification.

## API Endpoints Used

| Endpoint                          | Method | Description                          |
|-----------------------------------|--------|--------------------------------------|
| `/supplier/eligibility`           | POST   | Check user eligibility for surveys.  |
| `/supplier/bids`                | GET    | Fetch available survey bids.         |
| `/user/public-keys`               | POST   | Register our signing public key.     |
| `/user/redirect-urls/{status_id}` | PUT    | Set redirect URLs for each status.   |
| `/lookup/public-key`              | GET    | Fetch MC's public key for verification. |

## Redirect Flow

1. User clicks "Start Survey".
2. Backend generates a `survey_session` and signs the entry URL.
3. User is redirected to MC's prescreener URL with signed params.
4. MC redirects user back to our `/redirect` endpoint with status.
5. Backend verifies MC's signature on the redirect.
6. Backend updates session status and credits wallet if `status=complete`.
7. User is redirected to frontend result page (`/surveys/redirect/[status]`).

## Status Codes

| Status        | Description                       |
|---------------|-----------------------------------|
| `complete`    | Survey finished successfully.     |
| `screenout`   | User did not qualify.             |
| `over_quota`  | Survey quota already filled.      |
| `quality_term`| Terminated for quality reasons.   |
| `timeout`     | Session expired.                  |
