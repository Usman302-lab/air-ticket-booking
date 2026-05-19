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
