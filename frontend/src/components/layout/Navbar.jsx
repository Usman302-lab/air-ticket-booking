import { Link, useNavigate } from 'react-router-dom';
import { Plane, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function Navbar() {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('token');

    const logout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <header className="border-b bg-white sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 font-bold text-lg">
                    <Plane className="h-5 w-5" /> SkyBook
                </Link>
                <nav className="hidden md:flex items-center gap-6 text-sm">
                    {isLoggedIn && (
                        <>
                            <Link to="/flights" className="text-zinc-600 hover:text-zinc-900 transition-colors">Flights</Link>
                            <Link to="/my-bookings" className="text-zinc-600 hover:text-zinc-900 transition-colors">My Bookings</Link>
                            <Link to="/ai-assistant" className="text-zinc-600 hover:text-zinc-900 transition-colors">AI Assistant</Link>
                        </>
                    )}
                </nav>
                <div className="flex items-center gap-2">
                    {isLoggedIn ? (
                        <Button variant="outline" size="sm" onClick={logout}>Sign out</Button>
                    ) : (
                        <>
                            <Link to="/login" className="inline-flex items-center justify-center rounded-lg text-sm font-medium px-2.5 h-7 hover:bg-muted transition-colors">Sign in</Link>
                            <Button size="sm" nativeButton={false} render={<Link to="/register" />}>Get started</Button>
                        </>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
                            <Menu className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {isLoggedIn ? (
                                <>
                                    <DropdownMenuItem><Link to="/flights" className="w-full">Flights</Link></DropdownMenuItem>
                                    <DropdownMenuItem><Link to="/my-bookings" className="w-full">My Bookings</Link></DropdownMenuItem>
                                    <DropdownMenuItem><Link to="/ai-assistant" className="w-full">AI Assistant</Link></DropdownMenuItem>
                                    <DropdownMenuItem onClick={logout}>Sign out</DropdownMenuItem>
                                </>
                            ) : (
                                <>
                                    <DropdownMenuItem><Link to="/login" className="w-full">Sign in</Link></DropdownMenuItem>
                                    <DropdownMenuItem><Link to="/register" className="w-full">Sign up</Link></DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
