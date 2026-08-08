import type { RewardRedemptionRecord } from "../rewards.api";

interface RedemptionClaimFormProps {
  unclaimedPoints: number | null;
  redemption: RewardRedemptionRecord | null;
  showClaimForm: boolean;
  setShowClaimForm: (value: boolean) => void;
  billNumber: string;
  setBillNumber: (value: string) => void;
  billAmount: string;
  setBillAmount: (value: string) => void;
  isRequesting: boolean;
  redemptionError: string | null;
  onSubmit: () => void;
}

/**
 * Point balance + "Claim your reward" flow: reveals a bill number/amount
 * form, then a confirmation message once a redemption request has been
 * submitted (no discount is applied here — that's staff-side approval).
 */
export default function RedemptionClaimForm({
  unclaimedPoints,
  redemption,
  showClaimForm,
  setShowClaimForm,
  billNumber,
  setBillNumber,
  billAmount,
  setBillAmount,
  isRequesting,
  redemptionError,
  onSubmit,
}: RedemptionClaimFormProps) {
  return (
    <>
      {unclaimedPoints !== null && unclaimedPoints > 0 && (
        <p className="text-base-content text-sm">
          You have <strong>{unclaimedPoints}</strong> points available (≈ ₹
          {unclaimedPoints}).
        </p>
      )}

      {redemption ? (
        <p className="text-success text-sm">
          Request submitted for bill #{redemption.billNumber} — ≈ ₹
          {redemption.discountAmount} off. Show this screen to the store
          staff to confirm your discount.
        </p>
      ) : unclaimedPoints !== null && unclaimedPoints > 0 ? (
        showClaimForm ? (
          <div className="flex flex-col gap-2 items-stretch">
            <input
              type="text"
              placeholder="Bill number"
              value={billNumber}
              onChange={(e) => setBillNumber(e.target.value)}
              className="input input-bordered w-full"
            />
            <input
              type="number"
              inputMode="decimal"
              placeholder="Bill amount"
              value={billAmount}
              onChange={(e) => setBillAmount(e.target.value)}
              className="input input-bordered w-full"
            />
            {redemptionError && (
              <span className="text-error text-sm">{redemptionError}</span>
            )}
            <button
              type="button"
              className="btn btn-primary"
              disabled={isRequesting}
              onClick={onSubmit}
            >
              {isRequesting ? "Please wait..." : "Submit request"}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={isRequesting}
              onClick={() => setShowClaimForm(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowClaimForm(true)}
          >
            Claim your reward
          </button>
        )
      ) : null}
    </>
  );
}
