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
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm unavailable right now." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={(isOpen) => onOpenChange(isOpen)}>
            <SheetContent className="flex flex-col w-full sm:max-w-md p-0" showCloseButton={true}>
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
