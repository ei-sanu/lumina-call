# NovaArc

A premium video conferencing platform built with React, TypeScript, and Vite..

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod
- **State/Fetching**: TanStack React Query

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test
```

## Project Structure

```
src/
├── assets/         # Static assets (images, etc.)
├── components/
│   ├── landing/    # Landing page sections
│   └── ui/         # Reusable UI components (shadcn)
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
├── pages/          # Route-level page components
└── main.tsx        # App entry point
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/login` | Sign in |
| `/signup` | Create account |
| `/dashboard` | User dashboard |
| `/meeting/:id` | Meeting room |
| `/settings` | User settings |
| `/terms` | Terms of Service |
