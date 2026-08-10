import MyStores from "../components/MyStores";
import { useNodesStore } from "@/shared/store/nodesStore";
import { CAPABILITIES } from "@/shared/capabilities";
import { routePaths } from "@/shared/utils/routePaths";

export default function Dashboard() {
  const canManageNodes = useNodesStore((state) =>
    state.hasCapability(CAPABILITIES["nodes:manage"]),
  );
  const canManageStores = useNodesStore((state) =>
    state.hasCapability(CAPABILITIES["store:manage"]),
  );
  const activeNodeId = useNodesStore((state) => state.activeNodeId);
  const activeNode = useNodesStore((state) =>
    state.memberships.find((m) => m.nodeId === activeNodeId),
  )?.node;
  // "Add Store" always creates under a brand/parent node — if the active
  // node is itself a store, use its parent instead of the store's own id.
  const addStoreParentId = activeNode
    ? (activeNode.parentId ?? activeNode.id)
    : null;

  return (
    <div className="flex flex-col gap-4">
      {canManageNodes && (
        <div className="flex items-center justify-end mb-4">
          <a
            href="/node/new"
            className="btn btn-success hover:btn-success cursor-pointer"
          >
            Add Node
          </a>
        </div>
      )}
      {canManageStores && addStoreParentId && (
        <div className="flex items-center justify-end mb-4">
          <a
            href={routePaths.newStore(addStoreParentId)}
            className="btn btn-success hover:btn-success cursor-pointer"
          >
            Add Store
          </a>
        </div>
      )}
      <MyStores />
    </div>
  );
}
