import { supabase } from "@/lib/supabase";
import { CHANNEL_TYPES } from "@/modules/account/components/store.form";
import type { ChannelType } from "@/modules/account/components/store.form";

export interface PublicStoreChannel {
  channelType: ChannelType;
  url: string;
}

export interface PublicStoreInfo {
  displayName: string | null;
  channels: PublicStoreChannel[];
}

interface PublicStoreInfoRow {
  display_name: string | null;
  channel_type: string | null;
  url: string | null;
}

/**
 * Public (anon-callable) read of a store's safe-to-expose fields, via the
 * get_public_store_info security-definer RPC — used by the unauthenticated
 * QR-scan landing page. Returns one row per active channel that has a URL
 * (or a single row with a null channel_type/url if the store has none), so
 * the caller can render a button per active channel (Google, Instagram,
 * Facebook, WhatsApp, YouTube, website...). Returns null if the store id
 * doesn't exist.
 */
export async function fetchPublicStoreInfo(
  storeId: string,
): Promise<PublicStoreInfo | null> {
  const { data, error } = await supabase.rpc("get_public_store_info", {
    p_store_id: storeId,
  });

  if (error) throw error;

  const rows = (data as unknown as PublicStoreInfoRow[] | null) ?? [];
  if (rows.length === 0) return null;

  return {
    displayName: rows[0].display_name,
    channels: rows
      .filter(
        (row): row is PublicStoreInfoRow & { channel_type: ChannelType; url: string } =>
          !!row.channel_type &&
          !!row.url &&
          (CHANNEL_TYPES as readonly string[]).includes(row.channel_type),
      )
      .map((row) => ({ channelType: row.channel_type, url: row.url })),
  };
}

export interface NodeRewardRecord {
  id: string;
  nodeId: string;
  phone: string;
  points: number;
  status: "unclaimed" | "requested" | "claimed";
  rewardType: "phone" | "birthday";
  channelType: ChannelType | null;
  dateOfBirth: string | null;
  rewardYear: number | null;
  createdAt: string;
  claimedAt: string | null;
}

export interface ClaimStoreRewardResult {
  /**
   * True if a date of birth was submitted AND a new "birthday" reward row
   * was created. False if no date of birth was submitted, or if this
   * (store, phone) already claimed the birthday reward for the current
   * calendar year — lets the caller distinguish "no DOB entered" from
   * "already claimed this year" and message the user accordingly.
   */
  birthdayRewardGranted: boolean;
}

/**
 * Public (anon-callable): records a customer's date of birth against a
 * store's reward program via the claim_store_reward security-definer RPC.
 * Only handles the birthday reward (capped at one per calendar year per
 * (store, phone) — the RPC does the year check and skips the insert if
 * already claimed this year). The phone-number reward is granted
 * separately, per channel click — see recordChannelClick. Points/status
 * are fixed server-side — the client can't forge either.
 */
export async function claimStoreReward(
  storeId: string,
  phone: string,
  dateOfBirth?: string,
): Promise<ClaimStoreRewardResult> {
  const { data, error } = await supabase.rpc("claim_store_reward", {
    p_store_id: storeId,
    p_phone: phone,
    p_date_of_birth: dateOfBirth ?? null,
  });

  if (error) throw error;

  const rows = (data as unknown as NodeRewardRow[] | null) ?? [];
  return {
    birthdayRewardGranted: rows.some((row) => row.reward_type === "birthday"),
  };
}

/**
 * Public (anon-callable): called when a customer clicks a channel button
 * (Google review, Instagram, ...) on the public store page. Grants a
 * separate "phone" reward row per click, tagged with which channel was
 * clicked, via the record_channel_click security-definer RPC — this is how
 * we know the customer actually engaged with a channel, not just that they
 * submitted a phone number.
 */
export async function recordChannelClick(
  storeId: string,
  phone: string,
  channelType: ChannelType,
): Promise<void> {
  const { error } = await supabase.rpc("record_channel_click", {
    p_store_id: storeId,
    p_phone: phone,
    p_channel_type: channelType,
  });

  if (error) throw error;
}

interface NodeRewardRow {
  id: string;
  node_id: string;
  phone: string;
  points: number;
  status: "unclaimed" | "requested" | "claimed";
  reward_type: "phone" | "birthday";
  channel_type: string | null;
  date_of_birth: string | null;
  reward_year: number | null;
  created_at: string;
  claimed_at: string | null;
}

function toNodeRewardRecord(row: NodeRewardRow): NodeRewardRecord {
  return {
    id: row.id,
    nodeId: row.node_id,
    phone: row.phone,
    points: row.points,
    status: row.status,
    rewardType: row.reward_type,
    channelType: (CHANNEL_TYPES as readonly string[]).includes(
      row.channel_type ?? "",
    )
      ? (row.channel_type as ChannelType)
      : null,
    dateOfBirth: row.date_of_birth,
    rewardYear: row.reward_year,
    createdAt: row.created_at,
    claimedAt: row.claimed_at,
  };
}

/** Reward claims for a set of stores, for the staff-facing rewards dashboard. */
export async function fetchNodeRewards(
  nodeIds: string[],
): Promise<NodeRewardRecord[]> {
  if (nodeIds.length === 0) return [];

  const { data, error } = await supabase
    .from("node_rewards")
    .select(
      "id, node_id, phone, points, status, reward_type, channel_type, date_of_birth, reward_year, created_at, claimed_at",
    )
    .in("node_id", nodeIds)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data as unknown as NodeRewardRow[]) ?? []).map(toNodeRewardRecord);
}

/** Marks a reward claim as redeemed in-store. RLS scopes this to staff who manage that reward's node. */
export async function markRewardClaimed(
  rewardId: string,
  claimedByMemberId: string,
): Promise<void> {
  const { error } = await supabase
    .from("node_rewards")
    .update({
      status: "claimed",
      claimed_at: new Date().toISOString(),
      claimed_by: claimedByMemberId,
    })
    .eq("id", rewardId);

  if (error) throw error;
}

export interface RewardRedemptionRecord {
  id: string;
  nodeId: string;
  phone: string;
  billNumber: string;
  billAmount: number;
  pointsApplied: number;
  discountAmount: number;
  status: "requested" | "approved" | "rejected";
  requestedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
}

interface RewardRedemptionRow {
  id: string;
  node_id: string;
  phone: string;
  bill_number: string;
  bill_amount: number;
  points_applied: number;
  discount_amount: number;
  status: "requested" | "approved" | "rejected";
  requested_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

function toRewardRedemptionRecord(
  row: RewardRedemptionRow,
): RewardRedemptionRecord {
  return {
    id: row.id,
    nodeId: row.node_id,
    phone: row.phone,
    billNumber: row.bill_number,
    billAmount: row.bill_amount,
    pointsApplied: row.points_applied,
    discountAmount: row.discount_amount,
    status: row.status,
    requestedAt: row.requested_at,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
  };
}

/**
 * Public (anon-callable): a customer's live unclaimed point balance for a
 * store, via the get_unclaimed_reward_summary security-definer RPC —
 * node_rewards itself is staff-only via RLS, so this is the only way an
 * anonymous visitor sees their own total.
 */
export async function fetchUnclaimedRewardSummary(
  storeId: string,
  phone: string,
): Promise<number> {
  const { data, error } = await supabase.rpc("get_unclaimed_reward_summary", {
    p_store_id: storeId,
    p_phone: phone,
  });

  if (error) throw error;
  return (data as unknown as number) ?? 0;
}

/**
 * Public (anon-callable): a customer's date of birth already on file for a
 * store (if any), via the get_customer_date_of_birth security-definer RPC —
 * node_rewards itself is staff-only via RLS, so this is the only way an
 * anonymous visitor's own prior submission can be looked up. Used to
 * prefill and lock the DOB field for a returning phone number.
 */
export async function fetchCustomerDateOfBirth(
  storeId: string,
  phone: string,
): Promise<string | null> {
  const { data, error } = await supabase.rpc("get_customer_date_of_birth", {
    p_store_id: storeId,
    p_phone: phone,
  });

  if (error) throw error;
  return (data as unknown as string | null) ?? null;
}

/**
 * Public (anon-callable): customer requests a redemption of their entire
 * unclaimed point balance against a bill, via the request_reward_redemption
 * security-definer RPC. This only creates a 'requested' record — the
 * discount isn't applied until staff approve it via reviewRewardRedemption.
 */
export async function requestRewardRedemption(
  storeId: string,
  phone: string,
  billNumber: string,
  billAmount: number,
): Promise<RewardRedemptionRecord> {
  const { data, error } = await supabase.rpc("request_reward_redemption", {
    p_store_id: storeId,
    p_phone: phone,
    p_bill_number: billNumber,
    p_bill_amount: billAmount,
  });

  if (error) throw error;
  return toRewardRedemptionRecord(data as unknown as RewardRedemptionRow);
}

/** Redemption requests for a set of stores, for the staff-facing rewards dashboard. */
export async function fetchRewardRedemptions(
  nodeIds: string[],
): Promise<RewardRedemptionRecord[]> {
  if (nodeIds.length === 0) return [];

  const { data, error } = await supabase
    .from("reward_redemptions")
    .select(
      "id, node_id, phone, bill_number, bill_amount, points_applied, discount_amount, status, requested_at, reviewed_by, reviewed_at",
    )
    .in("node_id", nodeIds)
    .order("requested_at", { ascending: false });

  if (error) throw error;
  return ((data as unknown as RewardRedemptionRow[]) ?? []).map(
    toRewardRedemptionRecord,
  );
}

/**
 * Staff-only: approve or reject a pending redemption request via the
 * review_reward_redemption security-definer RPC. Approving marks the
 * reserved node_rewards rows 'claimed'; rejecting releases them back to
 * 'unclaimed' so they're claimable again in a future request.
 */
export async function reviewRewardRedemption(
  redemptionId: string,
  approve: boolean,
): Promise<void> {
  const { error } = await supabase.rpc("review_reward_redemption", {
    p_redemption_id: redemptionId,
    p_approve: approve,
  });

  if (error) throw error;
}
