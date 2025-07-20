# replit.md

## Overview

Walk & Earn is a premium fitness PWA (Progressive Web App) that gamifies walking by rewarding users with earnings for completing walking sessions. The application features a glassmorphism design with dynamic rainbow backgrounds and integrates fitness tracking with a reward system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **Styling**: Tailwind CSS with custom glassmorphism design system
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Design System**: Custom glassmorphism components with rainbow VIBGYOR backgrounds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple

### PWA Features
- **Manifest**: Full PWA manifest with app icons and theme colors
- **Service Worker**: Ready for offline functionality
- **Mobile Optimization**: Responsive design optimized for mobile devices
- **App-like Experience**: Mobile-first glassmorphism interface

## Key Components

### Database Schema
- **Users**: Profile data, balance, streaks, and fitness statistics
- **Walk Sessions**: Individual walking session records with GPS data, steps, distance, and earnings
- **Transactions**: Financial transaction history for earnings and redemptions
- **Sessions**: Authentication session storage for Replit Auth

### Authentication System
- **Provider**: Replit Auth (OpenID Connect)
- **Session Storage**: PostgreSQL-backed sessions
- **Authorization**: Route-level authentication middleware
- **User Management**: Automatic user creation and profile management

### Core Features
- **Dashboard**: Real-time fitness statistics and earnings display
- **Walking Sessions**: 30-minute timed walking sessions with GPS tracking
- **Reward System**: Earnings based on completed walking sessions
- **Transaction History**: Complete financial transaction tracking
- **Streak System**: Daily walking streak tracking with bonus rewards
- **Live Brand Customization**: Real-time brand theming with preset configurations and live preview
- **Metro Integration**: Mixed payment system (coins + cash) with QR code generation
- **Premium Rewards Store**: Discounted subscriptions with up to 60% savings

## Data Flow

1. **Authentication Flow**: Users authenticate through Replit Auth, sessions stored in PostgreSQL
2. **Dashboard Data**: Real-time aggregation of user statistics, recent sessions, and earnings
3. **Walking Session Flow**: Start session → GPS tracking → Complete session → Calculate rewards → Update user balance
4. **Transaction Processing**: All earnings and bonuses recorded as individual transactions
5. **Real-time Updates**: TanStack Query provides optimistic updates and cache invalidation

## External Dependencies

### Core Dependencies
- **Database**: Neon Database (serverless PostgreSQL)
- **Authentication**: Replit Auth service
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **UI Framework**: Radix UI primitives
- **HTTP Client**: Native fetch with TanStack Query

### Development Dependencies
- **Build System**: Vite with React plugin
- **Type Checking**: TypeScript with strict mode
- **Styling**: Tailwind CSS with PostCSS
- **Development**: tsx for TypeScript execution

## Deployment Strategy

### MVP Phase (Current)
- **Platform**: Replit hosting for development and initial testing
- **Database**: Neon PostgreSQL (serverless)
- **Authentication**: Replit Auth with OpenID Connect
- **Frontend**: Vite builds optimized React bundle
- **Backend**: Express.js server with TypeScript

### Future Migration Plan
- **Target**: User's own web servers
- **Database Migration**: Export data from Neon to target PostgreSQL
- **Authentication**: Migrate to custom auth or third-party provider
- **Hosting**: Self-hosted or cloud provider (AWS, GCP, etc.)
- **Domain**: Custom domain configuration

### Environment Configuration
- **Database**: `DATABASE_URL` for Neon PostgreSQL connection
- **Authentication**: Replit Auth environment variables
- **Sessions**: `SESSION_SECRET` for session encryption

### Scaling Considerations
- **Current**: Serverless PostgreSQL scales automatically on Replit
- **Future**: Custom scaling based on target infrastructure
- **Sessions**: PostgreSQL session store handles concurrent users
- **Brand Assets**: CDN-ready for video/image backgrounds

### Development Workflow
- **Database Migrations**: Drizzle Kit for schema management
- **Hot Reload**: Vite HMR for frontend, tsx for backend development
- **Type Safety**: End-to-end TypeScript with shared schema definitions

## Recent Updates (July 19, 2025)

### Enhanced Brand Customization System
- **Live Preview**: Real-time visual feedback when adjusting brand settings
- **Brand Presets**: Quick-apply configurations for Nike, Adidas, Coca-Cola, Starbucks, and Apple
- **Advanced Theming**: Custom CSS injection with glassmorphism background controls
- **Persistent Settings**: Configuration saved to localStorage for session continuity
- **User-Friendly Interface**: Improved preset selection with color previews and hover effects

### Navigation & UX Improvements
- **Consistent Back Navigation**: BackButton component implemented across all pages
- **Enhanced Glassmorphism**: Better visibility with dark backgrounds (black/30) and proper shadows
- **Mobile-Optimized Layout**: Proper spacing and touch-friendly controls on all screens
- **Live Brand Application**: Changes apply instantly when live preview is enabled