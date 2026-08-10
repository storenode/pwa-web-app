import type { ReactNode } from "react";
import { useNodesStore } from "../store/nodesStore";
import NoNodeAttached from "@/modules/public/pages/NoNodeAttached";

interface RequireCapabilityProps {
  capability: string;
  children: ReactNode;
}

/**
 * Route-level capability gate. A role with no matching capability sees the
 * same "no store attached" fallback used for zero-membership users, rather
 * than a separate access-denied page — pure show/hide, no disabled state.
 */
export default function RequireCapability({
  capability,
  children,
}: RequireCapabilityProps) {
  const hasCapability = useNodesStore((state) => state.hasCapability);
  if (!hasCapability(capability)) return <NoNodeAttached />;
  return <>{children}</>;
}
