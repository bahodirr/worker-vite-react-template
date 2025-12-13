## Role & Approach
- Think of Convex as a backend for fullstack applications.
- For simple ui, frontend only, don't use Convex, for fullstack applications that require a backend should use Convex (./CONVEX.md)
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
- `bun run dev` - Run the development server
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

## UI Style
---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

<frontend_aesthetics>
You tend to converge toward generic, "on distribution" outputs. In frontend design,this creates what users call the "AI slop" aesthetic. Avoid this: make creative,distinctive frontends that surprise and delight. 

Focus on:
- Typography: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics.
- Color & Theme: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. Draw from IDE themes and cultural aesthetics for inspiration.
- Motion: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions.
- Backgrounds: Create atmosphere and depth rather than defaulting to solid colors. Layer CSS gradients, use geometric patterns, or add contextual effects that match the overall aesthetic.

Avoid generic AI-generated aesthetics:
- Overused font families (Inter, Roboto, Arial, system fonts)
- Clichéd color schemes (particularly purple gradients on white backgrounds)
- Predictable layouts and component patterns
- Cookie-cutter design that lacks context-specific character

Interpret creatively and make unexpected choices that feel genuinely designed for the context. Vary between light and dark themes, different fonts, different aesthetics. You still tend to converge on common choices (Space Grotesk, for example) across generations. Avoid this: it is critical that you think outside the box!
</frontend_aesthetics>

