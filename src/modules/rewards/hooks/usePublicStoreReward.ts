import { useEffect, useState } from "react";
import {
  claimStoreReward,
  fetchCustomerDateOfBirth,
  fetchHasPendingChannelReward,
  fetchPublicStoreInfo,
  fetchUnclaimedRewardSummary,
  recordChannelClick,
  requestRewardRedemption,
} from "../rewards.api";
import type { PublicStoreInfo, RewardRedemptionRecord } from "../rewards.api";
import { INDIA_PHONE_PATTERN } from "@/shared/utils/phone";

/**
 * All the state + handlers behind the public /store/:storeId page: store
 * info, phone/DOB capture + unlock, channel-click tracking, and the
 * point-balance/bill-redemption flow. Pulled out of the page component so
 * PublicStoreView.tsx can stay a thin composer over PhoneClaimForm /
 * RedemptionClaimForm / ChannelButtons.
 */
export function usePublicStoreReward(storeId: string | undefined) {
  const [info, setInfo] = useState<PublicStoreInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [isDateOfBirthLocked, setIsDateOfBirthLocked] = useState(false);
  const [birthdayNotice, setBirthdayNotice] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const [unclaimedPoints, setUnclaimedPoints] = useState<number | null>(null);
  const [hasPendingChannelReward, setHasPendingChannelReward] =
    useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [billNumber, setBillNumber] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  const [redemptionError, setRedemptionError] = useState<string | null>(null);
  const [redemption, setRedemption] = useState<RewardRedemptionRecord | null>(
    null,
  );

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

  useEffect(() => {
    if (!storeId || !INDIA_PHONE_PATTERN.test(phone)) {
      setIsDateOfBirthLocked(false);
      setDateOfBirth("");
      return;
    }

    let cancelled = false;
    fetchCustomerDateOfBirth(storeId, phone)
      .then((existing) => {
        if (cancelled) return;
        if (existing) {
          setDateOfBirth(existing);
          setIsDateOfBirthLocked(true);
        } else {
          setDateOfBirth("");
          setIsDateOfBirthLocked(false);
        }
      })
      .catch((err: Error) => {
        console.error(
          "Failed to fetch existing date of birth:",
          err.message,
        );
      });

    return () => {
      cancelled = true;
    };
  }, [storeId, phone]);

  const refreshUnclaimedPoints = async (
    currentStoreId: string,
    currentPhone: string,
  ) => {
    try {
      const [total, pendingChannelReward] = await Promise.all([
        fetchUnclaimedRewardSummary(currentStoreId, currentPhone),
        fetchHasPendingChannelReward(currentStoreId, currentPhone),
      ]);
      setUnclaimedPoints(total);
      setHasPendingChannelReward(pendingChannelReward);
    } catch (err) {
      console.error(
        "Failed to fetch unclaimed reward summary:",
        (err as Error).message,
      );
    }
  };

  const handleClaim = async () => {
    if (!storeId) return;

    if (!INDIA_PHONE_PATTERN.test(phone)) {
      setPhoneError("Enter a valid 10-digit mobile number");
      return;
    }
    setPhoneError(null);
    setBirthdayNotice(null);
    setIsClaiming(true);
    try {
      const result = await claimStoreReward(
        storeId,
        phone,
        dateOfBirth || undefined,
      );
      if (dateOfBirth && !result.birthdayRewardGranted) {
        setBirthdayNotice(
          "You've already claimed your birthday bonus this year — see you next year!",
        );
      }
      setIsUnlocked(true);
      void refreshUnclaimedPoints(storeId, phone);
    } catch (err) {
      setPhoneError((err as Error).message);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleChannelClick = (
    channelType: PublicStoreInfo["channels"][number]["channelType"],
  ) => {
    if (!storeId) return;
    recordChannelClick(storeId, phone, channelType)
      .then(() => refreshUnclaimedPoints(storeId, phone))
      .catch((err: Error) => {
        console.error("Failed to record channel click:", err.message);
      });
  };

  const handleRequestRedemption = async () => {
    if (!storeId) return;

    const parsedAmount = Number(billAmount);
    if (!billNumber.trim()) {
      setRedemptionError("Enter the bill number");
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setRedemptionError("Enter a valid bill amount");
      return;
    }

    setRedemptionError(null);
    setIsRequesting(true);
    try {
      const result = await requestRewardRedemption(
        storeId,
        phone,
        billNumber.trim(),
        parsedAmount,
      );
      setRedemption(result);
      setShowClaimForm(false);
      void refreshUnclaimedPoints(storeId, phone);
    } catch (err) {
      setRedemptionError((err as Error).message);
    } finally {
      setIsRequesting(false);
    }
  };

  return {
    info,
    isLoading,
    phone,
    setPhone,
    phoneError,
    dateOfBirth,
    setDateOfBirth,
    isDateOfBirthLocked,
    birthdayNotice,
    isClaiming,
    isUnlocked,
    handleClaim,
    unclaimedPoints,
    hasPendingChannelReward,
    showClaimForm,
    setShowClaimForm,
    billNumber,
    setBillNumber,
    billAmount,
    setBillAmount,
    isRequesting,
    redemptionError,
    redemption,
    handleRequestRedemption,
    handleChannelClick,
  };
}
