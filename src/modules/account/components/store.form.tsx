import { useFormContext } from "react-hook-form";
import { schema as s, type Infer } from "@/lib/valibot";

export default function StoreForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext<StoreFormValues>();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <label className="form-control w-full">
        <div className="label">
          <span className="label-text">Name</span>
        </div>
        <input
          type="text"
          className={`input input-bordered w-full ${errors.name ? "input-error" : ""}`}
          {...register("name")}
        />
        {errors.name && (
          <div className="label">
            <span className="label-text-alt text-error">
              {errors.name.message}
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
          className={`input input-bordered w-full ${errors.displayName ? "input-error" : ""}`}
          {...register("displayName")}
        />
        {errors.displayName && (
          <div className="label">
            <span className="label-text-alt text-error">
              {errors.displayName.message}
            </span>
          </div>
        )}
      </label>

      <label className="form-control w-full">
        <div className="label">
          <span className="label-text">Status</span>
        </div>
        <select
          className={`select select-bordered w-full ${errors.status ? "select-error" : ""}`}
          {...register("status")}
        >
          <option value="">Select status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {errors.status && (
          <div className="label">
            <span className="label-text-alt text-error">
              {errors.status.message}
            </span>
          </div>
        )}
      </label>

      <label className="form-control w-full">
        <div className="label">
          <span className="label-text">City</span>
        </div>
        <input
          type="text"
          className={`input input-bordered w-full ${errors.city ? "input-error" : ""}`}
          {...register("city")}
        />
        {errors.city && (
          <div className="label">
            <span className="label-text-alt text-error">
              {errors.city.message}
            </span>
          </div>
        )}
      </label>

      <label className="form-control w-full sm:col-span-2">
        <div className="label">
          <span className="label-text">Address</span>
        </div>
        <textarea
          className={`textarea textarea-bordered w-full ${errors.address ? "textarea-error" : ""}`}
          rows={3}
          {...register("address")}
        />
        {errors.address && (
          <div className="label">
            <span className="label-text-alt text-error">
              {errors.address.message}
            </span>
          </div>
        )}
      </label>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Logo (optional)</legend>
        <input
          type="file"
          accept="image/*"
          className={`file-input w-full ${errors.logoUrl ? "file-input-error" : ""}`}
          {...register("logoUrl")}
        />
        {errors.logoUrl ? (
          <span className="label text-error">{errors.logoUrl.message}</span>
        ) : (
          <span className="label">Max size 2MB</span>
        )}
      </fieldset>
    </div>
  );
}

// node_channels.channel_type enum (see supabase/storenode-schema.svg)
export const CHANNEL_TYPES = ["fb", "ig", "google", "wa", "yt", "web"] as const;
export type ChannelType = (typeof CHANNEL_TYPES)[number];

export const CHANNEL_TYPE_LABELS: Record<ChannelType, string> = {
  fb: "Facebook",
  ig: "Instagram",
  google: "Google",
  wa: "WhatsApp",
  yt: "YouTube",
  web: "Website",
};

// node_channels.status — mirrors nodes.status (active/inactive)
export const CHANNEL_STATUSES = ["active", "inactive"] as const;
export type ChannelStatus = (typeof CHANNEL_STATUSES)[number];

// role_definitions rows where role_level = 'store' (see supabase/storenode-schema.svg / seed.sql)
export const STORE_ROLES = [
  { roleKey: "brand_admin", displayName: "Brand Admin" },
  { roleKey: "store_manager", displayName: "Store Manager" },
  { roleKey: "sales_person", displayName: "Sales Person" },
  { roleKey: "helper", displayName: "Helper" },
  { roleKey: "temporary", displayName: "Temporary" },
] as const;
export type StoreRoleKey = (typeof STORE_ROLES)[number]["roleKey"];

// role_definitions rows where role_level = 'platform' (see seed.sql) — shown
// read-only on brand/platform nodes; not offered when adding a store member.
export const PLATFORM_ROLES = [
  { roleKey: "platform_admin", displayName: "Platform Admin" },
  { roleKey: "platform_manager", displayName: "Platform Manager" },
  { roleKey: "platform_editor", displayName: "Platform Editor" },
] as const;

export const ALL_ROLES = [...PLATFORM_ROLES, ...STORE_ROLES];

export const memberSchema = s.object({
  firstName: s.pipe(
    s.string(),
    s.trim(),
    s.minLength(1, "First name is required"),
  ),
  lastName: s.pipe(
    s.string(),
    s.trim(),
    s.minLength(1, "Last name is required"),
  ),
  displayName: s.pipe(
    s.string(),
    s.trim(),
    s.minLength(1, "Display name is required"),
  ),
  email: s.pipe(s.string(), s.trim(), s.email("Invalid email")),
  // Not restricted to STORE_ROLES here: this schema also backs read-only
  // display of already-persisted node_members rows, which can carry
  // platform-tier roles (e.g. on brand/platform nodes). The "Add Member"
  // form still only offers STORE_ROLES as options via its <select>.
  roleKey: s.pipe(s.string(), s.trim(), s.minLength(1, "Role is required")),
});
export type MemberFormValues = Infer<typeof memberSchema>;

export const channelSchema = s.object({
  channelType: s.picklist(CHANNEL_TYPES, "Channel type is required"),
  externalId: s.optional(s.pipe(s.string(), s.trim())),
  url: s.pipe(s.string(), s.trim(), s.url("Invalid URL")),
  label: s.optional(s.pipe(s.string(), s.trim())),
  isPrimary: s.optional(s.boolean()),
  status: s.picklist(CHANNEL_STATUSES, "Status is required"),
  // Never persisted to node_channels directly — routed through the
  // set_node_channel_token RPC into Supabase Vault on save.
  token: s.optional(s.pipe(s.string(), s.trim())),
});
export type ChannelFormValues = Infer<typeof channelSchema>;

export const storeFormSchema = s.object({
  name: s.pipe(s.string(), s.trim(), s.minLength(1, "Name is required")),
  displayName: s.pipe(
    s.string(),
    s.trim(),
    s.minLength(1, "Display name is required"),
  ),
  status: s.pipe(s.string(), s.trim(), s.minLength(1, "Status is required")),
  logoUrl: s.optional(
    s.pipe(
      s.instance(FileList),
      s.check(
        (files) => files.length === 0 || files[0].size <= 2 * 1024 * 1024,
        "Max size is 2MB",
      ),
    ),
  ),
  city: s.pipe(s.string(), s.trim(), s.minLength(1, "City is required")),
  address: s.pipe(s.string(), s.trim(), s.minLength(1, "Address is required")),
  members: s.optional(s.array(memberSchema)),
  channels: s.optional(s.array(channelSchema)),
});
export type StoreFormValues = Infer<typeof storeFormSchema>;
