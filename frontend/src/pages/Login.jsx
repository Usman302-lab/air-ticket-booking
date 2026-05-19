import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const schema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
});

export default function Login() {
    const navigate = useNavigate();
    const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

    const onSubmit = async (values) => {
        try {
            const res = await api.post('/auth/login', values);
            localStorage.setItem('token', res.data.token);
            navigate('/flights');
        } catch {
            toast.error('Invalid email or password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Sign in</CardTitle>
                    <CardDescription>Enter your credentials to continue</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="password" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </form>
                    </Form>
                    <p className="mt-4 text-center text-sm text-zinc-500">
                        No account?{' '}
                        <Link to="/register" className="text-zinc-900 underline underline-offset-2">Sign up</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
