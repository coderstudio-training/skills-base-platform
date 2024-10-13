# Skills Base Platform

## Overview

Skills Base is an enterprise-grade platform for managing skills, learning paths, and user progress in organizations. It's built on a microservices architecture using NestJS for backend services and Next.js for the frontend, all managed within a Lerna monorepo using npm workspaces.

## Project Structure

```
skills-base-platform/
├── packages/
│   ├── user-service/
│   ├── skills-service/
│   ├── learning-service/
│   ├── integration-service/
│   ├── email-service/
│   ├── event-processes-service/
│   ├── frontend/
│   └── shared/
├── n8n-workflows/
├── kubernetes/
├── docker/
├── scripts/
├── docs/
├── .github/
├── package.json
├── lerna.json
├── tsconfig.json
└── README.md
```

## Prerequisites

- Node.js (v20 LTS or later)
- npm (v9 or later)
- Rancher Desktop (recommended) or Docker Desktop
- Kubernetes CLI (kubectl)

## Local Development Setup

1. Clone the repository:

   ```bash
   git clone https://gitlab.com/your-org/skills-base-platform.git
   cd skills-base
   ```

2. Install dependencies and build packages:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file with your local configuration.

4. Start infrastructure services:

   ```bash
   docker compose -f docker/compose.infra.yml up -d
   ```

   > Note: See Local Infra Setup below for more details

5. Start all services in development mode:
   ```bash
   npx lerna run start:dev --stream --parallel
   ```

## Local Infrastructure Setup

The Skills Base platform relies on several infrastructure services that can be easily set up using Docker Compose. These services include MongoDB, RabbitMQ, and n8n.

### Starting Infrastructure Services

1. Ensure Docker and Docker Compose are installed on your system.

2. From the root of the project, run:

   ```bash
   docker compose -f docker/compose.infra.yml up -d
   ```

   This command starts the following services:

   - MongoDB (version 4.4) on port 27017
   - RabbitMQ (version 3 with management plugin) on ports 5672 and 15672
   - n8n on port 5678

3. Verify that all services are running:
   ```bash
   docker compose -f docker/compose.infra.yml ps
   ```

### Accessing Services

- **MongoDB**: Connect to MongoDB using a client of your choice at `mongodb://localhost:27017`
- **RabbitMQ**:
  - AMQP port: 5672
  - Management UI: http://localhost:15672 (default credentials: guest/guest)
- **n8n**:
  - Access the n8n dashboard at http://localhost:5678
  - Login credentials:
    - Username: admin
    - Password: password

### Data Persistence

The configuration uses Docker volumes to persist data:

- `mongodb_data`: Stores MongoDB data
- `n8n_data`: Stores n8n workflows and data

### Stopping Infrastructure Services

To stop all infrastructure services:

```bash
docker compose -f docker/compose.infra.yml down
```

To stop services and remove volumes (this will delete all data):

```bash
docker compose -f docker/compose.infra.yml down -v
```

### Troubleshooting

1. If you encounter port conflicts, ensure no other services are using ports 27017, 5672, 15672, or 5678.

2. If services fail to start, check Docker logs:

   ```bash
   docker compose -f docker/compose.infra.yml logs
   ```

3. For n8n connection issues, verify the correct credentials are being used (admin/password).

Remember to update your application's `.env` files to point to these local services:

- MongoDB connection string: `mongodb://localhost:27017/your_database_name`
- RabbitMQ connection: `amqp://localhost:5672`
- n8n base URL: `http://localhost:5678`

## Development Workflow

### Setting up environment variables

Before working on any service, ensure its environment variables are properly set:

1. Navigate to the service directory:

   ```bash
   cd packages/<service-name>
   ```

2. Copy the example environment file if you haven't already:

   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file with appropriate values for your local development environment.

4. Common variables to set for local development:
   ```
   MONGODB_URI=mongodb://localhost:27017/<service_database_name>
   RABBITMQ_URL=amqp://localhost:5672
   N8N_BASE_URL=http://localhost:5678
   ```

### Working on a specific service

1. Ensure environment variables are set up as described above.

2. Start a specific service in watch mode:

   ```bash
   npx lerna run start:dev --scope=@skills-base/<service-name> --stream
   ```

   For example, to start the user service:

   ```bash
   npx lerna run start:dev --scope=@skills-base/user-service --stream
   ```

3. Make changes to the code. The service will automatically restart when files are modified.

### Working on the shared package

1. Make changes in the `packages/shared` directory.

2. Rebuild the shared package:

   ```bash
   npx lerna run build --scope=@skills-base/shared
   ```

3. Rebuild and restart the services that depend on the shared package:
   ```bash
   npx lerna run build --scope=@skills-base/* --include-dependencies
   npx lerna run start:dev --scope=@skills-base/<dependent-service> --stream
   ```

### Updating environment variables

If you need to update environment variables for a service:

1. Edit the `.env` file in the specific service directory.
2. Restart the service for the changes to take effect:
   ```bash
   npx lerna run start:dev --scope=@skills-base/<service-name> --stream
   ```

Remember to never commit `.env` files to version control.

### Running tests

- Run tests for a specific service:

  ```bash
  npx lerna run test --scope=@skills-base/<service-name>
  ```

- Run tests for all services:
  ```bash
  npx lerna run test
  ```

### Code Quality and Commits

We use Husky at the root level to enforce code quality and consistent commit messages across all services:

1. Husky automatically runs linting and formatting checks on staged files before each commit.

2. To manually run linting across all packages:

   ```bash
   npx lerna run lint
   ```

3. To manually run formatting across all packages:

   ```bash
   npx lerna run format
   ```

4. Commit messages must follow the Conventional Commits specification. Examples:

   ```
   feat(user-service): add email verification
   fix(skills-service): resolve skill assessment bug
   docs: update deployment instructions in root README
   ```

5. If your commit fails due to linting or formatting issues:
   - Review the error messages
   - Fix the issues in the relevant files
   - Stage the fixed files (`git add .`)
   - Try committing again

Remember:

- Husky checks apply to all services and packages in the monorepo.
- Always run tests before pushing your changes.
- Keep your branches up to date with the main branch to avoid conflicts.

### Cleaning the project

To remove all node_modules folders:

```bash
npx lerna clean -y
```

## Database Migrations

To run database migrations for a specific service:

```bash
npx lerna run migrate --scope=@skills-base/<service-name>
```

Note: Ensure that the service has a `migrate` script defined in its package.json.

## Using n8n for Workflows

1. Start n8n locally:

   ```bash
   npx lerna run start:n8n --scope=@skills-base/integration-service --stream
   ```

2. Access n8n at `http://localhost:5678`

3. Import workflows from the `n8n-workflows/` directory.

## API Documentation

Generate and view API documentation:

1. Generate OpenAPI specs:

   ```bash
   npx lerna run doc:gen
   ```

2. View the generated documentation at `http://localhost:<service-port>/api-docs`

## Troubleshooting

1. If you encounter module resolution issues:

   - Ensure all packages are built: `npx lerna run build`
   - Check that `tsconfig.json` in each package has the correct paths configuration
   - Try cleaning and reinstalling dependencies:
     ```bash
     npx lerna clean -y
     npm install
     ```

2. If services can't connect to MongoDB or RabbitMQ:

   - Verify that the infrastructure services are running: `docker compose -f docker/compose.infra.yml ps`
   - Check the `.env` file for correct connection strings

3. For port conflicts:

   - Update the port in the service's `.env` file
   - Restart the service

4. If changes in the shared package are not reflected:
   - Rebuild the shared package and its dependents:
     ```bash
     npx lerna run build --scope=@skills-base/shared --include-dependencies
     ```
   - Restart the dependent services

## Contributing

1. Create a new branch for your feature or bug fix:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and add tests if applicable.

3. Run tests and linting:

   ```bash
   npx lerna run test
   npx lerna run lint
   ```

4. Commit your changes using conventional commits:

   ```bash
   git commit -m "feat(service-name): add new feature"
   ```

5. Push your branch and create a merge request on GitLab.

## Additional Resources

- [npm Workspaces documentation](https://docs.npmjs.com/cli/v9/using-npm/workspaces)
- [Lerna documentation](https://lerna.js.org/)
- [NestJS documentation](https://docs.nestjs.com/)
- [Next.js documentation](https://nextjs.org/docs)
- [Docker documentation](https://docs.docker.com/)
- [Kubernetes documentation](https://kubernetes.io/docs/)
- [n8n documentation](https://docs.n8n.io/)

For any questions or issues, please contact the platform team
