import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchRewardsByPhone, type RewardsByPhoneEntry } from "../rewards.api";
import { CHANNEL_TYPE_LABELS } from "@/modules/account/components/store.form";
import { routePaths } from "@/shared/utils/routePaths";
import { INDIA_PHONE_PATTERN } from "@/shared/utils/phone";
import PublicHeaderView from "@/modules/public/components/header";

const STATUS_FILTERS = ["unclaimed", "claimed", "all"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

interface StoreGroup {
  nodeId: string;
  storeName: string;
  entries: RewardsByPhoneEntry[];
}

function groupByStore(entries: RewardsByPhoneEntry[]): StoreGroup[] {
  const byNode = new Map<string, StoreGroup>();
  for (const entry of entries) {
    const existing = byNode.get(entry.nodeId);
    if (existing) {
      existing.entries.push(entry);
    } else {
      byNode.set(entry.nodeId, {
        nodeId: entry.nodeId,
        storeName: entry.storeName,
        entries: [entry],
      });
    }
  }
  return Array.from(byNode.values());
}

export default function FindRewards() {
  const [searchParams] = useSearchParams();
  const phoneFromUrl = searchParams.get("phone") ?? "";

  const [phone, setPhone] = useState(phoneFromUrl);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [groups, setGroups] = useState<StoreGroup[]>([]);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("unclaimed");

  const runSearch = async (searchPhone: string) => {
    if (!INDIA_PHONE_PATTERN.test(searchPhone)) {
      setPhoneError("Enter a valid 10-digit mobile number");
      return;
    }
    setPhoneError(null);
    setIsLoading(true);
    try {
      const entries = await fetchRewardsByPhone(searchPhone);
      const nextGroups = groupByStore(entries);
      setGroups(nextGroups);
      setActiveNodeId(nextGroups[0]?.nodeId ?? null);
      setHasSearched(true);
    } catch (err) {
      console.error(
        "Failed to fetch rewards by phone:",
        (err as Error).message,
      );
      setPhoneError("Something went wrong — please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (phoneFromUrl && INDIA_PHONE_PATTERN.test(phoneFromUrl)) {
      void runSearch(phoneFromUrl);
    }
    // Only auto-run for the phone the page was opened with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneFromUrl]);

  const activeGroup = groups.find((group) => group.nodeId === activeNodeId);
  const visibleEntries =
    activeGroup?.entries.filter(
      (entry) => statusFilter === "all" || entry.status === statusFilter,
    ) ?? [];

  return (
    <div className="min-h-screen bg-base-200">
      <PublicHeaderView forceSolid />
      <div className="px-4 pt-28 pb-10">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-semibold text-base-content">
              Find Your Rewards
            </h1>
            <p className="text-sm text-base-content/60">
              Enter the mobile number you used at any StoreNode store to see
              your rewards.
            </p>
          </div>

          <div className="flex flex-col gap-2 items-stretch max-w-sm mx-auto">
            <input
              type="tel"
              inputMode="numeric"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`input input-bordered w-full ${phoneError ? "input-error" : ""}`}
            />
            {phoneError && (
              <span className="text-error text-sm">{phoneError}</span>
            )}
            <button
              type="button"
              className="btn btn-primary"
              disabled={isLoading}
              onClick={() => void runSearch(phone)}
            >
              {isLoading ? "Searching..." : "Find My Rewards"}
            </button>
          </div>

          {hasSearched && (
            <div className="bg-base-100 rounded-2xl border border-base-300 p-4">
              {groups.length === 0 ? (
                <p className="text-center text-sm text-base-content/60 py-6">
                  No rewards found for this number yet — scan a store's QR code
                  to get started.
                </p>
              ) : (
                <>
                  <div role="tablist" className="tabs tabs-boxed mb-4">
                    {groups.map((group) => (
                      <a
                        key={group.nodeId}
                        role="tab"
                        className={`tab ${activeNodeId === group.nodeId ? "tab-active" : ""}`}
                        onClick={() => setActiveNodeId(group.nodeId)}
                      >
                        {group.storeName}
                      </a>
                    ))}
                  </div>

                  {activeGroup && (
                    <div className="space-y-3">
                      <div className="flex justify-end">
                        <div className="join">
                          {STATUS_FILTERS.map((filter) => (
                            <button
                              key={filter}
                              type="button"
                              className={`join-item btn btn-xs ${
                                statusFilter === filter ? "btn-secondary" : ""
                              }`}
                              onClick={() => setStatusFilter(filter)}
                            >
                              {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {visibleEntries.length === 0 ? (
                          <p className="text-center text-sm text-base-content/60 py-4">
                            No {statusFilter !== "all" ? statusFilter : ""}{" "}
                            rewards at {activeGroup.storeName}.
                          </p>
                        ) : (
                          visibleEntries.map((entry, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between text-sm border-b border-base-300 last:border-0 pb-2 last:pb-0"
                            >
                              <div>
                                <span className="badge badge-sm badge-outline mr-2">
                                  {entry.rewardType}
                                </span>
                                {entry.channelType && (
                                  <span className="text-base-content/60">
                                    {CHANNEL_TYPE_LABELS[entry.channelType]}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-medium">
                                  {entry.points} pts
                                </span>
                                <span
                                  className={`badge badge-sm ${
                                    entry.status === "claimed"
                                      ? "badge-success"
                                      : entry.status === "requested"
                                        ? "badge-warning"
                                        : "badge-ghost"
                                  }`}
                                >
                                  {entry.status}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <a
                        href={routePaths.publicStore(activeGroup.nodeId)}
                        className="btn btn-secondary btn-sm w-full"
                      >
                        View &amp; claim more at {activeGroup.storeName}
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
