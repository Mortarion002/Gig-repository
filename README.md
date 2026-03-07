# Gig-Marketplace

A full-stack, distributed gig economy engine — similar to Uber or TaskRabbit — that instantly connects customers with nearby service providers using in-memory geo-spatial routing and bi-directional WebSockets. Built with a microservices-inspired architecture, it features a central backend, a web dashboard for customers, and a mobile app for on-the-go providers.

## 🌟 Key Features

- **Real-Time Geolocation Tracking:** Providers' locations are continuously updated and indexed using Redis for ultra-fast spatial querying.
- **Live Task Broadcasting:** When a new gig is posted, nearby providers receive instant push-style alerts via WebSockets — no polling required.
- **Interactive Maps:** Both the web and mobile apps feature interactive OpenStreetMap layers to visualize tasks, providers, and navigation routes.
- **Secure Authentication:** JWT-based user authentication and authorization across all clients.

## 🏗️ Architecture & Tech Stack

This project is built using a micro-service-oriented approach with three distinct clients communicating through a central Node.js API.

### 1. Next.js Web Client — Customer (`/web-client`)

Where users authenticate, manage their dashboard, and broadcast new gigs to the network.

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4
- **Maps:** React-Leaflet
- **Real-Time:** Socket.io-client

### 2. React Native Mobile App — Provider (`/mobile-client`)

A field-app that continuously tracks the provider's GPS coordinates and listens for incoming job alerts.

- **Framework:** React Native / Expo
- **Location:** Expo Location (background/foreground tracking)
- **Maps:** React Native WebView (rendering dynamic Leaflet maps)
- **Real-Time:** Socket.io-client

### 3. Express/Node.js Backend — Central Brain (`/backend`)

The central engine managing the relational database, caching layer, and all WebSocket connections.

- **Platform:** Node.js & Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **In-Memory Store:** Redis (for high-speed geospatial indexing & socket session management)
- **Real-Time:** Socket.io

## ⚙️ The Core Loop — How It Works

```
Provider's Phone          Backend                  Customer's Browser
──────────────────        ───────────────────────  ──────────────────
GPS ping every 10s ──▶  Update lat/lng in Redis
                                                   Post new gig ──▶  Save to PostgreSQL
                          GeoSearch Redis ◀──────────────────────────(find nearby providers)
Receive alert ◀──────── Socket.io event fired
Accept gig ──────────▶  Lock task to provider ID in PostgreSQL
Render route on map ◀── Confirmation response
```

1. **Geo-Tracking:** As mobile providers move, their physical device silently pings the backend, updating their exact latitude/longitude in Redis.
2. **Task Broadcast:** A customer creates a task on the Next.js web client. The backend saves the immutable record to PostgreSQL via Prisma.
3. **In-Memory Geo-Search:** The backend queries Redis using spatial math to find all active providers within a configured radius of the newly created task.
4. **Event-Driven Alerts:** Instead of standard HTTP polling, the backend fires a targeted Socket.io event directly to nearby providers' phones, triggering a native push-style alert instantly.
5. **Acceptance & Navigation:** The provider accepts the gig. The backend atomically locks the task to their User ID, and the mobile app renders a dynamic OpenStreetMap showing the exact route to the job.

## 📁 Folder Structure

```text
gig-marketplace/
├── backend/                # Node.js & Express server
│   ├── prisma/             # Database schema and migrations
│   └── src/                # Backend source code
│       ├── controllers/    # API route handlers
│       ├── middleware/     # Custom middleware (auth, etc.)
│       ├── routes/         # Express route definitions
│       └── services/       # Core business logic (Redis, Socket.io)
├── mobile-client/          # React Native (Expo) app
│   └── src/                # Mobile source code
│       ├── api/            # API communication clients
│       ├── context/        # React context providers
│       ├── hooks/          # Custom React hooks
│       ├── screens/        # App screens and views
│       ├── services/       # External service integrations
│       └── types/          # TypeScript interface definitions
└── web-client/             # Next.js web application
    └── src/                # Web source code
        ├── app/            # Next.js App Router pages
        ├── components/     # Reusable React components
        └── lib/            # Utility functions and shared logic
```

## 🚀 Getting Started

Follow these instructions to get the complete system running locally.

### Prerequisites

- Node.js (v18 or higher)
- Docker & Docker Compose (for running PostgreSQL and Redis)
- Expo CLI (for running the mobile app)
- Android Studio / Emulator or a physical device connected via USB

### 1. Start the Backend Infrastructure

```bash
cd backend
docker-compose up -d           # Start PostgreSQL and Redis
npm install
npx prisma migrate dev         # Run database migrations
npm run dev                    # Start the backend server
```

### 2. Start the Web Client

```bash
cd web-client
npm install
npm run dev
```
The web app will be available at `http://localhost:3000`.

### 3. Start the Mobile Client

```bash
cd mobile-client
npm install
```

If testing on a **physical Android device**, bridge the connection so it can reach the local backend:
```bash
adb reverse tcp:4000 tcp:4000
```

Then start Expo:
```bash
npx expo start -c
```
Press `a` in the terminal to open the app on your Android emulator or connected device.

> **Physical device on a shared network?** Update the API base URL in `mobile-client/src/api/client.ts` and the socket URL in `mobile-client/src/services/socket.ts` to your machine's local IPv4 address (e.g., `http://192.168.x.x:4000`). Both devices must be on the same network.

## 🗺️ Mapping Strategy (Zero-Cost Setup)

To keep the application completely free of external API billing (no Google Maps SDK limits), both the Next.js Web Client and the React Native Mobile App use OpenStreetMap tile layers. The mobile app injects a dynamic HTML string into a native WebView, rendering a fully interactive Leaflet map that matches the exact UI experience of the web dashboard.

## 📄 License

This project is open-source and available under the MIT License.