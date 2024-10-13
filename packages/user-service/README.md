# User Service

## Overview

The User Service is part of the Skills Base platform, responsible for managing user accounts and authentication. It utilizes the `@skills-base/shared` package for common functionalities and is managed within a Lerna monorepo using npm workspaces.

## Setup

1. Clone the repository:

   ```
   git clone https://github.com/your-org/skills-base.git
   cd skills-base
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Build all packages:
   ```
   npm run build
   ```

## Using @skills-base/shared

The `@skills-base/shared` package contains common utilities and base classes used across all services.

1. Importing shared components:

   ```typescript
   import {
     BaseController,
     BaseService,
     DatabaseModule,
   } from '@skills-base/shared';
   ```

2. Extending base classes:

   ```typescript
   export class UsersController extends BaseController<User> {
     // ...
   }

   export class UsersService extends BaseService<User> {
     // ...
   }
   ```

3. Using shared modules:

   ```typescript
   @Module({
     imports: [DatabaseModule],
     // ...
   })
   export class AppModule {}
   ```

4. Ensure your `tsconfig.json` includes the path to the shared package:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@skills-base/shared": ["../shared/src"]
       }
     }
   }
   ```

## Running Services with Lerna and npm Workspaces

Lerna (v8.x) is used in conjunction with npm workspaces to manage the monorepo and run commands across all or specific packages.

1. Run a command in all services:

   ```
   npx lerna run <command>
   ```

   Example: `npx lerna run start:dev`

2. Run a command in a specific service:

   ```
   npm run start:dev -w @skills-base/user-service
   ```

3. Start all services in development mode:
   ```
   npx lerna run start:dev
   ```

## Development Workflow

1. Make changes in the user-service or shared package.

2. Rebuild the affected packages:

   ```
   npm run build
   ```

3. Start the user-service:

   ```
   npm run start:dev -w @skills-base/user-service
   ```

4. To update dependencies after changes in the shared package:
   ```
   npm install
   ```

## Testing

Run tests for the user-service:

```
npm test -w @skills-base/user-service
```

Run tests for all services:

```
npx lerna run test
```

## Troubleshooting

1. Module not found errors:

   - Ensure all packages are built: `npm run build`
   - Check that `tsconfig.json` has the correct paths configuration
   - Try cleaning the project: `npm clean-install`

2. Dependency version conflicts:

   - Update all packages: `npm install`
   - Check for conflicting versions in `package.json` files

3. Changes in shared package not reflected:

   - Rebuild the shared package: `npm run build -w @skills-base/shared`
   - Rebuild the user-service: `npm run build -w @skills-base/user-service`

4. Lerna command not found:
   - Ensure Lerna is installed as a dev dependency in the root `package.json`
   - Use npx: `npx lerna <command>`

## Contributing

1. Create a new branch for your feature or bug fix.
2. Make your changes and add tests if applicable.
3. Run tests to ensure all passes.
4. Submit a pull request with a clear description of your changes.

## Additional Resources

- [Lerna documentation](https://lerna.js.org/)
- [npm Workspaces documentation](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [NestJS documentation](https://docs.nestjs.com/)
- [MongoDB documentation](https://docs.mongodb.com/)

For any questions or issues, please contact the platform team.
