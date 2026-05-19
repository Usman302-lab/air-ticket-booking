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
