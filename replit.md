# Task Management Application

## Overview

This is a full-stack task management application built with a modern web architecture. The application features a React frontend with TypeScript, an Express.js backend, and PostgreSQL database integration. It includes real-time collaboration features through WebSocket connections and supports comprehensive task management with user authentication, comments, and file attachments.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for fast development and optimized builds
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time Communication**: WebSocket server for live updates
- **Session Management**: PostgreSQL-based session storage
- **API Structure**: RESTful endpoints with real-time WebSocket integration

### Hybrid API Support
- **Primary API**: Node.js/Express with TypeScript
- **Secondary API**: PHP Laravel components for additional functionality
- **Database Access**: Both APIs can interact with the same PostgreSQL database

## Key Components

### Database Schema (PostgreSQL + Drizzle)
- **Users Table**: Authentication and user management
- **Tasks Table**: Core task entities with metadata, status tracking, and soft delete functionality
- **Task Messages Table**: Comments and communication threads for tasks
- **Session Storage**: Built-in session management for user authentication

### Authentication System
- Session-based authentication using PostgreSQL storage
- User registration and login functionality
- Secure password handling

### Task Management Features
- Create, read, update, delete tasks with soft delete support
- Task status tracking and workflow management
- Due date and priority management
- File attachment support
- Assignee and collaborator management
- Archive/restore functionality

### Real-time Features
- WebSocket server for live updates
- Real-time task updates across connected clients
- Live comments and messaging system
- Collaborative editing notifications

### API Endpoints
- `/api/tasks` - Task CRUD operations
- `/api/tasks/all` - Include deleted tasks for admin views
- `/api/tasks/:id/messages` - Task-specific messaging
- WebSocket endpoint at `/ws` for real-time features

## Data Flow

1. **Client Requests**: React frontend makes API calls using TanStack Query
2. **Server Processing**: Express.js handles HTTP requests and WebSocket connections
3. **Database Operations**: Drizzle ORM manages PostgreSQL interactions with type safety
4. **Real-time Updates**: WebSocket server broadcasts changes to connected clients
5. **State Synchronization**: Frontend updates UI based on server responses and WebSocket events

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe database ORM with PostgreSQL support
- **ws**: WebSocket implementation for real-time features
- **connect-pg-simple**: PostgreSQL session store for Express

### Frontend Dependencies
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/**: Comprehensive UI component library
- **react-hook-form**: Form management with validation
- **zod**: Runtime type validation and schema definition
- **date-fns**: Date manipulation and formatting

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tailwindcss**: Utility-first CSS framework
- **drizzle-kit**: Database migration and schema management tools

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev`
- **Port**: 5000 (with external mapping to port 80)
- **Features**: Hot module replacement, TypeScript compilation, WebSocket support

### Production Build
- **Frontend Build**: Vite compiles React app to static assets
- **Backend Build**: esbuild bundles TypeScript server code
- **Database**: PostgreSQL with environment-based connection strings
- **Deployment Target**: Autoscale platform with optimized builds

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Supports both local development and cloud deployment
- PHP components configured for PostgreSQL integration
- Session management with database persistence

## Changelog

```
Changelog:
- June 16, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```