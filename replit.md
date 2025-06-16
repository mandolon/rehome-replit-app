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
- **Primary Framework**: Laravel 10+ with PHP 8.2+
- **Secondary Framework**: Node.js with Express.js (legacy support)
- **Language**: PHP for Laravel, TypeScript for Node.js
- **Database**: PostgreSQL with Eloquent ORM (Laravel) and Drizzle ORM (Node.js)
- **Frontend Integration**: Inertia.js for seamless SPA experience
- **Real-time Communication**: WebSocket server for live updates
- **Session Management**: Laravel session management with database storage
- **API Structure**: RESTful Laravel controllers with comprehensive CRUD operations

### Hybrid API Architecture
- **Primary API**: Laravel with Eloquent models and resource controllers
- **Secondary API**: Node.js/Express with TypeScript for real-time features
- **Database Access**: Both frameworks use the same PostgreSQL database
- **Model Synchronization**: Laravel Eloquent models mirror Node.js Drizzle schema

## Key Components

### Database Schema (PostgreSQL + Laravel Migrations)
- **Users Table**: Enhanced authentication with Laravel User model, roles, and profile management
- **Tasks Table**: Advanced task entities with Laravel soft deletes, status workflow, and project associations
- **Task Messages Table**: Thread-based communication system with user relationships and metadata
- **Session Storage**: Laravel session management with database persistence
- **Migration System**: Laravel migration files for version-controlled schema changes

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

#### Laravel API (Primary)
- `GET /api/tasks` - Retrieve tasks with filtering and relationships
- `POST /api/tasks` - Create new task with validation
- `GET /api/tasks/{taskId}` - Get specific task with messages
- `PUT /api/tasks/{taskId}` - Update task with status workflow
- `DELETE /api/tasks/{taskId}` - Soft delete task
- `DELETE /api/tasks/{taskId}/permanent` - Permanently delete task
- `POST /api/tasks/{taskId}/restore` - Restore soft-deleted task
- `PATCH /api/tasks/{taskId}/status` - Update task status with business logic
- `POST /api/tasks/{taskId}/archive` - Archive task
- `GET /api/tasks/{taskId}/messages` - Get task messages with user data
- `POST /api/tasks/{taskId}/messages` - Create task message
- `GET /api/users` - User management endpoints
- `GET /api/projects/{projectId}/tasks` - Project-specific tasks

#### Node.js API (Legacy/Real-time)
- WebSocket endpoint at `/ws` for real-time features
- Legacy Express endpoints for backward compatibility

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
- June 16, 2025: Initial setup
- June 16, 2025: Backend architecture refactoring - Implemented Laravel 10+ with Inertia.js integration as primary backend framework
  * Created comprehensive Laravel Models (Task, User, TaskMessage) with Eloquent relationships
  * Built Laravel Controllers (TaskController, UserController, TaskMessageController) with full CRUD operations
  * Designed database migrations for PostgreSQL with proper indexing and foreign key constraints
  * Implemented Laravel API routes with RESTful endpoints and advanced filtering
  * Added soft delete functionality, status workflow management, and user role system
  * Optimized React hooks (useTaskOperations, useTaskEditing, useTaskAssignments) to prevent infinite re-renders
  * Maintained Node.js/Express backend for real-time WebSocket functionality and legacy support
  * Enhanced project architecture to support hybrid Laravel/Node.js backend with shared PostgreSQL database
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```