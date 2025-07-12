# SkillSwap Platform

## Overview

This is a complete full-stack skill swapping platform built with React, Express, and PostgreSQL. Users can create profiles with skills they offer and want to learn, browse other users, send swap requests, and connect through a structured exchange system. The platform includes admin features for user moderation and a modern, responsive UI.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (December 2024)

✅ **Complete Platform Implementation**
- Full authentication system with JWT tokens
- User profile management with skills tracking
- Browse and search functionality with filters
- Swap request workflow (send/accept/reject)
- Admin dashboard with user management
- Modern UI with custom color scheme matching user requirements
- Fixed TypeScript errors and SelectItem value prop issues
- Database schema successfully deployed to PostgreSQL

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state, React Context for auth
- **Styling**: TailwindCSS with shadcn/ui component library
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based auth with bcrypt for password hashing
- **Session Management**: Express sessions with PostgreSQL store

### Database Design
- **Primary Database**: PostgreSQL with Neon serverless
- **Schema Management**: Drizzle Kit for migrations
- **Tables**: 
  - Users (profiles, skills, ratings)
  - Swap Requests (skill exchange requests)
  - Feedback (ratings and reviews)

## Key Components

### Authentication System
- JWT token-based authentication
- Secure password hashing with bcryptjs
- Persistent login with localStorage token storage
- Protected routes with middleware

### User Management
- Profile creation and editing
- Skills offered/wanted management
- Public/private profile visibility
- User search and filtering
- Admin user management with ban capabilities

### Swap System
- Send/receive skill swap requests
- Accept/reject request workflow
- Status tracking (pending, accepted, rejected, completed)
- Message system for requests

### Rating & Feedback
- Post-swap rating system
- Comment/review functionality
- Automatic user rating calculation
- Public rating display

### Admin Features
- User moderation (ban/unban)
- Platform-wide user management
- Swap request monitoring
- System statistics dashboard

## Data Flow

1. **User Registration/Login**: Client sends credentials to `/api/auth/*` endpoints
2. **Profile Management**: Users update profiles via `/api/users/*` endpoints
3. **Skill Discovery**: Search users by skills through `/api/users/search`
4. **Swap Requests**: Create and manage swaps via `/api/swaps/*` endpoints
5. **Real-time Updates**: Client polls server for new requests and updates

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI components foundation
- **tailwindcss**: Utility-first CSS framework

### Authentication & Security
- **jsonwebtoken**: JWT token generation/verification
- **bcryptjs**: Password hashing
- **connect-pg-simple**: PostgreSQL session store

### Development Tools
- **vite**: Fast build tool and dev server
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- tsx for backend development with auto-restart
- Environment variables for database and JWT configuration

### Production Build
- Frontend: Vite builds optimized React bundle to `dist/public`
- Backend: esbuild creates single Node.js bundle in `dist/`
- Serves static files from Express in production

### Database Management
- Drizzle migrations in `migrations/` directory
- Schema definitions in `shared/schema.ts`
- Push schema changes with `npm run db:push`

### Environment Configuration
- `DATABASE_URL`: Neon PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `NODE_ENV`: Environment flag for development/production modes

The application uses a monorepo structure with shared TypeScript types between client and server, ensuring type safety across the full stack. The architecture supports scalable user growth with efficient database queries and optimistic UI updates.