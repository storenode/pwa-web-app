import { supabase } from "@/lib/supabase";
import type { NodeMemberRecord } from "@/shared/store/nodesStore";

interface NodeMemberRow {
  id: string;
  member_id: string;
  role_id: string | null;
  members: {
    email: string | null;
    display_name: string | null;
  } | null;
  role_definitions: {
    role_key: string;
  } | null;
}

function toNodeMemberRecord(row: NodeMemberRow): NodeMemberRecord {
  return {
    id: row.id,
    memberId: row.member_id,
    email: row.members?.email ?? null,
    displayName: row.members?.display_name ?? null,
    roleId: row.role_id ?? "",
    roleKey: row.role_definitions?.role_key ?? null,
  };
}

/**
 * Existing node_members for a store, joined with member + role details.
 * Note: RLS on "members" only allows a user to read their own row, so
 * teammates' email/display_name will come back null until that policy is
 * widened to cover fellow members of a shared node.
 */
export async function fetchStoreMembers(
  storeId: string,
  isParentNode: boolean = false,
): Promise<NodeMemberRecord[]> {
  console.log("fetchStoreMembers", storeId);
  const { data, error } = await supabase
    .from("node_members")
    .select(
      "id, member_id, role_id, members(email, display_name), role_definitions(role_key)",
    )
    .eq("node_id", storeId);
  console.log("fetchStoreMembers", data, error);
  if (error) throw error;

  return ((data as unknown as NodeMemberRow[]) ?? []).map(toNodeMemberRecord);
}
