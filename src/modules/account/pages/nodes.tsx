import { useEffect } from "react";
import { useNodesStore } from "../../../shared/store/nodesStore";
import { refetchNodes } from "@/shared/providers/NodesProvider";
import NodesTable from "../components/nodes.table";

export default function BrowseAllNodes() {
  const isPlatformAdmin = useNodesStore((state) => state.isPlatformAdmin());

  useEffect(() => {
    void refetchNodes();
  }, []);

  return (
    <>
      <div className="card w-full bg-base-200 card-xs shadow-sm p-6">
        <div className="card-body">
          <div className="flex items-center justify-end mb-4">
            {isPlatformAdmin && (
              <a href="/node/new" className="btn btn-primary cursor-pointer">
                Add Node
              </a>
            )}
          </div>
          <NodesTable />
        </div>
      </div>
    </>
  );
}
