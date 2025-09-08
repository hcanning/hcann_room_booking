# Overview

This is a university room booking system built as a full-stack web application. The system allows administrators to manage room bookings through a modern web interface. The application provides functionality for viewing available rooms, creating new bookings, and managing existing reservations. It features a clean, responsive design with real-time availability tracking and an intuitive booking workflow.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Modern component-based UI using React 18 with TypeScript for type safety
- **Vite Build System**: Fast development server and optimized production builds
- **Wouter Router**: Lightweight client-side routing for navigation
- **TanStack Query**: Server state management for API calls, caching, and data synchronization
- **shadcn/ui Component Library**: Modern, accessible UI components built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework for consistent styling with CSS variables for theming
- **React Hook Form + Zod**: Form handling with schema validation for type-safe form inputs

## Backend Architecture
- **Express.js Server**: Node.js web framework handling HTTP requests and API endpoints
- **Session-based Authentication**: Express sessions with memory store for admin authentication
- **RESTful API Design**: Standard REST endpoints for rooms, bookings, and authentication
- **In-memory Storage**: Custom storage implementation using JavaScript Maps for development/demo purposes
- **Shared Schema Validation**: Zod schemas shared between frontend and backend for consistent data validation

## Data Storage Solutions
- **Development Storage**: In-memory storage using JavaScript Maps for rapid prototyping
- **Database Ready**: Drizzle ORM configured for PostgreSQL with schema definitions and migrations
- **Neon Database Integration**: Cloud PostgreSQL provider integration configured for production deployment

## Authentication and Authorization
- **Session Management**: Express sessions with configurable cookie settings
- **Admin-only Access**: Single admin role with username/password authentication
- **Protected Routes**: Middleware-based route protection for authenticated endpoints
- **Frontend Auth Guards**: React router guards preventing unauthorized access to admin features

## External Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver for cloud database connectivity
- **Drizzle ORM**: Type-safe SQL ORM with PostgreSQL dialect support
- **Radix UI Primitives**: Accessible, unstyled UI component primitives
- **React Query**: Server state management and caching
- **Replit Integration**: Development environment optimizations with error handling and cartographer support
- **Font Awesome**: Icon library for equipment and UI icons
- **Google Fonts**: Web fonts (Inter, Architects Daughter, DM Sans, Fira Code, Geist Mono)