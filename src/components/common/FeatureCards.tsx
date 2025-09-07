
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const FeatureCards = () => {
  const features = [
    {
      title: 'Popular Destinations',
      description: 'Discover amazing places around the world',
      items: ['Beijing', 'Xi\'an', 'Shanghai'],
      keywords: ['History', 'Culture', 'Heritage'],
      href: '/explore'
    },
    {
      title: 'Recommended Routes',
      description: 'Carefully curated travel itineraries',
      items: ['3-Day In-Depth Tour', 'City Roaming', 'Family-Friendly Route'],
      keywords: ['Classic', 'Efficient', 'Family-Friendly'],
      href: '/explore'
    },
    {
      title: 'Smart Packing Checklist',
      description: 'Generate a personalized packing list for your trip',
      items: [],
      keywords: ['AI Customized', 'Packing Assistant', 'Travel Essentials'],
      href: '/explore'
    }
  ];

  return (
    // Use flexbox for the container on medium screens and up to ensure equal height cards
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
      {features.map((feature, index) => (
        // Add flex and flex-col to make the card a flex container itself
        <Card key={index} className="bg-muted border-border hover:shadow-md transition-shadow duration-200 flex flex-col">
          <CardHeader>
            <CardTitle className="text-foreground">{feature.title}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {feature.description}
            </CardDescription>
          </CardHeader>
          {/* Add flex-grow to make this content area expand and push the footer down */}
          <CardContent className="space-y-4 flex-grow">
            {feature.items.length > 0 && (
              <div className="space-y-2">
                {feature.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="text-sm text-foreground">
                    {item}
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              {feature.keywords.map((keyword, keywordIndex) => (
                <span
                  key={keywordIndex}
                  className="inline-block px-2 py-1 text-xs bg-background text-muted-foreground rounded-md border border-border"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </CardContent>

          {/* This part is now effectively the footer of the card content */}
          <div className="p-6 pt-0">
            <div className="flex justify-end">
              <Button 
                asChild 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Link to={feature.href} className="flex items-center space-x-1">
                  <span>More</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default FeatureCards;