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
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Register() {
    const navigate = useNavigate();
    const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

    const onSubmit = async (values) => {
        try {
            await api.post('/auth/signup', values);
            toast.success('Account created! Please sign in.');
            navigate('/login');
        } catch {
            toast.error('Registration failed. Email may already be in use.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Create account</CardTitle>
                    <CardDescription>Get started with flight booking</CardDescription>
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
                                {form.formState.isSubmitting ? 'Creating account...' : 'Create account'}
                            </Button>
                        </form>
                    </Form>
                    <p className="mt-4 text-center text-sm text-zinc-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-zinc-900 underline underline-offset-2">Sign in</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
