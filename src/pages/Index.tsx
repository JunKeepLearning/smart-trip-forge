import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import TheHeader from '@/components/TheHeader';
import TheFooter from '@/components/TheFooter';
import FeatureCards from '@/components/FeatureCards';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TheHeader />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              AI Smart Journey Planning Assistant
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Simply enter the city and number of days to plan your custom journey
            </p>
          </div>
          
          <Button 
            asChild 
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-3"
          >
            <Link to="/plan">
              🚀 Start Planning
            </Link>
          </Button>
        </div>
        
        <FeatureCards />
      </main>

      <TheFooter />
    </div>
  );
};

export default Index;
