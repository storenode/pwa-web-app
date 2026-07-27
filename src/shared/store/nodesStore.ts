import { create } from 'zustand'

export interface NodeRecord {
  id: string
  parentId: string | null
  name: string | null
  displayName: string | null
  slug: string | null
  status: string | null
  logoUrl: string | null
  city: string | null
  address: string | null
}

export interface RoleRecord {
  id: string
  roleKey: string
  roleLevel: string | null
  displayName: string | null
}

export interface MembershipRecord {
  nodeId: string
  node: NodeRecord
  role: RoleRecord | null
}

export type NodeScope = 'all' | 'own'

interface NodesState {
  /** The logged-in user's own node_members rows, joined with node + role. Always fetched on login. */
  memberships: MembershipRecord[]
  /** The resolved node list to show: own nodes, or every node for platform-tier members. */
  nodes: NodeRecord[]
  scope: NodeScope | null
  isLoading: boolean
  error: string | null
  setMemberships: (memberships: MembershipRecord[]) => void
  setNodes: (nodes: NodeRecord[]) => void
  setScope: (scope: NodeScope | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  memberships: [] as MembershipRecord[],
  nodes: [] as NodeRecord[],
  scope: null as NodeScope | null,
  isLoading: true,
  error: null as string | null,
}

export const useNodesStore = create<NodesState>()((set) => ({
  ...initialState,
  setMemberships: (memberships) => set({ memberships }),
  setNodes: (nodes) => set({ nodes }),
  setScope: (scope) => set({ scope }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ ...initialState }),
}))
