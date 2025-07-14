# SkillSwap Platform

## Overview
A skill exchange platform where users can swap skills with each other. Users can offer skills they have and request skills they want to learn. The platform includes user authentication, profile management, swap requests, feedback/rating system, and admin functionality.

## Project Architecture
- **Frontend**: React with TypeScript, Vite, TailwindCSS, shadcn/ui components
- **Backend**: Express.js with TypeScript 
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens
- **File Upload**: Multer for profile photos
- **Routing**: Wouter for client-side routing

## Key Features
- User registration and login
- Profile management with photo upload
- Skill offering/requesting system
- Swap request workflow (pending/accepted/rejected/completed)
- Rating and feedback system
- Admin panel for user and content moderation
- Search and filter functionality

## Recent Changes (July 14, 2025)
- Migrated from Replit Agent to standard Replit environment
- Fixed import paths from @shared to relative imports for ESM compatibility
- Set up PostgreSQL database with proper schema migration
- Removed SQLite dependency for better production compatibility
- Updated database configuration for Replit deployment
- Implemented comprehensive admin dashboard with full moderation capabilities
- Added admin authentication system with user management, content moderation, and analytics
- Created platform messaging system and CSV report generation
- Fixed admin login credentials (email: odoo-hackathon@gmail.com, password: admin123)

## Security Features
- Password hashing with bcryptjs
- JWT token authentication
- Input validation with Zod schemas
- File upload restrictions (images only, 5MB limit)
- Admin role-based access control

## User Preferences
- Keep code clean and follow TypeScript best practices
- Use modern React patterns with hooks
- Maintain separation between client and server code
