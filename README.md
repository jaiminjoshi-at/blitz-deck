# BlitzDeck

BlitzDeck is a modern, interactive learning platform built with Next.js and React. Designed for versatility, it supports quizzes and learning packs for any topic—from languages to technical skills.

## 🚀 Tech Stack

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **UI Library**: [Material UI (MUI) v7](https://mui.com/)
-   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
-   **Testing**: [Playwright](https://playwright.dev/)
-   **Language**: TypeScript

## ✨ Features

-   **Universal Content Support**: Create learning packs for any subject using a simple JSON structure.
-   **Dynamic Content Engine**: Seamlessly loads courses, pathways, and lessons.
-   **Interactive Quizzes**: Engaging quiz interface to test knowledge retention.
-   **Responsive Design**: Mobile-optimized UI/UX for tablets and phones.
-   **Docker Ready**: Tailored for easy deployment (including NAS support).

## 🛠️ Getting Started

### Prerequisites

-   Node.js 20+
-   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd blitz-deck
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📦 Content Management

The application loads content recursively from `src/content/packs`.

**Structure:**
1.  **Packs**: Top-level folders (e.g., `german-basics`).
2.  **Pathways**: Sub-folders (e.g., `intro-german`).
3.  **Units**: Sub-folders (e.g., `unit-1`).
4.  **Lessons**: JSON files (e.g., `lesson-1.json`).

**Important**:
Ordering and visibility are strictly controlled by `metadata.json` files at each folder level. You must refer to your child folders/files in this metadata file for them to appear in the app.

## 🐳 Deployment

### Docker

To run the application using Docker Compose:

```bash
docker-compose up -d --build
```

### NAS Deployment
For specific instructions on deploying to a NAS (e.g., Synology), please refer to [deploy_nas.md](./deploy_nas.md).

## 🧪 Testing

Run End-to-End tests with Playwright:

```bash
npm run test:e2e
```

## 📜 License

This project is licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE).

