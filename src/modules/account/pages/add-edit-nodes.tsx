import { Link, useParams } from "react-router-dom";
import { useNodesStore } from "../../../shared/store/nodesStore";

export default function AddEditNodes() {
  const { nodeId } = useParams<{ nodeId: string }>();
  const node = useNodesStore((state) =>
    state.nodes.find((n) => n.id === nodeId),
  );

  return (
    <div className="p-6">
      <Link to="/node/" className="link link-hover text-sm opacity-70">
        ← Back to all nodes
      </Link>

      <h1 className="text-2xl font-semibold text-text mt-4">
        {node ? node.displayName : "Add / Edit Node"}
      </h1>

      <div className="card bg-surface border border-border shadow-sm mt-6 max-w-xl">
        <div className="card-body">
          <p className="opacity-70 text-sm">
            This is a placeholder screen. The full add/edit form for a brand
            or store node — name, slug, city, address, logo, status — will
            live here.
          </p>
          {node && (
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="opacity-60 w-24 shrink-0">Slug</dt>
                <dd className="text-text">{node.slug ?? "—"}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="opacity-60 w-24 shrink-0">City</dt>
                <dd className="text-text">{node.city ?? "—"}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="opacity-60 w-24 shrink-0">Status</dt>
                <dd>
                  <span
                    className={`badge ${node.status === "active" ? "badge-success" : "badge-ghost"} badge-sm`}
                  >
                    {node.status ?? "—"}
                  </span>
                </dd>
              </div>
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
