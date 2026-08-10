import { CHANNEL_TYPE_LABELS } from "@/modules/account/components/store.form";
import type { PublicStoreInfo } from "../rewards.api";

// Google keeps its existing "leave a review" call-to-action; every other
// active channel just gets a "Visit our <Channel>" link.
const CHANNEL_BUTTON_LABELS: Record<string, string> = {
  google: "Leave a Google Review",
};

interface ChannelButtonsProps {
  channels: PublicStoreInfo["channels"];
  onChannelClick: (
    channelType: PublicStoreInfo["channels"][number]["channelType"],
  ) => void;
  /** True once this phone already has an unclaimed channel/Google reward at this store (independent of any pending birthday reward) — record_channel_click blocks a second one, so the buttons are disabled instead of failing silently on click. */
  isRewardPending: boolean;
}

/** One button per active channel (Google review, Instagram, ...); logs a channel-click reward on click before navigating away. */
export default function ChannelButtons({
  channels,
  onChannelClick,
  isRewardPending,
}: ChannelButtonsProps) {
  if (channels.length === 0) {
    return (
      <p className="text-base-content/60 text-sm">
        Thanks! This store hasn't set up any channels yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 items-stretch">
      {channels.map((channel) => {
        const label =
          CHANNEL_BUTTON_LABELS[channel.channelType] ??
          `Visit our ${CHANNEL_TYPE_LABELS[channel.channelType]}`;

        if (isRewardPending) {
          return (
            <button
              key={channel.channelType}
              type="button"
              className="btn btn-primary btn-disabled"
              disabled
            >
              {label} — reward already earned
            </button>
          );
        }

        return (
          <a
            key={channel.channelType}
            href={channel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            onClick={() => onChannelClick(channel.channelType)}
          >
            {label}
          </a>
        );
      })}
    </div>
  );
}
