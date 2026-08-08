import { idCodec } from "@/shared/store/idCodecStore";

/**
 * Single source of truth for every app URL that embeds a node/store id.
 * Every Link/navigate/QR-code call site should build its href through one
 * of these instead of interpolating raw ids into a template string — that
 * makes this the one interception point outbound urls go through, mirroring
 * useSecureParams on the inbound side.
 */
export const routePaths = {
  nodesList: () => "/node/",
  node: (nodeId: string) => `/node/${idCodec.encodeId(nodeId)}`,
  newStore: (nodeId: string) => `/node/${idCodec.encodeId(nodeId)}/store/new`,
  store: (nodeId: string, storeId: string) =>
    `/node/${idCodec.encodeId(nodeId)}/store/${idCodec.encodeId(storeId)}`,
  rewards: (nodeId: string) => `/node/${idCodec.encodeId(nodeId)}/rewards`,
  /** Public, anon-facing QR-scan landing page. */
  publicStore: (storeId: string) => `/store/${idCodec.encodeId(storeId)}`,
  /** Public, anon-facing cross-store "find my rewards by phone" lookup. */
  findRewards: () => "/rewards/find",
};
