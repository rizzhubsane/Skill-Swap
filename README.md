# 🔁 SkillSwap Platform

SkillSwap is a full-stack web application that enables users to exchange their skills in a structured and secure environment. Built with **React**, **Express**, and **PostgreSQL**, it provides a smooth user experience, real-time interactions, admin moderation tools, and a modern UI optimized for desktop and mobile.

---

## 🧠 Our Approach

The SkillSwap platform was built with the following guiding principles:

- **Skill-first matching**: Let users offer and request skills clearly
- **Simplicity and accessibility**: Use intuitive UX and responsive design
- **Security by design**: JWT-based authentication and protected routes
- **Maintainability**: Use type-safe tooling across frontend/backend
- **Scalability**: Optimized queries and separation of concerns
- **Developer Experience**: Modern stack with monorepo architecture and auto-reloading development environment

---

## 🚀 Features

### 👥 User Management
- JWT-based authentication (login/register)
- Profile creation and skill listing (offered + wanted)
- Upload profile photos (drag & drop + preview)
- Public/private profile toggle
- Browse and filter user profiles by skills
- Secure password hashing with bcrypt

### 🔁 Skill Swap System
- Send/accept/reject swap requests
- Status: pending, accepted, rejected, completed
- Real-time messaging within requests
- Feedback and ratings after swap completion
- Automatic rating calculation

### 🛠️ Admin Dashboard
- Ban/unban users
- Monitor swap activity and stats
- View all users and feedback

### 📸 Profile Photo Support
- JPEG, PNG, GIF formats up to 5MB
- Image previews before uploading
- Stored as Base64 strings
- Fully responsive design

---

## ⚙️ Tech Stack

### Frontend
- **React 18 + TypeScript**
- **Vite** for lightning-fast build and dev server
- **TailwindCSS** for styling
- **shadcn/ui** for accessible components
- **TanStack Query (React Query)** for data fetching
- **Wouter** for routing

### Backend
- **Node.js + Express** (ES Modules)
- **TypeScript** with full type safety
- **Drizzle ORM** for PostgreSQL access
- **JWT authentication** with `jsonwebtoken`
- **Password security** using `bcryptjs`
- **Express-session + connect-pg-simple** for persistent sessions

### Database
- **PostgreSQL** hosted on Neon (serverless) or Railway
- DrizzleKit for schema and migrations

### Shared Monorepo
- Common `schema.ts` for DB models and API types
- Shared `@shared/schema` ensures type safety across frontend/backend

---

## 🗂️ Project Structure

