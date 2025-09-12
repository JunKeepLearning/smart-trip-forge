-- Migration for creating trips-related tables

-- 1. Trips Table
-- Stores the main trip information, linked to a user.
CREATE TABLE trips (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL CHECK (char_length(name) > 0),
    destination TEXT NOT NULL CHECK (char_length(destination) > 0),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Completed')),
    thumbnail TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Ensure end date is after start date
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Enable Row-Level Security (RLS) for the trips table.
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- 2. Trip Collaborators Table
-- Stores collaborators for each trip with their access level
CREATE TABLE trip_collaborators (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    access_level TEXT NOT NULL DEFAULT 'viewer' CHECK (access_level IN ('viewer', 'editor', 'owner')),
    invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    accepted_at TIMESTAMPTZ,
    
    -- Each user can only be added once per trip
    UNIQUE(trip_id, user_id)
);

-- Enable RLS for trip collaborators.
ALTER TABLE trip_collaborators ENABLE ROW LEVEL SECURITY;

-- 3. Itinerary Days Table
-- Stores itinerary days for each trip
CREATE TABLE itinerary_days (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
    day_number INTEGER NOT NULL CHECK (day_number >= 1),
    date DATE NOT NULL,
    title TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Each trip can only have one day per day number
    UNIQUE(trip_id, day_number)
);

-- Enable RLS for itinerary days.
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;

-- 4. Itinerary Items Table
-- Stores individual itinerary items for each day
CREATE TABLE itinerary_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    day_id uuid REFERENCES itinerary_days(id) ON DELETE CASCADE NOT NULL,
    time TIME,
    type TEXT NOT NULL DEFAULT 'custom' CHECK (type IN ('attraction', 'restaurant', 'hotel', 'custom')),
    name TEXT NOT NULL CHECK (char_length(name) > 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Ordering within the day
    sort_order INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS for itinerary items.
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;

-- 5. Indexes for Foreign Keys and Performance
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_dates ON trips(start_date, end_date);
CREATE INDEX idx_trip_collaborators_trip_id ON trip_collaborators(trip_id);
CREATE INDEX idx_trip_collaborators_user_id ON trip_collaborators(user_id);
CREATE INDEX idx_itinerary_days_trip_id ON itinerary_days(trip_id);
CREATE INDEX idx_itinerary_items_day_id ON itinerary_items(day_id);

-- 6. RLS Policies for Trips Table
-- Users can only see their own trips or trips they collaborate on
CREATE POLICY "Users can view own trips" ON trips
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM trip_collaborators 
            WHERE trip_collaborators.trip_id = trips.id 
            AND trip_collaborators.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own trips" ON trips
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips" ON trips
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips" ON trips
    FOR DELETE USING (auth.uid() = user_id);

-- 7. RLS Policies for Trip Collaborators
CREATE POLICY "Users can view trip collaborators" ON trip_collaborators
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM trips 
            WHERE trips.id = trip_collaborators.trip_id 
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Trip owners can manage collaborators" ON trip_collaborators
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM trips 
            WHERE trips.id = trip_collaborators.trip_id 
            AND trips.user_id = auth.uid()
        )
    );

-- 8. RLS Policies for Itinerary Tables
CREATE POLICY "Users can manage itinerary for accessible trips" ON itinerary_days
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM trips 
            WHERE trips.id = itinerary_days.trip_id AND (
                trips.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM trip_collaborators 
                    WHERE trip_collaborators.trip_id = trips.id 
                    AND trip_collaborators.user_id = auth.uid()
                    AND trip_collaborators.access_level IN ('editor', 'owner')
                )
            )
        )
    );

CREATE POLICY "Users can manage itinerary items for accessible days" ON itinerary_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM itinerary_days 
            JOIN trips ON trips.id = itinerary_days.trip_id
            WHERE itinerary_days.id = itinerary_items.day_id AND (
                trips.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM trip_collaborators 
                    WHERE trip_collaborators.trip_id = trips.id 
                    AND trip_collaborators.user_id = auth.uid()
                    AND trip_collaborators.access_level IN ('editor', 'owner')
                )
            )
        )
    );

-- 9. Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trips_updated_at 
    BEFORE UPDATE ON trips 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();