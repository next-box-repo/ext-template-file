# NextBox Extension React Template

Welcome to the NextBox Extension React Template! This boilerplate project is specifically designed for creating extensions for the NextBox platform. It combines the power of Vite, React, TypeScript, SWC, and NextBox APIs to give you a robust starting point for your extension development.

Explore more extensions and tools in the [NextBox Extensions Library](https://next-box.ru/extensions) to see what's possible with the platform.

## Table of Contents

- [About](#about)
- [Installation](#installation)
- [Development](#development)
- [Building](#building)

## About

This template provides a modern development environment for building NextBox extensions using:

- **React 18** - Modern UI library with hooks and concurrent features
- **TypeScript** - Type-safe development experience
- **Vite** - Fast build tool and development server
- **SWC** - Super-fast TypeScript/JavaScript compiler
- **NextBox APIs** - Integration with NextBox platform capabilities

## Installation

To get started with this extension template, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/next-box-repo/ext-template-file.git
   cd ext-template-file
   ```

2. **Install dependencies:**

   You can use either npm or Bun to install the required packages. Choose the one you prefer:

   - With **npm**:

     ```bash
     npm i
     ```

   - With **Bun**:
     ```bash
     bun i
     ```

## Development

Once dependencies are installed, you can start the development server:

- With **npm**:

  ```bash
  npm run dev
  ```

- With **Bun**:
  ```bash
  bun run dev
  ```

This command starts a local development server. Open your browser and navigate to the URL provided in the terminal (usually [http://localhost:5173](http://localhost:5173)) to see your app running.

## Building

When you are ready to build the project for production, run:

- With **npm**:

  ```bash
  npm run build
  ```

- With **Bun**:
  ```bash
  bun run build
  ```

This command will create a production-ready build of your project in the `/dist` directory.
