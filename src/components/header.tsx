
'use client';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { getFirestore, doc } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';

type HeaderProps = {
  isLoggedIn?: boolean;
}

export function Header({ isLoggedIn = false }: HeaderProps) {
  const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar-1');
  const { user, isUserLoading } = useUser();
  const db = getFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  const isLoading = isUserLoading || isProfileLoading;
  
  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-4">
          {isLoggedIn ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/home#journal">Journal</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-offset-2 ring-offset-background ring-transparent group-hover:ring-primary transition-all">
                    {isLoading ? <Skeleton className="h-9 w-9 rounded-full" /> : (
                      <>
                        {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={userProfile?.name || 'User'} data-ai-hint={userAvatar.imageHint} />}
                        <AvatarFallback>{userProfile?.name?.charAt(0) || 'U'}</AvatarFallback>
                      </>
                    )}
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {isLoading ? <div className="p-2"><Skeleton className="h-5 w-3/4" /></div> : <DropdownMenuLabel>{userProfile?.name || 'My Account'}</DropdownMenuLabel>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href="#">Profile</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/dashboard">Dashboard</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href="/">Logout</Link></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
