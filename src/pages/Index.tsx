import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import FeatureCards from '@/components/FeatureCards';

const Index = () => {
  return (
    <>
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

        {/* New About Section */}
        <section className="py-8 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-xl md:text-2xl text-foreground mb-6">
              A Traveler's Heart
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              "With a bamboo staff and light straw sandals, through mist and rain, I walk life's journeys—again and again.<br />
              I'm a traveler myself, and I built this little tool to help you explore with ease.<br />
              See you down the road!"
            </p>
          </div>
        </section>
      </main>
    </>
  );
};

export default Index;
