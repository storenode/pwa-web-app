import { useEffect } from "react";
import type { ReactNode } from "react";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../store/authStore";
import {
  useNodesStore,
  type MembershipRecord,
  type NodeRecord,
} from "../store/nodesStore";

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

interface RoleRow {
  id: string;
  role_key: string;
  role_level: string | null;
  display_name: string | null;
}

interface MembershipRow {
  node_id: string;
  nodes: NodeRow | null;
  role_definitions: RoleRow | null;
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

function toMembershipRecord(row: MembershipRow): MembershipRecord | null {
  if (!row.nodes) return null;
  return {
    nodeId: row.node_id,
    node: toNodeRecord(row.nodes),
    role: row.role_definitions
      ? {
          id: row.role_definitions.id,
          roleKey: row.role_definitions.role_key,
          roleLevel: row.role_definitions.role_level,
          displayName: row.role_definitions.display_name,
        }
      : null,
  };
}

/**
 * Standard query run once per login: the user's own node_members rows,
 * joined with their node and role. Role-specific behavior (e.g. platform
 * admins seeing every node) branches off this base result.
 */
async function fetchOwnMemberships(
  memberId: string,
): Promise<MembershipRecord[]> {
  const { data, error } = await supabase
    .from("node_members")
    .select("node_id, nodes(*), role_definitions(*)")
    .eq("member_id", memberId);

  if (error) throw error;

  return ((data as unknown as MembershipRow[]) ?? [])
    .map(toMembershipRecord)
    .filter((row): row is MembershipRecord => row !== null);
}

async function fetchAllNodes(): Promise<NodeRecord[]> {
  const { data, error } = await supabase.from("nodes").select("*");
  if (error) throw error;
  return ((data as unknown as NodeRow[]) ?? []).map(toNodeRecord);
}

async function fetchChildNodes(parentIds: string[]): Promise<NodeRecord[]> {
  if (parentIds.length === 0) return [];

  const { data, error } = await supabase
    .from("nodes")
    .select("*")
    .in("parent_id", parentIds);

  if (error) throw error;
  return ((data as unknown as NodeRow[]) ?? []).map(toNodeRecord);
}

export function NodesProvider({ children }: { children: ReactNode }) {
  const session = useAuthStore((state) => state.session);
  const member = useAuthStore((state) => state.member);
  const authLoading = useAuthStore((state) => state.isLoading);

  const setMemberships = useNodesStore((state) => state.setMemberships);
  const setNodes = useNodesStore((state) => state.setNodes);
  const setScope = useNodesStore((state) => state.setScope);
  const setLoading = useNodesStore((state) => state.setLoading);
  const setError = useNodesStore((state) => state.setError);
  const reset = useNodesStore((state) => state.reset);

  useEffect(() => {
    if (authLoading) return;

    if (!session || !member) {
      reset();
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchOwnMemberships(member.id)
      .then(async (memberships) => {
        if (cancelled) return;
        setMemberships(memberships);

        // Only platform_admin gets system-wide visibility. Other
        // platform-tier roles (platform_manager, platform_editor) are
        // scoped to whichever nodes they hold a node_members row for —
        // e.g. an editor or accountant assigned to a handful of stores —
        // same as any store-tier role.
        const isPlatformAdmin = memberships.some(
          (m) => m.role?.roleKey === "platform_admin",
        );

        console.log("--== isPlatformAdmin ", isPlatformAdmin);

        if (isPlatformAdmin) {
          const nodes = await fetchAllNodes();
          console.log("--== fetchAllNodes ", nodes);
          if (cancelled) return;
          setScope("all");
          setNodes(nodes);
          return;
        }

        // brand_admin cascades to that brand's stores: fetch every node
        // whose parent_id is one of their brand_admin nodes, and merge it
        // with their own membership nodes (still "own" scope, not
        // system-wide — just their brand(s) plus descendants).
        const brandAdminNodeIds = memberships
          .filter((m) => m.role?.roleKey === "brand_admin")
          .map((m) => m.nodeId);

        if (brandAdminNodeIds.length > 0) {
          const childNodes = await fetchChildNodes(brandAdminNodeIds);
          if (cancelled) return;

          const merged = new Map<string, NodeRecord>();
          for (const n of memberships.map((m) => m.node)) merged.set(n.id, n);
          for (const n of childNodes) merged.set(n.id, n);

          setScope("own");
          setNodes(Array.from(merged.values()));
          return;
        }

        setScope("own");
        setNodes(memberships.map((m) => m.node));
      })
      .catch((err: Error) => {
        if (cancelled) return;
        console.error("Failed to fetch nodes:", err.message);
        setError(err.message);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    session,
    member,
    authLoading,
    setMemberships,
    setNodes,
    setScope,
    setLoading,
    setError,
    reset,
  ]);

  return <>{children}</>;
}
