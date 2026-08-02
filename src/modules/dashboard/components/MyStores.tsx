import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNodesStore } from "@/shared/store/nodesStore";
import type { NodeRecord } from "@/shared/store/nodesStore";
import {
  fetchChildStores,
  fetchMembersByParent,
  fetchStoreMembers,
} from "@/modules/account/account.api";
import SlidingCardStack from "@/shared/components/SlidingCardStack";

interface StoreCard {
  store: NodeRecord;
  memberCount: number;
  href: string;
  isMine: boolean;
}

export default function MyStores() {
  const memberships = useNodesStore((state) => state.memberships);
  const brandAdminMembership = memberships.find(
    (m) => m.role?.roleKey === "brand_admin",
  );
  const parentId = brandAdminMembership?.nodeId;

  const [cards, setCards] = useState<StoreCard[]>([]);

  useEffect(() => {
    if (memberships.length === 0) {
      setCards([]);
      return;
    }

    let cancelled = false;
    const ownNodeIds = new Set(memberships.map((m) => m.nodeId));

    const load = async () => {
      if (parentId) {
        const [childStores, members] = await Promise.all([
          fetchChildStores(parentId),
          fetchMembersByParent(parentId),
        ]);

        const countByNodeId = new Map<string, number>();
        for (const member of members) {
          countByNodeId.set(
            member.nodeId,
            (countByNodeId.get(member.nodeId) ?? 0) + 1,
          );
        }

        return childStores.map((store) => ({
          store,
          memberCount: countByNodeId.get(store.id) ?? 0,
          href: `/node/${parentId}/store/${store.id}`,
          isMine: ownNodeIds.has(store.id),
        }));
      }

      // Not a brand_admin (platform_admin or plain store-tier member): the
      // node hierarchy is flat — brands and the platform "storenode" node
      // both have parent_id null, so there are no children to enumerate.
      // Show a self-card per node the user is directly a member of.
      return Promise.all(
        memberships.map(async (m) => ({
          store: m.node,
          memberCount: (await fetchStoreMembers(m.node.id)).length,
          href: `/node/${m.node.id}`,
          isMine: true,
        })),
      );
    };

    load()
      .then((result) => {
        if (cancelled) return;
        setCards(result);
      })
      .catch((err: Error) => {
        console.error("Failed to fetch stores:", err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [parentId, memberships]);

  return (
    <SlidingCardStack>
      <div className="flex flex-row gap-4 p-4">
        {cards.map(({ store, memberCount, href, isMine }) => (
          <Link
            key={store.id}
            to={href}
            className={`join-item card snap-start border-0 ${
              isMine
                ? "bg-success text-success-content hover:brightness-110"
                : "bg-slate-200 text-slate-800 hover:brightness-110"
            }`}
          >
            <div className="card-body">
              <h2 className="card-title">{store.displayName ?? store.name}</h2>
              <p>
                {memberCount} member{memberCount === 1 ? "" : "s"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </SlidingCardStack>
  );
}
