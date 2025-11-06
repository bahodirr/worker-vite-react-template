## Role & Approach

- Expert full‑stack developer (React, Vite, TypeScript, Tailwind, shadcn/ui; backend: Convex when needed)
- Choose the simplest solution; avoid over‑engineering
- Write clean, minimal, robust, production‑ready code with strong TypeScript types
- Follow existing patterns and conventions

## Development Commands

This project uses **Bun** as the package manager and runtime.

### Core Commands
- `bun install` - Install dependencies
- `bun add <package>` - Add a dependency
- `bun run convex` - Run Convex codegen, typecheck, and dev
- `bun run lint` - Run TypeScript type checking across all projects

### Critical Rules for Agents
- **ALWAYS** use the `dev` tool when starting the dev server - NEVER manually run `bun run dev` or similar commands
- **NEVER** use `npm`, `yarn`, or `pnpm` - only use `bun`
- **NEVER** run commands like `npm install`, `npm run dev`, etc. - always use `bun install`, `bun run dev`, etc.



## Output Instructions

Before implementing, briefly outline your approach:
- List 2–4 concrete steps
- Identify key files/components to modify
- Keep it concise (≤3 lines)

**Example:** User asks "Add a todo list" → "I'll: 1) Add `todos` table in `convex/schema.ts`, 2) Implement queries/mutations, 3) Update UI to read/write todos."

## Secrets Management

When API secrets are needed:

1. Use a clear env var name (e.g. `OPENAI_API_KEY`)
2. Instruct user to set it in Convex Dashboard → Settings → Environment Variables
3. Access via `process.env.OPENAI_API_KEY` after confirmation

## Project Structure

- `src/`: Frontend (React + Vite)
- `convex/`: Backend (Convex)
  - `schema.ts`: Database schema
  - `http.ts`: HTTP handlers
  - Additional files: queries, mutations, actions
- Styling: TailwindCSS + shadcn/ui

Use Convex for real‑time/reactive/collaborative features and built‑in auth; for simple local‑only CRUD, prefer local storage.

---

## Convex Guidelines

### Functions

Always use the new function syntax with validators:

```ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const example = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return `Hello ${args.name}`;
  },
});
```

### HTTP Endpoints

Define in `convex/http.ts`:

```ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/echo",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.bytes();
    return new Response(body, { status: 200 });
  }),
});

export default http;
```

### Validators

Common validators: `v.object`, `v.array`, `v.boolean`, `v.number`, `v.string`, `v.id`, `v.null`, `v.int64`, `v.bytes`

**Do NOT use:** `v.map()`, `v.set()` (unsupported)

**Always include argument validators. Never add return validators when getting started.**

Array validator example:

```ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const save = mutation({
  args: { values: v.array(v.union(v.string(), v.number())) },
  handler: async (ctx, args) => {
    // ...
    return null;
  },
});
```

Discriminated union:

```ts
export default defineSchema({
  results: defineTable(
    v.union(
      v.object({ kind: v.literal("error"), errorMessage: v.string() }),
      v.object({ kind: v.literal("success"), value: v.number() })
    )
  ),
});
```

### Function Registration & Calling

- **Public:** `query`, `mutation`, `action`
- **Private:** `internalQuery`, `internalMutation`, `internalAction`
- Call using `ctx.runQuery`, `ctx.runMutation`, `ctx.runAction` with function references from `api`/`internal`
- Minimize cross‑function calls in actions/transactions to avoid race conditions

Example:

```ts
import { api } from "./_generated/api";

const data: string = await ctx.runQuery(api.example.example, { name: "Bob" });
```

### API Design

- File‑based routing: `convex/foo.ts` export `bar` → `api.foo.bar`
- Organize by domain folders
- Use `query`/`mutation`/`action` for public, `internalQuery`/`internalMutation`/`internalAction` for private

### Limits

- Args/returns ≤ 8 MiB; read ≤ 8 MiB/16384 docs; write ≤ 8 MiB/8192 docs
- Record < 1 MiB; nesting ≤ 16 levels; arrays ≤ 8192 items
- ASCII keys only
- Execution: queries/mutations ≤ 1s, actions/HTTP ≤ 10m
- HTTP can stream ≤ 20 MiB

**Design to avoid hitting these limits.**

### Environment Variables

```ts
import { action } from "./_generated/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const helloWorld = action({
  args: {},
  handler: async () => {
    const { choices } = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Hello" }],
    });
    return choices[0].message.content;
  },
});
```

### Pagination

```ts
import { v } from "convex/values";
import { query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const list = query({
  args: { paginationOpts: paginationOptsValidator, author: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("messages")
      .withIndex("by_author", (q) => q.eq("author", args.author))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
```

### Schema & Indexes

- Define schema in `convex/schema.ts`
- **Never** add built‑in indexes (`by_id`, `by_creation_time`)
- Include all index fields in name; query in same order
- **Do NOT** use `_creationTime` explicitly as last column

Example:

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({ name: v.string(), body: v.string() })
    .index("by_name", ["name"]),
});
```

### TypeScript

- Use `Id<"table">` for document IDs from `./_generated/dataModel`
- Be strict with types
- Fully type `Record<Key, Value>` and `Array<T>`
- Add `@types/node` when using Node built‑ins

### Full‑Text Search

Define index:

```ts
messages: defineTable({ body: v.string(), channel: v.string() })
  .searchIndex("search_body", { searchField: "body", filterFields: ["channel"] }),
```

Query:

```ts
const messages = await ctx.db
  .query("messages")
  .withSearchIndex("search_body", (q) => 
    q.search("body", "hello").eq("channel", "#general")
  )
  .take(10);
```

### Queries

- Use indexes via `.withIndex`; **avoid** `.filter`
- No `.delete()` on queries; use `.collect()` + iterate + `ctx.db.delete(id)`
- Use `.unique()` for single doc (throws if multiple)
- Default order: ascending `_creationTime`; use `.order('desc')` to reverse

### Mutations

- `ctx.db.patch`: shallow merge
- `ctx.db.replace`: full replace

### Actions

- Add `"use node";` when using Node APIs
- Files with `"use node"` should **only** contain actions
- **Never** use `ctx.db` in actions

```ts
import { action } from "./_generated/server";

export const exampleAction = action({
  args: {},
  handler: async (ctx, args) => {
    return null;
  },
});
```

### Scheduling

**Cron** (`crons.ts`):

```ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

const empty = internalAction({ args: {}, handler: async () => {} });
const crons = cronJobs();
crons.interval("example", { hours: 2 }, internal.crons.empty, {});
export default crons;
```

**Scheduler:**

```ts
await ctx.scheduler.runAfter(0, internal.module.fn, { arg: "value" });
```

**Note:** Auth state does NOT propagate to scheduled jobs.

### File Storage

- Upload: `ctx.storage.generateUploadUrl()`
- Store `Id<"_storage">` in DB, **not** URLs
- Fetch URL: `ctx.storage.getUrl(id)`

---

## Examples

### Image Upload Flow

```ts
// convex/messages.ts
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").collect();
    return Promise.all(
      messages.map(async (m) => ({
        ...m,
        ...(m.format === "image" ? { url: await ctx.storage.getUrl(m.body) } : {}),
      }))
    );
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => ctx.storage.generateUploadUrl(),
});

export const sendImage = mutation({
  args: { storageId: v.id("_storage"), author: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", { 
      body: args.storageId, 
      author: args.author, 
      format: "image" 
    });
  },
});

export const sendMessage = mutation({
  args: { body: v.string(), author: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", { 
      body: args.body, 
      author: args.author, 
      format: "text" 
    });
  },
});
```

### Real‑Time AI Chat

```ts
// convex/functions.ts
import { query, mutation, internalAction } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { internal } from "./_generated/api";

export const createChannel = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => ctx.db.insert("channels", { name: args.name }),
});

export const listMessages = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) =>
    ctx.db.query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("desc")
      .take(10),
});

export const sendMessage = mutation({
  args: { channelId: v.id("channels"), content: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", args);
    await ctx.scheduler.runAfter(0, internal.functions.generateResponse, { 
      channelId: args.channelId 
    });
    return null;
  },
});

const openai = new OpenAI();

export const generateResponse = internalAction({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const context = await ctx.runQuery(internal.functions.loadContext, { channelId: args.channelId });
    const { choices } = await openai.chat.completions.create({ model: "gpt-4o-mini", messages: context });
    const content = choices[0].message.content!;
    await ctx.runMutation(internal.functions.writeAgentResponse, { channelId: args.channelId, content });
    return null;
  },
});

export const loadContext = internalQuery({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel_and_author", (q) => q.eq("channelId", args.channelId))
      .order("desc")
      .take(10);
    return messages.map((m) => (m.authorId ? { role: "user" as const, content: m.content } : { role: "assistant" as const, content: m.content }));
  },
});

export const writeAgentResponse = internalMutation({
  args: { channelId: v.id("channels"), content: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", { channelId: args.channelId, content: args.content });
    return null;
  },
});
```

Schema:

```ts
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  channels: defineTable({ name: v.string() }),
  messages: defineTable({ 
    channelId: v.id("channels"), 
    content: v.string() 
  }).index("by_channel", ["channelId"]),
});
```

---

## Convex Components

**Supported:** `proseMirror` (collaborative editor), `presence` (live user list/status)

**Unsupported:** Workflow, AI Agent, Persistent Text Streaming, Workpool, Crons, Action Retrier, Sharded Counter, Migrations, Aggregate, Geospatial, Cloudflare R2, Expo push notifications, Twilio SMS, LaunchDarkly, Polar, OSS stats, Rate limiter, Action cache

---

## Frontend Hooks

```tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

const data = useQuery(api.module.query) || [];
const mutate = useMutation(api.module.mutation);
```

---

## Response Hygiene

- Keep answers concise
- Use `api`/`internal` function references
- Include validators for all Convex functions
- Minimize stateful calls from actions
- Prefer early returns and shallow nesting
