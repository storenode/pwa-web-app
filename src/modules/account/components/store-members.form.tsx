import { useState } from "react";
import { useFieldArray } from "react-hook-form";
import * as v from "valibot";
import {
  ALL_ROLES,
  memberSchema,
  STORE_ROLES,
  type MemberFormValues,
  type StoreFormValues,
} from "./store.form";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/shared/fields/ComponentTable";

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

export default function StoreMembersForm() {
  const { fields, append, remove } = useFieldArray<
    StoreFormValues,
    "members"
  >({
    name: "members",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState<MemberDraft>(emptyDraft);
  const [draftErrors, setDraftErrors] = useState<
    Partial<Record<keyof MemberFormValues, string>>
  >({});

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
    </div>
  );
}
