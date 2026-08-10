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
  capabilities: string[] | null;
}

export interface MembershipRecord {
  nodeId: string;
  node: NodeRecord;
  role: RoleRecord | null;
}

export type NodeScope = "all" | "own";

const ACTIVE_NODE_ID_STORAGE_KEY = "selfnode.activeNodeId";

interface NodesState {
  /** The logged-in user's own node_members rows, joined with node + role. Always fetched on login. */
  memberships: MembershipRecord[];
  /** The resolved node list to show: own nodes, or every node for platform-tier members. */
  nodes: NodeRecord[];
  scope: NodeScope | null;
  isLoading: boolean;
  error: string | null;
  /** The node/store the user picked to work in, for users with multiple memberships. */
  activeNodeId: string | null;
  isPlatformAdmin: () => boolean;
  hasCapability: (key: string) => boolean;
  setMemberships: (memberships: MembershipRecord[]) => void;
  setNodes: (nodes: NodeRecord[]) => void;
  setScope: (scope: NodeScope | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setActiveNodeId: (nodeId: string | null) => void;
  reset: () => void;
}

const initialState = {
  memberships: [] as MembershipRecord[],
  nodes: [] as NodeRecord[],
  scope: null as NodeScope | null,
  isLoading: true,
  error: null as string | null,
  activeNodeId: (typeof window !== "undefined"
    ? window.localStorage.getItem(ACTIVE_NODE_ID_STORAGE_KEY)
    : null) as string | null,
};

// Compares two id-bearing lists by content (sorted by id), ignoring array
// order/object identity — used to skip no-op set() calls when a refetch
// returns identical rows (e.g. after a silent token refresh), which would
// otherwise hand consumers a new array reference and trigger spurious
// re-fetches. Deliberately a full content compare, not just an id-set
// compare — a row whose id is unchanged but whose fields were edited (e.g.
// after saving a node/store) must still be treated as different.
function sameIds<T extends { id: string }>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x.id.localeCompare(y.id));
  const sortedB = [...b].sort((x, y) => x.id.localeCompare(y.id));
  return sortedA.every(
    (item, i) => JSON.stringify(item) === JSON.stringify(sortedB[i]),
  );
}

export const useNodesStore = create<NodesState>()((set, get) => ({
  ...initialState,
  isPlatformAdmin: () =>
    get().memberships.some(
      (m: MembershipRecord) => m.role?.roleKey === "platform_admin",
    ),
  hasCapability: (key) => {
    const resource = key.split(":")[0];
    return get().memberships.some((m) => {
      const capabilities = m.role?.capabilities;
      if (!capabilities) return false;
      return (
        capabilities.includes(key) ||
        capabilities.includes(`${resource}:*`) ||
        capabilities.includes("*:*")
      );
    });
  },
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
  setActiveNodeId: (nodeId) => {
    if (typeof window !== "undefined") {
      if (nodeId) {
        window.localStorage.setItem(ACTIVE_NODE_ID_STORAGE_KEY, nodeId);
      } else {
        window.localStorage.removeItem(ACTIVE_NODE_ID_STORAGE_KEY);
      }
    }
    set({ activeNodeId: nodeId });
  },
  reset: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ACTIVE_NODE_ID_STORAGE_KEY);
    }
    set({ ...initialState, activeNodeId: null });
  },
}));
