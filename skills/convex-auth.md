# Convex Auth — React Vite

Authentication built into Convex backend. No external service needed.

**Supported methods**: OAuth, Passwords, Email/Phone OTPs, Magic Links, Anonymous

**Architecture**:
- Server: Configure providers in `convex/auth.ts` → exports `signIn`, `signOut`, `isAuthenticated`
- Client: Wrap app in `<ConvexAuthProvider>` → manages JWT tokens, handles OAuth `?code=` param
- Schema: Include `authTables` for users, sessions, accounts, refresh tokens, verification codes
- HTTP: `auth.addHttpRoutes(http)` registers OIDC/OAuth endpoints

Docs: https://labs.convex.dev/auth

## Setup (already done)

✅ Schema: `convex/schema.ts` includes `authTables` + customized `users` table  
✅ Providers: `convex/auth.ts` → `Password` + `Anonymous`  
✅ HTTP routes: `convex/http.ts` → `auth.addHttpRoutes(http)`  
✅ Client: `src/main.tsx` has `ConvexAuthProvider` (commented, uncomment to enable)  
✅ UI example: `src/components/auth/SignIn.tsx`

**Install** (if needed):
```bash
bun install convex @convex-dev/auth @auth/core
bun run convex  # dev server
```

## Providers (`convex/auth.ts`)

**Password** (email + password):
```ts
import { Password } from "@convex-dev/auth/providers/Password";

Password({
  // validatePasswordRequirements: (pwd) => { if (pwd.length < 12) throw new Error("Weak"); },
  // verify: Email({ sendVerificationRequest }), // require email verification
  // reset: Email({ sendVerificationRequest }),  // enable password reset
})
```

**Email** (magic link or OTP):
```ts
import { Email } from "@convex-dev/auth/providers/Email";

Email({
  sendVerificationRequest: async ({ identifier, url, code }) => {
    // Send email with url (magic link) or code (OTP)
  },
})
```

**Phone** (SMS OTP):
```ts
import { Phone } from "@convex-dev/auth/providers/Phone";

Phone({
  sendVerificationRequest: async ({ identifier, code }) => {
    // Send SMS with code
  },
})
```

**OAuth** (GitHub/Google/Apple):
```ts
import GitHub from "@auth/core/providers/github";

GitHub({
  clientId: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
})
```

**Anonymous**:
```ts
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";

Anonymous()
```

## Client (`src/main.tsx`)

```tsx
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL!);

<ConvexAuthProvider client={convex}>
  <App />
</ConvexAuthProvider>
```

## Usage

**Sign in/out**:
```tsx
import { useAuthActions } from "@convex-dev/auth/react";
const { signIn, signOut } = useAuthActions();

// Password (MUST include flow param)
await signIn("password", { flow: "signIn", email, password });
await signIn("password", { flow: "signUp", email, password });
await signIn("password", { flow: "reset", email });
await signIn("password", { flow: "reset-verification", email, code, newPassword });

// Email/Phone
await signIn("email", { email });
await signIn("phone", { phone });
await signIn(undefined, { code }); // verify OTP

// OAuth
await signIn("github", { redirectTo: "/" });
// ConvexAuthProvider auto-handles ?code= param after redirect

// Anonymous
await signIn("anonymous");

// Sign out
await signOut();
```

**Server auth**:
```ts
import { getAuthUserId } from "@convex-dev/auth/server";

export const myQuery = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");
    // ...
  },
});
```

**Token for HTTP calls**:
```tsx
import { useAuthToken } from "@convex-dev/auth/react";
const token = useAuthToken();
fetch("/api", { headers: { Authorization: `Bearer ${token}` } });
```

## Environment vars

**Frontend**: `VITE_CONVEX_URL`  
**Backend**: `CONVEX_SITE_URL`, `JWKS`, OAuth secrets (`GITHUB_CLIENT_ID`, etc.)

## Key notes

⚠️ Password provider requires `flow` param: `"signIn"`, `"signUp"`, `"reset"`, `"reset-verification"`, `"email-verification"`  
⚠️ Email/Phone providers need `sendVerificationRequest` implementation  
⚠️ `useAuthToken()` is for your own services only, not third-party APIs  
✅ Built-in rate limiting for OTP/password (10 attempts/hour default)

## Customizing `users` table

Inline `users` in `convex/schema.ts` to add fields/indexes:

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Add custom fields
    role: v.optional(v.string()),
  }).index("email", ["email"]),
});
```

**Required fields**: Must be provided by all sign-up paths. Use:
- `Password({ profile: (params) => ({ email, role: "user" }) })`
- `GitHub({ profile: (gh) => ({ id: gh.id, email: gh.email, role: "user" }) })`
- Or `callbacks.createOrUpdateUser` for full control

---

Docs: https://labs.convex.dev/auth