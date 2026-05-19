# SkyBook — AI-Powered Air Ticket Booking

Full-stack flight booking application with three AI features powered by **Google Gemini 2.5 Flash**.

## Features

- Flight search with airport, price, and sort filters
- Booking management with boarding passes
- Flight reviews
- **AI Smart Assistant** — natural language flight search ("find cheap flights from Karachi to Dubai")
- **AI Pricing Insights** — real-time "Book Now / Good Deal / Wait" badges on search results  
- **AI Travel Recommendations** — weather, visa, packing, and hotel tips auto-generated after booking

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express, MongoDB, Mongoose, JWT |
| AI | Google Gemini 2.5 Flash |
| Frontend | React 18, Vite, shadcn/ui, Tailwind CSS |
| Monorepo | npm workspaces |

## Project Structure

```
air-ticket-booking/
├── backend/          # Node.js/Express API
└── frontend/         # React + Vite + shadcn/ui
```

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally

### Installation

```bash
# Clone the repo
git clone https://github.com/<your-username>/air-ticket-booking

# Install all dependencies
npm install

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env and fill in your values
```

### Environment Variables (`backend/.env`)

```
MONGO_URI=mongodb://localhost:27017/air-ticket-booking
JWT_SECRET=your_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```

Get a free Gemini API key at [Google AI Studio](https://aistudio.google.com).

### Running the App

```bash
# Start both backend and frontend
npm run dev

# Or individually
npm run dev:backend   # http://localhost:5000
npm run dev:frontend  # http://localhost:5173
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /auth/signup | Register |
| POST | /auth/login | Login (returns JWT) |
| GET | /api/v1/flight | Search flights |
| POST | /api/v1/booking | Create booking |
| GET | /api/v1/booking | Get my bookings |
| GET | /api/v1/booking/:id/boardingPass | Get boarding pass |
| POST | /api/v1/ai/chat | AI flight assistant |
| POST | /api/v1/ai/recommendations | AI travel recommendations |
| POST | /api/v1/ai/pricing-insight | AI pricing analysis |
