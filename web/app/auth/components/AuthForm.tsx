'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

type FormMode = 'signin' | 'signup';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export default function AuthForm() {
  const [mode, setMode] = useState<FormMode>('signin');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    form.reset();
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(values.email, values.password);
      } else {
        const { error, data } = await signUp(values.email, values.password);
        
        if (!error && data) {
          toast.success(`Success! Please check your email (${values.email}) to confirm your account before signing in.`);
          setMode('signin');
          form.reset();
        }
      }
    } catch (err: Error | unknown) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>
      </Form>
      
      <div className="text-center text-sm">
        <Button variant="link" onClick={toggleMode}>
          {mode === 'signin'
            ? "Don't have an account? Sign Up"
            : 'Already have an account? Sign In'}
        </Button>
      </div>
    </div>
  );
} 