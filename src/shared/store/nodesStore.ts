import { create } from "zustand";

export interface NodeMemberRecord {
  id: string;
  memberId: string;
  email: string | null;
  displayName: string | null;
  roleId: string;
  roleKey: string | null;
}

export interface NodeChannelRecord {
  id: string;
  channelType: string;
  externalId: string | null;
  url: string | null;
  label: string | null;
  isPrimary: boolean;
  status: string | null;
}

export interface NodeRecord {
  id: string;
  parentId: string | null;
  name: string | null;
  displayName: string | null;
  slug: string | null;
  status: string | null;
  logoUrl: string | null;
  city: string | null;
  address: string | null;
  members?: NodeMemberRecord[];
  channels?: NodeChannelRecord[];
}

export interface RoleRecord {
  id: string;
  roleKey: string;
  roleLevel: string | null;
  displayName: string | null;
}

export interface MembershipRecord {
  nodeId: string;
  node: NodeRecord;
  role: RoleRecord | null;
}

export type NodeScope = "all" | "own";

interface NodesState {
  /** The logged-in user's own node_members rows, joined with node + role. Always fetched on login. */
  memberships: MembershipRecord[];
  /** The resolved node list to show: own nodes, or every node for platform-tier members. */
  nodes: NodeRecord[];
  scope: NodeScope | null;
  isLoading: boolean;
  error: string | null;
  isPlatformAdmin: () => boolean;
  setMemberships: (memberships: MembershipRecord[]) => void;
  setNodes: (nodes: NodeRecord[]) => void;
  setScope: (scope: NodeScope | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  memberships: [] as MembershipRecord[],
  nodes: [] as NodeRecord[],
  scope: null as NodeScope | null,
  isLoading: true,
  error: null as string | null,
};

// Compares two id-bearing lists by sorted id set, ignoring order/object
// identity — used to skip no-op set() calls when a refetch returns the
// same rows (e.g. after a silent token refresh), which would otherwise
// hand consumers a new array reference and trigger spurious re-fetches.
function sameIds(a: { id: string }[], b: { id: string }[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = a.map((x) => x.id).sort();
  const sortedB = b.map((x) => x.id).sort();
  return sortedA.every((id, i) => id === sortedB[i]);
}

export const useNodesStore = create<NodesState>()((set, get) => ({
  ...initialState,
  isPlatformAdmin: () =>
    get().memberships.some(
      (m: MembershipRecord) => m.role?.roleKey === "platform_admin",
    ),
  setMemberships: (memberships) => {
    const current = get().memberships.map((m) => ({ id: m.nodeId }));
    const next = memberships.map((m) => ({ id: m.nodeId }));
    if (sameIds(current, next)) return;
    set({ memberships });
  },
  setNodes: (nodes) => {
    const current = get().nodes;
    if (sameIds(current, nodes)) return;
    set({ nodes });
  },
  setScope: (scope) => set({ scope }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ ...initialState }),
}));
