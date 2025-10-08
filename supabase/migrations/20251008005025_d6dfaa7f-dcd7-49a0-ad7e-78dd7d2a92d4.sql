-- Create day habilitation organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  services TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create locations table for each organization
CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  county TEXT NOT NULL,
  state TEXT DEFAULT 'NY',
  zip_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  schedule TEXT,
  accessibility_features TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create profiles table for caregivers
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE NOT NULL,
  notes TEXT,
  visited BOOLEAN DEFAULT false,
  visit_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, location_id)
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations (public read)
CREATE POLICY "Organizations are viewable by everyone"
  ON public.organizations FOR SELECT
  USING (true);

-- RLS Policies for locations (public read)
CREATE POLICY "Locations are viewable by everyone"
  ON public.locations FOR SELECT
  USING (true);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for favorites
CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites"
  ON public.favorites FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_favorites_updated_at
  BEFORE UPDATE ON public.favorites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data
INSERT INTO public.organizations (name, description, phone, email, services) VALUES
('Hope Day Habilitation Center', 'Providing quality day programs focusing on life skills, social engagement, and community integration', '(555) 123-4567', 'info@hopedayhab.org', ARRAY['Life Skills Training', 'Social Activities', 'Community Outings', 'Arts & Crafts']),
('Bright Futures Day Program', 'Empowering individuals through personalized day habilitation services', '(555) 234-5678', 'contact@brightfutures.org', ARRAY['Vocational Training', 'Health & Wellness', 'Recreation', 'Technology Skills']),
('Community Connect Day Services', 'Building connections and fostering independence through innovative programs', '(555) 345-6789', 'hello@communityconnect.org', ARRAY['Job Coaching', 'Independent Living Skills', 'Social Integration', 'Physical Activities']);

-- Insert sample locations
INSERT INTO public.locations (organization_id, name, address, city, county, zip_code, latitude, longitude, schedule, accessibility_features)
SELECT 
  org.id,
  org.name || ' - Main Location',
  '123 Main Street',
  'Buffalo',
  'Erie',
  '14201',
  42.8864,
  -78.8784,
  'Monday-Friday, 9 AM - 3 PM',
  ARRAY['Wheelchair Accessible', 'Elevator', 'Accessible Parking', 'Sensory-Friendly Spaces']
FROM public.organizations org
WHERE org.name = 'Hope Day Habilitation Center';

INSERT INTO public.locations (organization_id, name, address, city, county, zip_code, latitude, longitude, schedule, accessibility_features)
SELECT 
  org.id,
  org.name || ' - North Campus',
  '456 North Avenue',
  'Rochester',
  'Monroe',
  '14606',
  43.1566,
  -77.6088,
  'Monday-Friday, 8:30 AM - 3:30 PM',
  ARRAY['Wheelchair Accessible', 'Accessible Restrooms', 'Ramps']
FROM public.organizations org
WHERE org.name = 'Bright Futures Day Program';

INSERT INTO public.locations (organization_id, name, address, city, county, zip_code, latitude, longitude, schedule, accessibility_features)
SELECT 
  org.id,
  org.name || ' - Downtown Center',
  '789 Center Street',
  'Syracuse',
  'Onondaga',
  '13202',
  43.0481,
  -76.1474,
  'Monday-Friday, 9 AM - 4 PM',
  ARRAY['Wheelchair Accessible', 'Ground Floor Access', 'Wide Doorways', 'Accessible Parking']
FROM public.organizations org
WHERE org.name = 'Community Connect Day Services';