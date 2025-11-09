import { useVisitorTracking } from '@/shared/hooks/useVisitorTracking';

// Set to false to completely disable visitor tracking
// Useful if the visitor_sessions table doesn't exist in your database
const ENABLE_VISITOR_TRACKING = false;

export function VisitorTracker() {
  if (!ENABLE_VISITOR_TRACKING) {
    return null;
  }
  
  useVisitorTracking();
  return null;
}







