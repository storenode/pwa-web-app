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
  const activeNodeId = useNodesStore((state) => state.activeNodeId);
  const activeNode = memberships.find(
    (m) => m.nodeId === activeNodeId,
  )?.node;

  const [cards, setCards] = useState<StoreCard[]>([]);

  useEffect(() => {
    if (!activeNode) {
      setCards([]);
      return;
    }

    let cancelled = false;
    const ownNodeIds = new Set(memberships.map((m) => m.nodeId));

    const load = async () => {
      if (activeNode.parentId === null) {
        const [childStores, members] = await Promise.all([
          fetchChildStores(activeNode.id),
          fetchMembersByParent(activeNode.id),
        ]);

        const countByNodeId = new Map<string, number>();
        for (const member of members) {
          countByNodeId.set(
            member.nodeId,
            (countByNodeId.get(member.nodeId) ?? 0) + 1,
          );
        }

        return childStores
          .filter((store) => store.id !== activeNode.id)
          .map((store) => ({
            store,
            memberCount: countByNodeId.get(store.id) ?? 0,
            href: `/node/${activeNode.id}/store/${store.id}`,
            isMine: ownNodeIds.has(store.id),
          }));
      }

      // The active node is itself a store, not a brand — show only that
      // one store rather than every node the user is a member of.
      const members = await fetchStoreMembers(activeNode.id);
      return [
        {
          store: activeNode,
          memberCount: members.length,
          href: `/node/${activeNode.parentId}/store/${activeNode.id}`,
          isMine: true,
        },
      ];
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
  }, [activeNode, memberships]);

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
