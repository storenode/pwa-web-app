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
import ComponentCard from "@/shared/fields/ComponentCard";
import {
  Table,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "@/shared/fields/ComponentTable";
import { type NodeTreeRow } from "@/modules/account/account.types";
import { useNodesStore } from "@/shared/store/nodesStore";
import { routePaths } from "@/shared/utils/routePaths";
import { buildTree } from "../account.utils";

export default function NodesTable() {
  const isLoading = useNodesStore((state) => state.isLoading);
  const [expanded, setExpanded] = useState<ExpandedState>(true);
  const nodes = useNodesStore((state) => state.nodes);
  const data = useMemo(() => buildTree(nodes), [nodes]);

  const columns: ColumnDef<NodeTreeRow>[] = [
    {
      accessorKey: "displayName",
      header: "Name",
      cell: ({ row, getValue }) => (
        <div
          style={{ paddingLeft: `${row.depth * 1.5}rem` }}
          className={`flex items-center gap-2`}
        >
          {row.getCanExpand() ? (
            <button
              type="button"
              onClick={row.getToggleExpandedHandler()}
              className="btn btn-ghost btn-xs btn-circle"
              aria-label={row.getIsExpanded() ? "Collapse" : "Expand"}
            >
              {row.getIsExpanded() ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
              )}
            </button>
          ) : (
            <span className="w-6" />
          )}
          {/* Only brand/root-level nodes (no parent) can have store
              children — this must NOT depend on row.getCanExpand(), which
              is only true once the brand already has at least one store
              (see buildTree in account.utils.tsx), otherwise a brand with
              zero stores can never get its first one added. */}
          {!row.original.parentId && (
            <div className="dropdown dropdown-right dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:bg-base-300 hover:text-base-content"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                  />
                </svg>
              </div>
              <ul
                tabIndex={-1}
                className="dropdown-content menu menu-sm bg-base-100 border border-base-300 rounded-box z-10 w-44 p-1.5 shadow-lg"
              >
                <li>
                  <Link
                    to={routePaths.newStore(row.original.id)}
                    className="rounded-md font-medium text-base-content hover:bg-base-200 active:!bg-primary active:!text-primary-content"
                  >
                    Add Store
                  </Link>
                </li>
              </ul>
            </div>
          )}
          <div className="flex items-center gap-2">
            {!row.original.parentId && (
              <div className="badge badge-warning badge-xs">Node</div>
            )}
            <Link
              to={
                row.original.parentId
                  ? routePaths.store(row.original.parentId, row.original.id)
                  : routePaths.node(row.original.id)
              }
              className="link link-hover font-medium text-primary cursor-pointer"
            >
              {getValue<string | null>() ?? "—"}
            </Link>
          </div>
        </div>
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
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : data.length === 0 ? (
        <p className="text-base-content/60">No nodes to show.</p>
      ) : (
        <ComponentCard title="Nodes">
          <div className="overflow-auto h-[50vh] w-full">
            <Table className="table table-xs table-pin-rows table-pin-cols">
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        key={header.id}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-5 py-4 sm:px-6 text-start"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ComponentCard>
      )}
    </>
  );
}
