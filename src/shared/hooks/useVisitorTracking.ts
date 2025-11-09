import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { UAParser } from 'ua-parser-js';
import { supabase } from '@/integrations/supabase/client';
import { generateSecureSessionId, setSecureStorage, getSecureStorage } from '@/shared/lib/session';
import { CONFIG } from '@/shared/lib/constants';
import { logger } from '@/shared/lib/logger';

interface PageView {
  path: string;
  timestamp: string;
  timeSpent: number;
}

interface VisitorSession {
  session_id: string;
  user_agent: string;
  device_type: string;
  device_os: string;
  browser: string;
  browser_version: string;
  ip_address?: string;
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  page_views: PageView[];
  time_spent_seconds: number;
}

export function useVisitorTracking() {
  const location = useLocation();
  const sessionIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const pageStartTimeRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const tableExistsRef = useRef<boolean | null>(null); // Cache table existence check
  const lastRequestTimeRef = useRef<number>(0); // Throttle requests
  const requestDelayRef = useRef<number>(30000); // 30 seconds between requests

  // Generate or retrieve session ID
  const getSessionId = (): string => {
    if (sessionIdRef.current) {
      return sessionIdRef.current;
    }

    // Check secure storage for existing session
    const stored = getSecureStorage<{ id: string; time: number }>('visitor_session');
    
    if (stored && stored.time) {
      const sessionAge = Date.now() - stored.time;
      if (sessionAge < CONFIG.SESSION_TIMEOUT) {
        sessionIdRef.current = stored.id;
        return stored.id;
      }
    }

    // Generate new secure session ID
    const newSessionId = generateSecureSessionId();
    sessionIdRef.current = newSessionId;
    setSecureStorage('visitor_session', { id: newSessionId, time: Date.now() });
    return newSessionId;
  };

  // Get device information
  const getDeviceInfo = () => {
    const parser = new UAParser();
    const result = parser.getResult();

    let deviceType = 'desktop';
    if (result.device.type === 'mobile') {
      deviceType = 'mobile';
    } else if (result.device.type === 'tablet') {
      deviceType = 'tablet';
    }

    return {
      userAgent: navigator.userAgent,
      deviceType,
      deviceOS: result.os.name || 'Unknown',
      browser: result.browser.name || 'Unknown',
      browserVersion: result.browser.version || 'Unknown',
    };
  };

  // Get geolocation from IP (with silent error handling for CORS issues in development)
  const getGeolocation = async (): Promise<{
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    ip?: string;
  }> => {
    // Skip geolocation in development if it's already failed (avoid CORS spam)
    const geolocationFailed = sessionStorage.getItem('geolocation_failed');
    if (geolocationFailed === 'true' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return {};
    }

    try {
      // Using ipapi.co free API (no key required for basic usage)
      const response = await fetch('https://ipapi.co/json/', {
        mode: 'cors',
        credentials: 'omit',
      });
      if (!response.ok) throw new Error('Geolocation API failed');
      
      const data = await response.json();
      return {
        country: data.country_name,
        region: data.region,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
        ip: data.ip,
      };
    } catch (error) {
      // Silently handle CORS errors in development
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        sessionStorage.setItem('geolocation_failed', 'true');
        return {};
      }
      
      // Fallback: try alternative API (only in production)
      try {
        const response = await fetch('https://ip-api.com/json/', {
          mode: 'cors',
          credentials: 'omit',
        });
        if (response.ok) {
          const data = await response.json();
          return {
            country: data.country,
            region: data.regionName,
            city: data.city,
            latitude: data.lat,
            longitude: data.lon,
            ip: data.query,
          };
        }
      } catch (fallbackError) {
        // Silently fail
      }
      return {};
    }
  };

  // Create or update session in Supabase
  const createOrUpdateSession = async (pageViews: PageView[], timeSpent: number) => {
    // Skip if we know the table doesn't exist (avoid repeated 404 errors)
    if (tableExistsRef.current === false) {
      return;
    }

    // Throttle requests to avoid rate limiting
    const now = Date.now();
    if (now - lastRequestTimeRef.current < requestDelayRef.current) {
      return; // Skip this request, too soon since last one
    }

    try {
      lastRequestTimeRef.current = now;
      const sessionId = getSessionId();
      const deviceInfo = getDeviceInfo();
      const geolocation = await getGeolocation();

      const sessionData: VisitorSession = {
        session_id: sessionId,
        user_agent: deviceInfo.userAgent,
        device_type: deviceInfo.deviceType,
        device_os: deviceInfo.deviceOS,
        browser: deviceInfo.browser,
        browser_version: deviceInfo.browserVersion,
        ip_address: geolocation.ip,
        country: geolocation.country,
        region: geolocation.region,
        city: geolocation.city,
        latitude: geolocation.latitude,
        longitude: geolocation.longitude,
        page_views: pageViews,
        time_spent_seconds: timeSpent,
      };

      // Check if session exists (use maybeSingle to avoid error if table doesn't exist)
      const { data: existingSession, error: selectError } = await supabase
        .from('visitor_sessions')
        .select('id')
        .eq('session_id', sessionId)
        .maybeSingle();

      // Handle different error types
      if (selectError) {
        // Table doesn't exist (404) - check multiple error properties
        const errorMessage = (selectError.message || '').toLowerCase();
        const errorCode = selectError.code || '';
        const errorStatus = (selectError as any).status || (selectError as any).statusCode;
        
        const is404 = 
          errorCode === 'PGRST116' || 
          errorCode === '42P01' || // PostgreSQL relation does not exist
          errorMessage.includes('404') ||
          errorMessage.includes('not found') ||
          (errorMessage.includes('relation') && errorMessage.includes('does not exist')) ||
          errorMessage.includes('could not find') ||
          errorStatus === 404;
        
        if (is404) {
          tableExistsRef.current = false;
          // Don't make any more requests if table doesn't exist
          return;
        }
        
        // Rate limiting (429) - increase delay and skip
        const is429 = 
          selectError.message?.includes('429') || 
          selectError.code === '429' ||
          (selectError as any).status === 429 ||
          (selectError as any).statusCode === 429;
        
        if (is429) {
          requestDelayRef.current = Math.min(requestDelayRef.current * 2, 300000); // Max 5 minutes
          return; // Skip this request due to rate limiting
        }
      }

      // Mark that table exists if we got here without error
      if (tableExistsRef.current === null) {
        tableExistsRef.current = true;
      }

      if (existingSession) {
        // Update existing session
        const { error: updateError } = await supabase
          .from('visitor_sessions')
          .update({
            page_views: pageViews,
            time_spent_seconds: timeSpent,
            last_activity_at: new Date().toISOString(),
          })
          .eq('session_id', sessionId);
        
        if (updateError) {
          const errorMessage = updateError.message?.toLowerCase() || '';
          const is404 = 
            updateError.code === 'PGRST116' || 
            errorMessage.includes('404') ||
            errorMessage.includes('not found') ||
            errorMessage.includes('relation') && errorMessage.includes('does not exist') ||
            (updateError as any).status === 404 ||
            (updateError as any).statusCode === 404;
          
          const is429 = 
            errorMessage.includes('429') || 
            updateError.code === '429' ||
            (updateError as any).status === 429 ||
            (updateError as any).statusCode === 429;
          
          if (is404) {
            tableExistsRef.current = false;
          } else if (is429) {
            requestDelayRef.current = Math.min(requestDelayRef.current * 2, 300000);
          } else if (!is404 && !is429) {
            // Only log unexpected errors (not 404, not 429)
            logger.warn('Failed to update visitor session', { error: updateError });
          }
        }
      } else {
        // Create new session
        const { error: insertError } = await supabase
          .from('visitor_sessions')
          .insert({
            session_id: sessionId,
            user_agent: deviceInfo.userAgent,
            device_type: deviceInfo.deviceType,
            device_os: deviceInfo.deviceOS,
            browser: deviceInfo.browser,
            browser_version: deviceInfo.browserVersion,
            ip_address: geolocation.ip,
            country: geolocation.country,
            region: geolocation.region,
            city: geolocation.city,
            latitude: geolocation.latitude,
            longitude: geolocation.longitude,
            page_views: pageViews,
            time_spent_seconds: timeSpent,
            started_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString(),
          });
        
        if (insertError) {
          const errorMessage = insertError.message?.toLowerCase() || '';
          const is404 = 
            insertError.code === 'PGRST116' || 
            errorMessage.includes('404') ||
            errorMessage.includes('not found') ||
            errorMessage.includes('relation') && errorMessage.includes('does not exist') ||
            (insertError as any).status === 404 ||
            (insertError as any).statusCode === 404;
          
          const is429 = 
            errorMessage.includes('429') || 
            insertError.code === '429' ||
            (insertError as any).status === 429 ||
            (insertError as any).statusCode === 429;
          
          if (is404) {
            tableExistsRef.current = false;
          } else if (is429) {
            requestDelayRef.current = Math.min(requestDelayRef.current * 2, 300000);
          } else if (!is404 && !is429) {
            // Only log unexpected errors (not 404, not 429)
            logger.warn('Failed to insert visitor session', { error: insertError });
          }
        }
      }
    } catch (error) {
      // Silently handle errors (table might not exist yet, rate limiting, etc.)
      if (error instanceof Error) {
        const errorMessage = (error.message || '').toLowerCase();
        const errorStatus = (error as any).status || (error as any).statusCode;
        
        const is404 = 
          errorMessage.includes('404') || 
          errorMessage.includes('pgrst116') ||
          errorMessage.includes('not found') ||
          errorMessage.includes('relation') && errorMessage.includes('does not exist') ||
          errorStatus === 404;
        
        const is429 = 
          errorMessage.includes('429') || 
          errorStatus === 429;
        
        if (is404) {
          tableExistsRef.current = false;
          // Stop all tracking if table doesn't exist
          return;
        } else if (is429) {
          requestDelayRef.current = Math.min(requestDelayRef.current * 2, 300000);
        } else if (!is404 && !is429) {
          // Only log unexpected errors
          logger.warn('Failed to save visitor session', { error });
        }
      } else {
        // Unknown error type - assume table doesn't exist to prevent spam
        tableExistsRef.current = false;
      }
    }
  };

  // Track page view
  const trackPageView = useCallback(async () => {
    const currentPath = location.pathname + location.search;
    const pageViews: PageView[] = JSON.parse(
      localStorage.getItem('visitor_page_views') || '[]'
    );

    // Calculate time spent on previous page
    const previousPageView = pageViews[pageViews.length - 1];
    if (previousPageView && pageStartTimeRef.current) {
      const timeSpent = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
      previousPageView.timeSpent = timeSpent;
    }

    // Add new page view
    pageViews.push({
      path: currentPath,
      timestamp: new Date().toISOString(),
      timeSpent: 0,
    });

    // Keep only last N page views per session
    if (pageViews.length > CONFIG.MAX_PAGE_VIEWS) {
      pageViews.shift();
    }

    localStorage.setItem('visitor_page_views', JSON.stringify(pageViews));
    pageStartTimeRef.current = Date.now();

    // Calculate total time spent
    const totalTimeSpent = pageViews.reduce((sum, pv) => sum + pv.timeSpent, 0);

    // Save to Supabase
    await createOrUpdateSession(pageViews, totalTimeSpent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  // Update time spent periodically
  useEffect(() => {
    if (!isTracking) return;

    let updateCount = 0;
    intervalRef.current = setInterval(async () => {
      const pageViews: PageView[] = JSON.parse(
        localStorage.getItem('visitor_page_views') || '[]'
      );

      // Update current page time
      if (pageViews.length > 0 && pageStartTimeRef.current) {
        const currentPageIndex = pageViews.length - 1;
        const timeSpent = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
        pageViews[currentPageIndex].timeSpent = timeSpent;
        localStorage.setItem('visitor_page_views', JSON.stringify(pageViews));
      }

      // Calculate total time spent
      const totalTimeSpent = pageViews.reduce((sum, pv) => sum + pv.timeSpent, 0);

      // Update in Supabase every N seconds (every 12 intervals of 5 seconds)
      // Reduced frequency to avoid rate limiting
      updateCount++;
      if (updateCount >= 12 || totalTimeSpent === 0) {
        updateCount = 0;
        await createOrUpdateSession(pageViews, totalTimeSpent);
      }
    }, CONFIG.VISITOR_TRACKING_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTracking]);

  // Track page changes
  useEffect(() => {
    if (isTracking) {
      trackPageView();
    }
  }, [trackPageView, isTracking]);

  // Initialize tracking
  useEffect(() => {
    setIsTracking(true);
    startTimeRef.current = Date.now();
    pageStartTimeRef.current = Date.now();

    // Track initial page view
    trackPageView();

    // Save session on page unload
    const handleBeforeUnload = async () => {
      const pageViews: PageView[] = JSON.parse(
        localStorage.getItem('visitor_page_views') || '[]'
      );

      // Update current page time
      if (pageViews.length > 0 && pageStartTimeRef.current) {
        const currentPageIndex = pageViews.length - 1;
        const timeSpent = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
        pageViews[currentPageIndex].timeSpent = timeSpent;
      }

      const totalTimeSpent = pageViews.reduce((sum, pv) => sum + pv.timeSpent, 0);

      // Final save
      await createOrUpdateSession(pageViews, totalTimeSpent);

      // Mark session as ended (only if table exists)
      if (tableExistsRef.current !== false) {
        const sessionId = getSessionId();
        if (sessionId) {
          const { error } = await supabase
            .from('visitor_sessions')
            .update({ ended_at: new Date().toISOString() })
            .eq('session_id', sessionId);
          
          // Silently handle errors
          if (error) {
            const is404 = 
              error.code === 'PGRST116' || 
              error.message?.includes('404') ||
              (error as any).status === 404 ||
              (error as any).statusCode === 404;
            
            const is429 = 
              error.message?.includes('429') || 
              error.code === '429' ||
              (error as any).status === 429 ||
              (error as any).statusCode === 429;
            
            if (is404) {
              tableExistsRef.current = false;
            } else if (!is429 && !is404) {
              // Only log unexpected errors (not 404, not 429)
              logger.warn('Failed to end visitor session', { error });
            }
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { isTracking };
}

