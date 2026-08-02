import { useState } from "react";
import { useFieldArray } from "react-hook-form";
import * as v from "valibot";
import {
  channelSchema,
  CHANNEL_STATUSES,
  CHANNEL_TYPE_LABELS,
  CHANNEL_TYPES,
  type ChannelFormValues,
  type StoreFormValues,
} from "./store.form";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/shared/fields/ComponentTable";

type ChannelDraft = Omit<ChannelFormValues, "channelType" | "status"> & {
  channelType: string;
  status: string;
};

const emptyDraft: ChannelDraft = {
  channelType: "",
  externalId: "",
  url: "",
  label: "",
  isPrimary: false,
  status: "",
  token: "",
};

export default function StoreChannelsForm() {
  const { fields, append, remove } = useFieldArray<StoreFormValues, "channels">(
    {
      name: "channels",
    },
  );
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState<ChannelDraft>(emptyDraft);
  const [draftErrors, setDraftErrors] = useState<
    Partial<Record<keyof ChannelDraft, string>>
  >({});

  const updateDraft = <K extends keyof ChannelDraft>(
    key: K,
    value: ChannelDraft[K],
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleCancel = () => {
    setIsAdding(false);
    setDraft(emptyDraft);
    setDraftErrors({});
  };

  const handleSave = () => {
    const result = v.safeParse(channelSchema, draft);
    if (!result.success) {
      const nextErrors: Partial<Record<keyof ChannelDraft, string>> = {};
      for (const issue of result.issues) {
        const key = issue.path?.[0]?.key as keyof ChannelDraft | undefined;
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
        <h3 className="text-lg font-semibold text-base-content">Channels</h3>
        {!isAdding && (
          <button
            type="button"
            className="btn btn-sm btn-outline btn-primary"
            onClick={() => setIsAdding(true)}
          >
            Add Channel
          </button>
        )}
      </div>

      {isAdding && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-base-300 p-4">
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Channel Type</span>
            </div>
            <select
              className={`select select-bordered w-full ${draftErrors.channelType ? "select-error" : ""}`}
              value={draft.channelType}
              onChange={(e) => updateDraft("channelType", e.target.value)}
            >
              <option value="">Select channel type</option>
              {CHANNEL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {CHANNEL_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
            {draftErrors.channelType && (
              <div className="label">
                <span className="label-text-alt text-error">
                  {draftErrors.channelType}
                </span>
              </div>
            )}
          </label>

          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Status</span>
            </div>
            <select
              className={`select select-bordered w-full ${draftErrors.status ? "select-error" : ""}`}
              value={draft.status}
              onChange={(e) => updateDraft("status", e.target.value)}
            >
              <option value="">Select status</option>
              {CHANNEL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status === "active" ? "Active" : "Inactive"}
                </option>
              ))}
            </select>
            {draftErrors.status && (
              <div className="label">
                <span className="label-text-alt text-error">
                  {draftErrors.status}
                </span>
              </div>
            )}
          </label>

          <label className="form-control w-full sm:col-span-2">
            <div className="label">
              <span className="label-text">URL</span>
            </div>
            <input
              type="text"
              className={`input input-bordered w-full ${draftErrors.url ? "input-error" : ""}`}
              value={draft.url}
              onChange={(e) => updateDraft("url", e.target.value)}
            />
            {draftErrors.url && (
              <div className="label">
                <span className="label-text-alt text-error">
                  {draftErrors.url}
                </span>
              </div>
            )}
          </label>

          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Label (optional)</span>
            </div>
            <input
              type="text"
              className={`input input-bordered w-full ${draftErrors.label ? "input-error" : ""}`}
              value={draft.label}
              onChange={(e) => updateDraft("label", e.target.value)}
            />
            {draftErrors.label && (
              <div className="label">
                <span className="label-text-alt text-error">
                  {draftErrors.label}
                </span>
              </div>
            )}
          </label>

          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">External ID (optional)</span>
            </div>
            <input
              type="text"
              className={`input input-bordered w-full ${draftErrors.externalId ? "input-error" : ""}`}
              value={draft.externalId}
              onChange={(e) => updateDraft("externalId", e.target.value)}
            />
            {draftErrors.externalId && (
              <div className="label">
                <span className="label-text-alt text-error">
                  {draftErrors.externalId}
                </span>
              </div>
            )}
          </label>

          <label className="form-control w-full sm:col-span-2">
            <div className="label">
              <span className="label-text">Access Token (optional)</span>
            </div>
            <input
              type="password"
              autoComplete="new-password"
              className={`input input-bordered w-full ${draftErrors.token ? "input-error" : ""}`}
              value={draft.token}
              onChange={(e) => updateDraft("token", e.target.value)}
            />
            {draftErrors.token ? (
              <div className="label">
                <span className="label-text-alt text-error">
                  {draftErrors.token}
                </span>
              </div>
            ) : (
              <span className="label">
                Stored securely in Vault — never shown again after saving.
              </span>
            )}
          </label>

          <label className="label cursor-pointer justify-start gap-2 sm:col-span-2">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={draft.isPrimary}
              onChange={(e) => updateDraft("isPrimary", e.target.checked)}
            />
            <span className="label-text">Primary channel for this type</span>
          </label>

          <div className="sm:col-span-2 flex items-center justify-end gap-2">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button type="button" className="btn btn-info" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      )}

      {fields.length === 0 ? (
        <p className="text-sm text-base-content/60">No channels added yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader className="text-start">
                Type
              </TableCell>
              <TableCell isHeader className="text-start">
                URL
              </TableCell>
              <TableCell isHeader className="text-start">
                Label
              </TableCell>
              <TableCell isHeader className="text-start">
                Primary
              </TableCell>
              <TableCell isHeader className="text-start">
                Status
              </TableCell>
              <TableCell isHeader className="text-start">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => (
              <TableRow key={field.id}>
                <TableCell>{CHANNEL_TYPE_LABELS[field.channelType]}</TableCell>
                <TableCell>{field.url}</TableCell>
                <TableCell>{field.label || "—"}</TableCell>
                <TableCell>{field.isPrimary ? "Yes" : "No"}</TableCell>
                <TableCell>{field.status}</TableCell>
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
