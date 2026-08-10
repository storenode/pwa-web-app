/**
 * Every capability key the app gates on, keyed `resource:action`. This is
 * the shared vocabulary between code (route/nav guards) and the
 * `role_definitions.capabilities` column in the DB — a role's array should
 * only ever contain values from this list, plus the wildcard forms below.
 *
 * A role with `capabilities: null` (or missing a key) is treated as not
 * having that capability — no partial/disabled states, pure show/hide.
 *
 * Wildcards: a role's capabilities array may include `"<resource>:*"` to
 * grant every action on that resource (e.g. `"dashboard:*"`), or `"*:*"` for
 * every capability in the app. `hasCapability()` checks the exact key, then
 * `<resource>:*`, then `*:*` — there is no role-key special-casing (e.g. for
 * platform_admin); every role, including super-admin-like ones, is
 * configured the same way through this array.
 */
export const CAPABILITIES = {
  // Dashboard
  "dashboard:view": "dashboard:view",

  // Nodes (brands/stores tree)
  "nodes:browse_all": "nodes:browse_all", // /node/ list of every visible node
  "nodes:view": "nodes:view", // open a node/store detail page
  "nodes:manage": "nodes:manage", // create/edit a node
  "nodes:create_store": "nodes:create_store", // add a store under a brand

  // Store detail
  "store:manage": "store:manage", // edit a store's own fields
  "store:manage_members": "store:manage_members", // add/remove/change store members' roles
  "store:manage_channels": "store:manage_channels", // store-channels.form.tsx

  // Node/brand members
  "nodes:manage_members": "nodes:manage_members", // node-members.form.tsx

  // Rewards
  "rewards:view": "rewards:view", // node-rewards.tsx

  // Voice reviews
  "voice_reviews:view": "voice_reviews:view",
} as const;

export type CapabilityKey = keyof typeof CAPABILITIES;
