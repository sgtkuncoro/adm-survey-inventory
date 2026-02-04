# Task: Ed25519 Key Generation & URL Signing

**Phase**: 1 - Backend Foundation  
**Priority**: High  
**Status**: ✅ Done

## Overview

Implement Ed25519 cryptographic functions for URL signing. Morning Consult requires all entry URLs to be signed with Ed25519 to prevent tampering.

## Implementation Details

- **Libraries**:
  - `@noble/curves/ed25519` for signing/verification.
  - `node:crypto` (via `crypto-js` or subtle crypto compatible layer) for key encryption.
- **Files**:
  - `apps/worker/src/lib/crypto/ed25519.ts`: Key pair generation.
  - `apps/worker/src/lib/crypto/encryption.ts`: Private key encryption at rest.
  - `apps/worker/src/lib/mc/url-signer.ts`: Entry URL signing.
  - `apps/worker/src/lib/mc/signature-verify.ts`: Redirect signature verification.

## Features Implemented

1. **Key Generation**: Generates valid Ed25519 key pairs (public/private).
2. **Encryption**: Private keys are encrypted before storage using AES-256-GCM (or compatible).
3. **URL Signing**: Signs entry URLs with alphabetical query params.
4. **Verification**: Verifies MC redirect signatures using their public key.

## Verification

- [x] Key generation implemented
- [x] Encryption implemented
- [x] URL signing implemented
- [x] Signature verification implemented
