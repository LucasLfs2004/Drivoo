---
name: drivoo-spec-architecture
description: Use when planning, designing, implementing, or refactoring Drivoo features that must follow the project's feature-based architecture and the workflow spec -> design -> tasks -> implement.
---

# Drivoo Spec Architecture

Use this skill whenever the task involves:

- creating a new Drivoo feature
- reorganizing or refactoring feature structure
- integrating API flows into product domains
- deciding where code should live
- writing architecture, design, or implementation specs

Do not use this skill for isolated visual tweaks or trivial one-file fixes unless the user explicitly wants architectural alignment.

## Workflow

For structural work and non-trivial features, follow this sequence:

1. `spec`
2. `design`
3. `tasks`
4. `implement`

Use lighter judgment for small UI-only changes:

- skip full spec only if the change is localized, low-risk, and does not alter domain flow or architecture

When a spec is needed, write files in:

- `docs/specs/<feature>/SPEC.md`
- `docs/specs/<feature>/DESIGN.md`
- `docs/specs/<feature>/TASKS.md`

## Source of Truth

Read these files before making structural decisions:

- `docs/ARCHITECTURE_TARGET.md`
- `docs/specs/architecture-migration/SPEC.md`
- `docs/specs/architecture-migration/DESIGN.md`
- `docs/specs/architecture-migration/TASKS.md`

If those docs conflict with existing code, prefer the documented target architecture unless the user explicitly overrides it.

## Architecture Rules

Drivoo uses feature-based architecture organized by domain, not by role.

Primary domains:

- `auth`
- `instructors`
- `bookings`
- `profile`
- `reviews`
- `notifications`
- `support`
- `payments` (prepared but not tightly coupled to bookings yet)

Roles such as `aluno` and `instrutor` are perspectives on domains, not top-level architecture drivers.

Example:

- `bookings` is shared by aluno and instrutor
- role-specific screens may exist inside the same domain module

## Folder Placement

Target structure:

```text
src/app
src/core
src/shared
src/features/<domain>
```

Inside each feature, prefer:

```text
api/
hooks/
screens/
components/
types/
mappers/
store/
```

Placement rules:

- shared/generic UI goes to `shared/ui/base`
- domain-specific UI goes inside the feature
- API calls belong in `features/<domain>/api`
- query/mutation hooks belong in `features/<domain>/hooks`
- API response normalization belongs in `features/<domain>/mappers`
- domain-specific local client state may go in `features/<domain>/store`

## State Rules

Use these defaults:

- `AuthContext` for session/auth lifecycle
- `react-query` for remote server state
- `zustand` only for shared client-side state that is not just cached API data

Do not introduce global state libraries for data that already belongs in `react-query`.

Good `zustand` cases:

- multi-step booking flow state
- persisted local search preferences
- transient cross-screen client state

Bad `zustand` cases:

- instructor search results from API
- current profile fetched from backend
- bookings lists returned by the server

## Implementation Rules

Mandatory:

- screens must not call `apiClient` directly
- screens must not map raw API payloads inline
- new remote integrations must use mappers
- new complex features must not begin with code before spec/design/tasks
- mocks must not remain the primary data source of production screens after integration

Recommended:

- keep components dumb when possible
- keep domain logic out of presentation components
- prefer one source of truth per flow
- remove or isolate legacy paths instead of adding a third path

## UI Layout Guidance

When implementing or refactoring screens and larger UI sections:

- prefer composing layouts with explicit wrapper blocks and `flex` containers
- prefer `gap`, `rowGap`, and `columnGap` on parent containers for spacing between siblings
- prefer grouping related content into semantic sections/cards instead of spacing many loose siblings individually
- use `marginBottom`, `marginTop`, and similar one-off margins only as a secondary escape hatch, not as the primary spacing strategy
- when in doubt, create a parent layout block and let that block own the spacing rules

The goal is to keep styles easier to reason about, easier to reorder, and less brittle during future UI changes.

## Product Domain Guidance

Current core flow:

1. aluno finds instrutor
2. aluno requests booking
3. instrutor accepts or rejects
4. lesson happens
5. both sides confirm lesson completion

Use this flow as the default booking model unless a newer approved spec replaces it.

Important product notes:

- `payments` should be modeled as its own future domain
- do not hard-couple booking architecture to the final charging model yet
- `admin` is secondary in mobile and should not dominate architecture decisions now

## Decision Heuristics

When unsure where code belongs, ask in this order:

1. Is it generic and reusable across domains?
2. Is it domain-specific but reusable within one domain?
3. Is it screen-specific orchestration only?
4. Is it remote contract, domain model, or UI model?

If the answer is:

- generic across domains: `shared`
- specific to one domain: that feature module
- app bootstrap/global wiring: `app` or `core`

## Migration Guidance

Do not rewrite the whole app at once.

Prefer incremental migration:

1. move one domain/feature at a time
2. make the migrated feature the new reference pattern
3. remove legacy dependencies only after replacement is stable

When touching legacy code, prefer:

- extracting into the new module structure
- reducing coupling
- avoiding duplicated parallel implementations

## Output Expectations

When planning a feature, produce:

- short domain summary
- affected modules
- API routes involved
- state strategy (`AuthContext`, `react-query`, `zustand`, or none)
- file placement plan
- spec/design/tasks files when applicable

When implementing, explain:

- what was created
- why each file lives where it does
- what legacy paths remain and why
