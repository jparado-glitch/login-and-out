import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background text-center">
      <div className="max-w-md space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to My App
        </h1>
        <p className="text-muted-foreground">
          Mag-log in sa iyong account o gumawa ng bago para makapagsimula.
        </p>
        
        <div className="flex justify-center gap-4 pt-2">
          <Link href="/login" className={buttonVariants()}>
            Login
          </Link>
          <Link href="/register" className={buttonVariants({ variant: 'outline' })}>
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}