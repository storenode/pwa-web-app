import { useSecureParams } from "@/shared/hooks/useSecureParams";
import { LogoDark } from "@/shared/components/LogoDark";
import { LogoLight } from "@/shared/components/LogoLight";
import { usePublicStoreReward } from "../hooks/usePublicStoreReward";
import PhoneClaimForm from "../components/PhoneClaimForm";
import ChannelButtons from "../components/ChannelButtons";
import RedemptionClaimForm from "../components/RedemptionClaimForm";
import VoiceYourReviewButton from "@/modules/voiceNote/components/VoiceYourReviewBtn";

export default function PublicStoreView() {
  const { storeId } = useSecureParams<{ storeId: string }>();
  const {
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
  } = usePublicStoreReward(storeId);

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
              <PhoneClaimForm
                phone={phone}
                setPhone={setPhone}
                phoneError={phoneError}
                dateOfBirth={dateOfBirth}
                setDateOfBirth={setDateOfBirth}
                isDateOfBirthLocked={isDateOfBirthLocked}
                isClaiming={isClaiming}
                onContinue={() => void handleClaim()}
              />
            ) : (
              <div className="flex flex-col gap-4">
                {birthdayNotice && (
                  <p className="text-warning text-sm">{birthdayNotice}</p>
                )}

                <RedemptionClaimForm
                  unclaimedPoints={unclaimedPoints}
                  redemption={redemption}
                  showClaimForm={showClaimForm}
                  setShowClaimForm={setShowClaimForm}
                  billNumber={billNumber}
                  setBillNumber={setBillNumber}
                  billAmount={billAmount}
                  setBillAmount={setBillAmount}
                  isRequesting={isRequesting}
                  redemptionError={redemptionError}
                  onSubmit={() => void handleRequestRedemption()}
                />

                <VoiceYourReviewButton storeId={storeId} phone={phone} />

                <ChannelButtons
                  channels={info.channels}
                  onChannelClick={handleChannelClick}
                  isRewardPending={hasPendingChannelReward}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
