# Air Ticket Booking — Full-Stack Design Spec
Date: 2026-05-19

## Overview

A full-stack air ticket booking application with a Node.js/Express/MongoDB backend, a React + shadcn/ui frontend, and three AI features powered by Google Gemini 2.5 Flash. The project is structured as an npm workspaces monorepo and published to GitHub under the user's account.

---

## Monorepo Structure

```
air-ticket-booking/
├── package.json              # root — npm workspaces ["backend", "frontend"]
├── .gitignore
├── README.md
├── backend/                  # existing Node.js API (moved here)
│   ├── package.json
│   ├── index.js
│   ├── .env                  # MONGO_URI, JWT_SECRET, GEMINI_API_KEY
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── service/
│       └── util/
└── frontend/                 # new React app
    ├── package.json
    ├── vite.config.js        # /api proxy → localhost:5000
    ├── tailwind.config.js
    └── src/
        ├── components/       # shared shadcn + custom components
        ├── pages/            # one file per route
        ├── hooks/            # custom React hooks
        ├── lib/              # axios instance, utils
        └── main.jsx
```

Root `package.json` scripts:
- `npm run dev` — starts both backend (nodemon) and frontend (vite) concurrently
- `npm run dev:backend` / `npm run dev:frontend` — individual

---

## Frontend Pages & Routing

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Hero section, flight search form |
| `/login` | Login | JWT login form |
| `/register` | Register | User registration form |
| `/flights` | Search Results | Flight cards + filters + AI pricing badges |
| `/flights/:id` | Flight Detail | Full flight info + reviews |
| `/booking/:id` | Booking Confirmation | Summary + AI travel recommendations |
| `/my-bookings` | My Bookings | Booking history + boarding passes |
| `/ai-assistant` | AI Assistant | Full-screen chat interface |

**Shared layout:** Navbar (logo, links, user avatar/menu) present on all authenticated pages. A floating AI chat button (bottom-right) opens the assistant as a slide-over panel without leaving the current page.

---

## Backend API

### Existing endpoints (unchanged)
- `POST /api/v1/auth/register` — register
- `POST /api/v1/auth/login` — login, returns JWT
- `GET/POST/DELETE /api/v1/flight` — flight CRUD + search/filter
- `GET/POST/DELETE /api/v1/airline` — airline CRUD
- `POST /api/v1/booking` — create booking
- `GET /api/v1/booking/:id/boardingPass` — get boarding pass
- `DELETE /api/v1/booking/:id` — cancel booking
- `GET/POST/DELETE /api/v1/review` — flight reviews

### New AI endpoints

**`POST /api/v1/ai/chat`**
- Body: `{ message: string, conversationHistory: array }`
- Gemini parses natural language, extracts flight search intent (`{ from, to, date, maxPrice }`), or answers general travel Q&A
- Response: `{ type: "search_intent" | "answer", data: object | string }`

**`POST /api/v1/ai/recommendations`**
- Body: `{ destination: string, departureDate: string }`
- Gemini returns destination travel tips
- Response: `{ weather: string, visa: string, packing: string[], hotelAreas: string[] }`

**`POST /api/v1/ai/pricing-insight`**
- Body: `{ flights: [{ flightId, price, route, date }] }`
- Gemini analyses price distribution and returns verdict per flight
- Response: `{ insights: [{ flightId, verdict: "Book Now"|"Good Deal"|"Wait if Flexible", reason: string }] }`

All AI endpoints use `@google/generative-ai` with `gemini-2.5-flash` model. `GEMINI_API_KEY` loaded from `backend/.env`.

---

## AI Features Detail

### 1. Smart Flight Assistant
- Available as a floating slide-over panel on all pages and as a full-screen `/ai-assistant` page
- User types natural language trip description
- Frontend sends message to `/api/v1/ai/chat`
- On `search_intent` response: auto-fills the search form on `/flights` and triggers search
- On `answer` response: displays text reply in chat bubble
- Conversation history maintained in React state for multi-turn context

### 2. Travel Recommendations
- Auto-triggers on `/booking/:id` page after booking is created
- Non-blocking: shows skeleton loader while fetching, gracefully hides section if API fails
- Displays 4 shadcn cards: Weather, Visa Requirements, Packing Tips, Top Hotel Areas
- Destination extracted from flight's `arrivalAirport` field

### 3. Pricing Insights
- Triggers after `/flights` search results load
- Batch call: all returned flights sent in one request to `/api/v1/ai/pricing-insight`
- Each flight card gets a colored badge: green (`Book Now`), blue (`Good Deal`), amber (`Wait if Flexible`)
- Badge includes a tooltip with the short reason from Gemini
- Renders independently — flight cards show without badges until AI responds

---

## Auth & Data Flow

**Auth:**
- JWT stored in `localStorage`
- Axios instance in `frontend/src/lib/axios.js` attaches `Authorization: Bearer <token>` to all requests
- Response interceptor: on 401, clear token and redirect to `/login`
- React Router protected route wrapper checks for token presence

**Flight search flow:**
1. User fills form (or AI assistant fills it) → `GET /api/v1/flight?departureAirport=X&arrivalAirport=Y`
2. Results render as shadcn cards
3. Pricing insight batch call fires → badges update asynchronously

**Booking flow:**
1. User clicks "Book" on flight detail → `POST /api/v1/booking`
2. On success → redirect to `/booking/:id`
3. Recommendations auto-fetch from `/api/v1/ai/recommendations`

---

## Error Handling

- API errors: `{ success: false, message }` → shadcn `Toast` (sonner) notification
- AI endpoints fail silently on the UI — features degrade gracefully, no broken states
- Network errors: Axios catches and shows generic toast
- Auth errors (401): auto-redirect to `/login`
- Form validation: shadcn Form + react-hook-form + zod schemas

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend runtime | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + Passport.js |
| AI | Google Gemini 2.5 Flash (`@google/generative-ai`) |
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| UI components | shadcn/ui |
| Styling | Tailwind CSS v3 |
| HTTP client | Axios |
| Forms | react-hook-form + zod |
| Monorepo | npm workspaces |
| Dev orchestration | concurrently |
| Version control | Git + GitHub |

---

## Environment Variables

`backend/.env`:
```
MONGO_URI=mongodb://localhost:27017/air-ticket-booking
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

`frontend/.env`:
```
VITE_API_URL=http://localhost:5000
```
