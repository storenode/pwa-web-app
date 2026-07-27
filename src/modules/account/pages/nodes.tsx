import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
  type ColumnDef,
  type ExpandedState,
} from "@tanstack/react-table";
import {
  useNodesStore,
  type NodeRecord,
} from "../../../shared/store/nodesStore";

interface NodeTreeRow extends NodeRecord {
  subRows?: NodeTreeRow[];
}

function buildTree(nodes: NodeRecord[]): NodeTreeRow[] {
  const byParent = new Map<string, NodeTreeRow[]>();

  for (const node of nodes) {
    const key = node.parentId ?? "__root__";
    const siblings = byParent.get(key) ?? [];
    siblings.push({ ...node });
    byParent.set(key, siblings);
  }

  for (const row of byParent.values()) {
    for (const row2 of row) {
      const children = byParent.get(row2.id);
      if (children) row2.subRows = children;
    }
  }

  return byParent.get("__root__") ?? [];
}

const columns: ColumnDef<NodeTreeRow>[] = [
  {
    accessorKey: "displayName",
    header: "Name",
    cell: ({ row, getValue }) => (
      <div
        style={{ paddingLeft: `${row.depth * 1.5}rem` }}
        className="flex items-center gap-2"
      >
        {row.getCanExpand() ? (
          <button
            type="button"
            onClick={row.getToggleExpandedHandler()}
            className="btn btn-ghost btn-xs btn-circle"
            aria-label={row.getIsExpanded() ? "Collapse" : "Expand"}
          >
            {row.getIsExpanded() ? "▾" : "▸"}
          </button>
        ) : (
          <span className="w-6" />
        )}
        <Link
          to={`/node/${row.original.id}`}
          className="link link-hover font-medium text-primary cursor-pointer"
        >
          {getValue<string | null>() ?? "—"}
        </Link>
      </div>
    ),
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ getValue }) => (
      <span className="opacity-60">{getValue<string | null>() ?? "—"}</span>
    ),
  },
  {
    accessorKey: "city",
    header: "City",
    cell: ({ getValue }) => (
      <span className="opacity-60">{getValue<string | null>() ?? "—"}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue<string | null>();
      const isActive = status === "active";
      return (
        <span
          className={`badge ${isActive ? "badge-success" : "badge-ghost"} badge-sm`}
        >
          {status ?? "—"}
        </span>
      );
    },
  },
];

export default function BrowseAllNodes() {
  const nodes = useNodesStore((state) => state.nodes);
  const isLoading = useNodesStore((state) => state.isLoading);
  const [expanded, setExpanded] = useState<ExpandedState>(true);

  const data = useMemo(() => buildTree(nodes), [nodes]);

  const table = useReactTable({
    data,
    columns,
    state: { expanded },
    onExpandedChange: setExpanded,
    getSubRows: (row) => row.subRows,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <>
      <h1 className="text-2xl font-semibold text-text mb-6">Store Nodes</h1>
      <div className="card w-full bg-base-200 card-xs shadow-sm p-6">
        <div className="card-body">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : data.length === 0 ? (
            <p className="text-text-muted">No nodes to show.</p>
          ) : (
            <div className="card bg-surface border border-border shadow-sm overflow-x-auto">
              <table className="table node-tree-table">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
