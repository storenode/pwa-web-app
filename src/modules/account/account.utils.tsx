import { type NodeTreeRow } from "@/modules/account/account.types";
import type { NodeMemberRecord, NodeRecord } from "@/shared/store/nodesStore";
import type { MemberFormValues } from "@/modules/account/components/store.form";

// Maps already-persisted node_members rows for display/prefill. Not
// restricted to STORE_ROLES: a node (e.g. a brand or the platform node)
// can have members holding platform-tier roles too — that filtering only
// belongs to the "Add Member" form, which offers store roles as options.
export function toMemberFormValues(
  members: NodeMemberRecord[],
): MemberFormValues[] {
  return members
    .filter((member): member is typeof member & { roleKey: string } =>
      Boolean(member.roleKey),
    )
    .map((member) => {
      const [firstName = "", ...rest] = (member.displayName ?? "").split(" ");
      return {
        firstName,
        lastName: rest.join(" "),
        displayName: member.displayName ?? "",
        email: member.email ?? "",
        roleKey: member.roleKey,
      };
    });
}

export function buildTree(nodes: NodeRecord[]): NodeTreeRow[] {
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
