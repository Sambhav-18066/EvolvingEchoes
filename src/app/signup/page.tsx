
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser, setDocumentNonBlocking } from "@/firebase";
import { doc, getFirestore } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, User, sendEmailVerification, signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 48 48" {...props}>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.618-3.226-11.283-7.582l-6.571 4.819C9.219 40.093 16.162 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.153 44 30.024 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );

export default function SignupPage() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const auth = useAuth();
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const db = getFirestore();

    useEffect(() => {
        if (!isUserLoading && user) {
            router.push("/home");
        }
    }, [user, isUserLoading, router]);

    const createUserProfile = (user: User) => {
        if (!db) return;
        const userRef = doc(db, 'users', user.uid);
        const userData = {
            id: user.uid,
            name: fullName || user.displayName,
            email: user.email,
            phoneNumber: user.phoneNumber,
        };
        setDocumentNonBlocking(userRef, userData, { merge: true });
    }

    const signUpWithGoogle = async () => {
        if (!auth) return;
        const provider = new GoogleAuthProvider();
        try {
          const result = await signInWithPopup(auth, provider);
          createUserProfile(result.user);
          // useEffect will handle the redirect to /home since Google users are always verified
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Google Sign-Up Failed",
            description: error.message,
          });
        }
    };
    
    const validatePassword = (password: string) => {
        const errors = [];
        if (password.length < 8) {
            errors.push("at least 8 characters");
        }
        if (!/(?=.*[a-z])/.test(password)) {
            errors.push("a lowercase character");
        }
        if (!/(?=.*[A-Z])/.test(password)) {
            errors.push("an uppercase character");
        }
        if (!/(?=.*\d)/.test(password)) {
            errors.push("a numeric character");
        }
        if (!/(?=.*[\W_])/.test(password)) {
            errors.push("a special character");
        }

        if (errors.length > 0) {
            setPasswordError(`Password must contain ${errors.join(', ')}.`);
            return false;
        }
        
        setPasswordError(null);
        return true;
    }

    const handleEmailSignUp = async () => {
        if (!auth) return;
        if (!validatePassword(password)) return;

        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(result.user);
            createUserProfile(result.user);
            
            // Sign the user out immediately so they have to log in after verifying
            await signOut(auth);
            
            router.push(`/verify-email?email=${email}`);

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Sign-Up Failed",
                description: error.message,
            });
        }
    };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
        <div className="absolute top-8">
            <Logo />
        </div>
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>Start your journey of self-discovery today.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <Button variant="outline" className="w-full" onClick={signUpWithGoogle}>
                    <GoogleIcon className="mr-2 h-4 w-4" />
                    Sign up with Google
                </Button>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input id="full-name" placeholder="Your Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required value={password} onChange={(e) => {
                        setPassword(e.target.value);
                        if (e.target.value) {
                            validatePassword(e.target.value);
                        } else {
                            setPasswordError(null);
                        }
                    }} />
                </div>

                {passwordError && (
                    <Alert variant="destructive">
                        <AlertDescription>
                            {passwordError}
                        </AlertDescription>
                    </Alert>
                )}

                <Button onClick={handleEmailSignUp} className="w-full mt-2">Sign Up</Button>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <div className="text-center text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="underline">
                    Log in
                    </Link>
                </div>
            </CardFooter>
        </Card>
    </div>
  );
}
