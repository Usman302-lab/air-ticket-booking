import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, Sparkles } from 'lucide-react';

const SUGGESTIONS = [
    "Find cheap flights from Lahore to Dubai",
    "What's the best time to visit Bangkok?",
    "Flights under $300 to London",
    "Do I need a visa for Turkey?",
];

export default function AIAssistant() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm your AI flight assistant powered by Gemini 2.5 Flash. Ask me to find flights or anything about travel." }
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
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm unavailable right now." }]);
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
