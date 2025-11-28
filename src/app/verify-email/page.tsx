'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { sendEmailVerification } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { MailCheck } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleResendEmail = async () => {
    if (auth && auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        toast({
          title: 'Verification Email Sent',
          description: `A new verification email has been sent to ${email}.`,
        });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Failed to Resend Email',
          description: error.message,
        });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No active user session found. Please try signing up again.',
      });
    }
  };

  const checkEmailVerified = async () => {
    if (auth && auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
            router.push('/home');
        } else {
            toast({
                title: "Email Not Verified",
                description: "Please check your inbox and click the verification link.",
            });
        }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="absolute top-8">
        <Logo />
      </div>
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <MailCheck className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to <strong>{email}</strong>. Please check your inbox and click the link to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm text-muted-foreground">
            Once you've verified, you can log in to your account.
          </p>
          <Button onClick={checkEmailVerified}>I've Verified My Email</Button>
          <div className="text-sm text-muted-foreground">
            Didn't receive the email?{' '}
            <Button variant="link" className="p-0 h-auto" onClick={handleResendEmail}>
              Resend verification email
            </Button>
          </div>
        </CardContent>
        <CardFooter>
           <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">Back to Log In</Button>
           </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
