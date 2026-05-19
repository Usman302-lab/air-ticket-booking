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
