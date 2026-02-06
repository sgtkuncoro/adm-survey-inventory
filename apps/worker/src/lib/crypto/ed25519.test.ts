import { describe, it, expect, vi } from "vitest";
import { generateKeyPair } from "./ed25519";
import { signRedirectUrl, verifyRedirectSignature } from "../mc/url-signer";
import { Buffer } from "node:buffer";

// Polyfill Buffer for Cloudflare Workers environment in Vitest
globalThis.Buffer = Buffer;

// Mock tweetnacl if necessary, but it's pure JS so it should run fine in node environment for tests
// We will test the high level logic

describe("Ed25519 Crypto", () => {
  it("should generate a valid key pair", () => {
    const keys = generateKeyPair();
    expect(keys.publicKey).toBeDefined();
    expect(keys.privateKey).toBeDefined();
    expect(keys.publicKey).not.toBe(keys.privateKey);
  });
});

describe("URL Signer", () => {
  it("should sign and verify a redirect URL parameters", async () => {
    const keys = generateKeyPair();
    const params = {
      status: "complete",
      session: "session-123",
      payout: "200", // cents
    };

    // Sign
    const signature = await signRedirectUrl(
      params,
      keys.privateKey
    );
    expect(signature).toBeDefined();

    // Verify
    const isValid = verifyRedirectSignature(
      { ...params, signature },
      keys.publicKey
    );
    expect(isValid).toBe(true);
  });

  it("should reject invalid signatures", async () => {
    const keys = generateKeyPair();
    const params = {
      status: "complete",
      session: "session-123",
    };

    const signature = await signRedirectUrl(params, keys.privateKey);
    
    // Tamper with params
    const tamperedParams = { ...params, session: "session-999", signature };
    
    const isValid = verifyRedirectSignature(
      tamperedParams,
      keys.publicKey
    );
    expect(isValid).toBe(false);
  });
});
