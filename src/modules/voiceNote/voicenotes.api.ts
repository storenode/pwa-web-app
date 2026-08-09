import { supabase } from "@/lib/supabase";

export interface VoiceReviewRecord {
  id: string;
  nodeId: string;
  phone: string;
  reviewText: string;
  createdAt: string;
}

interface VoiceReviewRow {
  id: string;
  node_id: string;
  phone: string;
  review_text: string;
  created_at: string;
}

function toVoiceReviewRecord(row: VoiceReviewRow): VoiceReviewRecord {
  return {
    id: row.id,
    nodeId: row.node_id,
    phone: row.phone,
    reviewText: row.review_text,
    createdAt: row.created_at,
  };
}

/**
 * Public (anon-callable): submits a customer's voice-transcribed review via
 * the submit_voice_review security-definer RPC — node_voice_reviews is
 * staff-only via RLS, so this is the only way an anonymous visitor can
 * create a row.
 */
export async function submitVoiceReview(
  storeId: string,
  phone: string,
  reviewText: string,
): Promise<VoiceReviewRecord> {
  const { data, error } = await supabase.rpc("submit_voice_review", {
    p_store_id: storeId,
    p_phone: phone,
    p_review_text: reviewText,
  });

  if (error) throw error;
  return toVoiceReviewRecord(data as unknown as VoiceReviewRow);
}

/** Voice reviews for a set of stores, for the staff-facing dashboard. */
export async function fetchVoiceReviews(
  nodeIds: string[],
): Promise<VoiceReviewRecord[]> {
  if (nodeIds.length === 0) return [];

  const { data, error } = await supabase
    .from("node_voice_reviews")
    .select("id, node_id, phone, review_text, created_at")
    .in("node_id", nodeIds)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data as unknown as VoiceReviewRow[]) ?? []).map(
    toVoiceReviewRecord,
  );
}
