// src/components/profile/HelpCenterCard.tsx

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, LifeBuoy, MessageSquare, BookOpen, Info } from 'lucide-react';

export function HelpCenterCard() {
  const helpItems = [
    { icon: <BookOpen className="h-5 w-5" />, text: 'User Guide' },
    { icon: <LifeBuoy className="h-5 w-5" />, text: 'Frequently Asked Questions' },
    { icon: <MessageSquare className="h-5 w-5" />, text: 'Contact Support' },
    { icon: <Info className="h-5 w-5" />, text: 'About Us' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Help Center</CardTitle>
        <CardDescription>Need help? Find your answers here.</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {helpItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full flex justify-between items-center p-4 h-auto text-left"
            >
              <div className="flex items-center space-x-4">
                {item.icon}
                <span className="font-medium">{item.text}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}