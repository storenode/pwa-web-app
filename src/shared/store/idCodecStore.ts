import { create } from "zustand";

// IMPORTANT: this is URL *obfuscation*, not access control. Any secret
// baked into VITE_* env vars ships inside the client bundle and can be
// read by anyone via devtools — real authorization still lives entirely
// in Supabase RLS. The goal here is only to stop raw node/store uuids
// from being plainly visible/guessable in the address bar.
const RAW_SECRET = import.meta.env.VITE_ID_CIPHER_SECRET as string | undefined;
const FALLBACK_DEV_SECRET = "storenode-dev-only-fallback-secret";

if (!RAW_SECRET && import.meta.env.PROD) {
  console.error(
    "VITE_ID_CIPHER_SECRET is not set — falling back to a shared dev key, " +
      "so route ids will encode/decode the same for every deployment. Set " +
      "a real secret in this environment's env vars.",
  );
}

const SECRET = RAW_SECRET || FALLBACK_DEV_SECRET;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// djb2 — fast, synchronous string hash used only to seed the keystream
// PRNG below. crypto.subtle.digest is async, which doesn't fit decoding a
// route param during render, so this trades cryptographic strength for a
// synchronous, deterministic (same secret + same id -> same token every
// time, which is what makes encoded links bookmarkable/shareable) keystream.
function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

// mulberry32 — deterministic PRNG from a numeric seed.
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function keystream(length: number): number[] {
  const rand = mulberry32(djb2(SECRET));
  return Array.from({ length }, () => Math.floor(rand() * 256));
}

function toBase64Url(bytes: number[]): string {
  const binary = bytes.map((b) => String.fromCharCode(b)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(token: string): number[] | null {
  if (!/^[A-Za-z0-9_-]+$/.test(token)) return null;
  const padded =
    token.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat((4 - (token.length % 4)) % 4);
  try {
    const binary = atob(padded);
    return Array.from(binary, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

interface IdCodecState {
  /** False when running on the shared fallback dev secret. */
  isConfigured: boolean;
  /** uuid -> opaque url-safe token. Non-uuid input (e.g. "new") passes through unchanged. */
  encodeId: (value: string) => string;
  /** token -> uuid. Anything that doesn't decode to a valid uuid passes through unchanged. */
  decodeId: (value: string) => string;
}

export const useIdCodecStore = create<IdCodecState>(() => ({
  isConfigured: Boolean(RAW_SECRET),

  encodeId: (value) => {
    if (!UUID_PATTERN.test(value)) return value;
    const bytes = value
      .replace(/-/g, "")
      .match(/.{2}/g)!
      .map((byte) => parseInt(byte, 16));
    const stream = keystream(bytes.length);
    return toBase64Url(bytes.map((b, i) => b ^ stream[i]));
  },

  decodeId: (value) => {
    const bytes = fromBase64Url(value);
    if (!bytes || bytes.length !== 16) return value;
    const stream = keystream(bytes.length);
    const hex = bytes
      .map((b, i) => (b ^ stream[i]).toString(16).padStart(2, "0"))
      .join("");
    const uuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    return UUID_PATTERN.test(uuid) ? uuid : value;
  },
}));

// Static access for call sites outside component render (e.g. building a
// QR code payload). encodeId/decodeId are stable across the store's
// lifetime, so a one-time snapshot is safe — no subscription needed.
export const idCodec = useIdCodecStore.getState();
