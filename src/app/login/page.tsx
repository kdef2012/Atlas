
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser, initiateEmailSignUp, initiateEmailSignIn } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

enum AuthMode {
  SignIn = 'Sign In',
  SignUp = 'Sign Up',
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>(AuthMode.SignIn);
  const { toast } = useToast();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (authMode === AuthMode.SignUp) {
        await createUserWithEmailAndPassword(auth, values.email, values.password);
        toast({
          title: 'Account Created',
          description: 'Welcome to ATLAS! You can now proceed with onboarding.',
        });
      } else {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        toast({
          title: 'Welcome Back!',
          description: 'You have successfully signed in.',
        });
      }
      // onAuthStateChanged will redirect the user from the AppLayout
    } catch (error: any) {
      let description = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'This email is already in use. Try signing in instead.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        description = 'Invalid email or password. Please try again.';
      }
       else if (error.code === 'auth/invalid-credential') {
        description = 'Invalid email or password. Please try again.';
      }
      toast({
        variant: 'destructive',
        title: `${authMode} Failed`,
        description,
      });
      setIsLoading(false);
    }
  }
  
  if (isUserLoading || user) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Welcome to ATLAS</CardTitle>
          <CardDescription>
            {authMode === AuthMode.SignIn ? 'Sign in to continue your journey.' : 'Create an account to begin your journey.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
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
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full font-bold">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {authMode}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            {authMode === AuthMode.SignIn ? (
              <>
                Don't have an account?{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => setAuthMode(AuthMode.SignUp)}>
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => setAuthMode(AuthMode.SignIn)}>
                  Sign In
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
