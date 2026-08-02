import { supabase } from "@/lib/supabase";
import type { NodeMemberRecord } from "@/shared/store/nodesStore";

interface NodeMemberRow {
  id: string;
  node_id: string;
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
): Promise<NodeMemberRecord[]> {
  const { data, error } = await supabase
    .from("node_members")
    .select(
      "id, node_id, member_id, role_id, members(email, display_name), role_definitions(role_key)",
    )
    .eq("node_id", storeId);

  if (error) throw error;

  return ((data as unknown as NodeMemberRow[]) ?? []).map(toNodeMemberRecord);
}

export interface NodeMemberWithNode extends NodeMemberRecord {
  nodeId: string;
  nodeDisplayName: string | null;
}

/**
 * Members of a parent node plus every one of its child nodes (e.g. a
 * brand and all its stores), grouped by node_id. Two round trips total
 * — resolve the node ids first, then a single `.in(...)` query for their
 * node_members — instead of one fetchStoreMembers call per child.
 */
export async function fetchMembersByParent(
  parentId: string,
): Promise<NodeMemberWithNode[]> {
  const { data: nodeRows, error: nodeError } = await supabase
    .from("nodes")
    .select("id, display_name")
    .or(`id.eq.${parentId},parent_id.eq.${parentId}`);

  if (nodeError) throw nodeError;

  const nodeNameById = new Map(
    (nodeRows ?? []).map((row) => [row.id, row.display_name as string | null]),
  );
  const nodeIds = Array.from(nodeNameById.keys());
  if (nodeIds.length === 0) return [];

  const { data, error } = await supabase
    .from("node_members")
    .select(
      "id, node_id, member_id, role_id, members(email, display_name), role_definitions(role_key)",
    )
    .in("node_id", nodeIds);

  if (error) throw error;

  return ((data as unknown as NodeMemberRow[]) ?? []).map((row) => ({
    ...toNodeMemberRecord(row),
    nodeId: row.node_id,
    nodeDisplayName: nodeNameById.get(row.node_id) ?? null,
  }));
}
