# Sigalit Scheduling Management System

## Project Overview

This is a comprehensive scheduling management system for Israeli organizations. It is a Next.js application with a tRPC backend, Prisma for the database, and NextAuth.js for authentication. The system supports Hebrew RTL, the Israeli calendar (Friday-Saturday weekend), and role-based access control with multi-house support.

### Main Technologies

*   **Frontend**: Next.js 15.2.3, React 19, TypeScript 5.8.2, Tailwind CSS 4.0.15
*   **Backend**: tRPC 11.0.0, Prisma 6.5.0
*   **Database**: PostgreSQL
*   **Authentication**: NextAuth.js 5.0.0-beta.25
*   **Testing**: Playwright for end-to-end testing

## Building and Running

### Prerequisites

*   Node.js 18+
*   PostgreSQL 12+
*   npm

### Installation

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Set up the environment variables by creating a `.env` file. You can use `.env.example` as a template.
3.  Set up the database:
    ```bash
    npx prisma db push
    ```
4.  Seed the database with initial data:
    ```bash
    npm run db:seed
    ```

### Running the application

*   To run the development server:
    ```bash
    npm run dev
    ```
*   To build the application for production:
    ```bash
    npm run build
    ```
*   To start the production server:
    ```bash
    npm run start
    ```

### Testing

*   To run the linter:
    ```bash
    npm run lint
    ```
*   To run the type checker:
    ```bash
    npm run typecheck
    ```
*   To run the prettier check:
    ```bash
    npm run format:check
    ```
*   To run Playwright tests:
    ```bash
    npx playwright test
    ```

## Development Conventions

*   The project uses the App Router from Next.js.
*   The backend API is built with tRPC.
*   The database is managed with Prisma.
*   Authentication is handled by NextAuth.js.
*   Styling is done with Tailwind CSS.
*   The project follows the T3 Stack architecture.
*   The code is written in TypeScript.
*   The project uses ESLint and Prettier for code quality and formatting.
*   Husky is used for pre-commit hooks.
