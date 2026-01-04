# Bill Splitting App - Simple Plan

## Concept
A simple web app where you create a room, upload a receipt, and share a code with friends to split the bill - **NO LOGIN**.

## Tech Stack
- **Frontend**: React + Vite + Tailwind
- **Backend**: Express + Socket.io
- **Database**: Supabase (no auth)
- **AI**: Claude API (receipt reading)
- **Deploy**: Vercel + Railway
- **Cost**: $0-5/month

---

## User Flow

### 1. Create Room Flow (Creator)
```
1. Land on homepage
2. Click "Create New Bill"
3. Enter:
   - Room name (e.g., "Dinner at Sushi Bar")
   - Your name (e.g., "John")
4. Click "Create"
5. Get Room Code: ABC123
6. See room page with:
   - Room code displayed big
   - "Share Code" button
   - "Upload Receipt" button
   - Empty items list
   - Participants: [John (You)]
```

### 2. Upload Receipt Flow (Creator)
```
1. Click "Upload Receipt"
2. Select/drag receipt photo
3. See loading: "Reading receipt..."
4. AI extracts items:
   - Pad Thai - ฿120
   - Fried Rice - ฿100
   - Coke x2 - ฿70
   - Tax - ฿20
   - Total: ฿310
5. Can edit items (change name/price)
6. Click "Confirm Items"
7. Items now shown in room
```

### 3. Join Room Flow (Participant)
```
1. Friend shares code: "ABC123"
2. Open app
3. Click "Join Room"
4. Enter:
   - Room code: ABC123
   - Your name: Sarah
5. Click "Join"
6. See same room page
7. Everyone sees: "Sarah joined" (real-time)
8. Participants: [John (Creator), Sarah (You)]
```

### 4. Split Bill Flow (Everyone)
```
1. See list of items:
   □ Pad Thai - ฿120
   □ Fried Rice - ฿100
   □ Coke x2 - ฿70
   □ Tax - ฿20 (auto-split)

2. Sarah clicks "Pad Thai":
   ✓ Pad Thai - ฿120 [Sarah]
   
3. John clicks "Fried Rice":
   ✓ Fried Rice - ฿100 [John]
   
4. Both click "Coke x2":
   ✓ Coke x2 - ฿70 [John + Sarah] (฿35 each)

5. Tax auto-splits equally
   
6. See summary (real-time for everyone):
   John owes: ฿145 (Fried Rice + half Coke + tax)
   Sarah owes: ฿165 (Pad Thai + half Coke + tax)
```

### 5. Payment Flow
```
1. Sarah pays cash to John
2. Sarah clicks "Mark as Paid"
3. Everyone sees:
   ✓ Sarah - ฿165 - PAID ✅
   ○ John - ฿145 - Unpaid

4. When everyone paid:
   Bill status: COMPLETED ✅
```

---

## Pages

### 1. Home (`/`)
- Big title: "Split Bills Easily"
- Two buttons:
  - "Create New Bill"
  - "Join Existing Bill"
- How it works (3 steps)

### 2. Create Room (`/create`)
- Form:
  - Room name input
  - Your name input
  - "Create Room" button

### 3. Join Room (`/join`)
- Form:
  - Room code input (ABC123)
  - Your name input
  - "Join Room" button

### 4. Room Page (`/room/:code`)
**Top Section:**
- Room name
- Room code (big): ABC123
- "Copy Code" button
- "Show QR Code" button (generates QR for easy mobile sharing)
- Participants count: 3 people

**Receipt Section (creator only):**
- Upload button
- Receipt preview

**Items Section:**
- List of all items
- Click to assign/unassign
- Visual indicator: assigned items highlighted
- Show who assigned what

**Participants Section:**
- List all participants with:
  - Name
  - Amount owed
  - Paid status
  - "Mark Paid" button (for yourself)

**Summary Card:**
- Your name
- Your total: ฿165
- Status: Paid/Unpaid
- Payment button
- "Export Summary" button (download breakdown)

---

## Database Tables

### rooms
- id (uuid)
- room_code (ABC123)
- room_name (text)
- creator_name (text)
- total_amount (decimal)
- status (active/completed)
- created_at
- expires_at (7 days)

### items
- id (uuid)
- room_id (foreign key)
- item_name (text)
- price (decimal)
- quantity (int)

### participants
- id (uuid)
- room_id (foreign key)
- participant_name (text)
- amount_owed (decimal)
- paid_status (boolean)
- joined_at

### assignments
- id (uuid)
- item_id (foreign key)
- participant_id (foreign key)
- share_ratio (0.5 = half item)

---

## API Endpoints

### Rooms
- `POST /api/rooms/create` - Create room
- `GET /api/rooms/:code` - Get room data
- `POST /api/rooms/:code/join` - Join room

### Items
- `POST /api/rooms/:code/items` - Add items
- `PUT /api/items/:id` - Edit item
- `DELETE /api/items/:id` - Delete item

### Assignments
- `POST /api/assignments` - Assign item
- `DELETE /api/assignments/:id` - Unassign item

### Analysis
- `POST /api/analyze/receipt` - Upload & analyze receipt

### Payments
- `POST /api/participants/:id/pay` - Mark as paid

### QR Code
- `GET /api/rooms/:code/qr` - Generate QR code for room

### Export
- `GET /api/rooms/:code/summary` - Get bill breakdown summary (JSON)
- `GET /api/rooms/:code/export` - Export as PDF/text

---

## Socket.io Events

### Client → Server
- `join-room` - Join room channel
- `assign-item` - Assign item to self
- `unassign-item` - Remove assignment
- `mark-paid` - Mark payment

### Server → Clients (Broadcast)
- `participant-joined` - New person joined
- `assignment-updated` - Someone assigned item
- `payment-updated` - Someone paid
- `items-updated` - Items list changed

---

## Development Plan (4 Weeks)

### Week 1: Setup
- Day 1-2: Setup React + Express
- Day 3-4: Create database schema
- Day 5-7: Basic API (create/join room)

### Week 2: Core Features
- Day 8-9: Home, create, join pages
- Day 10-12: Receipt upload + AI
- Day 13-14: Socket.io real-time

### Week 3: Main Features
- Day 15-17: Room page + item list
- Day 18-19: Assignment system
- Day 20-21: Payment tracking

### Week 4: Polish & Launch
- Day 22-23: Mobile responsive
- Day 24-25: Testing
- Day 26-28: Deploy + launch

---

## Key Features

✅ **No Login** - Just name and room code
✅ **Real-time** - Everyone sees updates instantly
✅ **AI Receipt Reading** - Upload photo, auto-extract items
✅ **Fair Splitting** - Click items to assign, auto-calculates
✅ **Simple UI** - Clean, mobile-friendly
✅ **Shareable** - Easy 6-digit room code + QR code
✅ **Temporary** - Rooms auto-delete after 7 days
✅ **Export Summary** - Download detailed breakdown of who owes what

---

## Visual Flow Diagram

```
┌─────────────┐
│   Homepage  │
│             │
│ [Create]    │──────┐
│ [Join]      │      │
└─────────────┘      │
                     │
        ┌────────────▼──────────┐
        │  Create: Enter name   │
        │         + room name   │
        └────────────┬──────────┘
                     │
                     ▼
        ┌──────────────────────┐
        │  Get Code: ABC123    │◄───────┐
        │  [Share Code]        │        │
        │  [Upload Receipt]    │        │
        └────────────┬─────────┘        │
                     │                   │
                     ▼                   │
        ┌──────────────────────┐        │
        │  Receipt Analysis    │        │
        │  Items extracted     │        │
        └────────────┬─────────┘        │
                     │                   │
                     ▼                   │
        ┌──────────────────────┐        │
        │   Room Page          │        │
        │   ┌────────────────┐ │        │
        │   │ Items          │ │        │
        │   │ □ Pad Thai     │ │        │
        │   │ □ Fried Rice   │ │        │
        │   └────────────────┘ │        │
        │   ┌────────────────┐ │        │
        │   │ Participants   │ │        │
        │   │ John - ฿145    │ │        │
        │   │ Sarah - ฿165   │ │        │
        │   └────────────────┘ │        │
        └──────────────────────┘        │
                                         │
┌─────────────┐                        │
│ Join Page   │                        │
│             │                        │
│ Code: ___   │────────────────────────┘
│ Name: ___   │
│             │
│ [Join]      │
└─────────────┘
```

---

## Sample UI Mockup (Text)

### Room Page
```
┌──────────────────────────────────────┐
│  🍽️ Dinner at Sushi Bar              │
│                                       │
│  Room Code: ABC123  [📋 Copy]        │
│  👥 3 participants                    │
├──────────────────────────────────────┤
│                                       │
│  📸 Receipt                           │
│  [Receipt image preview]              │
│                                       │
├──────────────────────────────────────┤
│  🧾 Items                             │
│                                       │
│  ✓ Pad Thai · ฿120                   │
│    👤 Sarah                           │
│                                       │
│  ✓ Fried Rice · ฿100                 │
│    👤 John                            │
│                                       │
│  ✓ Coke x2 · ฿70                     │
│    👤 John + Sarah (฿35 each)        │
│                                       │
│  ✓ Tax · ฿20                         │
│    👤 Split equally (฿10 each)       │
│                                       │
├──────────────────────────────────────┤
│  👥 Participants & Payments           │
│                                       │
│  John (Creator)         ฿145 [ ]     │
│  Sarah (You)           ฿165 [✓] PAID │
│                                       │
│  ──────────────────────              │
│  Total Bill:           ฿310          │
│  Remaining:            ฿145          │
└──────────────────────────────────────┘
```

---

## QR Code Sharing Feature

### How It Works
1. Click "Show QR Code" button on room page
2. Modal displays QR code containing room join link
3. Friends scan with phone camera → auto-opens join page
4. QR encodes: `https://snapsplit.app/join/ABC123`

### Implementation
- **Frontend**: Use `qrcode` or `qrcode.react` library
- **Generate**: Client-side (no API needed for basic version)
- **Alternative**: Server-side generation at `/api/rooms/:code/qr`
- **Display**: Modal popup with downloadable QR image

### Benefits
- Faster than typing codes
- Perfect for in-person gatherings
- One-tap join from mobile
- Can print/display QR at table

---

## Export Summary Feature

### What Gets Exported
```
🍽️ DINNER AT SUSHI BAR
Room Code: ABC123
Date: Jan 4, 2026, 3:50 PM

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ITEMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Pad Thai · ฿120
  → Sarah (100%)

✓ Fried Rice · ฿100
  → John (100%)

✓ Coke x2 · ฿70
  → John (50%) = ฿35
  → Sarah (50%) = ฿35

✓ Tax · ฿20
  → Split equally
  → John (50%) = ฿10
  → Sarah (50%) = ฿10

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
John:          ฿145  ⚪ Unpaid
  Fried Rice:  ฿100
  Coke (half): ฿35
  Tax (half):  ฿10

Sarah:         ฿165  ✅ PAID
  Pad Thai:    ฿120
  Coke (half): ฿35
  Tax (half):  ฿10

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL BILL:    ฿310
PAID:          ฿165
REMAINING:     ฿145
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generated by SnapSplit
```

### Export Formats
1. **Text/Markdown** - Copy to clipboard or download .txt
2. **PDF** - Professional receipt (use `jsPDF` or server-side)
3. **Image** - Screenshot of summary (use `html2canvas`)
4. **JSON** - For developers/integrations

### Implementation
**Client-side (Simpler):**
- Generate formatted text in browser
- Copy to clipboard with `navigator.clipboard`
- Download as .txt file
- Use `html2canvas` + `jsPDF` for PDF

**Server-side (Better):**
- `GET /api/rooms/:code/summary?format=txt|pdf|json`
- Use libraries: `pdfkit` (Node.js) or `puppeteer`
- Return formatted document

### Use Cases
- Send via WhatsApp/LINE to absent friends
- Keep record of who paid what
- Dispute resolution
- Expense tracking/accounting

---

## Notes
- Store participant name in localStorage (persist on refresh)
- Room expires after 7 days (auto-cleanup)
- Mobile-first design
- Works without account
- Simple 6-character codes (easy to share)
- Real-time makes it feel collaborative
- No email/notifications needed (everyone is in room together)

---

**Status:** Ready to build
**Time:** 4 weeks
**Cost:** $0-5/month