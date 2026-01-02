# Agent Rules and Guidelines

This file contains persistent rules and guidelines for AI agents working on this project.

## Workflow Rules
1.  **Feature Development**:
    -   **Design & Plan**: Before writing any code for a new feature, you MUST create a **Design Proposal** and **Implementation Plan**.
    -   **Sign-off**: This plan must be presented to the user and explicitly **signed off** (approved) before proceeding to the implementation phase.
    -   **Artifact**: Use the `implementation_plan` artifact type for this purpose.

## File Management Rules
1.  **Temporary Files**: ALWAYS use the `/tmp/` directory for any temporary files, logs, or test outputs that are not meant to be committed to version control.
    -   The `/tmp/` directory is ignored by git.
    -   Do not create random temp files in the root or source directories.

## Code Style Guidelines
1.  **Formatting**: Follow the existing project configuration (ESLint, Prettier).

## Git Workflow
1.  **Commit Messages**: Use conventional commits (feat, fix, chore, etc.).

## Pre-commit Checks
Before pushing any changes to git, you MUST ensure the following checks pass:
1.  **Linting**: Run `npm run lint` (or equivalent) to ensure no linting errors.
2.  **Type Checking**: Check for TypeScript errors.
3.  **Build**: Run `npm run build` to verify the project builds successfully.
4.  **Tests**: Run relevant tests (e.g., unit tests or playwright tests) to ensure no regressions.
5.  **Clean State**: Ensure no temporary files (like logs) are included in the commit.

## Safe Refactoring
1.  **Context Check**: When using `replace_file_content`, ALWAYS verify the context. Ensure you are not accidentally overwriting variable declarations or imports.
2.  **Read After Write**: Read the file content *after* the edit if the change was complex.

## Deployment Constraints
1.  **Lean Images**: Production Docker images must be lean. Do not rely on `devDependencies` (like `tsx`, `eslint`) in the production container.
