// src/hooks/useAnalytics.ts - VERSION AVANCÉE
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

const getDeviceType = (): string => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

const getBrowser = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Other';
};

const getOS = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'MacOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS')) return 'iOS';
  return 'Other';
};

const getSource = (): string => {
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source');
  if (utmSource) return utmSource;
  const source = params.get('source');
  if (source) return source;
  const referrer = document.referrer;
  if (referrer) {
    if (referrer.includes('google')) return 'google';
    if (referrer.includes('facebook')) return 'facebook';
    if (referrer.includes('instagram')) return 'instagram';
    return 'referral';
  }
  return 'direct';
};

// Tracker un événement
export const trackEvent = async (
  eventType: string,
  eventName: string,
  metadata?: any
) => {
  try {
    const visitId = sessionStorage.getItem('visit_id');
    const sessionId = getSessionId();

    await supabase.from('events').insert([{
      visit_id: visitId,
      session_id: sessionId,
      event_type: eventType,
      event_name: eventName,
      page_url: window.location.href,
      time_from_load: Date.now() - (window.performance?.timing?.navigationStart || 0),
      metadata: metadata || null,
    }]);
  } catch (error) {
    console.error('Erreur trackEvent:', error);
  }
};

// Tracker une page vue
export const trackPageView = async () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const width = window.innerWidth;

    const visitData = {
      user_agent: navigator.userAgent,
      source: getSource(),
      referrer: document.referrer || null,
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_content: params.get('utm_content'),
      utm_term: params.get('utm_term'),
      gclid: params.get('gclid'),
      fbclid: params.get('fbclid'),
      page_url: window.location.href,
      page_title: document.title,
      device_type: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
      screen_width: width,
      screen_height: window.innerHeight,
      is_mobile: width < 768,
      is_tablet: width >= 768 && width < 1024,
      language: navigator.language,
      session_id: getSessionId(),
      page_load_time: window.performance?.timing?.loadEventEnd - window.performance?.timing?.navigationStart,
    };

    const { data, error } = await supabase
      .from('visits')
      .insert([visitData])
      .select()
      .single();

    if (error) throw error;

    sessionStorage.setItem('visit_id', data.id);
    
    // Tracker l'événement de page view
    trackEvent('pageview', `view_${document.title}`);
    
    return data.id;
  } catch (error) {
    console.error('Erreur trackPageView:', error);
    return null;
  }
};

// Mettre à jour l'engagement
export const updateEngagement = async (updates: any) => {
  try {
    const visitId = sessionStorage.getItem('visit_id');
    if (!visitId) return;

    await supabase
      .from('visits')
      .update(updates)
      .eq('id', visitId);
  } catch (error) {
    console.error('Erreur updateEngagement:', error);
  }
};

// Tracker une conversion
export const trackConversion = async (
  type: 'contact-form' | 'whatsapp' | 'phone' | 'email',
  contactId?: string
) => {
  try {
    const visitId = sessionStorage.getItem('visit_id');
    const firstSource = sessionStorage.getItem('first_source') || getSource();

    if (!sessionStorage.getItem('first_source')) {
      sessionStorage.setItem('first_source', firstSource);
    }

    // Mettre à jour la visite
    const updateField = type === 'contact-form' ? 'started_contact_form' :
                       type === 'whatsapp' ? 'clicked_whatsapp' :
                       type === 'phone' ? 'clicked_phone' : 'clicked_email';
    
    await updateEngagement({ [updateField]: true });

    // Créer la conversion
    await supabase.from('conversions').insert([{
      visit_id: visitId,
      contact_id: contactId,
      conversion_type: type,
      original_source: firstSource,
    }]);

    // Tracker l'événement
    trackEvent('conversion', type, { source: firstSource });
  } catch (error) {
    console.error('Erreur trackConversion:', error);
  }
};

// Hook principal
export const useAnalytics = () => {
  const location = useLocation();
  const visitIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const maxScrollRef = useRef<number>(0);
  const clickCountRef = useRef<number>(0);
  const [hasTracked, setHasTracked] = useState(false);

  useEffect(() => {
    // Tracker au chargement initial
    if (!hasTracked) {
      trackPageView().then((id) => {
        if (id) visitIdRef.current = id;
      });
      setHasTracked(true);
    }

    // Tracker le changement de page
    const page = location.pathname;
    if (page.includes('/services')) {
      updateEngagement({ viewed_services: true });
    } else if (page.includes('/contact')) {
      updateEngagement({ viewed_contact: true });
    }

    // Tracker les clics
    const handleClick = () => {
      clickCountRef.current++;
      updateEngagement({ clicks_count: clickCountRef.current });
      trackEvent('click', 'page_click');
    };

    // Tracker le scroll
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercent = Math.round(((scrollTop + windowHeight) / documentHeight) * 100);
      
      if (scrollPercent > maxScrollRef.current) {
        maxScrollRef.current = scrollPercent;
        updateEngagement({ scroll_depth: scrollPercent });
        
        // Tracker les jalons de scroll
        if ([25, 50, 75, 100].includes(scrollPercent)) {
          trackEvent('scroll', `scroll_${scrollPercent}`, { page: location.pathname });
        }
      }
    };

    // Interval pour le temps passé
    const timeInterval = setInterval(() => {
      if (visitIdRef.current) {
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        updateEngagement({ time_on_page: timeSpent });
      }
    }, 10000);

    document.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timeInterval);
      
      if (visitIdRef.current) {
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        updateEngagement({ 
          time_on_page: timeSpent,
          exit_page: location.pathname,
          bounced: timeSpent < 5 && clickCountRef.current < 2
        });
      }
    };
  }, [location, hasTracked]);

  return { trackConversion, trackEvent };
};

export default useAnalytics;
