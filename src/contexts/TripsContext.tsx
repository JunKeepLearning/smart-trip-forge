import React, { createContext, useContext, useState, ReactNode } from 'react';
import { format } from 'date-fns';

// Data structures for the itinerary
export interface ItineraryItem {
  id: string;
  time?: string;
  type: 'attraction' | 'restaurant' | 'hotel' | 'custom';
  name: string;
  notes?: string;
}

export interface DayPlan {
  id: string;
  day: number;
  date: string;
  title: string;
  items: ItineraryItem[];
}

// Data structure for a collaborator
export interface Collaborator {
  id: string;
  name: string;
  avatarUrl: string;
}

// Type definition for a single trip
export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string; // Stored as ISO string yyyy-MM-dd
  endDate: string;   // Stored as ISO string yyyy-MM-dd
  description: string;
  status: "Not Started" | "In Progress" | "Completed";
  thumbnail?: string;
  createdAt: string; // Stored as ISO string yyyy-MM-dd
  itinerary?: DayPlan[]; // Optional itinerary array
  collaborators?: Collaborator[]; // Optional collaborators array
}

// Mock Data - Centralized here
const mockTrips: Trip[] = [
  {
    id: "1",
    name: "Beijing Cultural Journey",
    destination: "Beijing, China",
    startDate: "2024-03-15",
    endDate: "2024-03-20", // 6 days
    description: "6-day exploration of historic Beijing",
    status: "In Progress",
    createdAt: "2024-02-10",
    itinerary: [
      { id: 'd1', day: 1, date: '2024-03-15', title: 'Arrival and Temple of Heaven', items: [{id: 'i1', name: 'Temple of Heaven', type: 'attraction'}] },
      { id: 'd2', day: 2, date: '2024-03-16', title: 'Great Wall and Ming Tombs', items: [{id: 'i2', name: 'Great Wall at Mutianyu', type: 'attraction'}, {id: 'i3', name: 'Ming Tombs', type: 'attraction'}] },
    ],
    collaborators: [
      { id: 'u1', name: 'Alice', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
      { id: 'u2', name: 'Bob', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705d' },
    ]
  },
  {
    id: "2",
    name: "Shanghai Modern Adventure",
    destination: "Shanghai, China",
    startDate: "2024-04-10",
    endDate: "2024-04-14", // 5 days
    description: "5-day modern city experience",
    status: "Not Started",
    createdAt: "2024-02-15",
    itinerary: [
      { id: 'd3', day: 1, date: '2024-04-10', title: 'The Bund', items: [{id: 'i4', name: 'The Bund', type: 'attraction'}] }
    ],
    collaborators: [
      { id: 'u3', name: 'Charlie', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026706d' },
    ]
  },
  {
    id: "3",
    name: "Xi'an Ancient Discovery",
    destination: "Xi'an, China",
    startDate: "2024-01-20",
    endDate: "2024-01-24", // 5 days
    description: "Historical sites and terracotta warriors",
    status: "Completed",
    createdAt: "2024-01-05",
    itinerary: [],
    collaborators: []
  }
];

// Define the shape of the context
interface TripsContextType {
  trips: Trip[];
  loading: boolean;
  getTripById: (id: string) => Trip | undefined;
  addTrip: (tripData: Omit<Trip, 'id' | 'createdAt' | 'status' | 'itinerary' | 'collaborators'>) => Trip;
  updateTrip: (id: string, tripData: Partial<Omit<Trip, 'id'>>) => void;
  deleteTrip: (id: string) => void;
}

// Create the context
const TripsContext = createContext<TripsContextType | undefined>(undefined);

// Create the provider component
export const TripsProvider = ({ children }: { children: ReactNode }) => {
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const [loading, setLoading] = useState(false); // Not really loading from API yet

  const getTripById = (id: string) => {
    return trips.find(trip => trip.id === id);
  };

  const addTrip = (tripData: Omit<Trip, 'id' | 'createdAt' | 'status' | 'itinerary' | 'collaborators'>) => {
    const newTrip: Trip = {
      ...tripData,
      id: Date.now().toString(),
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      status: "Not Started",
      itinerary: [], // Initialize with an empty itinerary
      collaborators: [], // Initialize with no collaborators
    };
    setTrips(prevTrips => [newTrip, ...prevTrips]);
    return newTrip;
  };

  const updateTrip = (id: string, tripData: Partial<Omit<Trip, 'id'>>) => {
    setTrips(prevTrips => 
      prevTrips.map(trip => 
        trip.id === id ? { ...trip, ...tripData } : trip
      )
    );
  };

  const deleteTrip = (id: string) => {
    setTrips(prevTrips => prevTrips.filter(trip => trip.id !== id));
  };

  const value = {
    trips,
    loading,
    getTripById,
    addTrip,
    updateTrip,
    deleteTrip,
  };

  return (
    <TripsContext.Provider value={value}>
      {children}
    </TripsContext.Provider>
  );
};

// Create a custom hook for easy consumption
export const useTrips = () => {
  const context = useContext(TripsContext);
  if (context === undefined) {
    throw new Error('useTrips must be used within a TripsProvider');
  }
  return context;
};
