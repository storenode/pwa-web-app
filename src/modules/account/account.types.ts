import { type NodeRecord } from "@/shared/store/nodesStore";

export interface NodeTreeRow extends NodeRecord {
  subRows?: NodeTreeRow[];
}
