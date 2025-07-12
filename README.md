# Skill-Swap Platform

A full-stack web application that enables users to exchange skills and knowledge with others in their community.

## Features

- **User Authentication**: Secure login and registration system
- **Profile Management**: Upload and manage profile photos with drag & drop support
- **Skill Profiles**: Create and manage your skill profile
- **Skill Matching**: Find users with complementary skills
- **Swap Requests**: Send and manage skill exchange requests
- **Real-time Messaging**: Communicate with other users
- **Admin Dashboard**: Manage users and platform content
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **React Query** for data fetching
- **React Router** for navigation

### Backend
- **Node.js** with TypeScript
- **Express.js** for API server
- **Drizzle ORM** for database operations
- **SQLite** for database (can be easily switched to PostgreSQL/MySQL)

## Getting Started

### Profile Photo Feature

The platform now supports profile photo uploads with the following features:
- **Drag & Drop**: Easily upload photos by dragging and dropping files
- **Image Preview**: See a preview before uploading
- **File Validation**: Supports JPEG, PNG, and GIF files up to 5MB
- **Base64 Storage**: Photos are stored as base64 strings in the database
- **Responsive Design**: Works seamlessly on mobile and desktop

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Skill-Swap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=file:./dev.db
   JWT_SECRET=your-secret-key-here
   PORT=3000
   ```

4. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## Project Structure

```
Skill-Swap/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions and configurations
│   └── index.html
├── server/                # Backend Node.js application
│   ├── routes.ts          # API route definitions
│   ├── db.ts             # Database configuration
│   └── index.ts          # Server entry point
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema definitions
└── package.json          # Project dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server (both frontend and backend)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open database studio

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, please open an issue on GitHub. 