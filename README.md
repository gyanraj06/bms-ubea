# Happy Holidays Booking System - Client Side

A modern, Happy Holidays booking website built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🎨 Exact design recreation of chaletmatthe.sk
- 🏨 Room browsing with advanced filtering
- 📱 Fully responsive design
- ⚡ Optimized performance with Next.js 14
- 🎭 Smooth animations with Framer Motion
- 🎯 TypeScript for type safety

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Phosphor Icons
- **Carousel:** Embla Carousel
- **Forms:** React Hook Form + Zod
- **State:** React Query

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

```
bms-clientside/
├── app/                    # Next.js app directory
│   ├── (routes)/          # Page routes
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── home/              # Homepage sections
│   ├── shared/            # Shared components
│   └── ui/                # Base UI components
├── lib/                   # Utility functions
├── types/                 # TypeScript types
└── public/                # Static assets
```

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/gyanraj06/bms-clientside)

Or manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Environment Variables

Currently, no environment variables are required. When backend integration is added, create a `.env.local` file:

```env
# Future variables
NEXT_PUBLIC_API_URL=your_api_url
```

## Pages

- `/` - Homepage (Chalet-inspired design)
- `/rooms` - Room listing with filters
- `/rooms/[id]` - Room detail page
- `/gallery` - Image gallery
- `/contact` - Contact form
- `/about` - About page
- `/booking` - Booking flow (placeholder)

## License

ISC

## Author

Happy Holidays Team
