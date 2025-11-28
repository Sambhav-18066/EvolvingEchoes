
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { MailCheck } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // This function is no longer needed as we direct the user to log in.
  // The login page will handle the check.

  const handleProceedToLogin = () => {
    router.push('/login');
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
          <Button onClick={handleProceedToLogin}>Proceed to Log In</Button>
          <div className="text-sm text-muted-foreground">
            {/* The resend functionality is not straightforward without a signed-in user,
                so we will guide them to try logging in, which can also trigger a resend flow.
            */}
            Didn't receive the email? Check your spam folder or try signing in again to resend.
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
