import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useNodesStore } from "../../../shared/store/nodesStore";
import { FormProvider, useForm } from "react-hook-form";
import { createResolver } from "@/lib/valibot";
import NodeForm, {
  nodeFormSchema,
  type NodeFormValues,
} from "../components/node.form";
import ComponentCard from "@/shared/fields/ComponentCard";
import StoreMembersForm from "../components/store-members.form";
import { fetchStoreMembers } from "../account.api";
import { toMemberFormValues } from "../account.utils";

export default function AddEditNodes() {
  const { nodeId } = useParams<{ nodeId: string }>();
  const node = useNodesStore((state) =>
    state.nodes.find((n) => n.id === nodeId),
  );
  const methods = useForm<NodeFormValues>({
    defaultValues: {
      name: node?.name || "",
      displayName: node?.displayName || "",
      slug: node?.slug || "",
      status: node?.status || "",
      logoUrl: undefined,
      city: node?.city || "",
      address: node?.address || "",
      members: node?.members ? toMemberFormValues(node.members) : undefined,
    },
    mode: "onBlur",
    resolver: createResolver(nodeFormSchema),
  });

  useEffect(() => {
    if (!nodeId) return;

    let cancelled = false;
    fetchStoreMembers(nodeId)
      .then((members) => {
        if (cancelled) return;
        methods.setValue("members", toMemberFormValues(members));
      })
      .catch((err: Error) => {
        console.error("Failed to fetch node members:", err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [nodeId, methods]);

  const onSubmit = methods.handleSubmit((values) => {
    console.log(values);
  });

  return (
    <FormProvider {...methods}>
      <div className="p-6 flex flex-col gap-4">
        <Link to="/node/" className="link link-hover text-sm opacity-70">
          ← Back to all nodes
        </Link>

        <ComponentCard title={node ? node.displayName : "Add / Edit Node"}>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <NodeForm />
            <StoreMembersForm />
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
