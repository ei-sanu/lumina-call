# Project Instructions

## Database Management
- Always update `supabase-schema.sql` and `supabase-migration-updates.sql` whenever the database schema is modified.
- If possible, apply database changes directly using the Supabase CLI or relevant tools to ensure the environment is synchronized.

## Git Workflow
- The user has explicitly requested to **commit each and every update** performed by the agent.
- Follow the standard Git protocol: check `git status`, review changes with `git diff`, and provide clear, concise commit messages.
- Do not push changes to the remote repository unless explicitly asked.

## Tech Stack
- Frontend: React (TypeScript)
- Styling: Tailwind CSS (with Shadcn UI)
- Backend: Node.js (Express)
- Database: Supabase
- Authentication: Clerk
