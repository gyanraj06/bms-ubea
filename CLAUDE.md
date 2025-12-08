# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Union Awaas Happy Holiday booking website client-side application built with Next.js 14. The design is an exact recreation of chaletmatthe.sk, featuring a premium aesthetic with brown/tan color scheme and smooth animations.

## Development Commands

```bash
# Development
npm run dev          # Start dev server on http://localhost:3000

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Architecture

### Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Query (TanStack Query)
- **Icons**: Phosphor Icons

### Directory Structure

```
app/
├── (routes)/           # Route groups (about, booking, contact, gallery, rooms)
├── layout.tsx          # Root layout with Providers and Toaster
├── page.tsx            # Homepage (Chalet-inspired design)
├── providers.tsx       # React Query provider setup
└── globals.css         # Global styles and CSS variables

components/
├── home/               # Homepage-specific sections (hero, sliders, testimonials, etc.)
├── shared/             # Reusable components (header, footer, chalet-header)
└── ui/                 # Base UI components (button, card, input, label)

lib/
└── utils.ts            # Utility functions (cn, formatCurrency, formatDate)

types/
└── index.ts            # TypeScript type definitions (Room, Hall, Booking, SearchParams)
```

### Design System

The project uses a custom color palette defined in [tailwind.config.ts](tailwind.config.ts):

- **Primary**: `#32373c` (dark brown) - Main brand color
- **Accent**: `#DDC9B5` (tan) - Secondary brand color
- **Brown variants**: dark (#32373c), medium (#5a4a3a), light (#8b7355)
- **Tan variants**: light (#F2EDE8), default (#DDC9B5), dark (#c4b5a3)

Custom animations: `fade-in`, `fade-in-up`, `scale-in`, `accordion-down/up`

### Key Patterns

#### Component Organization

- Homepage sections in `components/home/` are composed together in [app/page.tsx](app/page.tsx#L14-L28)
- Each page uses client components (`'use client'`) for interactivity
- Shared layout components (Header/Footer) are reused across pages

#### Styling

- Use the `cn()` utility from [lib/utils.ts](lib/utils.ts#L4-L6) to merge Tailwind classes
- Components use `class-variance-authority` for variant-based styling (see [components/ui/button.tsx](components/ui/button.tsx))
- All custom colors use Tailwind's theme system, not hardcoded hex values

#### Data Handling

- Currently uses mock data (e.g., `allRooms` array in [app/rooms/page.tsx](app/rooms/page.tsx#L14-L81))
- React Query is configured with 60s staleTime and disabled window focus refetch
- Type definitions in [types/index.ts](types/index.ts) are ready for backend integration

#### Utilities

- Currency formatting uses INR (Indian Rupees): `formatCurrency(amount)`
- Date formatting uses en-IN locale: `formatDate(date)`

### Next.js Configuration

[next.config.js](next.config.js) includes:

- Remote image patterns enabled for any hostname (`**`)
- ESLint ignored during builds (set to `true`)
- TypeScript build errors NOT ignored
- 120s static page generation timeout

### Path Aliases

The project uses `@/*` for imports mapped to the root directory (configured in [tsconfig.json](tsconfig.json#L20-L22)):

```typescript
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { Room } from "@/types";
```

## Important Notes

### Current State

- No backend integration yet - all data is mock/static
- No environment variables required currently
- Booking flow is placeholder only

### When Adding Features

- Match the chalet-inspired luxury aesthetic (brown/tan color scheme)
- Use Framer Motion for animations to maintain consistency
- Add new route pages directly in `app/` directory (App Router pattern)
- Place reusable components in `components/shared/`, page-specific ones in appropriate subdirectory

### Deployment

- Configured for Vercel deployment ([vercel.json](vercel.json))
- Production builds require all TypeScript errors to be resolved
- Static assets should go in `public/` directory
