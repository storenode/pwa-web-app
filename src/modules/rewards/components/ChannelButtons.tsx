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
}

/** One button per active channel (Google review, Instagram, ...); logs a channel-click reward on click before navigating away. */
export default function ChannelButtons({
  channels,
  onChannelClick,
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
      {channels.map((channel) => (
        <a
          key={channel.channelType}
          href={channel.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          onClick={() => onChannelClick(channel.channelType)}
        >
          {CHANNEL_BUTTON_LABELS[channel.channelType] ??
            `Visit our ${CHANNEL_TYPE_LABELS[channel.channelType]}`}
        </a>
      ))}
    </div>
  );
}
