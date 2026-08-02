import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useFieldArray } from "react-hook-form";
import * as v from "valibot";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
  type ColumnDef,
  type ExpandedState,
} from "@tanstack/react-table";
import {
  ALL_ROLES,
  memberSchema,
  STORE_ROLES,
  type MemberFormValues,
} from "./store.form";
import type { NodeFormValues } from "./node.form";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/shared/fields/ComponentTable";
import {
  useNodesStore,
  type NodeMemberRecord,
} from "@/shared/store/nodesStore";
import { fetchMembersByParent } from "../account.api";

interface NodeMembersFormProps {
  nodeId?: string;
}

type MemberDraft = Omit<MemberFormValues, "roleKey"> & { roleKey: string };

const emptyDraft: MemberDraft = {
  firstName: "",
  lastName: "",
  displayName: "",
  email: "",
  roleKey: "",
};

const roleDisplayName = (roleKey: string) =>
  ALL_ROLES.find((role) => role.roleKey === roleKey)?.displayName ?? roleKey;

interface StoreMemberTreeRow {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
  isStore: boolean;
  href: string | null;
  subRows?: StoreMemberTreeRow[];
}

function buildStoreMemberTree(
  parentId: string,
  stores: { id: string; name: string }[],
  membersByStore: Record<string, NodeMemberRecord[]>,
): StoreMemberTreeRow[] {
  return stores.map((store) => {
    const members = membersByStore[store.id] ?? [];
    return {
      id: store.id,
      name: `${store.name} (${members.length} ${members.length === 1 ? "member" : "members"})`,
      email: null,
      role: null,
      isStore: true,
      href: `/node/${parentId}/store/${store.id}`,
      subRows: members.map((member) => ({
        id: member.id,
        name: member.displayName ?? "—",
        email: member.email,
        role: member.roleKey ? roleDisplayName(member.roleKey) : null,
        isStore: false,
        href: null,
      })),
    };
  });
}

function StoreMembersTree({
  data,
  isLoading,
}: {
  data: StoreMemberTreeRow[];
  isLoading: boolean;
}) {
  const [expanded, setExpanded] = useState<ExpandedState>(true);

  const columns: ColumnDef<StoreMemberTreeRow>[] = [
    {
      accessorKey: "name",
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
              {row.getIsExpanded() ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
              )}
            </button>
          ) : (
            <span className="w-6" />
          )}
          {row.original.href ? (
            <Link
              to={row.original.href}
              className="link link-hover font-medium text-primary"
            >
              {getValue<string>()}
            </Link>
          ) : (
            <span className="text-base-content">{getValue<string>()}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ getValue }) => (
        <span className="opacity-60">{getValue<string | null>() ?? "—"}</span>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ getValue }) => (
        <span className="opacity-60">{getValue<string | null>() ?? "—"}</span>
      ),
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

  if (isLoading) {
    return <span className="loading loading-spinner loading-sm text-primary" />;
  }

  if (data.length === 0) {
    return <p className="text-sm text-base-content/60">No stores yet.</p>;
  }

  return (
    <Table>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function NodeMembersForm({ nodeId }: NodeMembersFormProps) {
  const { fields, append, remove } = useFieldArray<NodeFormValues, "members">({
    name: "members",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState<MemberDraft>(emptyDraft);
  const [draftErrors, setDraftErrors] = useState<
    Partial<Record<keyof MemberFormValues, string>>
  >({});

  const nodes = useNodesStore((state) => state.nodes);
  const childStores = useMemo(
    () => nodes.filter((n) => n.parentId === nodeId),
    [nodes, nodeId],
  );
  const [childMembers, setChildMembers] = useState<
    Record<string, NodeMemberRecord[]>
  >({});
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const storeMemberTree = useMemo(
    () =>
      nodeId
        ? buildStoreMemberTree(
            nodeId,
            childStores.map((store) => ({
              id: store.id,
              name: store.displayName ?? store.name ?? store.id,
            })),
            childMembers,
          )
        : [],
    [nodeId, childStores, childMembers],
  );

  useEffect(() => {
    if (!nodeId) {
      setChildMembers({});
      return;
    }

    let cancelled = false;
    setIsLoadingChildren(true);

    fetchMembersByParent(nodeId)
      .then((rows) => {
        if (cancelled) return;
        const grouped: Record<string, NodeMemberRecord[]> = {};
        for (const row of rows) {
          if (row.nodeId === nodeId) continue; // own members, handled above
          (grouped[row.nodeId] ??= []).push(row);
        }
        setChildMembers(grouped);
      })
      .catch((err: Error) => {
        console.error("Failed to fetch node members:", err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingChildren(false);
      });

    return () => {
      cancelled = true;
    };
  }, [nodeId]);

  const updateDraft = (key: keyof MemberFormValues, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleCancel = () => {
    setIsAdding(false);
    setDraft(emptyDraft);
    setDraftErrors({});
  };

  const handleSave = () => {
    const result = v.safeParse(memberSchema, draft);
    if (!result.success) {
      const nextErrors: Partial<Record<keyof MemberFormValues, string>> = {};
      for (const issue of result.issues) {
        const key = issue.path?.[0]?.key as keyof MemberFormValues | undefined;
        if (key && !nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
      setDraftErrors(nextErrors);
      return;
    }

    append(result.output);
    setIsAdding(false);
    setDraft(emptyDraft);
    setDraftErrors({});
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-base-content">Members</h3>
        {!isAdding && (
          <button
            type="button"
            className="btn btn-sm btn-outline btn-primary"
            onClick={() => setIsAdding(true)}
          >
            Add Member
          </button>
        )}
      </div>

      {isAdding && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-base-300 p-4">
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">First Name</span>
            </div>
            <input
              type="text"
              className={`input input-bordered w-full ${draftErrors.firstName ? "input-error" : ""}`}
              value={draft.firstName}
              onChange={(e) => updateDraft("firstName", e.target.value)}
            />
            {draftErrors.firstName && (
              <div className="label">
                <span className="label-text-alt text-error">
                  {draftErrors.firstName}
                </span>
              </div>
            )}
          </label>

          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Last Name</span>
            </div>
            <input
              type="text"
              className={`input input-bordered w-full ${draftErrors.lastName ? "input-error" : ""}`}
              value={draft.lastName}
              onChange={(e) => updateDraft("lastName", e.target.value)}
            />
            {draftErrors.lastName && (
              <div className="label">
                <span className="label-text-alt text-error">
                  {draftErrors.lastName}
                </span>
              </div>
            )}
          </label>

          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Display Name</span>
            </div>
            <input
              type="text"
              className={`input input-bordered w-full ${draftErrors.displayName ? "input-error" : ""}`}
              value={draft.displayName}
              onChange={(e) => updateDraft("displayName", e.target.value)}
            />
            {draftErrors.displayName && (
              <div className="label">
                <span className="label-text-alt text-error">
                  {draftErrors.displayName}
                </span>
              </div>
            )}
          </label>

          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Email</span>
            </div>
            <input
              type="email"
              className={`input input-bordered w-full ${draftErrors.email ? "input-error" : ""}`}
              value={draft.email}
              onChange={(e) => updateDraft("email", e.target.value)}
            />
            {draftErrors.email && (
              <div className="label">
                <span className="label-text-alt text-error">
                  {draftErrors.email}
                </span>
              </div>
            )}
          </label>

          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Role</span>
            </div>
            <select
              className={`select select-bordered w-full ${draftErrors.roleKey ? "select-error" : ""}`}
              value={draft.roleKey}
              onChange={(e) => updateDraft("roleKey", e.target.value)}
            >
              <option value="">Select role</option>
              {STORE_ROLES.map((role) => (
                <option key={role.roleKey} value={role.roleKey}>
                  {role.displayName}
                </option>
              ))}
            </select>
            {draftErrors.roleKey && (
              <div className="label">
                <span className="label-text-alt text-error">
                  {draftErrors.roleKey}
                </span>
              </div>
            )}
          </label>

          <div className="sm:col-span-2 flex items-center justify-end gap-2">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {fields.length === 0 ? (
        <p className="text-sm text-base-content/60">No members added yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader className="text-start">
                Name
              </TableCell>
              <TableCell isHeader className="text-start">
                Email
              </TableCell>
              <TableCell isHeader className="text-start">
                Role
              </TableCell>
              <TableCell isHeader className="text-start">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => (
              <TableRow key={field.id}>
                <TableCell>{field.displayName}</TableCell>
                <TableCell>{field.email}</TableCell>
                <TableCell>{roleDisplayName(field.roleKey)}</TableCell>
                <TableCell>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost text-error"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {childStores.length > 0 && (
        <div className="flex flex-col gap-3 mt-2">
          <h4 className="text-sm font-semibold text-base-content/80">
            Store Members
          </h4>
          <StoreMembersTree
            data={storeMemberTree}
            isLoading={isLoadingChildren}
          />
        </div>
      )}
    </div>
  );
}
