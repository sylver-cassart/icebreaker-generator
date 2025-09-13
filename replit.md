# LinkedIn Icebreaker Generator

## Overview

A React-based web application that generates personalized 2-line icebreakers for LinkedIn outreach using AI. Users paste LinkedIn profile content, and the system creates three tailored conversation starters designed for cold emails or direct messages. The application focuses on professional, human-sounding icebreakers that avoid generic compliments and sales-heavy language.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React useState for local component state, React Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Theme Support**: Light/dark mode toggle with localStorage persistence

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Structure**: RESTful endpoints with `/api` prefix
- **Rate Limiting**: 10 requests per minute per IP address
- **Error Handling**: Centralized error sanitization to prevent information leakage
- **Validation**: Zod schemas for request validation
- **File Structure**: Clean separation between routes, storage, and utility modules

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: User table with UUID primary keys, username/password authentication
- **Migrations**: Drizzle-kit for schema management
- **Storage Pattern**: Abstract storage interface with in-memory implementation for development

### AI Integration
- **Provider**: OpenAI API integration
- **Model Strategy**: Fallback system using GPT-5 as primary, GPT-4o as backup
- **Prompt Engineering**: Structured system prompt for generating professional icebreakers
- **Response Validation**: Word count limits (≤18 words per line) and structure validation
- **Error Recovery**: Multiple model attempts with graceful degradation

### Design System
- **Color Palette**: LinkedIn-inspired blue primary with professional grays
- **Typography**: Inter font family for clean, readable text
- **Component Structure**: Modular components with consistent spacing (4-unit grid)
- **Layout**: Centered, max-width constrained design with generous whitespace
- **Accessibility**: Focus management, ARIA labels, and keyboard navigation support

### Security & Performance
- **Input Sanitization**: Profile text limited to 5000 characters
- **Rate Limiting**: API protection against abuse
- **Error Security**: Sanitized error messages to prevent information disclosure
- **Development Tools**: Runtime error overlay and hot module replacement

## External Dependencies

### Core Infrastructure
- **Database**: PostgreSQL via Neon serverless
- **AI Service**: OpenAI API (GPT-5/GPT-4o)
- **Build System**: Vite with React and TypeScript plugins

### UI Libraries
- **Component System**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS for utility-first styling
- **Icons**: Lucide React for consistent iconography
- **Fonts**: Google Fonts (Inter, JetBrains Mono)

### Development & Deployment
- **Replit Integration**: Development environment with cartographer plugin
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **Validation**: Zod for runtime type checking and API validation
- **Date Handling**: date-fns for date manipulation utilities