const INDIA_PHONE_PATTERN = /^[6-9]\d{9}$/;

interface PhoneClaimFormProps {
  phone: string;
  setPhone: (value: string) => void;
  phoneError: string | null;
  dateOfBirth: string;
  setDateOfBirth: (value: string) => void;
  isClaiming: boolean;
  onContinue: () => void;
}

/** Phone number entry + DOB (only shown once the phone number is valid) + Continue button. */
export default function PhoneClaimForm({
  phone,
  setPhone,
  phoneError,
  dateOfBirth,
  setDateOfBirth,
  isClaiming,
  onContinue,
}: PhoneClaimFormProps) {
  return (
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
      {phoneError && <span className="text-error text-sm">{phoneError}</span>}
      {INDIA_PHONE_PATTERN.test(phone) && (
        <>
          <p className="text-base-content/60 text-sm">
            Share your date of birth for a bonus reward (once a year).
          </p>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            className="input input-bordered w-full"
          />
        </>
      )}
      <button
        type="button"
        className="btn btn-primary"
        disabled={isClaiming}
        onClick={onContinue}
      >
        {isClaiming ? "Please wait..." : "Continue"}
      </button>
    </div>
  );
}
