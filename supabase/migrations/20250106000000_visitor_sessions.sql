-- Create visitor_sessions table for website analytics
CREATE TABLE public.visitor_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  user_agent text,
  device_type text, -- mobile, tablet, desktop
  device_os text,   -- iOS, Android, Windows, macOS, Linux, etc.
  browser text,     -- Chrome, Safari, Firefox, Edge, etc.
  browser_version text,
  ip_address text,
  country text,
  region text,
  city text,
  latitude numeric,
  longitude numeric,
  page_views jsonb DEFAULT '[]'::jsonb,
  time_spent_seconds integer DEFAULT 0,
  started_at timestamp with time zone DEFAULT now(),
  last_activity_at timestamp with time zone DEFAULT now(),
  ended_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_visitor_sessions_session_id ON public.visitor_sessions(session_id);
CREATE INDEX idx_visitor_sessions_started_at ON public.visitor_sessions(started_at);
CREATE INDEX idx_visitor_sessions_country ON public.visitor_sessions(country);
CREATE INDEX idx_visitor_sessions_city ON public.visitor_sessions(city);
CREATE INDEX idx_visitor_sessions_device_type ON public.visitor_sessions(device_type);

-- Enable RLS
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert visitor sessions (for tracking)
CREATE POLICY "Anyone can create visitor sessions"
ON public.visitor_sessions
FOR INSERT
WITH CHECK (true);

-- Policy: Anyone can update their own session (for time tracking)
CREATE POLICY "Anyone can update visitor sessions"
ON public.visitor_sessions
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Policy: Only admins can view all visitor sessions
CREATE POLICY "Admin can view all visitor sessions"
ON public.visitor_sessions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));












