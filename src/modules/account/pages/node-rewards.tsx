import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  fetchChildStores,
  fetchNodeChannels,
  fetchNodeRewards,
  markRewardClaimed,
  type NodeRewardRecord,
} from "../account.api";
import type { NodeRecord } from "@/shared/store/nodesStore";
import { useAuthStore } from "@/shared/store/authStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/shared/fields/ComponentTable";
import NavigableCard from "@/shared/fields/NavigableCard";

interface StoreQrCard {
  store: NodeRecord;
  hasChannels: boolean;
}

export default function NodeRewards() {
  const { nodeId } = useParams<{ nodeId: string }>();
  const member = useAuthStore((state) => state.member);
  const [cards, setCards] = useState<StoreQrCard[]>([]);
  const [qrCodeSlideIndex, setQrCodeSlideIndex] = useState(0);
  const [storeNameById, setStoreNameById] = useState<Map<string, string>>(
    new Map(),
  );
  const [rewards, setRewards] = useState<NodeRewardRecord[]>([]);

  useEffect(() => {
    if (!nodeId) return;

    let cancelled = false;

    fetchChildStores(nodeId)
      .then(async (stores) => {
        const childStores = stores.filter((store) => store.id !== nodeId);
        const results = await Promise.all(
          childStores.map(async (store) => ({
            store,
            hasChannels: (await fetchNodeChannels(store.id)).length > 0,
          })),
        );
        if (cancelled) return;
        setCards(results);
        setStoreNameById(
          new Map(
            childStores.map((store) => [
              store.id,
              store.displayName ?? store.name ?? store.id,
            ]),
          ),
        );

        const rewardRows = await fetchNodeRewards(
          childStores.map((store) => store.id),
        );
        if (cancelled) return;
        setRewards(rewardRows);
      })
      .catch((err: Error) => {
        console.error("Failed to fetch rewards data:", err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [nodeId]);

  const handleMarkClaimed = async (rewardId: string) => {
    if (!member) return;
    try {
      await markRewardClaimed(rewardId, member.id);
      setRewards((prev) =>
        prev.map((reward) =>
          reward.id === rewardId
            ? {
                ...reward,
                status: "claimed",
                claimedAt: new Date().toISOString(),
              }
            : reward,
        ),
      );
    } catch (err) {
      console.error("Failed to mark reward claimed:", (err as Error).message);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      <NavigableCard
        title="Store Rewards QR Codes"
        desc="Scan the QR code to claim rewards for this store."
        onPrevClick={() => setQrCodeSlideIndex((prev) => Math.max(prev - 1, 0))}
        onNextClick={() =>
          setQrCodeSlideIndex((prev) => Math.min(prev + 1, cards.length - 1))
        }
        isPrevDisabled={qrCodeSlideIndex === 0}
        isNextDisabled={qrCodeSlideIndex === cards.length - 1}
      >
        {cards.length === 0 ? (
          <p className="text-sm text-base-content/60">No stores yet.</p>
        ) : (
          (() => {
            const { store, hasChannels } = cards[qrCodeSlideIndex];
            const storeRewards = rewards.filter(
              (reward) => reward.nodeId === store.id,
            );
            return (
              <>
                {hasChannels ? (
                  <div className="flex flex-col gap-4">
                    <div className="w-full flex justify-center">
                      <div
                        key={store.id}
                        className="join-item card border-0 bg-base-100 snap-start"
                      >
                        <div className="card-body items-center text-center">
                          <QRCodeSVG
                            value={`${window.location.origin}/store/${store.id}`}
                            size={160}
                          />
                          <h2 className="card-title">
                            {store.displayName ?? store.name}
                          </h2>
                        </div>
                      </div>
                    </div>
                    <div className="flex">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableCell isHeader className="text-start">
                              Store
                            </TableCell>
                            <TableCell isHeader className="text-start">
                              Phone
                            </TableCell>
                            <TableCell isHeader className="text-start">
                              Points
                            </TableCell>
                            <TableCell isHeader className="text-start">
                              Status
                            </TableCell>
                            <TableCell isHeader className="text-start">
                              Actions
                            </TableCell>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {storeRewards.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center">
                                <div className="w-full flex justify-center items-center gap-2">
                                  <span className="text-sm text-base-content/60">
                                    No rewards yet for this store.
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            <>
                              {storeRewards.map((reward) => (
                                <TableRow key={reward.id}>
                                  <TableCell>
                                    {storeNameById.get(reward.nodeId) ??
                                      reward.nodeId}
                                  </TableCell>
                                  <TableCell>{reward.phone}</TableCell>
                                  <TableCell>{reward.points}</TableCell>
                                  <TableCell>
                                    <span
                                      className={`badge badge-sm ${
                                        reward.status === "claimed"
                                          ? "badge-success"
                                          : "badge-ghost"
                                      }`}
                                    >
                                      {reward.status}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    {reward.status === "unclaimed" && (
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-primary"
                                        onClick={() =>
                                          void handleMarkClaimed(reward.id)
                                        }
                                      >
                                        Mark claimed
                                      </button>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={store.id}
                    to={`/node/${nodeId}/store/${store.id}`}
                    className="join-item card border-0 bg-slate-200 text-slate-800 hover:brightness-110 snap-start"
                  >
                    <div className="card-body items-center text-center">
                      <h2 className="card-title">
                        {store.displayName ?? store.name}
                      </h2>
                      <p>Channels not set up yet — click to configure</p>
                    </div>
                  </Link>
                )}
              </>
            );
          })()
        )}
      </NavigableCard>
    </div>
  );
}
