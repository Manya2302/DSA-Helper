# DSA Visualizer

## Overview

DSA Visualizer is an interactive web application that allows users to input code in various programming languages and automatically generates real-time visualizations of data structures and algorithms. The system detects algorithm types (sorting, searching, graph traversal, etc.), executes code securely, and provides step-by-step visual representations to help users understand algorithmic concepts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: TailwindCSS with CSS variables for theming support
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Code Editor**: Monaco Editor integration for syntax highlighting and multi-language support

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured route handlers
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Development Setup**: Hot module replacement via Vite middleware integration

### Data Storage Solutions
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **Schema Design**: 
  - Users table for authentication
  - Projects table for storing user code and metadata
  - Algorithms table for reference implementations and complexity data
  - Visualizations table for storing step-by-step execution data
- **Connection Pooling**: Neon serverless connection pooling with WebSocket support

### Visualization Engine
- **Library**: D3.js for creating dynamic SVG-based visualizations
- **Algorithm Support**: Built-in visualization generators for sorting, searching, and graph algorithms
- **Interactive Controls**: Play/pause, step-through, and speed adjustment capabilities
- **Responsive Design**: Dynamic sizing based on container dimensions

### Algorithm Detection System
- **Pattern Matching**: RegEx-based code analysis to identify algorithm types
- **Multi-language Support**: Detection patterns for JavaScript, Python, Java, C, and C++
- **Classification**: Automatic categorization into sorting, searching, graph, tree, and other algorithm types
- **Confidence Scoring**: Algorithm detection with confidence levels and fallback mechanisms

### Code Execution Strategy
- **Architecture**: Prepared for external code execution service integration
- **Security**: Designed for sandboxed execution environments
- **Multi-language**: Support for JavaScript, Python, Java, C, C++, and other popular languages
- **Result Processing**: Structured output parsing for visualization data extraction

## External Dependencies

### UI and Styling
- **Radix UI**: Comprehensive set of accessible UI primitives
- **TailwindCSS**: Utility-first CSS framework with PostCSS processing
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe variant API for component styling

### Development and Build Tools
- **Vite**: Fast build tool with HMR and development server
- **TypeScript**: Static type checking and enhanced developer experience
- **Replit Plugins**: Development banner, error overlay, and cartographer for Replit integration

### Database and ORM
- **Neon Database**: Serverless PostgreSQL database platform
- **Drizzle ORM**: Lightweight TypeScript ORM with excellent type safety
- **Drizzle Kit**: Schema management and migration tools

### Data Visualization
- **D3.js**: Data visualization library for creating interactive charts and animations
- **Custom SVG Rendering**: Manual SVG manipulation for algorithm-specific visualizations

### State Management and API
- **TanStack React Query**: Server state management with caching and synchronization
- **Zod**: Runtime type validation for API endpoints and form handling
- **React Hook Form**: Form state management with validation support

### Planned Integrations
- **Code Execution API**: Judge0 API or similar service for secure multi-language code execution
- **Session Management**: PostgreSQL-based session storage for user authentication
- **Export Capabilities**: Image and video export functionality for visualizations