# Act 4: Garbage Collection — Proposal

## Problem Statement

Guest sessions expire after 7 days of inactivity (`guest-sessions.expiresAt`), but the corresponding data (tasks, lists, task logs) persists indefinitely in SQLite. Over time, orphan records accumulate, consuming disk space and slowing queries on the `guestId` index.

## Proposed Solution

A single maintenance endpoint `GET /api/maintenance/cleanup` that:

1. Finds all `GuestSessions` where `expiresAt < now()`
2. Collects the expired `guestId` values
3. Cascade-deletes related data in dependency order: Tasks → TaskLogs → Lists → GuestSessions
4. Returns a report: `{ deletedSessions, deletedTasks, deletedLists, deletedLogs }`

## Access Control Bypass

All 4 collections have access control restricting reads/writes to the owning guest. The cleanup endpoint runs server-side with `overrideAccess: true` on every `payload.delete()` call, bypassing per-guest filtering.

- `GuestSessions.delete: () => false` → bypassed via `overrideAccess: true`
- `Tasks.access.delete` → filtered by guestId normally for users; bypassed for cleanup
- `Lists.access.delete` → same
- `TaskLogs.access.delete` → same

## Protection

The endpoint must not be callable by anonymous users. Protected by:
- **Development**: accessible freely (via `process.env.NODE_ENV === 'development'`)
- **Production**: requires `x-cleanup-key` header matching `CLEANUP_SECRET` env var

## No New Collections

Zero new PayloadCMS collections. The endpoint uses existing `payload.delete()` with `where` queries on all 4 collections.

## Dependencies

| Dependency | Type | Required By |
|------------|------|-------------|
| Act 6 (withRetry) | Strong | Wraps each delete batch for SQLITE_BUSY resilience |
| GuestSessions collection | Existing | Source of expired guestId values |
| Tasks / Lists / TaskLogs collections | Existing | Target of cascade delete |
