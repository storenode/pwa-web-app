import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { claimStoreReward, fetchPublicStoreInfo } from "@/modules/account/account.api";
import type { PublicStoreInfo } from "@/modules/account/account.api";
import { LogoDark } from "../../../shared/components/LogoDark";
import { LogoLight } from "../../../shared/components/LogoLight";

const INDIA_PHONE_PATTERN = /^[6-9]\d{9}$/;

export default function PublicStoreView() {
  const { storeId } = useParams<{ storeId: string }>();
  const [info, setInfo] = useState<PublicStoreInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (!storeId) return;

    let cancelled = false;
    fetchPublicStoreInfo(storeId)
      .then((result) => {
        if (cancelled) return;
        setInfo(result);
      })
      .catch((err: Error) => {
        console.error("Failed to fetch public store info:", err.message);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [storeId]);

  const handleClaim = async () => {
    if (!storeId) return;

    if (!INDIA_PHONE_PATTERN.test(phone)) {
      setPhoneError("Enter a valid 10-digit mobile number");
      return;
    }
    setPhoneError(null);
    setIsClaiming(true);
    try {
      await claimStoreReward(storeId, phone);
      setIsUnlocked(true);
    } catch (err) {
      setPhoneError((err as Error).message);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="text-center space-y-4 max-w-md w-full">
        <div className="flex justify-center items-center space-x-2">
          <LogoLight className="h-16 w-auto shrink-0 dark:hidden" />
          <LogoDark className="h-16 w-auto shrink-0 hidden dark:block" />
        </div>

        {isLoading ? (
          <p className="text-base-content/60 text-sm">Loading...</p>
        ) : !info ? (
          <p className="text-base-content/60 text-sm">Store not found.</p>
        ) : (
          <>
            <h1 className="text-base-content font-semibold text-xl">
              {info.displayName}
            </h1>

            {!isUnlocked ? (
              <div className="flex flex-col gap-2 items-stretch">
                <p className="text-base-content/60 text-sm">
                  Enter your mobile number to unlock the review reward.
                </p>
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
                  disabled={isClaiming}
                  onClick={() => void handleClaim()}
                >
                  {isClaiming ? "Please wait..." : "Continue"}
                </button>
              </div>
            ) : info.googleReviewUrl ? (
              <a
                href={info.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Leave a Google Review
              </a>
            ) : (
              <p className="text-base-content/60 text-sm">
                Thanks! This store hasn't set up its Google review link yet.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
