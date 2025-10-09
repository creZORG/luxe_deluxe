
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { ArrowRight, Gift, Users, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    icon: Gift,
    title: 'Sign Up & Earn',
    description: 'Create an account and instantly receive STRAD Points as a welcome gift.',
  },
  {
    icon: Users,
    title: 'Refer Your Friends',
    description: 'Share your unique referral link. You\'ll get points for every friend who signs up and verifies their email.',
  },
  {
    icon: ShoppingBag,
    title: 'Shop Your Favorites',
    description: 'Every purchase you make earns you more STRAD Points, bringing you closer to exclusive rewards.',
  },
];

export default function TradCampaignPage() {
    const { user } = useAuth();

    return (
        <div className="bg-background text-foreground">
            <div className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="text-center animate-fade-in-up">
                    <p className="font-semibold text-primary">A Partnership for the Future</p>
                    <h1 className="mt-2 font-headline text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                        Earn STRAD Points, Get Ready for $trad.
                    </h1>
                    <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground">
                        Luna has partnered with <a href="https://tradinta.co.ke" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">Tradinta</a> to reward our community. Your STRAD Points, earned from signups, referrals, and purchases, will be eligible for the upcoming $trad crypto airdrop.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Button asChild size="lg">
                            <Link href={user ? '/profile' : '/signup'}>
                                {user ? 'View My Points' : 'Sign Up & Earn Now'}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                         <Button asChild size="lg" variant="outline">
                            <a href="https://trad.co.ke" target="_blank" rel="noopener noreferrer">
                                Learn about $trad
                            </a>
                        </Button>
                    </div>
                </div>

                {/* How it Works Section */}
                <div className="mt-24">
                    <div className="text-center">
                        <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            How to Earn Points
                        </h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                           It's simple. The more you engage, the more you earn.
                        </p>
                    </div>

                    <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
                        {steps.map((step, index) => (
                            <Card key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 200}ms` }}>
                                <CardHeader className="items-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <step.icon className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="mt-4">{step.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{step.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
