import { useParams } from "react-router-dom";
import { useIdCodecStore } from "@/shared/store/idCodecStore";

/**
 * Drop-in replacement for react-router's useParams(). Every route param
 * (nodeId, storeId, ...) is transparently decoded back to its real uuid —
 * this is the single interception point param-consuming pages go through,
 * so page code always works with real ids and never has to know about the
 * url-token encoding scheme. Non-encoded params (slugs, literal "new",
 * etc.) pass through unchanged, since decodeId no-ops on non-tokens.
 */
export function useSecureParams<
  T extends Record<string, string | undefined>,
>(): Partial<T> {
  const rawParams = useParams();
  const decodeId = useIdCodecStore((state) => state.decodeId);

  const decoded: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(rawParams)) {
    decoded[key] = value === undefined ? value : decodeId(value);
  }
  return decoded as Partial<T>;
}
