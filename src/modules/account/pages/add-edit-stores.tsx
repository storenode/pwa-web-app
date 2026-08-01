import { Link, useParams } from "react-router-dom";
import { useNodesStore } from "../../../shared/store/nodesStore";
import { FormProvider, useForm } from "react-hook-form";
import { createResolver } from "@/lib/valibot";
import StoreForm, {
  CHANNEL_STATUSES,
  CHANNEL_TYPES,
  STORE_ROLES,
  storeFormSchema,
  type ChannelStatus,
  type ChannelType,
  type StoreFormValues,
  type StoreRoleKey,
} from "../components/store.form";
import StoreMembersForm from "../components/store-members.form";
import StoreChannelsForm from "../components/store-channels.form";
import ComponentCard from "@/shared/fields/ComponentCard";

export default function AddEditStores() {
  const { nodeId, storeId } = useParams<{ nodeId: string; storeId: string }>();
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
      slug: store?.slug || "",
      status: store?.status || "",
      logoUrl: undefined,
      city: store?.city || "",
      address: store?.address || "",
      members: store?.members
        ?.filter(
          (member): member is typeof member & { roleKey: StoreRoleKey } =>
            !!member.roleKey &&
            (STORE_ROLES as readonly { roleKey: string }[]).some(
              (role) => role.roleKey === member.roleKey,
            ),
        )
        .map((member) => {
          const [firstName = "", ...rest] = (member.displayName ?? "").split(
            " ",
          );
          return {
            firstName,
            lastName: rest.join(" "),
            displayName: member.displayName ?? "",
            email: member.email ?? "",
            roleKey: member.roleKey,
          };
        }),
      channels: store?.channels
        ?.filter(
          (
            channel,
          ): channel is typeof channel & {
            channelType: ChannelType;
            status: ChannelStatus;
          } =>
            (CHANNEL_TYPES as readonly string[]).includes(
              channel.channelType,
            ) &&
            !!channel.status &&
            (CHANNEL_STATUSES as readonly string[]).includes(channel.status),
        )
        .map((channel) => ({
          channelType: channel.channelType,
          externalId: channel.externalId ?? undefined,
          url: channel.url ?? "",
          label: channel.label ?? undefined,
          isPrimary: channel.isPrimary,
          status: channel.status,
        })),
    },
    mode: "onBlur",
    resolver: createResolver(storeFormSchema),
  });

  const onSubmit = methods.handleSubmit((values) => {
    console.log(values);
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
        >
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <StoreForm />
            <StoreMembersForm />
            <StoreChannelsForm />
            <div className="card-actions justify-end mt-4">
              <Link to="/node/" className="btn btn-ghost">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary">
                Save
              </button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </FormProvider>
  );
}
