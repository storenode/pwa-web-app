import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNodesStore } from "@/shared/store/nodesStore";

export default function SelectStore() {
  const navigate = useNavigate();
  const memberships = useNodesStore((state) => state.memberships);
  const setActiveNodeId = useNodesStore((state) => state.setActiveNodeId);

  // Nothing to choose from — auto-select and move on rather than showing an
  // empty/degenerate picker (ProtectedRoute normally keeps single/zero-
  // membership users off this route, but guard here too for direct nav).
  useEffect(() => {
    if (memberships.length === 1) {
      setActiveNodeId(memberships[0].nodeId);
      navigate("/dashboard", { replace: true });
    }
  }, [memberships, navigate, setActiveNodeId]);

  const handleSelect = (nodeId: string) => {
    setActiveNodeId(nodeId);
    navigate("/dashboard", { replace: true });
  };

  if (memberships.length <= 1) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-semibold text-base-content">
            Choose a store to continue
          </h1>
          <p className="text-sm text-base-content/60">
            You're a member of more than one store. Pick one to launch into.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {memberships.map((membership) => (
            <button
              key={membership.nodeId}
              type="button"
              onClick={() => handleSelect(membership.nodeId)}
              className="card border border-base-300 bg-base-100 text-left hover:border-primary hover:shadow-md transition-colors cursor-pointer"
            >
              <div className="card-body gap-2">
                <h2 className="card-title text-base">
                  {membership.node.displayName ?? membership.node.name}
                </h2>
                {membership.node.city && (
                  <p className="text-sm text-base-content/60">
                    {membership.node.city}
                  </p>
                )}
                {membership.role?.displayName && (
                  <span className="badge badge-ghost badge-sm w-fit">
                    {membership.role.displayName}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
