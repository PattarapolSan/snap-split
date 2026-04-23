# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SnapSplit is a no-login bill-splitting web app. Users create rooms, upload receipt images (analyzed by Claude AI), and split bills among participants in real-time via WebSockets.

## Commands

### Development
```bash
npm run dev              # Start both client (port 5173) and server (port 3001)
npm run dev:no-db        # Start without Supabase (uses in-memory storage)
```

### Build
```bash
npm run build            # build:shared → test → build:client → build:server
npm start                # Start production server (serves static client build)
```

### Testing
```bash
npm test                 # Run all workspace tests
npm test --workspace=client   # Vitest (client only)
npm test --workspace=server   # Jest (server only)
npm run test:coverage --workspace=client
npm run test:coverage --workspace=server
```

## Architecture

### Monorepo Structure
- **`/client`** — React 19 + Vite + TypeScript frontend
- **`/server`** — Express + Socket.io + TypeScript backend
- **`/shared`** — Shared TypeScript interfaces (Room, Item, Participant, Assignment)

The `shared` package must be built before client/server when types change: `npm run build:shared`.

### Backend (`/server/src/`)
- **`index.ts`** — Express + HTTP server + Socket.io setup; emits WebSocket events after every HTTP mutation
- **`routes/rooms.ts`** — Room CRUD, items, assignments, and all room-related endpoints
- **`routes/receipts.ts`** — Receipt image upload + Claude AI analysis (`POST /api/rooms/:code/analyze`)
- **`services/RoomService.ts`** — All business logic; called by routes
- **`services/ReceiptService.ts`** — Claude vision API integration (claude-sonnet-4-5); extracts items, tax, service charge from receipt images
- **`db/index.ts`** — Repository factory: returns `SupabaseRepository` or `MemoryRepository` based on env vars

### Repository Pattern
Two implementations share an abstract `Repository` interface:
- `SupabaseRepository` — Production (requires `SUPABASE_URL` + `SUPABASE_KEY`)
- `MemoryRepository` — In-memory fallback; enabled via `SKIP_DB=true` or missing Supabase credentials

### Frontend (`/client/src/`)
- **`store/roomStore.ts`** — Single Zustand store for all room state (room, items, participants, assignments, currentUser, onlineParticipants); computes splits automatically on state change
- **`lib/api.ts`** — Typed fetch wrappers for all API endpoints
- **`lib/splitCalculator.ts`** — Split calculation logic: per-participant subtotal → service charge → tax
- **`lib/localStorage.ts`** — Persists user identity per room (`snap-split-user-${code}`) and tracks last 10 visited rooms
- **`pages/Room.tsx`** — Main room workspace; connects Socket.io, listens for all real-time events

### Real-time Sync
Socket.io events flow: HTTP mutation → server emits event → all clients in room update Zustand store. Key events: `item-added`, `item-updated`, `item-removed`, `assignment-added`, `assignment-removed`, `room-updated`, `online-participants`.

### Split Calculation Logic
`subtotal` = sum of (item.price × item.quantity × assignment.percentage / total_percentage) per participant  
`serviceCharge` = subtotal × (serviceChargeRate / 100)  
`tax` = (subtotal + serviceCharge) × (taxRate / 100)  
`total` = subtotal + serviceCharge + tax

### Database Schema (Supabase/PostgreSQL)
4 tables: `rooms` (6-char unique code, 5-day TTL, tax/SC rates), `participants` (unique name per room), `items` (name, unit price, quantity), `assignments` (item_id + participant_id + percentage). All cascade-delete on room deletion.

## Environment Variables

Copy `.env.example` to `.env`:
- `SUPABASE_URL`, `SUPABASE_KEY` — optional; omit or set `SKIP_DB=true` for in-memory mode
- `CLAUDE_API_KEY` — required for receipt analysis feature
- `VITE_API_URL`, `VITE_SOCKET_URL` — frontend URLs (default: `http://localhost:3001`)

## Key Constraints
- Room codes exclude I, O, 0, 1 characters to avoid confusion
- Participant names must be unique within a room (enforced DB-side and server-side)
- Receipt AI prompt is tuned to prevent tax-inclusive price hallucination — be careful modifying `ReceiptService.ts`
- `shared/` types are the contract between client and server — changes require rebuilding the package
