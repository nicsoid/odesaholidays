# Odesa Holiday Postcard Application

## Overview

This is a full-stack web application for creating, customizing, and sharing digital postcards featuring Odesa, Ukraine. The application allows users to create personalized postcards using templates of local landmarks, coastal views, and historic sites. Users can customize text, fonts, colors, and share their creations via social media or order physical prints. The platform includes user authentication, template management, event/location discovery, AI-powered recommendations, comprehensive internationalization (Ukrainian/English), and e-commerce functionality for postcard printing services.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom Ukrainian-themed color palette (blue #004C9F, yellow #FFD300)
- **Canvas Rendering**: HTML5 Canvas API for postcard preview and image generation
- **Payment Integration**: Stripe React components for checkout flow
- **Form Management**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js web framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with conventional HTTP methods and status codes
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Middleware**: Custom authentication middleware for protected routes
- **Email Service**: File-based email logging for development (production-ready service structure)

### Data Storage Solutions
- **Primary Database**: MongoDB Atlas with native MongoDB Node.js driver
- **Schema Validation**: Zod schemas for both MongoDB documents and API request/response validation
- **Database Alternative**: Drizzle ORM configured for PostgreSQL as backup option
- **File Storage**: Local filesystem for email logs, cloud storage integration ready for images

### Authentication and Authorization
- **Strategy**: Email/password authentication with JWT tokens
- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: Token-based stateless authentication
- **Role-based Access**: Admin role checking for administrative features
- **Password Recovery**: Token-based password reset flow with email notifications

### External Dependencies
- **Database**: MongoDB Atlas cloud database service
- **Payment Processing**: Stripe for credit card processing and subscription management
- **Email Service**: SendGrid integration structure (currently using file logging for development)
- **Image Hosting**: Unsplash API for template images with fallback to local assets
- **Font Services**: Google Fonts for typography options
- **Development Tools**: Replit-specific tooling for cloud development environment

The application follows a monorepo structure with shared TypeScript schemas between frontend and backend, ensuring type safety across the full stack. The architecture supports both development and production environments with appropriate fallbacks and configuration options.

### Recent Changes (January 2025)
- **Internationalization System**: Implemented comprehensive Ukrainian/English language support with browser detection, localStorage persistence, and translation framework
- **UX Improvement**: Fixed postcard creator to skip email prompt for authenticated users, improving user experience for logged-in customers
- **Language Switcher**: Added flag-based language toggle in navigation with Ukrainian as default language
- **AI Integration**: Enhanced AI recommendations with proper navigation and fixed infinite loop issues
- **Translation Coverage**: Navigation, AI recommendations, authentication flows, and core UI components fully translated