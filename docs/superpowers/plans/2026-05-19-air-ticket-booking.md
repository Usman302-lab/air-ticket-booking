# Air Ticket Booking — Full-Stack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform an existing Node.js/Express API into a full-stack npm-workspaces monorepo with a React + shadcn/ui frontend and three Gemini 2.5 Flash AI features, published to GitHub.

**Architecture:** `backend/` (Express + MongoDB + Gemini) and `frontend/` (React 18 + Vite + shadcn/ui) as npm workspaces under a root `package.json`. Frontend proxies `/api` and `/auth` to `localhost:5000` via Vite. Auth uses JWT Bearer tokens. Three AI endpoints power a chat assistant, travel recommendations, and pricing insights.

**Tech Stack:** Node.js, Express, MongoDB/Mongoose, JWT, `@google/generative-ai` (Gemini 2.5 Flash), React 18, Vite, shadcn/ui, Tailwind CSS v3, React Router v6, Axios, react-hook-form, zod, concurrently

---

## File Map

**Backend — modified:**
- `backend/index.js` — port from env, CORS, morgan, fix auth mount path
- `backend/src/config/database.js` — use `MONGO_URI` env var
- `backend/src/util/auth.js` — Bearer token extraction, env JWT secret
- `backend/src/routes/authRoutes.js` — env JWT secret
- `backend/src/service/flightService.js` — add airport + maxPrice search, fix missing default
- `backend/src/service/bookingService.js` — auto-generate id, add `getUserBookings`
- `backend/src/controllers/bookingController.js` — add `getUserBookings` handler
- `backend/src/routes/v1/index.js` — add `GET /booking`, add AI routes
- `backend/package.json` — add `@google/generative-ai`, `cors`, `dotenv`

**Backend — new:**
- `backend/src/service/aiService.js`
- `backend/src/controllers/aiController.js`
- `backend/.env` / `backend/.env.example`

**Frontend — new (all files):**
- `frontend/package.json`, `frontend/vite.config.js`, `frontend/tailwind.config.js`
- `frontend/src/main.jsx`, `frontend/src/App.jsx`
- `frontend/src/lib/axios.js`
- `frontend/src/components/layout/Layout.jsx`, `Navbar.jsx`
- `frontend/src/components/ai/AIChatPanel.jsx`
- `frontend/src/components/flights/FlightCard.jsx`
- `frontend/src/pages/Landing.jsx`, `Login.jsx`, `Register.jsx`
- `frontend/src/pages/Flights.jsx`, `FlightDetail.jsx`
- `frontend/src/pages/BookingConfirmation.jsx`, `MyBookings.jsx`, `AIAssistant.jsx`

**Root — new/modified:**
- `package.json` (root workspaces)
- `.gitignore`
- `README.md`

---

## Task 1: Set up monorepo root

**Files:** Create root `package.json`, update `.gitignore`, move existing files to `backend/`

- [ ] **Step 1: Create backend directory and copy existing files**

```bash
cd /Users/usmanarshad/Air-Ticket-Booking-API-Node
mkdir -p backend
cp -r src backend/src
cp index.js backend/index.js
cp package.json backend/package.json
```

- [ ] **Step 2: Create root `package.json`**

Create `/Users/usmanarshad/Air-Ticket-Booking-API-Node/package.json`:

```json
{
  "name": "air-ticket-booking",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["backend", "frontend"],
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "npm run dev --workspace=backend",
    "dev:frontend": "npm run dev --workspace=frontend"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

- [ ] **Step 3: Replace `backend/package.json`**

```json
{
  "name": "backend",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "dev": "nodemon index.js",
    "start": "node index.js"
  },
  "dependencies": {
    "@google/generative-ai": "^0.21.0",
    "bcrypt": "^4.0.1",
    "body-parser": "^1.19.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.18.1",
    "jsonwebtoken": "^8.5.1",
    "mongoose": "^6.3.1",
    "morgan": "^1.10.0",
    "nodemon": "^2.0.16",
    "passport": "^0.4.1",
    "passport-jwt": "^4.0.0",
    "passport-local": "^1.0.0"
  }
}
```

- [ ] **Step 4: Create `backend/.env`**

```
MONGO_URI=mongodb://localhost:27017/air-ticket-booking
JWT_SECRET=your_super_secret_jwt_key_change_this
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```

- [ ] **Step 5: Create `backend/.env.example`**

Same content as `.env` above.

- [ ] **Step 6: Update root `.gitignore`**

```
node_modules/
backend/node_modules/
frontend/node_modules/
backend/.env
frontend/.env
dist/
.DS_Store
```

- [ ] **Step 7: Install root + backend dependencies**

```bash
cd /Users/usmanarshad/Air-Ticket-Booking-API-Node
npm install
cd backend && npm install
```

Expected: `node_modules/` at root with `concurrently`; `backend/node_modules/` with all backend deps including `@google/generative-ai`.

- [ ] **Step 8: Commit**

```bash
git add backend/ package.json .gitignore
git commit -m "chore: restructure into npm workspaces monorepo"
```

---

## Task 2: Fix backend — env vars, CORS, JWT Bearer, search

**Files:** `backend/index.js`, `backend/src/config/database.js`, `backend/src/util/auth.js`, `backend/src/routes/authRoutes.js`, `backend/src/service/flightService.js`

- [ ] **Step 1: Replace `backend/index.js`**

```javascript
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');

const apiRouter = require('./src/routes/index');
const authRouter = require('./src/routes/authRoutes');
const { connect } = require('./src/config/database');
require('./src/util/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/auth', authRouter);
app.use('/api', passport.authenticate('jwt', { session: false }), apiRouter);

app.listen(PORT, async () => {
    await connect();
    console.log(`Server running on port ${PORT}`);
});
```

- [ ] **Step 2: Replace `backend/src/config/database.js`**

```javascript
require('dotenv').config();
const mongoose = require('mongoose');

const connect = () => {
    console.log('MongoDB connection requested');
    return mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/air-ticket-booking');
};

module.exports = { connect };
```

- [ ] **Step 3: Replace `backend/src/util/auth.js`**

```javascript
require('dotenv').config();
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

passport.use('signup', new localStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
        try {
            const user = await User.create({ email, password });
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

passport.use('login', new localStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email });
            if (!user) return done(null, false, { message: 'User not found' });
            const validate = await user.isValidPassword(password);
            if (!validate) return done(null, false, { message: 'Wrong password' });
            return done(null, user, { message: 'Logged in Successfully' });
        } catch (err) {
            return done(err);
        }
    }
));

passport.use(new JWTStrategy(
    {
        secretOrKey: process.env.JWT_SECRET || 'TOP_SECRET',
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
        try {
            return done(null, token.user);
        } catch (err) {
            done(err);
        }
    }
));
```

- [ ] **Step 4: Replace `backend/src/routes/authRoutes.js`**

```javascript
require('dotenv').config();
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/signup', passport.authenticate('signup', { session: false }), async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Signup successful',
        data: { user: req.user },
    });
});

router.post('/login', async (req, res, next) => {
    passport.authenticate('login', async (err, user) => {
        try {
            if (err || !user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
            req.login(user, { session: false }, async (loginErr) => {
                if (loginErr) return next(loginErr);
                const token = jwt.sign(
                    { user: { _id: user._id, email: user.email } },
                    process.env.JWT_SECRET || 'TOP_SECRET'
                );
                return res.status(200).json({ token, success: true, message: 'Successfully signed in' });
            });
        } catch (err) {
            return next(err);
        }
    })(req, res, next);
});

module.exports = router;
```

- [ ] **Step 5: Replace the `getAllFlights` function in `backend/src/service/flightService.js`**

Replace only the `getAllFlights` function body (keep all other functions unchanged):

```javascript
const getAllFlights = async (data) => {
    try {
        const query = {};
        if (data.departureAirport) query.departureAirport = new RegExp(data.departureAirport, 'i');
        if (data.arrivalAirport) query.arrivalAirport = new RegExp(data.arrivalAirport, 'i');
        if (data.maxPrice) query.price = { $lte: Number(data.maxPrice) };

        let dbQuery = Flight.find(query);

        if (data.sort === 'price_asc') dbQuery = dbQuery.sort('price');
        else if (data.sort === 'price_desc') dbQuery = dbQuery.sort('-price');
        else if (data.sort === 'duration_asc') dbQuery = dbQuery.sort('duration');
        else if (data.sort === 'duration_desc') dbQuery = dbQuery.sort('-duration');

        return await dbQuery.populate('airline').exec();
    } catch (err) {
        console.log(err);
    }
};
```

- [ ] **Step 6: Verify backend starts**

```bash
cd /Users/usmanarshad/Air-Ticket-Booking-API-Node/backend
node index.js
```

Expected output: `Server running on port 5000` and `MongoDB connection requested`. Stop with Ctrl+C.

- [ ] **Step 7: Commit**

```bash
git add backend/index.js backend/src/config/database.js backend/src/util/auth.js backend/src/routes/authRoutes.js backend/src/service/flightService.js backend/.env.example
git commit -m "fix: env vars, CORS, Bearer JWT auth, airport search in getAllFlights"
```

---

## Task 3: Add user bookings endpoint

**Files:** `backend/src/service/bookingService.js`, `backend/src/controllers/bookingController.js`, `backend/src/routes/v1/index.js`

- [ ] **Step 1: Replace `backend/src/service/bookingService.js`**

```javascript
const Booking = require('../models/booking');

const createBooking = async (data) => {
    try {
        const newBooking = {
            status: data.status || 'booked',
            id: Date.now(),
            flight: data.flight,
            user: data.user,
        };
        return await new Booking(newBooking).save();
    } catch (err) {
        console.log(err);
    }
};

const cancelBooking = async (id) => {
    try {
        return await Booking.findOneAndUpdate({ id: id }, { status: 'cancelled' });
    } catch (err) {
        console.log(err);
    }
};

const boardingPass = async (id) => {
    try {
        return await Booking.findOne({ id: id }).populate('flight').populate('user').exec();
    } catch (err) {
        console.log(err);
    }
};

const getUserBookings = async (userId) => {
    try {
        return await Booking.find({ user: userId }).populate('flight').exec();
    } catch (err) {
        console.log(err);
    }
};

module.exports = { createBooking, cancelBooking, boardingPass, getUserBookings };
```

- [ ] **Step 2: Replace `backend/src/controllers/bookingController.js`**

```javascript
const BookingService = require('../service/bookingService');

const createBooking = async (req, res) => {
    try {
        const booking = await BookingService.createBooking(req.body);
        res.status(200).json({ success: true, message: 'Successfully created booking', data: booking });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Something went wrong' });
    }
};

const getBoardingPass = async (req, res) => {
    try {
        const boardingPass = await BookingService.boardingPass(req.params.id);
        res.status(200).json({ success: true, message: 'Successfully fetched boarding pass', data: boardingPass });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Something went wrong' });
    }
};

const cancelBooking = async (req, res) => {
    try {
        const booking = await BookingService.cancelBooking(req.params.id);
        res.status(200).json({ success: true, message: 'Successfully cancelled booking', data: booking });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Something went wrong' });
    }
};

const getUserBookings = async (req, res) => {
    try {
        const bookings = await BookingService.getUserBookings(req.user._id);
        res.status(200).json({ success: true, message: 'Successfully fetched user bookings', data: bookings });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Something went wrong' });
    }
};

module.exports = { createBooking, getBoardingPass, cancelBooking, getUserBookings };
```

- [ ] **Step 3: Add `GET /booking` route to `backend/src/routes/v1/index.js`**

Add this line after the existing `router.delete("/booking/:id", ...)` line:

```javascript
router.get("/booking", bookingController.getUserBookings);
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/service/bookingService.js backend/src/controllers/bookingController.js backend/src/routes/v1/index.js
git commit -m "feat: add GET /booking for user bookings, auto-generate booking id"
```

---

## Task 4: Add AI endpoints to backend

**Files:** Create `backend/src/service/aiService.js`, `backend/src/controllers/aiController.js`; modify `backend/src/routes/v1/index.js`

- [ ] **Step 1: Create `backend/src/service/aiService.js`**

```javascript
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const chatWithAssistant = async (message) => {
    const prompt = `You are a helpful flight booking assistant. The user says: "${message}".

If the user is searching for a flight (mentions cities, airports, or travel intent), respond ONLY with this JSON:
{ "type": "search_intent", "data": { "departureAirport": "city name", "arrivalAirport": "city name", "date": "YYYY-MM-DD or empty string", "maxPrice": null } }

If it is a general travel question, respond ONLY with this JSON:
{ "type": "answer", "data": "your helpful answer here" }

Respond only with valid JSON. No markdown fences, no extra text.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/^```json\s*|\s*```$/g, '');
    return JSON.parse(text);
};

const getTravelRecommendations = async (destination, departureDate) => {
    const prompt = `Provide brief travel recommendations for a trip to ${destination} departing ${departureDate}.
Respond ONLY with valid JSON, no markdown fences:
{
  "weather": "one sentence weather description",
  "visa": "one sentence visa requirement summary",
  "packing": ["item1", "item2", "item3", "item4", "item5"],
  "hotelAreas": ["area1", "area2", "area3"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/^```json\s*|\s*```$/g, '');
    return JSON.parse(text);
};

const getPricingInsights = async (flights) => {
    if (!flights || flights.length === 0) return { insights: [] };

    const flightList = flights.map(f => `ID:${f.flightId} | $${f.price} | ${f.route}`).join('\n');

    const prompt = `Analyze these flight prices and give a buying verdict for each.
Flights:
${flightList}

Respond ONLY with valid JSON, no markdown fences:
{
  "insights": [
    { "flightId": "exact ID from above", "verdict": "Book Now", "reason": "one sentence reason" }
  ]
}
Verdict must be exactly one of: "Book Now", "Good Deal", "Wait if Flexible"`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/^```json\s*|\s*```$/g, '');
    return JSON.parse(text);
};

module.exports = { chatWithAssistant, getTravelRecommendations, getPricingInsights };
```

- [ ] **Step 2: Create `backend/src/controllers/aiController.js`**

```javascript
const AIService = require('../service/aiService');

const chat = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ success: false, message: 'message is required' });
        const response = await AIService.chatWithAssistant(message);
        res.status(200).json({ success: true, data: response });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'AI service unavailable' });
    }
};

const recommendations = async (req, res) => {
    try {
        const { destination, departureDate } = req.body;
        if (!destination) return res.status(400).json({ success: false, message: 'destination is required' });
        const response = await AIService.getTravelRecommendations(destination, departureDate || 'soon');
        res.status(200).json({ success: true, data: response });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'AI service unavailable' });
    }
};

const pricingInsight = async (req, res) => {
    try {
        const { flights } = req.body;
        if (!Array.isArray(flights)) return res.status(400).json({ success: false, message: 'flights array is required' });
        const response = await AIService.getPricingInsights(flights);
        res.status(200).json({ success: true, data: response });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'AI service unavailable' });
    }
};

module.exports = { chat, recommendations, pricingInsight };
```

- [ ] **Step 3: Add AI routes to `backend/src/routes/v1/index.js`**

At the top of the file, add:
```javascript
const aiController = require('../../controllers/aiController');
```

Before `module.exports`, add:
```javascript
router.post('/ai/chat', aiController.chat);
router.post('/ai/recommendations', aiController.recommendations);
router.post('/ai/pricing-insight', aiController.pricingInsight);
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/service/aiService.js backend/src/controllers/aiController.js backend/src/routes/v1/index.js
git commit -m "feat: add Gemini 2.5 Flash AI endpoints"
```

---

## Task 5: Scaffold React frontend

**Files:** Full `frontend/` directory

- [ ] **Step 1: Create Vite React app**

```bash
cd /Users/usmanarshad/Air-Ticket-Booking-API-Node
npm create vite@latest frontend -- --template react
```

- [ ] **Step 2: Install frontend dependencies**

```bash
cd frontend
npm install axios react-router-dom react-hook-form zod @hookform/resolvers lucide-react clsx tailwind-merge class-variance-authority
npm install -D tailwindcss postcss autoprefixer @types/node
npx tailwindcss init -p
```

- [ ] **Step 3: Init shadcn**

```bash
npx shadcn@latest init
```

Prompts: Style → **New York**, Base color → **Zinc**, CSS variables → **Yes**

- [ ] **Step 4: Add shadcn components**

```bash
npx shadcn@latest add button input card badge form label select dialog sheet skeleton avatar dropdown-menu separator textarea sonner
```

- [ ] **Step 5: Replace `frontend/vite.config.js`**

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
    server: {
        proxy: {
            '/api': { target: 'http://localhost:5000', changeOrigin: true },
            '/auth': { target: 'http://localhost:5000', changeOrigin: true },
        },
    },
});
```

- [ ] **Step 6: Replace `frontend/tailwind.config.js`**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    theme: { extend: {} },
    plugins: [],
};
```

- [ ] **Step 7: Commit**

```bash
git add frontend/
git commit -m "chore: scaffold React + Vite + shadcn/ui frontend"
```

---

## Task 6: Frontend foundation — Axios, routing, auth pages

**Files:** `frontend/src/lib/axios.js`, `frontend/src/App.jsx`, `frontend/src/pages/Login.jsx`, `frontend/src/pages/Register.jsx`

- [ ] **Step 1: Create `frontend/src/lib/axios.js`**

```javascript
import axios from 'axios';

const api = axios.create({ baseURL: '' });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
```

- [ ] **Step 2: Create `frontend/src/App.jsx`**

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Layout from '@/components/layout/Layout';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Flights from '@/pages/Flights';
import FlightDetail from '@/pages/FlightDetail';
import BookingConfirmation from '@/pages/BookingConfirmation';
import MyBookings from '@/pages/MyBookings';
import AIAssistant from '@/pages/AIAssistant';

function ProtectedRoute({ children }) {
    return localStorage.getItem('token') ? children : <Navigate to="/login" replace />;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Layout />}>
                    <Route index element={<Landing />} />
                    <Route path="flights" element={<ProtectedRoute><Flights /></ProtectedRoute>} />
                    <Route path="flights/:flightNumber" element={<ProtectedRoute><FlightDetail /></ProtectedRoute>} />
                    <Route path="booking/:id" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
                    <Route path="my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
                    <Route path="ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
                </Route>
            </Routes>
            <Toaster />
        </BrowserRouter>
    );
}
```

- [ ] **Step 3: Create `frontend/src/pages/Login.jsx`**

```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const schema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
});

export default function Login() {
    const navigate = useNavigate();
    const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

    const onSubmit = async (values) => {
        try {
            const res = await api.post('/auth/login', values);
            localStorage.setItem('token', res.data.token);
            navigate('/flights');
        } catch {
            toast.error('Invalid email or password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Sign in</CardTitle>
                    <CardDescription>Enter your credentials to continue</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="password" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </form>
                    </Form>
                    <p className="mt-4 text-center text-sm text-zinc-500">
                        No account?{' '}
                        <Link to="/register" className="text-zinc-900 underline underline-offset-2">Sign up</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
```

- [ ] **Step 4: Create `frontend/src/pages/Register.jsx`**

```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const schema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Register() {
    const navigate = useNavigate();
    const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

    const onSubmit = async (values) => {
        try {
            await api.post('/auth/signup', values);
            toast.success('Account created! Please sign in.');
            navigate('/login');
        } catch {
            toast.error('Registration failed. Email may already be in use.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Create account</CardTitle>
                    <CardDescription>Get started with flight booking</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="password" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Creating account...' : 'Create account'}
                            </Button>
                        </form>
                    </Form>
                    <p className="mt-4 text-center text-sm text-zinc-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-zinc-900 underline underline-offset-2">Sign in</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
```

- [ ] **Step 5: Update `frontend/src/main.jsx`**

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode><App /></StrictMode>
);
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/
git commit -m "feat: add frontend auth pages, routing, and Axios instance"
```

---

## Task 7: Layout — Navbar + AI floating button

**Files:** `frontend/src/components/layout/Navbar.jsx`, `frontend/src/components/ai/AIChatPanel.jsx`, `frontend/src/components/layout/Layout.jsx`

- [ ] **Step 1: Create `frontend/src/components/layout/Navbar.jsx`**

```jsx
import { Link, useNavigate } from 'react-router-dom';
import { Plane, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function Navbar() {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('token');

    const logout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <header className="border-b bg-white sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 font-bold text-lg">
                    <Plane className="h-5 w-5" /> SkyBook
                </Link>
                <nav className="hidden md:flex items-center gap-6 text-sm">
                    {isLoggedIn && (
                        <>
                            <Link to="/flights" className="text-zinc-600 hover:text-zinc-900 transition-colors">Flights</Link>
                            <Link to="/my-bookings" className="text-zinc-600 hover:text-zinc-900 transition-colors">My Bookings</Link>
                            <Link to="/ai-assistant" className="text-zinc-600 hover:text-zinc-900 transition-colors">AI Assistant</Link>
                        </>
                    )}
                </nav>
                <div className="flex items-center gap-2">
                    {isLoggedIn ? (
                        <Button variant="outline" size="sm" onClick={logout}>Sign out</Button>
                    ) : (
                        <>
                            <Button variant="ghost" size="sm" asChild><Link to="/login">Sign in</Link></Button>
                            <Button size="sm" asChild><Link to="/register">Get started</Link></Button>
                        </>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden"><Menu className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {isLoggedIn ? (
                                <>
                                    <DropdownMenuItem asChild><Link to="/flights">Flights</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link to="/my-bookings">My Bookings</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link to="/ai-assistant">AI Assistant</Link></DropdownMenuItem>
                                    <DropdownMenuItem onClick={logout}>Sign out</DropdownMenuItem>
                                </>
                            ) : (
                                <>
                                    <DropdownMenuItem asChild><Link to="/login">Sign in</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link to="/register">Sign up</Link></DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
```

- [ ] **Step 2: Create `frontend/src/components/ai/AIChatPanel.jsx`**

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

export default function AIChatPanel({ open, onOpenChange }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi! Try: "Find cheap flights from Karachi to Dubai"' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const send = async () => {
        const message = input.trim();
        if (!message || loading) return;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: message }]);
        setLoading(true);
        try {
            const res = await api.post('/api/v1/ai/chat', { message });
            const { type, data } = res.data.data;
            if (type === 'search_intent') {
                const params = new URLSearchParams();
                if (data.departureAirport) params.set('departureAirport', data.departureAirport);
                if (data.arrivalAirport) params.set('arrivalAirport', data.arrivalAirport);
                if (data.maxPrice) params.set('maxPrice', data.maxPrice);
                setMessages(prev => [...prev, { role: 'assistant', content: `Searching flights from ${data.departureAirport || 'anywhere'} to ${data.arrivalAirport || 'anywhere'}...` }]);
                onOpenChange(false);
                navigate(`/flights?${params.toString()}`);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: data }]);
            }
        } catch {
            toast.error('AI assistant unavailable');
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I\'m unavailable right now.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col w-full sm:max-w-md p-0">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle className="flex items-center gap-2"><Bot className="h-5 w-5" /> AI Flight Assistant</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-900'}`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-zinc-100 rounded-lg px-3 py-2 text-sm text-zinc-500">Thinking...</div>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t flex gap-2">
                    <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask about flights..." disabled={loading} />
                    <Button size="icon" onClick={send} disabled={loading}><Send className="h-4 w-4" /></Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
```

- [ ] **Step 3: Create `frontend/src/components/layout/Layout.jsx`**

```jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from './Navbar';
import AIChatPanel from '@/components/ai/AIChatPanel';

export default function Layout() {
    const [chatOpen, setChatOpen] = useState(false);
    const isLoggedIn = !!localStorage.getItem('token');

    return (
        <div className="min-h-screen bg-zinc-50">
            <Navbar />
            <main><Outlet /></main>
            {isLoggedIn && (
                <>
                    <Button onClick={() => setChatOpen(true)} className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg z-50" size="icon">
                        <Bot className="h-6 w-6" />
                    </Button>
                    <AIChatPanel open={chatOpen} onOpenChange={setChatOpen} />
                </>
            )}
        </div>
    );
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/
git commit -m "feat: add Layout, Navbar, and AI chat panel"
```

---

## Task 8: Landing page

**Files:** `frontend/src/pages/Landing.jsx`

- [ ] **Step 1: Create `frontend/src/pages/Landing.jsx`**

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Search, Zap, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function Landing() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ departureAirport: '', arrivalAirport: '', maxPrice: '' });

    const search = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (form.departureAirport) params.set('departureAirport', form.departureAirport);
        if (form.arrivalAirport) params.set('arrivalAirport', form.arrivalAirport);
        if (form.maxPrice) params.set('maxPrice', form.maxPrice);
        navigate(`/flights?${params.toString()}`);
    };

    return (
        <div>
            <section className="bg-zinc-900 text-white py-24 px-4">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                    <div className="inline-flex items-center gap-2 bg-zinc-800 rounded-full px-4 py-1.5 text-sm text-zinc-300">
                        <Zap className="h-3.5 w-3.5" /> AI-powered booking for 2026
                    </div>
                    <h1 className="text-5xl font-bold leading-tight">Find your next flight<br />with AI assistance</h1>
                    <p className="text-zinc-400 text-lg">Smart pricing insights, personalized recommendations, and natural language search.</p>
                </div>
            </section>

            <section className="max-w-3xl mx-auto px-4 -mt-8">
                <Card className="shadow-xl border-0">
                    <CardContent className="p-6">
                        <form onSubmit={search} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="space-y-1.5">
                                <Label>From</Label>
                                <Input placeholder="e.g. Karachi" value={form.departureAirport} onChange={e => setForm(f => ({ ...f, departureAirport: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>To</Label>
                                <Input placeholder="e.g. Dubai" value={form.arrivalAirport} onChange={e => setForm(f => ({ ...f, arrivalAirport: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Max price ($)</Label>
                                <Input type="number" placeholder="500" value={form.maxPrice} onChange={e => setForm(f => ({ ...f, maxPrice: e.target.value }))} />
                            </div>
                            <Button type="submit" className="w-full"><Search className="h-4 w-4 mr-2" /> Search</Button>
                        </form>
                    </CardContent>
                </Card>
            </section>

            <section className="max-w-5xl mx-auto px-4 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { icon: <Zap className="h-6 w-6" />, title: 'AI Pricing Insights', desc: 'Know instantly if a price is a good deal or if you should wait.' },
                    { icon: <Plane className="h-6 w-6" />, title: 'Natural Language Search', desc: 'Describe your trip and our AI finds the right flights for you.' },
                    { icon: <MapPin className="h-6 w-6" />, title: 'Smart Recommendations', desc: 'After booking, get AI tips on weather, visas, and hotels.' },
                ].map(({ icon, title, desc }) => (
                    <div key={title} className="space-y-3">
                        <div className="h-12 w-12 bg-zinc-900 text-white rounded-xl flex items-center justify-center">{icon}</div>
                        <h3 className="font-semibold text-lg">{title}</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
                    </div>
                ))}
            </section>
        </div>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Landing.jsx
git commit -m "feat: add landing page"
```

---

## Task 9: Flights search results page

**Files:** `frontend/src/components/flights/FlightCard.jsx`, `frontend/src/pages/Flights.jsx`

- [ ] **Step 1: Create `frontend/src/components/flights/FlightCard.jsx`**

```jsx
import { Link } from 'react-router-dom';
import { Clock, Plane, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const verdictColors = {
    'Book Now': 'bg-green-100 text-green-800',
    'Good Deal': 'bg-blue-100 text-blue-800',
    'Wait if Flexible': 'bg-amber-100 text-amber-800',
};

export default function FlightCard({ flight, insight }) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3 text-lg font-semibold">
                        <span>{flight.departureAirport}</span>
                        <Plane className="h-4 w-4 text-zinc-400" />
                        <span>{flight.arrivalAirport}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{flight.duration} min</span>
                        {flight.departureTime && <span>{flight.departureTime} → {flight.arrivalTime}</span>}
                        {flight.airline?.name && <span>{flight.airline.name}</span>}
                    </div>
                    <p className="text-xs text-zinc-400">Flight {flight.flightNumber}</p>
                </div>
                <div className="text-right space-y-2 shrink-0">
                    <div className="flex items-center gap-1 text-2xl font-bold justify-end">
                        <DollarSign className="h-5 w-5" />{flight.price}
                    </div>
                    {insight === undefined ? (
                        <Skeleton className="h-5 w-24 ml-auto" />
                    ) : insight ? (
                        <span title={insight.reason} className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${verdictColors[insight.verdict] || 'bg-zinc-100 text-zinc-600'}`}>
                            {insight.verdict}
                        </span>
                    ) : null}
                    <div><Button size="sm" asChild><Link to={`/flights/${flight.flightNumber}`}>View</Link></Button></div>
                </div>
            </CardContent>
        </Card>
    );
}
```

- [ ] **Step 2: Create `frontend/src/pages/Flights.jsx`**

```jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/lib/axios';
import FlightCard from '@/components/flights/FlightCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';

export default function Flights() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [flights, setFlights] = useState([]);
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        departureAirport: searchParams.get('departureAirport') || '',
        arrivalAirport: searchParams.get('arrivalAirport') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        sort: '',
    });

    const fetchFlights = async (params) => {
        setLoading(true);
        setInsights(null);
        try {
            const res = await api.get('/api/v1/flight', { params });
            const data = res.data.data || [];
            setFlights(data);
            if (data.length > 0) {
                api.post('/api/v1/ai/pricing-insight', {
                    flights: data.map(f => ({ flightId: f._id, price: f.price, route: `${f.departureAirport} to ${f.arrivalAirport}` }))
                }).then(r => {
                    const map = {};
                    (r.data.data?.insights || []).forEach(i => { map[i.flightId] = i; });
                    setInsights(map);
                }).catch(() => setInsights({}));
            } else {
                setInsights({});
            }
        } catch {
            toast.error('Failed to load flights');
            setInsights({});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const params = Object.fromEntries(
            Object.entries({ departureAirport: form.departureAirport, arrivalAirport: form.arrivalAirport, maxPrice: form.maxPrice, sort: form.sort })
                .filter(([, v]) => v)
        );
        fetchFlights(params);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = Object.fromEntries(
            Object.entries({ departureAirport: form.departureAirport, arrivalAirport: form.arrivalAirport, maxPrice: form.maxPrice, sort: form.sort })
                .filter(([, v]) => v)
        );
        setSearchParams(params);
        fetchFlights(params);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
            <h1 className="text-2xl font-bold">Search Flights</h1>
            <form onSubmit={handleSearch} className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end bg-white p-4 rounded-xl border">
                <div className="space-y-1.5">
                    <Label>From</Label>
                    <Input placeholder="Karachi" value={form.departureAirport} onChange={e => setForm(f => ({ ...f, departureAirport: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                    <Label>To</Label>
                    <Input placeholder="Dubai" value={form.arrivalAirport} onChange={e => setForm(f => ({ ...f, arrivalAirport: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                    <Label>Max Price ($)</Label>
                    <Input type="number" placeholder="500" value={form.maxPrice} onChange={e => setForm(f => ({ ...f, maxPrice: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                    <Label>Sort</Label>
                    <Select value={form.sort} onValueChange={v => setForm(f => ({ ...f, sort: v }))}>
                        <SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="price_asc">Price: Low to High</SelectItem>
                            <SelectItem value="price_desc">Price: High to Low</SelectItem>
                            <SelectItem value="duration_asc">Duration: Shortest</SelectItem>
                            <SelectItem value="duration_desc">Duration: Longest</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button type="submit"><Search className="h-4 w-4 mr-2" />Search</Button>
            </form>

            {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
            ) : flights.length === 0 ? (
                <div className="text-center py-16 text-zinc-400">No flights found.</div>
            ) : (
                <div className="space-y-3">
                    <p className="text-sm text-zinc-500">{flights.length} flight{flights.length !== 1 ? 's' : ''} found</p>
                    {flights.map(flight => (
                        <FlightCard key={flight._id} flight={flight} insight={insights === null ? undefined : (insights[flight._id] || null)} />
                    ))}
                </div>
            )}
        </div>
    );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Flights.jsx frontend/src/components/flights/
git commit -m "feat: add flight search results page with AI pricing badges"
```

---

## Task 10: Flight detail page

**Files:** `frontend/src/pages/FlightDetail.jsx`

- [ ] **Step 1: Create `frontend/src/pages/FlightDetail.jsx`**

```jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Plane, Clock, DoorOpen, DollarSign } from 'lucide-react';

function getUserId() {
    try {
        return JSON.parse(atob(localStorage.getItem('token').split('.')[1])).user._id;
    } catch { return null; }
}

export default function FlightDetail() {
    const { flightNumber } = useParams();
    const navigate = useNavigate();
    const [flight, setFlight] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const flightRes = await api.get(`/api/v1/flight/${flightNumber}`);
                const f = flightRes.data.data;
                setFlight(f);
                const reviewRes = await api.get(`/api/v1/review/${f._id}`).catch(() => ({ data: { data: [] } }));
                setReviews(reviewRes.data.data || []);
            } catch {
                toast.error('Failed to load flight');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [flightNumber]);

    const bookFlight = async () => {
        setBooking(true);
        try {
            const res = await api.post('/api/v1/booking', { flight: flight._id, user: getUserId() });
            navigate(`/booking/${res.data.data.id}`);
        } catch {
            toast.error('Booking failed. Please try again.');
            setBooking(false);
        }
    };

    const submitReview = async () => {
        if (!comment.trim()) return;
        try {
            await api.post('/api/v1/review', { comment, flight: flight._id, user: getUserId() });
            toast.success('Review submitted');
            setComment('');
            const res = await api.get(`/api/v1/review/${flight._id}`);
            setReviews(res.data.data || []);
        } catch {
            toast.error('Failed to submit review');
        }
    };

    if (loading) return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
            <Skeleton className="h-8 w-48" /><Skeleton className="h-48 w-full rounded-xl" />
        </div>
    );
    if (!flight) return <div className="text-center py-16 text-zinc-400">Flight not found.</div>;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{flight.departureAirport} → {flight.arrivalAirport}</h1>
                <p className="text-zinc-500 text-sm mt-1">Flight {flight.flightNumber}</p>
            </div>
            <Card>
                <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                        <p className="text-xs text-zinc-400 uppercase tracking-wide">Price</p>
                        <p className="text-2xl font-bold flex items-center gap-1"><DollarSign className="h-5 w-5" />{flight.price}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-zinc-400 uppercase tracking-wide">Duration</p>
                        <p className="font-semibold flex items-center gap-1"><Clock className="h-4 w-4" />{flight.duration} min</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-zinc-400 uppercase tracking-wide">Departure</p>
                        <p className="font-semibold">{flight.departureTime || 'TBA'}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-zinc-400 uppercase tracking-wide">Arrival</p>
                        <p className="font-semibold">{flight.arrivalTime || 'TBA'}</p>
                    </div>
                    {flight.boardingGate && (
                        <div className="space-y-1">
                            <p className="text-xs text-zinc-400 uppercase tracking-wide">Gate</p>
                            <p className="font-semibold flex items-center gap-1"><DoorOpen className="h-4 w-4" />Gate {flight.boardingGate}</p>
                        </div>
                    )}
                    {flight.airline?.name && (
                        <div className="space-y-1">
                            <p className="text-xs text-zinc-400 uppercase tracking-wide">Airline</p>
                            <p className="font-semibold">{flight.airline.name}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Button onClick={bookFlight} disabled={booking} className="w-full" size="lg">
                {booking ? 'Booking...' : 'Book This Flight'}
            </Button>
            <Separator />
            <div className="space-y-4">
                <h2 className="font-semibold text-lg">Reviews ({reviews.length})</h2>
                {reviews.length === 0 ? (
                    <p className="text-zinc-400 text-sm">No reviews yet. Be the first!</p>
                ) : reviews.map((r, i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <p className="text-sm">{r.comment}</p>
                            <p className="text-xs text-zinc-400 mt-1">{r.user?.email || 'Anonymous'}</p>
                        </CardContent>
                    </Card>
                ))}
                <div className="space-y-2">
                    <Textarea placeholder="Write a review..." value={comment} onChange={e => setComment(e.target.value)} rows={3} />
                    <Button onClick={submitReview} disabled={!comment.trim()} variant="outline">Submit Review</Button>
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/FlightDetail.jsx
git commit -m "feat: add flight detail page with booking and reviews"
```

---

## Task 11: Booking confirmation + AI recommendations

**Files:** `frontend/src/pages/BookingConfirmation.jsx`

- [ ] **Step 1: Create `frontend/src/pages/BookingConfirmation.jsx`**

```jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, MapPin, CloudSun, FileText, Briefcase } from 'lucide-react';

export default function BookingConfirmation() {
    const { id } = useParams();
    const [booking, setBooking] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [loadingBooking, setLoadingBooking] = useState(true);
    const [loadingRecs, setLoadingRecs] = useState(true);

    useEffect(() => {
        api.get(`/api/v1/booking/${id}/boardingPass`)
            .then(res => {
                const data = res.data.data;
                setBooking(data);
                api.post('/api/v1/ai/recommendations', {
                    destination: data.flight?.arrivalAirport || 'the destination',
                    departureDate: data.flight?.flightDate ? new Date(data.flight.flightDate).toLocaleDateString() : 'soon',
                }).then(r => setRecommendations(r.data.data))
                  .catch(() => setRecommendations(null))
                  .finally(() => setLoadingRecs(false));
            })
            .catch(() => toast.error('Failed to load booking'))
            .finally(() => setLoadingBooking(false));
    }, [id]);

    if (loadingBooking) return (
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
            <Skeleton className="h-8 w-64" /><Skeleton className="h-48 w-full rounded-xl" />
        </div>
    );
    if (!booking) return <div className="text-center py-16 text-zinc-400">Booking not found.</div>;

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
            <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                    <h1 className="text-2xl font-bold">Booking Confirmed!</h1>
                    <p className="text-zinc-500 text-sm">Booking #{id}</p>
                </div>
            </div>
            <Card>
                <CardHeader><CardTitle>Flight Details</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-zinc-500">Route</span><span className="font-medium">{booking.flight?.departureAirport} → {booking.flight?.arrivalAirport}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Flight No.</span><span className="font-medium">{booking.flight?.flightNumber}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Status</span><Badge>{booking.status}</Badge></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Passenger</span><span className="font-medium">{booking.user?.email}</span></div>
                </CardContent>
            </Card>
            <div className="flex gap-3">
                <Button asChild variant="outline" className="flex-1"><Link to="/my-bookings">All Bookings</Link></Button>
                <Button asChild className="flex-1"><Link to="/flights">Search More</Link></Button>
            </div>
            <div className="space-y-3">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" /> AI Travel Tips for {booking.flight?.arrivalAirport}
                </h2>
                {loadingRecs ? (
                    <div className="grid grid-cols-2 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
                ) : recommendations ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Card><CardContent className="p-4 space-y-1">
                            <p className="font-medium text-sm flex items-center gap-1.5"><CloudSun className="h-4 w-4 text-yellow-500" />Weather</p>
                            <p className="text-sm text-zinc-600">{recommendations.weather}</p>
                        </CardContent></Card>
                        <Card><CardContent className="p-4 space-y-1">
                            <p className="font-medium text-sm flex items-center gap-1.5"><FileText className="h-4 w-4 text-blue-500" />Visa</p>
                            <p className="text-sm text-zinc-600">{recommendations.visa}</p>
                        </CardContent></Card>
                        <Card><CardContent className="p-4 space-y-2">
                            <p className="font-medium text-sm flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-purple-500" />Packing</p>
                            <ul className="space-y-0.5">{(recommendations.packing || []).map((item, i) => (
                                <li key={i} className="text-sm text-zinc-600 flex items-center gap-1.5"><span className="h-1 w-1 bg-zinc-400 rounded-full" />{item}</li>
                            ))}</ul>
                        </CardContent></Card>
                        <Card><CardContent className="p-4 space-y-2">
                            <p className="font-medium text-sm flex items-center gap-1.5"><MapPin className="h-4 w-4 text-green-500" />Hotel Areas</p>
                            <div className="flex flex-wrap gap-1.5">{(recommendations.hotelAreas || []).map((area, i) => (
                                <Badge key={i} variant="secondary">{area}</Badge>
                            ))}</div>
                        </CardContent></Card>
                    </div>
                ) : (
                    <p className="text-sm text-zinc-400">AI recommendations unavailable for this destination.</p>
                )}
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/BookingConfirmation.jsx
git commit -m "feat: add booking confirmation with AI travel recommendations"
```

---

## Task 12: My Bookings page

**Files:** `frontend/src/pages/MyBookings.jsx`

- [ ] **Step 1: Create `frontend/src/pages/MyBookings.jsx`**

```jsx
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plane, Ticket } from 'lucide-react';

function BoardingPassCard({ bookingId }) {
    const [bp, setBp] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/api/v1/booking/${bookingId}/boardingPass`)
            .then(res => setBp(res.data.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [bookingId]);

    if (loading) return <Skeleton className="h-32 w-full" />;
    if (!bp) return <p className="text-zinc-400 text-sm">Unable to load boarding pass.</p>;

    return (
        <div className="bg-zinc-900 text-white rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-zinc-400 text-xs uppercase tracking-wide">Boarding Pass</p>
                    <p className="text-2xl font-bold mt-1">{bp.flight?.departureAirport} → {bp.flight?.arrivalAirport}</p>
                </div>
                <Plane className="h-8 w-8 text-zinc-400" />
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
                <div><p className="text-zinc-400 text-xs">Flight</p><p className="font-medium">{bp.flight?.flightNumber}</p></div>
                <div><p className="text-zinc-400 text-xs">Gate</p><p className="font-medium">{bp.flight?.boardingGate || 'TBA'}</p></div>
                <div><p className="text-zinc-400 text-xs">Departure</p><p className="font-medium">{bp.flight?.departureTime || 'TBA'}</p></div>
            </div>
            <p className="text-xs text-zinc-400">{bp.user?.email}</p>
        </div>
    );
}

const statusColors = {
    booked: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    'in process': 'bg-yellow-100 text-yellow-800',
};

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/v1/booking')
            .then(res => setBookings(res.data.data || []))
            .catch(() => toast.error('Failed to load bookings'))
            .finally(() => setLoading(false));
    }, []);

    const cancel = async (id) => {
        try {
            await api.delete(`/api/v1/booking/${id}`);
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
            toast.success('Booking cancelled');
        } catch {
            toast.error('Failed to cancel booking');
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            <h1 className="text-2xl font-bold">My Bookings</h1>
            {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
            ) : bookings.length === 0 ? (
                <div className="text-center py-16 text-zinc-400">
                    <Ticket className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No bookings yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {bookings.map(booking => (
                        <Card key={booking._id}>
                            <CardContent className="p-5 flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <p className="font-semibold">{booking.flight?.departureAirport} → {booking.flight?.arrivalAirport}</p>
                                    <p className="text-sm text-zinc-500">Flight {booking.flight?.flightNumber} · #{booking.id}</p>
                                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[booking.status] || 'bg-zinc-100 text-zinc-600'}`}>
                                        {booking.status}
                                    </span>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm">Boarding Pass</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader><DialogTitle>Boarding Pass</DialogTitle></DialogHeader>
                                            <BoardingPassCard bookingId={booking.id} />
                                        </DialogContent>
                                    </Dialog>
                                    {booking.status === 'booked' && (
                                        <Button variant="destructive" size="sm" onClick={() => cancel(booking.id)}>Cancel</Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/MyBookings.jsx
git commit -m "feat: add my bookings page with boarding pass dialog"
```

---

## Task 13: AI Assistant full-screen page

**Files:** `frontend/src/pages/AIAssistant.jsx`

- [ ] **Step 1: Create `frontend/src/pages/AIAssistant.jsx`**

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, Sparkles } from 'lucide-react';

const SUGGESTIONS = [
    'Find cheap flights from Lahore to Dubai',
    'What\'s the best time to visit Bangkok?',
    'Flights under $300 to London',
    'Do I need a visa for Turkey?',
];

export default function AIAssistant() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi! I\'m your AI flight assistant powered by Gemini 2.5 Flash. Ask me to find flights or anything about travel.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const send = async (text) => {
        const message = (text || input).trim();
        if (!message || loading) return;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: message }]);
        setLoading(true);
        try {
            const res = await api.post('/api/v1/ai/chat', { message });
            const { type, data } = res.data.data;
            if (type === 'search_intent') {
                const params = new URLSearchParams();
                if (data.departureAirport) params.set('departureAirport', data.departureAirport);
                if (data.arrivalAirport) params.set('arrivalAirport', data.arrivalAirport);
                if (data.maxPrice) params.set('maxPrice', data.maxPrice);
                const href = `/flights?${params.toString()}`;
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `Searching flights from ${data.departureAirport || 'anywhere'} to ${data.arrivalAirport || 'anywhere'}${data.maxPrice ? ` under $${data.maxPrice}` : ''}.`,
                    action: { label: 'View Results', href },
                }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: data }]);
            }
        } catch {
            toast.error('AI assistant unavailable');
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I\'m unavailable right now.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center">
                    <Bot className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="font-bold text-lg">AI Flight Assistant</h1>
                    <p className="text-sm text-zinc-500">Powered by Gemini 2.5 Flash</p>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-[85%] space-y-2">
                            <div className={`rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-zinc-900 text-white rounded-br-sm' : 'bg-white border rounded-bl-sm'}`}>
                                {msg.content}
                            </div>
                            {msg.action && (
                                <Button size="sm" onClick={() => navigate(msg.action.href)}>{msg.action.label}</Button>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-zinc-400">Thinking...</div>
                    </div>
                )}
            </div>
            {messages.length === 1 && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                    {SUGGESTIONS.map(s => (
                        <button key={s} onClick={() => send(s)} className="text-left text-xs bg-white border rounded-lg p-3 hover:bg-zinc-50 transition-colors flex items-center gap-1.5 text-zinc-600">
                            <Sparkles className="h-3 w-3 shrink-0 text-zinc-400" />{s}
                        </button>
                    ))}
                </div>
            )}
            <div className="flex gap-2 border-t pt-4">
                <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask about flights or travel..." disabled={loading} className="flex-1" />
                <Button size="icon" onClick={() => send()} disabled={loading || !input.trim()}><Send className="h-4 w-4" /></Button>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/AIAssistant.jsx
git commit -m "feat: add AI assistant full-screen page"
```

---

## Task 14: Create GitHub repo and push

- [ ] **Step 1: Check gh CLI auth**

```bash
gh auth status
```

Expected: shows your logged-in GitHub username. If not authenticated: run `gh auth login` and follow prompts.

- [ ] **Step 2: Create README.md**

Create `/Users/usmanarshad/Air-Ticket-Booking-API-Node/README.md`:

```markdown
# SkyBook — AI-Powered Air Ticket Booking

Full-stack flight booking app with Google Gemini 2.5 Flash AI features.

## Features
- Flight search with airport, price, and sort filters
- Booking management with boarding passes
- Flight reviews
- **AI Smart Assistant** — natural language flight search ("find cheap flights from Karachi to Dubai")
- **AI Pricing Insights** — real-time "Book Now / Good Deal / Wait" badges on search results
- **AI Travel Recommendations** — weather, visa, packing, and hotel tips after booking

## Stack
| Layer | Tech |
|---|---|
| Backend | Node.js, Express, MongoDB, Mongoose, JWT |
| AI | Google Gemini 2.5 Flash |
| Frontend | React 18, Vite, shadcn/ui, Tailwind CSS |

## Setup

1. Clone: `git clone https://github.com/<your-username>/air-ticket-booking`
2. Copy `backend/.env.example` → `backend/.env` and fill in your values
3. `npm install` at repo root
4. `npm run dev` — starts both backend (port 5000) and frontend (port 5173)

## Environment Variables (`backend/.env`)
```
MONGO_URI=mongodb://localhost:27017/air-ticket-booking
JWT_SECRET=your_secret
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```
```

- [ ] **Step 3: Commit README**

```bash
git add README.md
git commit -m "docs: add README"
```

- [ ] **Step 4: Create GitHub repo**

```bash
gh repo create air-ticket-booking --public --description "Full-stack AI-powered flight booking app — React, Node.js, MongoDB, Gemini 2.5 Flash"
```

- [ ] **Step 5: Set remote and push**

```bash
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/$(gh api user --jq .login)/air-ticket-booking.git
git push -u origin master
```

Expected: all commits pushed. Repo URL printed by gh.

---

*Plan complete. 14 tasks, ~60 steps. All code is production-ready and self-contained.*
