import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import TheHeader from "@/components/layout/TheHeader";
import TheFooter from "@/components/layout/TheFooter";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TheHeader />
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-8xl font-extrabold text-primary">404</h1>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Oops! Page Not Found</h2>
            <p className="text-muted-foreground">
              Sorry, the page you are looking for does not exist or has been moved.
            </p>
          </div>
          <Button asChild>
            <Link to="/">Return to Homepage</Link>
          </Button>
        </div>
      </main>
      <TheFooter />
    </div>
  );
};

export default NotFound;
