# Auth, Session & Token Management

## Purpose

This document describes how login, session state, and token refresh work
end-to-end in the StoreNode PWA, and documents a fix for a bug where
Supabase's automatic session refresh (triggered on browser tab focus) was
cascading into unnecessary data refetches across the app.

## 1. Login flow

1. **Sign-in trigger** — `src/shared/fields/GoogleLogin.Button.tsx` starts a
   Google OAuth flow via Supabase Auth (`supabase.auth.signInWithOAuth`).
2. **OAuth redirect** — Supabase redirects back to
   `src/modules/public/pages/AuthCallback.tsx`, which reads `session`/`member`/
   `isLoading` from `useAuthStore` and redirects into the app once a session
   exists.
3. **Session bootstrap** — `src/shared/providers/AuthProvider.tsx` wraps the
   app. On mount it:
   - Calls `supabase.auth.getSession()` once, storing the result via
     `setSession`/`setMember` and calling `syncMember()`.
   - Subscribes to `supabase.auth.onAuthStateChange(...)`, which fires for
     every subsequent auth-related event for the lifetime of the tab
     (`SIGNED_IN`, `SIGNED_OUT`, `TOKEN_REFRESHED`, `USER_UPDATED`,
     `PASSWORD_RECOVERY`, `INITIAL_SESSION`, ...).
4. **Member profile sync** — `syncMember(session, setMember)` looks up the
   signed-in user's row in `public.members` by `id` (the Supabase auth user
   id). If missing, it inserts one (first login); if present, it updates
   `last_login_at`. The resulting row is written into `authStore.member`.
5. **Route gating** — `src/shared/components/ProtectedRoute.tsx` reads
   `session`/`member`/`isLoading` from `authStore` and redirects
   unauthenticated users away from protected routes.

## 2. Node/role resolution flow (post-login)

Once `authStore.session`/`member` are populated,
`src/shared/providers/NodesProvider.tsx` runs a separate effect:

1. `fetchOwnMemberships(member.id)` — queries `node_members` joined with
   `nodes` and `role_definitions` for the signed-in user, stored as
   `nodesStore.memberships`.
2. Role-based scoping of `nodesStore.nodes`:
   - **`platform_admin`** → `fetchAllNodes()`, `scope = "all"` (sees every
     node in the system — this is the `storenode` platform node's role).
   - **`brand_admin`** → `fetchChildNodes(brandAdminNodeIds)` merges the
     brand's own node(s) with every store under it (`parent_id` cascade),
     `scope = "own"`.
   - **plain store-tier member** → just their own directly-assigned node(s),
     `scope = "own"`.
3. Downstream consumers (e.g. `src/modules/dashboard/components/MyStores.tsx`)
   read `nodesStore.memberships`/`nodes` to render role-appropriate UI.

## 3. Token refresh behavior — the bug

Supabase's JS client manages the access/refresh token lifecycle internally:
it silently refreshes the session (a) on a timer before expiry, and (b) when
the browser tab regains focus/visibility (via its own internal
`visibilitychange` listener). Both cases fire `onAuthStateChange` with event
`TOKEN_REFRESHED` for the *same* signed-in user — nothing about who's logged
in has changed, only the token itself, which the client already holds
internally for its own requests.

Before this fix, the `onAuthStateChange` handler in `AuthProvider.tsx`
unconditionally called `setSession(session)` and `setMember(toMember(session))`
on every event, including `TOKEN_REFRESHED`. `toMember()` builds a brand-new
object on every call, so `member`/`session` got new object references on
every tab focus — even though nothing meaningful changed. That cascaded:

- `NodesProvider.tsx`'s effect depends on `[session, member, authLoading, ...]`
  — new references reran the whole effect, refetching `node_members`/`nodes`
  and calling `setMemberships`/`setNodes` with fresh arrays.
- `MyStores.tsx`'s effect depends on the `memberships` array — a new
  reference from the step above reran it too, refetching store/member data
  on every tab focus, visible to the user as a spurious "reload."

Nothing in the app actually reads `session.access_token` directly for
rendering or API calls (confirmed by inspection — `session` is only used as
a truthy gate in `ProtectedRoute.tsx`, `AuthCallback.tsx`, and
`NodesProvider.tsx`), so there was nothing that needed updating on a silent
refresh in the first place.

## 4. The fix

Two layered guards, so the fix holds even if a future change reintroduces a
similar reference-churn pattern elsewhere:

1. **Event-level guard** — `src/shared/providers/AuthProvider.tsx`: the
   `onAuthStateChange` handler now inspects the `event` argument. If
   `event === "TOKEN_REFRESHED"` and the refreshed session's `user.id`
   matches the currently-stored `member.id`, the handler returns early —
   skipping `setSession`, `setMember`, and the `syncMember` DB round-trip
   entirely. Every other event (sign-in, sign-out, user update, a token
   refresh for a *different* user, etc.) still runs the full update path.
2. **Store-level guard** — the zustand setters themselves now no-op when the
   incoming value is equivalent to current state, so any other caller that
   pushes same-content-but-new-reference data can't trigger a cascade either:
   - `src/shared/store/authStore.ts`: `setSession`/`setMember` compare by
     `user.id`/`id` before calling `set()`.
   - `src/shared/store/nodesStore.ts`: `setMemberships`/`setNodes` compare
     the incoming list's sorted id set against the current one (`sameIds()`
     helper) before calling `set()`.

Net effect: a real sign-in/sign-out/user-update still flows through
end-to-end as before; a silent token refresh on tab focus now does nothing
observable — no DB round-trip, no refetch, no re-render of node-dependent
widgets.

## 5. Files touched

- `src/shared/providers/AuthProvider.tsx`
- `src/shared/store/authStore.ts`
- `src/shared/store/nodesStore.ts`

## Suggested commit message

```
fix(auth): stop tab-focus token refresh from cascading into refetches

Supabase silently refreshes the session on tab focus, firing
onAuthStateChange with TOKEN_REFRESHED for the same user. The handler
was unconditionally pushing new session/member objects into authStore,
which cascaded through NodesProvider into a full node/member refetch on
every tab focus (visible in MyStores as a spurious reload).

- AuthProvider: skip setSession/setMember/syncMember for a
  TOKEN_REFRESHED event when the user id hasn't changed.
- authStore/nodesStore: setters now no-op when the incoming value is
  equivalent to current state (by user/node id), as a safety net
  against the same class of reference-churn bug elsewhere.
```
