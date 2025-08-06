// src/pages/PricingPage.tsx

import React from 'react';
import TheHeader from '@/components/TheHeader';
import TheFooter from '@/components/TheFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils'; // Helper for conditional classes

// Mock data for pricing plans
const pricingPlans = [
  {
    name: 'Basic',
    price: 'Free',
    description: 'For individuals getting started with trip planning.',
    features: [
      '5 AI-powered trip plans per month',
      'Basic destination search',
      'Save up to 3 checklists',
    ],
    isCurrent: true, // Assume the user is currently on this plan
  },
  {
    name: 'Pro',
    price: '$9.99',
    pricePeriod: '/ month',
    description: 'For frequent travelers who need more power.',
    features: [
      'Unlimited AI-powered trip plans',
      'Advanced destination filtering',
      'Unlimited checklists',
      'Real-time flight price tracking',
      'Priority support',
    ],
    isMostPopular: true,
  },
  {
    name: 'Business',
    price: '$29.99',
    pricePeriod: '/ month',
    description: 'For travel agents and teams.',
    features: [
      'All features from Pro',
      'Collaborative planning tools',
      'Client management dashboard',
      'Custom branding',
      'Dedicated account manager',
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50 dark:bg-background">
      <TheHeader />

      <main className="flex-grow container mx-auto py-12 px-4">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Choose Your Perfect Plan</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock powerful features and plan unlimited adventures. Choose the plan that fits your needs.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan) => (
            <Card 
              key={plan.name}
              className={cn(
                'flex flex-col', // Ensure cards have equal height
                plan.isMostPopular && 'border-primary border-2 relative' // Highlight most popular plan
              )}
            >
              {plan.isMostPopular && (
                <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
                </div>
              )}
              <CardHeader className="pt-10">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-6">
                {/* Price */}
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.pricePeriod && <span className="text-muted-foreground ml-1">{plan.pricePeriod}</span>}
                </div>
                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  disabled={plan.isCurrent}
                  variant={plan.isMostPopular ? 'default' : 'outline'}
                >
                  {plan.isCurrent ? 'Your Current Plan' : `Upgrade to ${plan.name}`}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      <TheFooter />
    </div>
  );
}
