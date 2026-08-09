import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSecureParams } from "@/shared/hooks/useSecureParams";
import { useNodesStore } from "../../../shared/store/nodesStore";
import { FormProvider, useForm } from "react-hook-form";
import { createResolver } from "@/lib/valibot";
import StoreForm, {
  storeFormSchema,
  type StoreFormValues,
} from "../components/store.form";
import StoreMembersForm from "../components/store-members.form";
import StoreChannelsForm from "../components/store-channels.form";
import ComponentCard from "@/shared/fields/ComponentCard";
import {
  createStore,
  fetchNodeChannels,
  fetchStoreMembers,
  updateStore,
  upsertNodeChannels,
  upsertNodeMembers,
} from "../account.api";
import { toChannelFormValues, toMemberFormValues } from "../account.utils";

export default function AddEditStores() {
  const { nodeId, storeId } = useSecureParams<{
    nodeId: string;
    storeId: string;
  }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const node = useNodesStore((state) =>
    state.nodes.find((n) => n.id === nodeId),
  );
  const store = useNodesStore((state) =>
    state.nodes.find((n) => n.id === storeId),
  );
  const methods = useForm<StoreFormValues>({
    defaultValues: {
      name: store?.name || "",
      displayName: store?.displayName || "",
      status: store?.status || "",
      logoUrl: undefined,
      city: store?.city || "",
      address: store?.address || "",
      members: store?.members ? toMemberFormValues(store.members) : undefined,
      channels: store?.channels
        ? toChannelFormValues(store.channels)
        : undefined,
    },
    mode: "onBlur",
    resolver: createResolver(storeFormSchema),
  });

  useEffect(() => {
    if (!storeId || storeId === "new") return;

    let cancelled = false;
    fetchStoreMembers(storeId)
      .then((members) => {
        if (cancelled) return;
        methods.setValue("members", toMemberFormValues(members));
      })
      .catch((err: Error) => {
        console.error("Failed to fetch store members:", err.message);
      });

    fetchNodeChannels(storeId)
      .then((channels) => {
        if (cancelled) return;
        methods.setValue("channels", toChannelFormValues(channels));
      })
      .catch((err: Error) => {
        console.error("Failed to fetch store channels:", err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [storeId, methods]);

  const onSubmit = methods.handleSubmit(async (values) => {
    if (!nodeId) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const savedStore =
        storeId && storeId !== "new" && store
          ? await updateStore(storeId, values)
          : await createStore(values, nodeId);
      if (values.members?.length) {
        await upsertNodeMembers(savedStore.id, values.members);
      }
      if (values.channels?.length) {
        await upsertNodeChannels(savedStore.id, values.channels);
      }
      navigate("/node/");
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <FormProvider {...methods}>
      <div className="p-6 flex flex-col gap-4">
        <Link to="/node/" className="link link-hover text-sm opacity-70">
          ← Back to all nodes
        </Link>

        <ComponentCard
          title={
            node
              ? `${node.displayName} — ${store ? "Edit" : "Add"} Store`
              : "Add / Edit Store"
          }
          actions={
            <div className="flex flex-row gap-2">
              <Link to="/node/" className="btn btn-ghost">
                Cancel
              </Link>
              <button
                type="button"
                className="btn btn-primary"
                disabled={isSubmitting}
                onClick={() => onSubmit()}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          }
        >
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {submitError && (
              <div className="alert alert-error text-sm">{submitError}</div>
            )}
            <StoreForm />
            <StoreMembersForm />
            <StoreChannelsForm />
          </form>
        </ComponentCard>
      </div>
    </FormProvider>
  );
}
