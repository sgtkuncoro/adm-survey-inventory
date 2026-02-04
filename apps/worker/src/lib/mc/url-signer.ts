import { signMessage } from "../crypto/ed25519";
import { ed25519 } from "@noble/curves/ed25519.js";

export interface EntryUrlParams {
  bidId: string;
  panelistId: string;
  supplierId: string;
  sessionMetadata: string;
  qualifications: string; // Format: "age,25,gender,M"
}

/**
 * Build and sign a Morning Consult entry URL
 * MC requires query params in alphabetical order for signing
 */
export function buildSignedEntryUrl(
  params: EntryUrlParams,
  privateKeyBase64: string,
  baseUrl: string,
): string {
  // Build query params in alphabetical order (required by MC)
  const queryParams = new URLSearchParams();
  queryParams.set("bid_id", params.bidId);
  queryParams.set("panelist_id", params.panelistId);
  queryParams.set("qualifications", params.qualifications);
  queryParams.set("session_metadata", params.sessionMetadata);
  queryParams.set("supplier_id", params.supplierId);

  // Get sorted query string
  const sortedParams = new URLSearchParams(
    Array.from(queryParams.entries()).sort(([a], [b]) => a.localeCompare(b)),
  );
  const queryString = sortedParams.toString();

  // Sign the query string
  const message = Buffer.from(queryString);
  const signatureBytes = signMessage(message, privateKeyBase64);
  const signature = signatureBytes.toString("base64");

  // Build full URL with signature
  return `${baseUrl}/v1/survey/entry?${queryString}&signature=${encodeURIComponent(signature)}`;
}

/**
 * Verify a Morning Consult redirect signature
 */
export function verifyRedirectSignature(
  params: {
    status: string;
    session: string;
    payout?: string;
    statusId?: string;
    statusDetailId?: string;
    signature: string;
  },
  mcPublicKeyBase64: string,
): boolean {
  try {
    // Build the message that was signed (alphabetical order)
    const messageParts: string[] = [];

    if (params.payout) {
      messageParts.push(`interview_cost=${params.payout}`);
    }
    messageParts.push(`session_metadata=${params.session}`);
    messageParts.push(`status=${params.status}`);
    if (params.statusDetailId) {
      messageParts.push(`status_detail_id=${params.statusDetailId}`);
    }
    if (params.statusId) {
      messageParts.push(`status_id=${params.statusId}`);
    }

    const message = Buffer.from(messageParts.join("&"));
    const signature = Buffer.from(params.signature, "base64");
    const publicKey = Buffer.from(mcPublicKeyBase64, "base64");

    // Use noble/curves for verification
    return ed25519.verify(signature, message, publicKey);
  } catch (error) {
    console.error("Redirect signature verification error:", error);
    return false;
  }
}
