# Getting Started with Skills Base Platform

This guide will help you set up your development environment and get started with the Skills Base Platform codebase.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v20 LTS or later)
- npm (v9 or later)
- Docker Desktop or Rancher Desktop
- Git
- MongoDB Compass (optional, for database visualization)
- Visual Studio Code (recommended)

## Initial Setup

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd skills-base-platform
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

   This will:

   - Install all workspace dependencies
   - Set up Husky git hooks
   - Build shared packages

3. **Set Up Infrastructure**

   ```bash
   # Start required infrastructure services
   docker compose -f docker/compose.infra.yml up -d
   ```

   This starts:

   - MongoDB on port 27017
   - RabbitMQ on ports 5672 (AMQP) and 15672 (Management UI)
   - n8n on port 5678

4. **Configure Environment Variables**
   ```bash
   # For each service, copy the example env file
   cd packages/user-service
   cp .env.example .env
   # Repeat for other services
   ```

## Project Structure

```
skills-base-platform/
├── packages/                    # Monorepo packages
│   ├── user-service/           # User management and auth
│   ├── skills-service/         # Skills and competencies
│   ├── learning-service/       # Learning paths
│   ├── integration-service/    # External integrations
│   ├── email-service/         # Email handling
│   ├── event-processes-service/# Event processing
│   ├── frontend/              # Next.js web interface
│   └── shared/                # Shared utilities and types
├── docker/                    # Docker compose files
├── kubernetes/               # K8s deployment configs
└── docs/                    # Documentation
```

## Architecture Overview

### Shared Package (@skills-base/shared)

The shared package is the foundation of our microservices architecture. It provides:

1. **Base Classes**

   ```typescript
   // Example of extending base service
   import { BaseService } from '@skills-base/shared';

   export class UserService extends BaseService<User> {
     // Additional user-specific methods
   }
   ```

2. **Common Utilities**

   - Database configurations
   - Authentication guards
   - Error handling
   - Message queue integration
   - Logging interceptors

3. **Shared Types**
   - DTOs for API requests/responses
   - Common interfaces
   - Entity base classes

### Microservices Communication

Services communicate through:

1. **REST APIs** for synchronous operations
2. **RabbitMQ** for asynchronous events using the shared messaging service

   ```typescript
   // Example of using messaging service
   @Injectable()
   export class NotificationService {
     constructor(private messagingService: MessagingService) {}

     async notifyUser(userId: string) {
       await this.messagingService.emit('user.notified', { userId });
     }
   }
   ```

## Development Workflow

1. **Start Development Services**

   ```bash
   # Start all services in development mode
   npx lerna run start:dev --stream --parallel

   # Or start a specific service
   npx lerna run start:dev --scope=@skills-base/user-service --stream

   # Or for Frontend (Next.js)
   npm lerna run dev --scope=@skills-base/frontend --stream
   ```

2. **Access Services**

   - Frontend: http://localhost:3000
   - User Service: http://localhost:3001
   - Skills Service: http://localhost:3002
   - Learning Service: http://localhost:3003
   - Integration Service: http://localhost:3004
   - Email Service: http://localhost:3005
   - Event Processes Service: http://localhost:3006

3. **Infrastructure UIs**
   - RabbitMQ Management: http://localhost:15672 (guest/guest)
   - n8n Dashboard: http://localhost:5678 (admin/password) or register if needed
   - MongoDB: mongodb://localhost:27017

## Environment Configuration

### Service Ports

Each service runs on a different port by default:

```
Frontend (Next.js): 3000
User Service:       3001
Skills Service:     3002
Learning Service:   3003
Integration Service:3004
Email Service:      3005
Event Processes:    3006
```

### Environment Variables

1. **Common Variables** (for all services)

   ```env
   NODE_ENV=development
   PORT=3001  # Unique for each service
   MONGODB_URI=mongodb://localhost:27017/<service_name>
   RABBITMQ_URL=amqp://localhost:5672
   ```

2. **Service-Specific Variables**

   ```env
   # User Service (.env)
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRATION=24h

   # Email Service (.env)
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_password

   # Frontend (.env.local)
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

3. **Configuration Usage**

   ```typescript
   // Example of using config in a service
   import { Injectable } from '@nestjs/common';
   import { ConfigService } from '@nestjs/config';

   @Injectable()
   export class AppService {
     constructor(private configService: ConfigService) {
       const port = this.configService.get('app.port');
       const mongoUri = this.configService.get('database.uri');
     }
   }
   ```

### Development vs Production

1. **Development**

   - Use local .env files
   - Services connect to local infrastructure
   - Debug logging enabled
   - Hot reload active

2. **Production**
   - Environment variables from deployment platform
   - Secure production URLs
   - Optimized logging
   - PM2 or Kubernetes for process management

## Service Development Guidelines

### Creating a New Service

1. **Setup**

   ```bash
   # Copy structure from existing service
   cp -r packages/user-service packages/new-service
   cd packages/new-service
   ```

2. **Update Package Info**

   - Modify package.json
   - Update service name and dependencies
   - Configure service-specific environment variables

3. **Implement Core Components**

   ```typescript
   // Example service structure for Domain-Driven Design (DDD)
   src/
   ├── main.ts                 # Service entry point
   ├── app.module.ts           # Main module
   ├── domain/                 # Business logic
   │   ├── entities/
   │   ├── repositories/
   │   └── services/
   ├── infrastructure/         # External integrations
   │   ├── database/
   │   └── messaging/
   └── interfaces/             # Controllers/DTOs
       ├── http/
       └── events/
   ```

   ***

   ```typescript
   // Example user-services structure
   ├── main.ts                     # Service entry point
   ├── app.module.ts               # Main module
   ├── auth/                       # Authentication module
   │   ├── auth.controller.ts      # Auth endpoints
   │   ├── auth.service.ts         # Auth business logic
   │   ├── auth.module.ts          # Auth module definition
   │   ├── jwt.strategy.ts         # JWT implementation
   │   └── dto/                    # Auth DTOs
   │       ├── login.dto.ts
   │       └── register.dto.ts
   └── users/                      # Feature module
       ├── users.controller.ts     # REST endpoints
       ├── users.service.ts        # Business logic
       ├── users.module.ts         # Module definition
       ├── entities/               # Database entities
       │   └── user.entity.ts
        └── dto/                    # Data transfer objects
           └── create-user.dto.ts
   ```

### Using Shared Components

1. **Database Operations**

   ```typescript
   import { BaseEntity, BaseService } from '@skills-base/shared';

   // Define entity
   export class User extends BaseEntity {
     email: string;
     password: string;
   }

   // Use base service
   export class UserService extends BaseService<User> {
     // Inherits CRUD operations
     async findByEmail(email: string) {
       return this.model.findOne({ email });
     }
   }
   ```

2. **API Endpoints**

   ```typescript
   import { BaseController } from '@skills-base/shared';

   @Controller('users')
   export class UserController extends BaseController<User> {
     // Inherits CRUD endpoints
     @Get('by-email/:email')
     findByEmail(@Param('email') email: string) {
       return this.service.findByEmail(email);
     }
   }
   ```

3. **Error Handling**

   ```typescript
   import { HttpException } from '@skills-base/shared';

   throw new HttpException('USER_NOT_FOUND', 404);
   ```

## Infrastructure Setup

### Local Development Infrastructure

1. **MongoDB**

   - Default URL: mongodb://localhost:27017
   - Separate database for each service
   - Access via MongoDB Compass

2. **RabbitMQ**

   - AMQP URL: amqp://localhost:5672
   - Management UI: http://localhost:15672
   - Default credentials: guest/guest
   - Key exchanges:
     ```
     skills.events - For service events
     skills.dlx    - Dead letter exchange
     ```

3. **n8n**
   - URL: http://localhost:5678
   - Used for workflow automation
   - Register new account on first use
   - Import workflows from n8n-workflows directory

### Docker Services

1. **Start Infrastructure**

   ```bash
   # Start all infrastructure services
   docker compose -f docker/compose.infra.yml up -d

   # Start specific service
   docker compose -f docker/compose.infra.yml up -d mongodb
   ```

2. **Check Status**

   ```bash
   # View all container status
   docker compose -f docker/compose.infra.yml ps

   # View logs
   docker compose -f docker/compose.infra.yml logs -f [service]
   ```

3. **Reset Data**

   ```bash
   # Remove containers and volumes
   docker compose -f docker/compose.infra.yml down -v

   # Restart fresh
   docker compose -f docker/compose.infra.yml up -d
   ```

## Best Practices

1. **Service Independence**

   - Keep services loosely coupled
   - Use shared DTOs for consistent data structures
   - Implement service-specific validation

2. **Database Design**

   - Each service manages its own database
   - Use MongoDB schemas from shared package
   - Follow naming conventions

3. **API Design**

   - RESTful endpoints
   - Consistent error responses
   - Proper status codes
   - API versioning when needed

4. **Event-Driven Patterns**

   - Use events for cross-service communication
   - Follow event naming conventions
   - Handle failed events properly

5. **Testing**
   - Unit tests for business logic
   - Integration tests for APIs
   - E2E tests for critical flows
   ```bash
   # Run different test types
   npm run test        # Unit tests
   npm run test:e2e    # E2E tests
   npm run test:cov    # Coverage report
   ```

## Code Conventions

1. **Git Commits**
   We use conventional commits. Your commits must follow this format:

   ```
   type(scope): subject

   Examples:
   feat(user-service): add email verification
   fix(skills-service): resolve skill assessment bug
   docs: update deployment guide
   ```

   Valid types: build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test
   Valid scopes: user-service, skills-service, learning-service, integration-service, email-service, event-processes-service, frontend, shared, deps

2. **Code Style**

   - We use ESLint and Prettier for code formatting
   - Husky enforces these on commit
   - Run manually:

     ```bash
     # Format code
     npm run format

     # Lint code
     npx lerna run lint
     ```

3. **TypeScript**
   - Strict mode enabled
   - Use interfaces for DTOs and entities
   - Leverage shared types from @skills-base/shared

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Lerna Documentation](https://lerna.js.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
