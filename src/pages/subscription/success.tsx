import { useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SubscriptionSuccess() {
  return (
    <Layout>
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
            <span className="text-5xl">🌸</span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-foreground">Welcome to Pro!</h1>
          <p className="text-lg text-muted-foreground">
            Your subscription was successful. You now have full access to all of Pansy's premium insights!
          </p>
          <Button asChild className="w-full h-12 text-lg rounded-xl mt-8">
            <Link href="/home">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}