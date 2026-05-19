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
                    <div>
                        <Button size="sm" render={<Link to={`/flights/${flight.flightNumber}`} />}>View</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
