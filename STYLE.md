# Style Guide

## Coding Principles

**Don't future-proof.** Build only what's needed for near-term goals. "Build assuming your code will be deleted in six months." Still build for reliability and quality — just don't develop toward unscheduled future use cases.

**Reuse code.** When 2+ things use the same logic, create an abstraction.

**Avoid unnecessary abstractions.** Don't abstract until 2+ things reuse the code. When that point arrives, don't copy-paste — create an abstraction instead.

**Prefer built-ins, then libraries.** Reach for the platform first (`fetch`, `crypto.randomUUID`, `Intl`). For common infrastructural work with no built-in — retries with backoff, date math, collection manipulation — use a well-established library rather than hand-rolling. Only write it yourself when nothing suitable exists, and unit-test it when you do.

**Avoid mutable state.** Utility methods that change state should return a copy with modified properties. Prefer:

- `filter`/`map` over `for` loops with `push`
- Spread (`[...a, ...b]`, `{...a, ...b}`) over clone + mutate
- Early returns over `let data; try { data = ... }` patterns

**Functions, not classes.** React components are `function` declarations (`function Button(...)`, `export default function Home()`); everything else is a `const` arrow function. Classes come from SDKs only — construct them once as a module-level singleton under `src/lib` (see `auth.ts` in `packages/api`) and export the configured instance rather than constructing at call sites.

| Use case          | Solution                           |
| ----------------- | ---------------------------------- |
| Data              | Plain objects / zod-inferred types |
| Configured client | Module-level singleton in `lib/`   |
| Behavior          | Arrow function                     |
| React component   | `function` declaration             |

**Use named arguments past 4 positional parameters, or for repeated types.** Once a function's argument list would run over 4 positional parameters, or whenever it takes multiple arguments of the same type (e.g. two `string` arguments), group the trailing arguments into a single destructured options object instead. This avoids call-site ambiguity between same-typed positional args and keeps call sites self-documenting.

```ts
// Avoid: which string is which at the call site?
const renderOtpEmail = (otp, heading, expiresInMinutes) => { ... };
renderOtpEmail("123456", "Your sign in code", 5);

// Prefer:
const renderOtpEmail = ({ otp, heading, expiresInMinutes }: { ... }) => { ... };
renderOtpEmail({ otp: "123456", heading: "Your sign in code", expiresInMinutes: 5 });
```

**Avoid type-narrowing casts.**
Use (in order of preference):

- Zod schema validation — the repo already depends on zod everywhere
- Type guards returning `v is T`
- Type inference with the `ts-expect-error` directive (e.g. `// @ts-expect-error <reason>`)

**Testing.** Happy path for deep functionality; complete unit tests for modular functionality. Pure, branchy logic is the target. Don't test thin wrappers over a client library, a Drizzle query, or a JSX tree with no logic in it. The API uses vitest; mobile uses jest-expo.

## Structure

**Mobile.** `src/app` holds routes only — a route file is either a couple of lines re-exporting a screen (`export default Workout`) or a small screen with no reusable parts. Real screens live in `src/features/<feature>/screens`, with that feature's `components/`, `hooks/`, `lib/` and `stores/` beside them. A sub-feature nests under its parent (`features/activity/workouts`) with the same directory names; code that its siblings share moves up to the parent (`features/activity/components`). Code that two or more features use goes in `src/components`, `src/hooks` and `src/lib`.

**API.** One directory per tRPC router under `src/routes`, composed into `appRouter` in `src/routes/index.ts`. Nested routers get a subdirectory. External clients and business logic go in `src/lib`; Drizzle tables and relations in `src/db`.

**File names are kebab-case**, matching the exported symbol (`auth-card.tsx` → `AuthCard`, `use-debounce.ts` → `useDebounce`).

## Patterns

**Selectively mapping a collection.** Define a type-guard predicate, then chain `filter` + `map`.

```ts
const isCompleted = (set: SessionSet): set is CompletedSet => set.completed;
sets.filter(isCompleted).map((set) => ...);
```

**Branching on a union.** Put the behaviour in a dispatch table keyed by the union value instead of chaining ternaries or repeating a switch. Type the table as a `Record` over the union so a new member is a type error until it has an entry. A ternary or switch is fine for one local two-way branch.

```ts
type Kind = "foo" | "bar";

const kindLabels: Record<Kind, string> = { foo: "Foo", bar: "Bar" };
```

**tRPC procedures.** Take the single `opts` argument and destructure it on the first lines of the body — `const { user } = opts.ctx;` then `const { id } = opts.input;`. Validate input with zod inline. Use `protectedProcedure` unless the endpoint is genuinely public.

**Ownership checks in the procedure.** Every query and mutation that reads or changes a user's rows scopes by `user.id` (`eq(Workouts.userId, user.id)`). Never trust an id from the client to identify a row on its own.

## Naming

**Prefixes:**

| Prefix   | Use                                                                            |
| -------- | ------------------------------------------------------------------------------ |
| `build`  | Assembles a value from parts; pure                                             |
| `create` | Creates a resource that didn't exist (DB row, presigned URL, client)           |
| `fetch`  | Retrieves from an external system (not caches/DBs); see `send`                 |
| `filter` | Returns all values in a collection fulfilling a predicate                      |
| `find`   | Returns first matching value or `undefined`                                    |
| `format` | Value → display string (see `render` for anything richer)                      |
| `from`   | Inverts a `to` function                                                        |
| `get`    | Reads a single value (`undefined` if missing); see `set`                       |
| `handle` | Event handler bound to a UI element (`handleSubmit`)                           |
| `has`    | Boolean ownership or collection membership                                     |
| `is`     | Boolean type check or type-guard function; return type should be `is T`        |
| `list`   | Reads a collection from a store; use `query` if selected by complex conditions |
| `parse`  | String/unknown → structured data, throwing on failure; see `render`            |
| `render` | Structured data → string/markup/email                                          |
| `send`   | Sends to an external system (not caches/DBs); see `fetch`                      |
| `set`    | Sets a value in a store; succeeds regardless of existing value                 |
| `to`     | Translates a value to another representation                                   |
| `update` | Updates an existing store value                                                |
| `use`    | React hook — required by the rules of hooks                                    |

**Suffixes:**

| Suffix     | Use                                                                         |
| ---------- | --------------------------------------------------------------------------- |
| `Client`   | Object whose properties are functions that call an API (`authClient`)       |
| `Context`  | Object whose properties are references to shared data used across functions |
| `Provider` | React context provider component                                            |
| `Router`   | tRPC router (`workoutRouter`, `exerciseRouter`)                             |
| `Schema`   | Zod schema; its inferred type is exported under the bare name               |

**Drizzle tables** are exported as PascalCase plurals (`Workouts`, `WorkoutSets`) with snake_case column names in the SQL; pg enums stay camelCase (`muscleGroupEnum`).

**No Hungarian notation.** Don't suffix types with `Type` or values with their type name. VSCode already communicates symbol kinds. `Schema` above is a deliberate exception — it distinguishes the runtime validator from the type it infers. Other exceptions — use these specific shorthands only:

```ts
const listLength = list.length;    // interning array length
const objectSize = object.size;    // interning object size
for (let iArray = 0; ...) { ... }  // array index variable
```

## Comments

Write no comment by default. Comments split by _what_/_how_/_why_, each in a different form. Keep every form concise — a comment that repeats what the code already shows is worse than no comment.

- **What.** A symbol's name should say what it does or is for. Don't add a comment restating the name (`// gets the user` above `getUser`) — rename the symbol instead if it needs explaining.
- **How.** Use JSDoc/TSDoc (`/** ... */`) on exported symbols to describe how to use them: parameters, return value, preconditions, thrown errors. Reserve it for things a call site can't infer from the signature.
- **Why.** Use inline `//` comments for what the code cannot show: a constraint from another system, an upstream bug, a necessary order, a unit, or a deliberate deviation. Don't use them to narrate what the next line does or to describe a change.

Write comments in ASD-STE100 (Simplified Technical English): short sentences and simple verbs such as use, make, get, put, remove, start, stop, keep, find and send.

```ts
// A batched tRPC call puts every procedure name in the URL path.
const server = fastify({ routerOptions: { maxParamLength: 5000 } });
```

## Textual Style

Prettier owns formatting (defaults, no config) and runs on commit — don't hand-format around it. The rules below cover what Prettier leaves to you.

**Destructuring.** Destructure on a single line when extracting from objects/tuples. Use multiple destructuring statements when unnesting would create a multi-line statement. Always destructure tuples; inline field access is OK for objects accessed only a couple of times.

```ts
const [workout] = await db.insert(Workouts).values({ ... }).returning();
const { user } = opts.ctx;
```

**Single-line when it fits.** Remove newlines after opening `{`/`[` so Prettier can collapse object/array literals onto one line. Omit braces on single-line `if`; use braces if the body doesn't fit on one line.

```ts
const obj = { x: 1, y: "a" };
if (!key) return;
```

**Newlines between functions.** Separate functions with a blank line. Exception: a closure variable may be grouped with its closure (no blank line between them).

**Sort object properties.** Sort properties in objects when doing so would not change the resulting value. Do not reorder across spread operations.
