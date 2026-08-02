import { supabase } from "@/lib/supabase";
import type {
  NodeChannelRecord,
  NodeMemberRecord,
  NodeRecord,
} from "@/shared/store/nodesStore";
import type { NodeFormValues } from "@/modules/account/components/node.form";
import type {
  ChannelFormValues,
  MemberFormValues,
  StoreFormValues,
} from "@/modules/account/components/store.form";

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

/**
 * Direct child nodes (stores) of a given parent node. Mirrors the private
 * fetchChildNodes helper in NodesProvider.tsx, exported here for on-demand
 * use (e.g. dashboard widgets) rather than only at login.
 */
export async function fetchChildStores(
  parentId: string,
): Promise<NodeRecord[]> {
  const { data, error } = await supabase
    .from("nodes")
    .select(
      "id, parent_id, name, display_name, slug, status, logo_url, city, address",
    )
    .or(`id.eq.${parentId},parent_id.eq.${parentId}`);

  if (error) throw error;
  return ((data as unknown as NodeRow[]) ?? []).map(toNodeRecord);
}

interface NodeRow {
  id: string;
  parent_id: string | null;
  name: string | null;
  display_name: string | null;
  slug: string | null;
  status: string | null;
  logo_url: string | null;
  city: string | null;
  address: string | null;
}

function toNodeRecord(row: NodeRow): NodeRecord {
  return {
    id: row.id,
    parentId: row.parent_id,
    name: row.name,
    displayName: row.display_name,
    slug: row.slug,
    status: row.status,
    logoUrl: row.logo_url,
    city: row.city,
    address: row.address,
  };
}

// logoUrl is a FileList (file upload) and is not persisted here — no
// storage bucket wiring exists yet for node/store logos.
function toNodeInsert(values: NodeFormValues | StoreFormValues) {
  return {
    name: values.name,
    display_name: values.displayName,
    slug: values.slug,
    status: values.status,
    city: values.city,
    address: values.address,
  };
}

export async function createNode(
  values: NodeFormValues,
  parentId: string | null,
): Promise<NodeRecord> {
  const { data, error } = await supabase
    .from("nodes")
    .insert({ ...toNodeInsert(values), parent_id: parentId })
    .select(
      "id, parent_id, name, display_name, slug, status, logo_url, city, address",
    )
    .single();

  if (error) throw error;
  return toNodeRecord(data as NodeRow);
}

export async function updateNode(
  nodeId: string,
  values: NodeFormValues,
): Promise<NodeRecord> {
  const { data, error } = await supabase
    .from("nodes")
    .update(toNodeInsert(values))
    .eq("id", nodeId)
    .select(
      "id, parent_id, name, display_name, slug, status, logo_url, city, address",
    )
    .single();

  if (error) throw error;
  return toNodeRecord(data as NodeRow);
}

export async function createStore(
  values: StoreFormValues,
  parentId: string,
): Promise<NodeRecord> {
  return createNode(values, parentId);
}

export async function updateStore(
  storeId: string,
  values: StoreFormValues,
): Promise<NodeRecord> {
  return updateNode(storeId, values);
}

/**
 * Attaches existing members (looked up by email) to a node. Members table
 * RLS only allows a row to be created/read by its own auth.uid(), so an
 * email that hasn't signed up yet can't be created here — those are
 * skipped and logged rather than thrown, since inviting new users requires
 * a server-side (service-role) flow outside this client-only API.
 */
export async function upsertNodeMembers(
  nodeId: string,
  members: MemberFormValues[],
): Promise<void> {
  if (members.length === 0) return;

  const emails = members.map((m) => m.email);
  const { data: existing, error: lookupError } = await supabase
    .from("members")
    .select("id, email")
    .in("email", emails);

  if (lookupError) throw lookupError;

  const memberIdByEmail = new Map(
    (existing ?? []).map((row) => [row.email as string, row.id as string]),
  );

  const { data: roleRows, error: roleError } = await supabase
    .from("role_definitions")
    .select("id, role_key")
    .in(
      "role_key",
      members.map((m) => m.roleKey),
    );

  if (roleError) throw roleError;

  const roleIdByKey = new Map(
    (roleRows ?? []).map((row) => [row.role_key as string, row.id as string]),
  );

  const rows = members.flatMap((member) => {
    const memberId = memberIdByEmail.get(member.email);
    if (!memberId) {
      console.warn(
        `Skipping member ${member.email}: no registered account yet.`,
      );
      return [];
    }
    return [
      {
        node_id: nodeId,
        member_id: memberId,
        role_id: roleIdByKey.get(member.roleKey) ?? null,
      },
    ];
  });

  if (rows.length === 0) return;

  const { error } = await supabase
    .from("node_members")
    .upsert(rows, { onConflict: "node_id,member_id" });

  if (error) throw error;
}

interface NodeChannelRow {
  id: string;
  node_id: string;
  channel_type: string;
  external_id: string | null;
  url: string | null;
  label: string | null;
  is_primary: boolean;
  status: string | null;
}

function toNodeChannelRecord(row: NodeChannelRow): NodeChannelRecord {
  return {
    id: row.id,
    channelType: row.channel_type,
    externalId: row.external_id,
    url: row.url,
    label: row.label,
    isPrimary: row.is_primary,
    status: row.status,
  };
}

/**
 * Upserts non-secret channel columns via PostgREST, then routes any token
 * through the set_node_channel_token security-definer RPC into Supabase
 * Vault. Tokens are never written to node_channels directly.
 */
export async function upsertNodeChannels(
  nodeId: string,
  channels: ChannelFormValues[],
): Promise<NodeChannelRecord[]> {
  if (channels.length === 0) return [];

  const rows = channels.map((channel) => ({
    node_id: nodeId,
    channel_type: channel.channelType,
    external_id: channel.externalId ?? null,
    url: channel.url,
    label: channel.label ?? null,
    is_primary: channel.isPrimary ?? false,
    status: channel.status,
  }));

  const { data, error } = await supabase
    .from("node_channels")
    .upsert(rows, { onConflict: "node_id,channel_type,external_id" })
    .select(
      "id, node_id, channel_type, external_id, url, label, is_primary, status",
    );

  if (error) throw error;

  const savedRows = (data as unknown as NodeChannelRow[]) ?? [];
  const savedByKey = new Map(
    savedRows.map((row) => [
      `${row.channel_type}:${row.external_id ?? ""}`,
      row,
    ]),
  );

  await Promise.all(
    channels.map(async (channel) => {
      if (!channel.token) return;
      const saved = savedByKey.get(
        `${channel.channelType}:${channel.externalId ?? ""}`,
      );
      if (!saved) return;
      const { error: tokenError } = await supabase.rpc(
        "set_node_channel_token",
        {
          p_channel_id: saved.id,
          p_token: channel.token,
          p_token_type: "meta_page_token",
        },
      );
      if (tokenError) throw tokenError;
    }),
  );

  return savedRows.map(toNodeChannelRecord);
}
