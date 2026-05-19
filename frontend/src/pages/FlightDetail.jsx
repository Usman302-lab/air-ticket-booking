import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { Card, CardContent } from '@/components/ui/card';
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
            const res = await api.post('/api/v1/booking', { flight: flight._id });
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
