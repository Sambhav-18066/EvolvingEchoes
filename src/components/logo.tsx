import { Waves } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="p-2 bg-secondary rounded-full group-hover:bg-primary/20 transition-colors">
        <Waves className="h-5 w-5 text-primary" />
      </div>
      <span className="text-xl font-bold tracking-tight text-foreground">
        Evolving Echoes
      </span>
    </Link>
  );
}
