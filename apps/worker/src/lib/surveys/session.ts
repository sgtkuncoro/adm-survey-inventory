import { buildSignedEntryUrl } from "../mc/url-signer";
import { decryptPrivateKey } from "../crypto/encryption";
import { calculateAge, mapGender } from "./eligibility";
import type { TypedSupabaseClient } from "@packages/supabase";

export interface CreateSessionResult {
  sessionId: string;
  entryUrl: string;
  expiresAt: Date;
}

/**
 * Create a new survey session and generate signed entry URL
 */
export async function createSurveySession(
  userId: string,
  providerId: string,
  bidId: string,
  quotaId: string | null,
  user: { dateOfBirth: Date; gender: string },
  provider: {
    supplierId: string;
    prescreenerUrl: string;
    privateKey: string;
    userPayoutPct: number;
  },
  bid: { cpi: number },
  db: TypedSupabaseClient,
): Promise<CreateSessionResult> {
  // Calculate payout
  const userPayout = Math.floor(
    bid.cpi * ((provider.userPayoutPct ?? 50) / 100),
  );

  // Create session record in database
  const { data: session, error } = await db
    .from("survey_sessions")
    .insert({
      user_id: userId,
      provider_id: providerId,
      bid_id: bidId,
      quota_id: quotaId,
      cpi_at_click: bid.cpi,
      expected_payout: userPayout,
      status: "pending",
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Decrypt private key
  const privateKey = decryptPrivateKey(provider.privateKey);

  // Calculate age and map gender
  const age = calculateAge(user.dateOfBirth);
  const gender = mapGender(user.gender);

  // Build qualifications string
  const qualifications = `age,${age},gender,${gender}`;

  // Sign entry URL
  const entryUrl = buildSignedEntryUrl(
    {
      bidId,
      panelistId: userId,
      supplierId: provider.supplierId,
      sessionMetadata: session.id, // Supabase returns the record with 'id'
      qualifications,
    },
    privateKey,
    provider.prescreenerUrl,
  );

  // Session expires in 24 hours (MC default)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return {
    sessionId: session.id,
    entryUrl,
    expiresAt,
  };
}
