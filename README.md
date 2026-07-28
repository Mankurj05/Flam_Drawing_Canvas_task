# Collaborative Canvas

A production-quality Real-Time Collaborative Drawing Canvas built with React 19, Vite, TypeScript, Zustand, and Socket.IO.

This project is designed to be highly scalable, performant, and interview-ready, similar to Figma Whiteboard, Excalidraw, or Miro.

## 🚀 Features
- **Real-time Collaboration:** Multiple users can draw simultaneously in a synchronized workspace.
- **Vector-based Drawing:** Pencil, Rectangle, Circle, Ellipse, Line, Arrow, Text.
- **Selection System:** Move, resize, rotate, duplicate, bring forward, send backward, and delete.
- **Undo / Redo:** Complete robust history stack for all drawing and transform operations.
- **Export & Import:** Save boards to JSON files or export them as PNG images.
- **Performance Optimized:** Dirty rectangle rendering strategies, canvas batched draws, and throttled socket emissions to maintain 60 FPS.
- **Responsive & Accessible:** Polished UI with framer-motion, fully accessible toolbars, keyboard shortcuts, and theme support.

## 🏗 Architecture
The application separates state from rendering to guarantee performance:

1. **Canvas Engine** (`CanvasEngine.ts`):
   - A pure decoupled rendering engine using the HTML5 `<canvas>` API.
   - Responsible strictly for rendering shapes based on the current state.
   - Doesn't trigger React renders, eliminating performance bottlenecks.

2. **State Management** (Zustand Stores):
   - `canvasStore`: Holds the local and synced objects, selection state, and viewport matrix.
   - `historyStore`: Manages undo/redo stacks.
   - `socketStore`: Holds connection status, room ID, and cursor positions.
   - `toolStore`: Manages the currently selected drawing tool and styles.

3. **Networking** (Socket.IO):
   - Event-driven architecture utilizing rooms.
   - Uses `lodash.throttle` equivalent to debounce high-frequency events like cursor movements.

## 📦 Deployment Instructions

### Frontend Deployment (Vercel)
1. Push the code to GitHub.
2. Import the project in Vercel.
3. Vercel will automatically detect the Vite preset.
4. Go to **Environment Variables** in Vercel and add:
   - `VITE_SOCKET_URL` = `<YOUR_RENDER_BACKEND_URL>`
5. Deploy.

### Backend Deployment (Render)
1. Push the code to GitHub.
2. In Render, create a new **Web Service**.
3. Set the Root Directory to `server`.
4. Build Command: `npm install && npm run build`
5. Start Command: `npm start` (or `node dist/index.js`).
6. Go to **Environment Variables** in Render and add:
   - `CLIENT_URL` = `<YOUR_VERCEL_FRONTEND_URL>`
7. Deploy.

## 🛠 Available Scripts
- `npm run dev`: Starts the frontend Vite server.
- `npm run server`: Starts the backend Socket.IO server.
- `npm run dev:all`: Concurrently runs both frontend and backend for local development.

## ⚖️ Trade-offs & Future Improvements
- **Canvas vs SVG:** Canvas was chosen over SVG because it scales better with thousands of overlapping vector objects. SVGs inject nodes directly into the DOM which significantly degrades performance for drawing applications.
- **WebSockets vs WebRTC:** WebSockets (via Socket.IO) were chosen to establish a central authoritative server to manage joining, state synchronization, and rooms easily. WebRTC could be explored for peer-to-peer cursor tracking to reduce server load in massive rooms.
- **Y.js / CRDTs:** For a real-world enterprise app, using a CRDT library like Y.js would resolve conflict resolution more gracefully than the current "last write wins" simple state sync algorithm.
