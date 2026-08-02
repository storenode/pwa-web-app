import { useFormContext } from "react-hook-form";
import { schema as s, type Infer } from "@/lib/valibot";
import { memberSchema } from "./store.form";

export default function NodeForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext<NodeFormValues>();

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
          <span className="label-text">Slug</span>
        </div>
        <input
          type="text"
          className={`input input-bordered w-full ${errors.slug ? "input-error" : ""}`}
          {...register("slug")}
        />
        {errors.slug && (
          <div className="label">
            <span className="label-text-alt text-error">
              {errors.slug.message}
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
    </div>
  );
}

export const nodeFormSchema = s.object({
  name: s.pipe(s.string(), s.trim(), s.minLength(1, "Name is required")),
  displayName: s.pipe(
    s.string(),
    s.trim(),
    s.minLength(1, "Display name is required"),
  ),
  slug: s.pipe(s.string(), s.trim(), s.minLength(1, "Slug is required")),
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
});
export type NodeFormValues = Infer<typeof nodeFormSchema>;
