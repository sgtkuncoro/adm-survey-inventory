import { ed25519 } from "@noble/curves/ed25519.js";

export interface KeyPair {
  publicKey: string; // Base64 encoded
  privateKey: string; // Base64 encoded
}

/**
 * Generate a new Ed25519 key pair for Morning Consult URL signing
 */
export function generateKeyPair(): KeyPair {
  const privateKeyBytes = ed25519.utils.randomSecretKey();
  const publicKeyBytes = ed25519.getPublicKey(privateKeyBytes);

  return {
    privateKey: Buffer.from(privateKeyBytes).toString("base64"),
    publicKey: Buffer.from(publicKeyBytes).toString("base64"),
  };
}

/**
 * Sign a message with Ed25519 private key
 */
export function signMessage(message: Buffer, privateKeyBase64: string): Buffer {
  const privateKeyBytes = Buffer.from(privateKeyBase64, "base64");
  const signatureBytes = ed25519.sign(message, privateKeyBytes);
  return Buffer.from(signatureBytes);
}

/**
 * Verify a signature with Ed25519 public key
 */
export function verifySignature(
  message: Buffer,
  signatureBase64: string,
  publicKeyBase64: string,
): boolean {
  try {
    const signatureBytes = Buffer.from(signatureBase64, "base64");
    const publicKeyBytes = Buffer.from(publicKeyBase64, "base64");
    return ed25519.verify(signatureBytes, message, publicKeyBytes);
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}
