import { type NodeTreeRow } from "@/modules/account/account.types";
import type { NodeRecord } from "@/shared/store/nodesStore";

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
