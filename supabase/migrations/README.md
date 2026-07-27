# Supabase CLI cheat sheet

This project's database schema is tracked as SQL files in this folder
(`supabase/migrations/`). Each file is a **migration**: a one-way SQL script
that changes the database schema (create a table, add a column, add a
policy, etc). They run in filename order (oldest timestamp first), and
Supabase keeps track of which ones have already been applied to each
database so it never re-runs the same migration twice.

You write/edit migration files locally, then "push" them to the real
(remote) database when you're ready.

## One-time setup

Run these once per machine you're working from.

### `supabase login`
Logs the CLI in to your Supabase account (opens a browser to authenticate).
You need to be logged in before any command that talks to your Supabase
project can work.

### `supabase link --project-ref <ref>`
Connects this local folder to a specific Supabase project, so the CLI
knows which remote database to talk to. The `<ref>` is the short ID in
your project's URL, e.g. for `https://pfogvikaikuboyvslqbn.supabase.co`
the ref is `pfogvikaikuboyvslqbn`. You only need to do this once per
clone of the repo.

## Everyday commands

### `supabase migration list`
Shows every migration file and whether it's been applied to the **remote**
(live) database yet. If a row's `Remote` column is empty, that migration
hasn't been pushed. Run this any time you want to check "is my local
folder in sync with the real database?"

### `supabase db push`
Applies any migration files that haven't been run yet to the **remote**
(live) database, in order. This is the command that actually changes the
real database — run it after you've reviewed the SQL and are ready to
apply it. Safe to run repeatedly; it skips migrations that were already
applied.

### `supabase db push --dry-run`
Same as above, but only prints which migrations *would* be pushed —
doesn't touch the database. Good for double-checking before the real push.

### `supabase migration new <name>`
Creates a new, empty, timestamped migration file in this folder
(e.g. `supabase/migrations/20260725130000_<name>.sql`) for you to fill in
with the SQL for your change. Use this whenever you need to make a new
schema change instead of hand-naming files.

### `supabase db pull`
Introspects the real (remote) database and generates a migration file
representing its current schema. Useful for creating a first "baseline"
migration when a project's database already has tables that were never
tracked as migrations, or to pull in changes someone else made directly
in the Supabase dashboard. Requires Docker Desktop to be running (it spins
up a temporary local Postgres to diff against).

### `supabase db dump --linked --schema public -f <file>`
Similar to `db pull`, but just dumps the current schema as raw SQL to the
file you specify, without trying to compute a "diff"-style migration.
Also requires Docker to be running.

## Running standalone SQL files (not migrations)

Not every SQL file in `supabase/` is a migration. `supabase/test-seed.sql`
and `supabase/test-seed-clean.sql` (one folder up from here), for example,
are plain data scripts for manual role/permission testing — `db push` will
never run them, since it only applies files under `supabase/migrations/`.
Run them directly with `db query` instead:

### `supabase db query --linked -f <file>`
Executes the given SQL file against the **linked (remote)** database via
the Management API, once, immediately — no tracking of "already applied"
like migrations get. Safe to re-run these two specifically; both are
idempotent (`on conflict ... do nothing`, lookups by email that no-op if
the person hasn't logged in yet).

```bash
# apply test role assignments — safe to re-run any time after someone
# in supabase/test-accounts.md logs in for the first time
supabase db query --linked -f supabase/test-seed.sql

# tear the test data back down
supabase db query --linked -f supabase/test-seed-clean.sql
```

## Local development database (optional)

These commands run a full local copy of Supabase (Postgres + Studio +
Auth, etc.) in Docker on your machine, separate from the live project.
Handy for testing schema changes before pushing them for real, but not
required for this workflow — you can also just review the SQL by eye and
push straight to the live project.

### `supabase start`
Boots a local Supabase stack in Docker (Postgres, Studio, Auth, etc.) at
`http://localhost:54323`. Requires Docker Desktop running.

### `supabase stop`
Shuts the local stack down.

### `supabase status`
Shows the URLs/keys for the running local stack.

### `supabase migration up`
Applies any pending local migration files to your **local** Docker
database (not the live one) — good for testing a migration works before
pushing it for real.

### `supabase db reset`
Drops your **local** Docker database, re-runs every migration from
scratch, then loads `supabase/seed.sql` (the file(s) listed under
`[db.seed] sql_paths` in `supabase/config.toml`). Use this whenever you
want a clean local database with sample data, or after editing
`seed.sql` to reload it. Does not touch the live project.

## Typical workflow for a schema change

1. `supabase migration new add_something` — creates an empty timestamped
   file.
2. Write the SQL for your change in that file (e.g. `ALTER TABLE ...`).
3. `supabase db push --dry-run` — sanity check what would be applied.
4. `supabase db push` — apply it to the live database.
5. `supabase migration list` — confirm it now shows up as applied.

## Project-specific notes

- Linked project ref: `pfogvikaikuboyvslqbn` (see `VITE_SUPABASE_URL` in
  `.env`).
- `00000000000000_baseline.sql` is a snapshot of the live schema taken via
  `supabase db dump` before any migrations existed in this repo — treat it
  as a starting point, not something to hand-edit.
- Never edit a migration file that has already been pushed
  (`supabase migration list` shows it under `Remote`). If you need to
  change something further, write a new migration instead — editing an
  already-applied file just makes your local folder disagree with what
  actually ran on the database.
