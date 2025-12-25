# Book CRUD

A simple Angular application for basic CRUD operations on books with title and author only.

## Features

- ➕ **Create**: Add new books with title and author
- 📖 **Read**: View all books in a clean list
- ✏️ **Update**: Edit existing book titles and authors
- 🗑️ **Delete**: Remove books with confirmation

## Tech Stack

- **Frontend**: Angular 21 with standalone components
- **Forms**: Reactive Forms with validation
- **Backend**: JSON Server (fake REST API)
- **Routing**: Angular Router
- **HTTP**: Angular HttpClient

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the JSON Server (Backend):**
   ```bash
   npm run server
   ```
   This will start the fake REST API on `http://localhost:3000`

3. **Start the Angular app (Frontend):**
   ```bash
   npm start
   ```
   Open your browser and navigate to `http://localhost:4200`

### API Endpoints

The JSON Server provides the following REST endpoints:
- `GET /books` - Get all books
- `GET /books/:id` - Get a specific book
- `POST /books` - Create a new book
- `PUT /books/:id` - Update a book
- `DELETE /books/:id` - Delete a book

## Book Model

Each book contains only:
- `title` (string, required)
- `author` (string, required)

## Development

### Code Scaffolding

Generate new components:
```bash
ng generate component component-name
```

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

## Project Structure

```
src/
├── app/
│   ├── models/
│   │   └── book.ts
│   ├── services/
│   │   └── book.service.ts
│   ├── book-list/
│   ├── book-create/
│   ├── book-edit/
│   ├── app.routes.ts
│   ├── app.config.ts
│   ├── app.ts
│   ├── app.html
│   └── app.css
├── db.json
└── ...
```
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
