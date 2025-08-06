// src/components/TheFooter.tsx

import React from 'react';
import { Link } from 'react-router-dom';

export default function TheFooter() {
  return (
    // Footer container with responsive visibility
    // - `hidden`: Hidden by default (on mobile screens)
    // - `lg:flex`: Becomes a flex container on large screens (1024px) and up
    <footer className="hidden lg:flex border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto py-4">
        <div className="flex justify-between items-center">
          {/* Copyright notice */}
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} smart-trip-forge. All rights reserved.
          </p>
          {/* Footer links */}
          <div className="flex items-center space-x-6 text-sm">
            <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
              About Us
            </Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
