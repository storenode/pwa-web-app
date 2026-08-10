import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  fetchChildStores,
  fetchNodeChannels,
} from "@/modules/account/account.api";
import {
  fetchNodeRewards,
  fetchRewardRedemptions,
  markRewardClaimed,
  reviewRewardRedemption,
  type NodeRewardRecord,
  type RewardRedemptionRecord,
} from "../rewards.api";
import type { NodeRecord } from "@/shared/store/nodesStore";
import { useAuthStore } from "@/shared/store/authStore";
import { useSecureParams } from "@/shared/hooks/useSecureParams";
import { routePaths } from "@/shared/utils/routePaths";
import { CHANNEL_TYPE_LABELS } from "@/modules/account/components/store.form";
import ComponentCard from "@/shared/fields/ComponentCard";
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
  const { nodeId } = useSecureParams<{ nodeId: string }>();
  const member = useAuthStore((state) => state.member);
  const [cards, setCards] = useState<StoreQrCard[]>([]);
  const [qrCodeSlideIndex, setQrCodeSlideIndex] = useState(0);
  const [storeNameById, setStoreNameById] = useState<Map<string, string>>(
    new Map(),
  );
  const [rewards, setRewards] = useState<NodeRewardRecord[]>([]);
  const [rewardsType, setRewardsType] = useState<string>("unclaimed");
  const [redemptions, setRedemptions] = useState<RewardRedemptionRecord[]>([]);
  const [childStoreIds, setChildStoreIds] = useState<string[]>([]);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const refreshRewardsAndRedemptions = async (nodeIds: string[]) => {
    const [rewardRows, redemptionRows] = await Promise.all([
      fetchNodeRewards(nodeIds),
      fetchRewardRedemptions(nodeIds),
    ]);
    setRewards(rewardRows);
    setRedemptions(redemptionRows);
  };

  useEffect(() => {
    if (!nodeId) return;

    let cancelled = false;
    setQrCodeSlideIndex(0);

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

        const nodeIds = childStores.map((store) => store.id);
        setChildStoreIds(nodeIds);
        await refreshRewardsAndRedemptions(nodeIds);
      })
      .catch((err: Error) => {
        console.error("Failed to fetch rewards data:", err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [nodeId]);

  const handleReview = async (redemptionId: string, approve: boolean) => {
    setReviewingId(redemptionId);
    try {
      await reviewRewardRedemption(redemptionId, approve);
      await refreshRewardsAndRedemptions(childStoreIds);
    } catch (err) {
      console.error(
        "Failed to review reward redemption:",
        (err as Error).message,
      );
    } finally {
      setReviewingId(null);
    }
  };

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

  const selectedStoreId = cards[qrCodeSlideIndex]?.store.id;
  const storeRedemptions = selectedStoreId
    ? redemptions.filter((redemption) => redemption.nodeId === selectedStoreId)
    : [];

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
              (reward) =>
                reward.nodeId === store.id &&
                reward.status ===
                  (rewardsType === "all" ? reward.status : rewardsType),
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
                            value={`${window.location.origin}${routePaths.publicStore(store.id)}`}
                            size={160}
                          />
                          <h2 className="card-title">
                            {store.displayName ?? store.name}
                          </h2>
                        </div>
                      </div>
                    </div>
                    <div className="w-full px-2 py-2 flex justify-end">
                      <div className="join">
                        {["unclaimed", "claimed", "all"].map((type) => (
                          <label
                            key={type}
                            className={`join-item btn btn-xs ${
                              rewardsType === type ? "btn-secondary" : ""
                            }`}
                            onClick={() => setRewardsType(type)}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </label>
                        ))}
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
                              Type
                            </TableCell>
                            <TableCell isHeader className="text-start">
                              Channel
                            </TableCell>
                            <TableCell isHeader className="text-start">
                              Date of Birth
                            </TableCell>
                            <TableCell isHeader className="text-start">
                              Points
                            </TableCell>
                            <TableCell isHeader className="text-start">
                              Status
                            </TableCell>
                            <TableCell isHeader className="text-start">
                              Created At
                            </TableCell>
                            <TableCell isHeader className="text-start">
                              Claimed At
                            </TableCell>
                            <TableCell isHeader className="text-start">
                              Actions
                            </TableCell>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {storeRewards.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={10} className="text-center">
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
                                  <TableCell>
                                    <span
                                      className={`badge badge-sm ${
                                        reward.rewardType === "birthday"
                                          ? "badge-secondary"
                                          : "badge-outline"
                                      }`}
                                    >
                                      {reward.rewardType}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    {reward.channelType
                                      ? CHANNEL_TYPE_LABELS[reward.channelType]
                                      : "—"}
                                  </TableCell>
                                  <TableCell>
                                    {reward.dateOfBirth ?? "—"}
                                  </TableCell>
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
                                    {new Date(
                                      reward.createdAt,
                                    ).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    {reward.claimedAt
                                      ? new Date(
                                          reward.claimedAt,
                                        ).toLocaleDateString()
                                      : "—"}
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
                    to={nodeId ? routePaths.store(nodeId, store.id) : "#"}
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

      <ComponentCard
        title="Redemption Requests"
        desc="Customer-submitted bill claims — approve to apply the discount and mark the underlying points claimed, or reject to release them."
      >
        {storeRedemptions.length === 0 ? (
          <p className="text-sm text-base-content/60">
            No redemption requests yet.
          </p>
        ) : (
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
                  Bill #
                </TableCell>
                <TableCell isHeader className="text-start">
                  Bill Amount
                </TableCell>
                <TableCell isHeader className="text-start">
                  Points Applied
                </TableCell>
                <TableCell isHeader className="text-start">
                  Discount
                </TableCell>
                <TableCell isHeader className="text-start">
                  Status
                </TableCell>
                <TableCell isHeader className="text-start">
                  Requested At
                </TableCell>
                <TableCell isHeader className="text-start">
                  Reviewed At
                </TableCell>
                <TableCell isHeader className="text-start">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {storeRedemptions.map((redemption) => (
                <TableRow key={redemption.id}>
                  <TableCell>
                    {storeNameById.get(redemption.nodeId) ?? redemption.nodeId}
                  </TableCell>
                  <TableCell>{redemption.phone}</TableCell>
                  <TableCell>{redemption.billNumber}</TableCell>
                  <TableCell>₹{redemption.billAmount}</TableCell>
                  <TableCell>{redemption.pointsApplied}</TableCell>
                  <TableCell>₹{redemption.discountAmount}</TableCell>
                  <TableCell>
                    <span
                      className={`badge badge-sm ${
                        redemption.status === "approved"
                          ? "badge-success"
                          : redemption.status === "rejected"
                            ? "badge-error"
                            : "badge-ghost"
                      }`}
                    >
                      {redemption.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(redemption.requestedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {redemption.reviewedAt
                      ? new Date(redemption.reviewedAt).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {redemption.status === "requested" && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-success"
                          disabled={reviewingId === redemption.id}
                          onClick={() => void handleReview(redemption.id, true)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-error"
                          disabled={reviewingId === redemption.id}
                          onClick={() =>
                            void handleReview(redemption.id, false)
                          }
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </ComponentCard>
    </div>
  );
}
