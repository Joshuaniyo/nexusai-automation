'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Mail, Lock, User, ArrowLeft, Loader2, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { getBaseUrl, getEmailRedirectUrl } from '@/lib/env';

function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const signup = searchParams.get('signup') === 'true';
  const redirect = searchParams.get('redirect') || '/dashboard';
  const errorParam = searchParams.get('error');

  const [tab, setTab] = useState<'signin' | 'signup'>(signup ? 'signup' : 'signin');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Show error from OAuth callback if any
  useEffect(() => {
    if (errorParam) {
      toast.error('Authentication failed. Please try again.');
    }
  }, [errorParam]);

  // Check for OAuth callback on mount
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        toast.success('Welcome!');
        router.refresh();
        router.push(redirect);
      }
    };
    handleOAuthCallback();
  }, [router, redirect]);

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    try {
      const baseUrl = getBaseUrl();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${baseUrl}/auth/callback?next=${encodeURIComponent(redirect)}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) {
        toast.error(error.message);
        setGoogleLoading(false);
      }
    } catch (err) {
      toast.error('Failed to sign in with Google');
      setGoogleLoading(false);
    }
  }

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        toast.success('Welcome back!');
        router.refresh();
        router.push(redirect);
      }
    } catch (err) {
      toast.error('Sign in failed. Please try again.');
    }
    setLoading(false);
  }

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, tier: 'free' },
          emailRedirectTo: getEmailRedirectUrl('/auth'),
        },
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        toast.success('Account created! Redirecting...');
        router.refresh();
        router.push(redirect);
      }
    } catch (err) {
      toast.error('Sign up failed. Please try again.');
    }
    setLoading(false);
  }

  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: getEmailRedirectUrl('/auth'),
    });
    if (error) {
      toast.error(error.message);
    } else {
      setResetSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    }
    setLoading(false);
  }

  if (resetMode) {
    return (
      <Card className="bg-[hsl(220,16%,9%)] border-[hsl(220,14%,16%)]">
        <CardHeader className="text-center">
          <CardTitle className="text-white text-2xl">{resetSent ? 'Check Your Email' : 'Reset Password'}</CardTitle>
          <CardDescription className="text-[hsl(215,16%,60%)]">
            {resetSent
              ? 'We sent you a password reset link.'
              : 'Enter your email and we\'ll send you a reset link.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!resetSent ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-white">Email</Label>
                <Input
                  id="reset-email"
                  name="email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="bg-[hsl(220,14%,12%)] border-[hsl(220,14%,20%)] text-white placeholder:text-[hsl(215,16%,40%)]"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-cyan-400 hover:bg-cyan-500 text-[hsl(220,16%,6%)] font-medium">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
              </Button>
              <Button type="button" variant="link" onClick={() => setResetMode(false)} className="w-full text-[hsl(215,16%,60%)]">
                Back to Sign In
              </Button>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-[hsl(215,16%,60%)] mb-4">
                Follow the link in your email to reset your password.
              </p>
              <Button variant="link" onClick={() => { setResetMode(false); setResetSent(false); }} className="text-cyan-400">
                Back to Sign In
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Google Sign-In Button */}
      <Button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 border border-gray-200 flex items-center justify-center gap-3"
      >
        {googleLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Chrome className="w-5 h-5" />
            Continue with Google
          </>
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[hsl(220,14%,16%)]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[hsl(220,16%,6%] px-2 text-[hsl(215,16%,47%)]">
            Or continue with email
          </span>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'signin' | 'signup')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-[hsl(220,14%,12%)] border border-[hsl(220,14%,16%)] rounded-lg p-1">
          <TabsTrigger value="signin" className="data-[state=active]:bg-cyan-400 data-[state=active]:text-[hsl(220,16%,6%)] text-[hsl(215,16%,60%)]">Sign In</TabsTrigger>
          <TabsTrigger value="signup" className="data-[state=active]:bg-cyan-400 data-[state=active]:text-[hsl(220,16%,6%)] text-[hsl(215,16%,60%)]">Sign Up</TabsTrigger>
        </TabsList>

        <TabsContent value="signin">
          <Card className="bg-[hsl(220,16%,9%)] border-[hsl(220,14%,16%)] mt-4">
            <CardHeader>
              <CardTitle className="text-white text-xl">Welcome back</CardTitle>
              <CardDescription className="text-[hsl(215,16%,60%)]">
                Sign in to access your dashboard and generated content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(215,16%,40%)]" />
                    <Input id="email" name="email" type="email" placeholder="you@example.com" required
                      autoComplete="email"
                      className="pl-10 bg-[hsl(220,14%,12%)] border-[hsl(220,14%,20%)] text-white placeholder:text-[hsl(215,16%,40%)]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(215,16%,40%)]" />
                    <Input id="password" name="password" type="password" placeholder="Your password" required
                      autoComplete="current-password"
                      className="pl-10 bg-[hsl(220,14%,12%)] border-[hsl(220,14%,20%)] text-white placeholder:text-[hsl(215,16%,40%)]" />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-cyan-400 hover:bg-cyan-500 text-[hsl(220,16%,6%)] font-medium py-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                </Button>
                <Button type="button" variant="link" onClick={() => setResetMode(true)} className="w-full text-[hsl(215,16%,60%)] text-sm">
                  Forgot your password?
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signup">
          <Card className="bg-[hsl(220,16%,9%)] border-[hsl(220,14%,16%)] mt-4">
            <CardHeader>
              <CardTitle className="text-white text-xl">Create your account</CardTitle>
              <CardDescription className="text-[hsl(215,16%,60%)]">
                Start your free trial. No credit card required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-white">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(215,16%,40%)]" />
                    <Input id="signup-name" name="name" type="text" placeholder="Your name" required
                      autoComplete="name"
                      maxLength={100}
                      className="pl-10 bg-[hsl(220,14%,12%)] border-[hsl(220,14%,20%)] text-white placeholder:text-[hsl(215,16%,40%)]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-white">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(215,16%,40%)]" />
                    <Input id="signup-email" name="email" type="email" placeholder="you@example.com" required
                      autoComplete="email"
                      maxLength={255}
                      className="pl-10 bg-[hsl(220,14%,12%)] border-[hsl(220,14%,20%)] text-white placeholder:text-[hsl(215,16%,40%)]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-white">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(215,16%,40%)]" />
                    <Input id="signup-password" name="password" type="password" placeholder="Create a password (min 6 characters)" required minLength={6}
                      autoComplete="new-password"
                      maxLength={128}
                      className="pl-10 bg-[hsl(220,14%,12%)] border-[hsl(220,14%,20%)] text-white placeholder:text-[hsl(215,16%,40%)]" />
                  </div>
                </div>
                <p className="text-xs text-[hsl(215,16%,50%)]">
                  By creating an account, you agree to our{' '}
                  <Link href="/terms" className="text-cyan-400 hover:underline">Terms of Service</Link> and{' '}
                  <Link href="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</Link>.
                </p>
                <Button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Free Account'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-[hsl(220,16%,6%)] flex flex-col">
      <header className="border-b border-[hsl(220,14%,16%)] bg-[hsl(220,16%,8%)]">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[hsl(220,16%,6%)]" />
            </div>
            <span className="text-lg font-semibold text-white">NexusAI</span>
          </Link>
          <Button variant="ghost" asChild className="text-[hsl(215,16%,65%)]">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Welcome to NexusAI
            </h1>
            <p className="text-[hsl(215,16%,60%)]">
              Sign in or create an account to access the dashboard.
            </p>
          </div>
          <Suspense fallback={<div className="text-center text-[hsl(215,16%,60%)]">Loading...</div>}>
            <AuthForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
