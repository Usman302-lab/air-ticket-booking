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
                                        <DialogTrigger render={<Button variant="outline" size="sm" />}>Boarding Pass</DialogTrigger>
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
