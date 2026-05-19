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
