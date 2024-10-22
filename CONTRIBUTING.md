# Contributing to Skills-base Management Platform

Thank you for contributing to Skills-base Management Platform. This guide outlines the process for contributing to this internal project and helps maintain consistency across our codebase.

## How to Contribute

### Reporting Issues

If you encounter a bug or have a suggestion for improvement:

1. Check the project's issue tracker to see if it's already been reported.
2. If not, create a new issue, providing as much detail as possible:
   - Clear, descriptive title
   - Detailed description of the issue or suggestion
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Screenshots if applicable
   - Your environment (OS, browser version, etc.)

### Suggesting Enhancements

We welcome suggestions for enhancements. Please create an issue in our project management tool (e.g., JIRA) with the following:

- Clear, descriptive title prefixed with [ENHANCEMENT]
- Detailed description of the proposed enhancement
- Any potential benefits and drawbacks
- If possible, a rough implementation plan

### Making Changes

1. Ensure you have the latest version of the code.
2. Create a new branch from `develop` following our naming convention.
3. Make your changes, adhering to our coding standards.
4. Write or update tests as needed.
5. Update documentation to reflect your changes.
6. Commit your changes using our commit message format.
7. Push your branch and submit a pull request to `develop`.

## Git Workflow and Standards

### Branch Structure

- Main branch: `main` (protected)
- Development branch: `develop`
- Feature branches: `feature/JIRA-123-short-description`
- Bugfix branches: `bugfix/JIRA-456-short-description`
- Hotfix branches: `hotfix/JIRA-789-short-description`

### Workflow

1. Create feature branch from `develop`
2. Work on feature and commit changes
3. Push feature branch to remote
4. Create pull request to merge into `develop`
5. After review and approval, merge into `develop`
6. Periodically, create release branch from `develop`
7. After testing, merge release branch into `main` and `develop`

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>

#For example,

feat(user-service): implement multi-factor authentication

Adds support for multi-factor authentication using SMS and email.
This change improves account security by requiring a second form
of verification during login.

- Implement SMS verification service
- Add email verification option
- Update user settings to manage MFA preferences
- Modify login flow to accommodate MFA steps

Breaking changes:
- Login API now returns a 202 status with a token for MFA verification

Closes JIRA-789
```

#### Types

- feat: A new feature
- fix: A bug fix
- docs: Documentation only changes
- style: Changes that do not affect the meaning of the code
- refactor: A code change that neither fixes a bug nor adds a feature
- perf: A code change that improves performance
- test: Adding missing tests or correcting existing tests
- chore: Changes to the build process or auxiliary tools and libraries

#### Scope

Optional, can be anything specifying the place of the commit change

#### Subject

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No dot (.) at the end

#### Body

- Just as in the subject, use the imperative, present tense
- Include motivation for the change and contrasts with previous behavior

#### Footer

- Mention BREAKING CHANGES if any
- Reference JIRA issues that this commit addresses

### Git Commands Cheat Sheet

- Create a new branch: `git checkout -b branch-name`
- Switch to a branch: `git checkout branch-name`
- Stage changes: `git add .`
- Commit changes: `git commit -m "type: subject"`
- Push to remote: `git push origin branch-name`
- Pull latest changes: `git pull origin branch-name`
- Merge branch: `git merge branch-name`
- View commit history: `git log --oneline`
- Get changes from another branch: `git checkout your-branch && git merge origin/other-branch`

## Code Review Process

1. Create a pull request in our version control system (e.g., GitHub, GitLab).
2. Assign relevant team members as reviewers.
3. Reviewers will use the following checklist:
   - [ ] Branch name follows convention
   - [ ] Commit messages are clear and follow format
   - [ ] Code follows our style guide
   - [ ] Tests are included and passing
   - [ ] Documentation is updated if necessary
   - [ ] No unnecessary commented-out code
   - [ ] No debug prints or console.logs left in production code
   - [ ] Code is efficient and follows our best practices
   - [ ] Security best practices are followed
4. Address any comments or requested changes.
5. Once approved, the pull request can be merged.

## Coding Standards

- Follow our company's style guide for all code contributions.
- Write clear, self-documenting code with appropriate comments where necessary.
- Ensure all new code is covered by unit tests.
- Maintain backwards compatibility unless explicitly planned otherwise.

## Documentation

- Update relevant documentation with any code changes.
- Use clear, concise language in all documentation.
- Include code examples where appropriate.

## Continuous Integration

- All pull requests will trigger our CI pipeline.
- Ensure all tests pass and there are no linting errors before requesting a review.

## Questions?

If you have any questions about contributing, please reach out to [Team Lead's Name] or [Project Manager's Name].

Thank you for your contributions to Skills-base Management Platform!
