# Trending Analysis Dashboard 🔥

A beautiful, interactive React dashboard for visualizing Reddit trending topics with AI-powered sentiment analysis.

## Features

- **Real-time Trending Topics**: Discover what's hot on Reddit across 7 categories
- **Smart Caching**: Instant category switching - no refetching when revisiting categories 📦
- **Sentiment Analysis**: Visualize positive, negative, and neutral sentiment for each topic
- **AI Component Analysis**: Optional deep-dive into sentiment by components (camera, battery, price, etc.)
- **Interactive UI**: Beautiful cards, progress bars, and responsive design
- **Category Filtering**: Technology, Gaming, News, Entertainment, Sports, Science, All
- **Sample Posts**: View top Reddit posts for each trending topic
- **Subreddit Badges**: See where topics are trending
- **Trending Metrics**: Post count, score, comments, velocity, and trending strength
- **Force Refresh**: Update data on demand with refresh button
- **Clear Cache**: Remove cached data when needed

## Quick Start

### Prerequisites
- Node.js & npm installed
- Backend API running on `http://localhost:8000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# http://localhost:5173/trending
```

### Backend Setup

Make sure the backend is running:

```bash
cd ../backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Complete setup guide with troubleshooting
- **[TRENDING_FRONTEND.md](./TRENDING_FRONTEND.md)** - Detailed feature documentation
- **[CACHING_SYSTEM.md](./CACHING_SYSTEM.md)** - How the smart caching system works

## Routes

- `/` - Home page with feature cards
- `/trending` - Trending Analysis Dashboard (main feature)
- `/main` - Main page
- `/test` - Test page

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Lucide React** - Icons
- **React Router** - Routing
- **Tanstack Query** - Data fetching (ready for use)

## Recent Updates

### ✅ Smart Caching System Implemented
- **Per-category caching**: Data cached separately for each category
- **Instant switching**: Revisiting categories is instant (no refetch)
- **Force refresh**: Refresh button to get latest data
- **Clear cache**: Button to remove all cached data
- **Visual indicators**: Badge shows when viewing cached data
- **Console logging**: Track cache hits/misses in DevTools

### ✅ Infinite Refetch Loop Fixed
The component was fetching data repeatedly. Fixed by:
- Removing `selectedCategory` from initial `useEffect` dependencies
- Adding separate `useEffect` to watch category changes
- Implementing cache-first fetch strategy
- Adding loading state check to prevent simultaneous requests

## Project info

**URL**: https://lovable.dev/projects/ed4549f5-e65a-46c1-b9b3-36c5000c9f18

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ed4549f5-e65a-46c1-b9b3-36c5000c9f18) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ed4549f5-e65a-46c1-b9b3-36c5000c9f18) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
