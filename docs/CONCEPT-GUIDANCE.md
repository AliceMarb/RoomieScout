# Concept Design — Guidance

App-independent guidance for writing concepts, based on Daniel Jackson's framework
([essenceofsoftware.com](https://essenceofsoftware.com)) and MIT 6.1040 course materials
([rubric](https://61040-fa25.github.io/resources/concept-rubric),
[state notation](https://61040-fa25.github.io/resources/state-notation),
[PS1](https://61040-fa25.github.io/assignments/problem-set-1)).
For RoomieScout's actual concepts, see [CONCEPTS.md](./CONCEPTS.md).

## What a concept is

A **concept** is a self-contained module with a single purpose. It has:

- **purpose** — the need it fulfills, stated as a need (not a mechanism), application-independently
- **operational princqiple** — an archetypal *scenario* (a sequence of steps covering the full lifecycle), not a restatement of the purpose
- **state** — what it remembers (see notation below)
- **actions** — with `requires`/`effects`, no getters for things users wouldn't query

A **sync** wires concepts together: *when action A fires in concept X, also fire B in concept Y*. All app-specific logic lives in syncs; concepts never reference each other.

## Tests for "is this a concept?"

1. **User-facing purpose.** A user could say in one sentence why it exists.
2. **Stands alone.** Its state and actions make sense with no knowledge of any other concept.
3. **Archetypal.** A pattern recognizable across apps (invitation, notification, registry…).
4. **Not infrastructure.** Storage, logging, caching, background jobs are implementation, not concepts.
5. **Not presentation.** Cards, images, copy are UI, not concepts.

## Rubric (condensed from 6.1040)

- **Independence** — never name another concept; external types are generic parameters (`[User]`, `[Item]`) or built-ins. Don't assume argument objects have fields defined elsewhere.
- **Completeness** — cover the whole lifecycle (setup, use, teardown/undo); state rich enough to support every action.
- **Separation of concerns** — if the state factors into two independent parts, that's two concepts. Don't store properties of external objects when their identity suffices (e.g., store an author `User`, not their name).
- **Purpose** — a need, not behavior; fulfillable by this concept alone.
- **Operational principle** — steps by all stakeholders, only this concept's actions.
- **Actions** — include creation *and* deletion/undo; preconditions explicit; minimal set; no getters.
- **Syncs** — add them for identity/access control (bind "the current user") and for cross-concept invariants (e.g., cascading deletes).

## State notation (Simple State Form)

Concept state is written as **sets of objects plus relations** — *not* a database schema. The
canonical form:

```
a set of Users with
  a username String
  a password String
```

Two readings of this — and the second is the more correct one:

1. *Collection of documents*: a collection of user objects, each with two fields.
2. **Sets and relations (pairings)**: a set of bare identifiers `{u1, u2, …}` plus relations —
   `username = {(u1, "Alice"), (u2, "Bob")}`, `password = {(u1, "foo"), …}`. Every field is a
   relation mapping an object's identity to values. An object's value *is* its identity; it is
   not a composite.

The relational reading explains the subtleties: objects can be freely shared across declarations
(no "ownership"), several concepts can each declare fields on "the same" set (auth declares
username/password on Users; profile declares avatar/displayName on Users), and generic parameter
types let one concept's `Items` be another's `Posts` at instantiation.

Key notation rules:

- Primitives: `String`, `Number`, `Flag`, `Date`, `DateTime`. Enums inline and uppercase:
  `a status of PENDING or SATISFIED`.
- `optional` for scalar fields that may be absent; set-typed fields are never optional (use the empty set).
- `seq` only when order isn't already implied (don't declare messages a `seq` if they're timestamped… though for transcripts, turn order *is* the structure).
- Subsets classify or extend: `a Banned set of Users with a bannedOn Date`.
- `an element GlobalSettings with …` declares a singleton.
- Field name optional for object types: `a Profile` means a field `profile`.
- Declaration *direction implies nothing about navigation or efficiency*. Choose the direction that
  is natural or that encodes a multiplicity for free (`a set of Users with a Group` says each user
  has exactly one group).
- Keep state **abstract**: no implementation taint (no lists where a set suffices, no redundant
  ordering, no caching fields).

## Storage is derived, not designed

How state is *persisted* is an implementation decision made later, mechanically: each set/subset
declaration maps to a collection (e.g., a MongoDB collection per set, fields as document
properties, set-typed fields as arrays, enums as strings, identities as generated ids). A
relational DB, KV store, or graph DB works equally well — SSF was designed to translate into any
of them. The concept document should never mention tables, keys, TTLs, or indexes.
