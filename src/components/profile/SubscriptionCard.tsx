// src/components/profile/SubscriptionCard.tsx
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function SubscriptionCard() {
  const subscription = {
    planName: 'Basic Plan',
    usageLeft: 17,
    totalUsage: 50,
  };

  const usagePercentage = (subscription.usageLeft / subscription.totalUsage) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>Your current plan and usage details.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Current Plan</span>
          <span className="font-semibold">{subscription.planName}</span>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2 text-sm">
            <span className="text-muted-foreground">Remaining AI Plans</span>
            <span className="font-semibold">{subscription.usageLeft} / {subscription.totalUsage}</span>
          </div>
          <Progress value={usagePercentage} aria-label={`${usagePercentage}% used`} />
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link to="/pricing">Upgrade Plan</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}