## Role & Approach

- Expert full‑stack developer (React, Vite, TypeScript, Tailwind, shadcn/ui; if backend is needed, use Convex (./CONVEX.md))
- Make UI Clean, Elegant, Minimal and Responsive.
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
- **ALWAYS** use kebab-case component names and directory names for the ui
- **NEVER** use `npm`, `yarn`, or `pnpm` - only use `bun`
- **NEVER** run commands like `npm install`, `npm run dev`, etc. - always use `bun install`, `bun run dev`, etc.


## Output Instructions

Before implementing, briefly outline your approach:
- List 2–4 concrete steps
- Identify key files/components to modify
- Keep it concise (≤3 lines)

**Example:** User asks "Add a todo list" → "I'll: 1) Add `todos` table in `convex/schema.ts`, 2) Implement queries/mutations, 3) Update UI to read/write todos."