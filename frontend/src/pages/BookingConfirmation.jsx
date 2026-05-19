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
            .catch(() => { toast.error('Failed to load booking'); setLoadingBooking(false); setLoadingRecs(false); })
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
                <Button render={<Link to="/my-bookings" />} variant="outline" className="flex-1">All Bookings</Button>
                <Button render={<Link to="/flights" />} className="flex-1">Search More</Button>
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
