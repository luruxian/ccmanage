# Project Context

## Purpose
ccmanage is a full-stack web application for managing Claude Code API keys, user subscriptions, and usage tracking. The system provides user authentication, API key management, subscription plans, and admin dashboard functionality.

## Tech Stack

### Backend
- **Framework**: FastAPI 0.115.6
- **Database**: SQLAlchemy 2.0.43 with MySQL
- **Authentication**: JWT with python-jose
- **Email**: FastAPI-mail with aiosmtplib
- **Configuration**: Pydantic Settings with environment variables
- **Migrations**: Alembic

### Frontend
- **Framework**: Vue 3 with TypeScript
- **UI Library**: Element Plus 2.5.6
- **CSS Framework**: Bootstrap 5.3.3
- **State Management**: Pinia 2.1.7
- **Routing**: Vue Router 4.5.1
- **HTTP Client**: Axios 1.6.7
- **Build Tool**: Vite 7.1.6

## Project Conventions

### Code Style
- **Backend**: Follow PEP 8 with 4-space indentation
- **Frontend**: TypeScript with strict typing, Vue 3 Composition API
- **Naming**: snake_case for Python, camelCase for TypeScript
- **File organization**: Feature-based modular structure

### Architecture Patterns
- **Clean Architecture**: Clear separation between API, business logic, and data access
- **Repository Pattern**: Database operations abstracted from business logic
- **Dependency Injection**: Services injected where needed
- **API-First**: FastAPI with automatic OpenAPI documentation

### Testing Strategy
- **Backend**: pytest with FastAPI TestClient
- **Frontend**: Vitest for unit tests, Playwright for E2E
- **Coverage**: Aim for 80%+ test coverage
- **Integration**: Test database interactions with test containers

### Git Workflow
- **Branching**: Feature branches from main, PR-based development
- **Commits**: Conventional commits format
- **Main branch**: Protected with required reviews
- **Release**: Semantic versioning with tags

## Domain Context

### Core Concepts
- **Users**: Registered users with email verification
- **API Keys**: Keys for accessing Claude Code APIs with usage limits
- **Packages**: Subscription plans with credit allocations
- **Credits**: Consumable resources for API usage
- **Admin**: System administrators with elevated privileges

### Business Rules
- API keys have usage limits based on subscription packages
- Credits are consumed per API call and reset periodically
- Users can upgrade/downgrade subscription packages
- Admin users can manage all users and system settings

## Important Constraints

### Technical Constraints
- **Database**: MySQL 8.0+ required for JSON support
- **Python**: 3.9+ required for FastAPI compatibility
- **Node.js**: 18+ required for Vue 3 and Vite
- **Security**: JWT tokens with 24-hour expiration
- **Performance**: Database connection pooling required

### Business Constraints
- **Data Privacy**: User data must be protected and encrypted
- **Availability**: System must maintain 99.9% uptime
- **Scalability**: Support for 10,000+ concurrent users
- **Compliance**: GDPR and data protection compliance required

## External Dependencies

### APIs and Services
- **Claude Code API**: Primary external API for key validation
- **Email Service**: SMTP server for user notifications
- **Payment Gateway**: Future integration for subscription billing
- **Monitoring**: Application performance monitoring

### Infrastructure
- **Database**: MySQL 8.0+ with connection pooling
- **Cache**: Redis for session management and caching
- **Storage**: File storage for logs and temporary files
- **CDN**: Content delivery for static assets
