// src/hooks/useAnalytics.ts
// Hook pour tracker les visites et conversions

import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Générer un session ID unique pour chaque visite
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

// Détecter le type d'appareil
const getDeviceType = (): string => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Extraire le navigateur du user agent
const getBrowser = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Other';
};

// Extraire l'OS du user agent
const getOS = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'MacOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS')) return 'iOS';
  return 'Other';
};

// Extraire la source depuis l'URL
const getSource = (): string => {
  const params = new URLSearchParams(window.location.search);
  
  // Vérifier les paramètres UTM
  const utmSource = params.get('utm_source');
  if (utmSource) return utmSource;
  
  // Vérifier le paramètre source personnalisé
  const source = params.get('source');
  if (source) return source;
  
  // Vérifier le referrer
  const referrer = document.referrer;
  if (referrer) {
    if (referrer.includes('google')) return 'google';
    if (referrer.includes('facebook')) return 'facebook';
    if (referrer.includes('instagram')) return 'instagram';
    if (referrer.includes('linkedin')) return 'linkedin';
    if (referrer.includes('twitter')) return 'twitter';
    return 'referral';
  }
  
  return 'direct';
};

// Tracker une visite
export const trackPageView = async () => {
  try {
    const params = new URLSearchParams(window.location.search);
    
    const visitData = {
      ip_address: null, // Sera rempli côté serveur si besoin
      user_agent: navigator.userAgent,
      source: getSource(),
      referrer: document.referrer || null,
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      page_url: window.location.href,
      page_title: document.title,
      device_type: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
      screen_width: window.innerWidth,
      screen_height: window.innerHeight,
      session_id: getSessionId(),
    };

    const { data, error } = await supabase
      .from('visits')
      .insert([visitData])
      .select()
      .single();

    if (error) {
      console.error('Erreur tracking:', error);
      return null;
    }

    // Stocker l'ID de visite pour les conversions
    sessionStorage.setItem('visit_id', data.id);
    
    return data.id;
  } catch (error) {
    console.error('Erreur trackPageView:', error);
    return null;
  }
};

// Mettre à jour le temps passé sur la page
export const updateTimeOnPage = async (visitId: string, timeInSeconds: number) => {
  try {
    await supabase
      .from('visits')
      .update({ time_on_page: timeInSeconds })
      .eq('id', visitId);
  } catch (error) {
    console.error('Erreur updateTimeOnPage:', error);
  }
};

// Mettre à jour le scroll depth
export const updateScrollDepth = async (visitId: string, scrollPercent: number) => {
  try {
    await supabase
      .from('visits')
      .update({ scroll_depth: scrollPercent })
      .eq('id', visitId);
  } catch (error) {
    console.error('Erreur updateScrollDepth:', error);
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
    
    // Sauvegarder la première source (attribution first-touch)
    if (!sessionStorage.getItem('first_source')) {
      sessionStorage.setItem('first_source', firstSource);
    }

    const conversionData = {
      visit_id: visitId,
      contact_id: contactId,
      conversion_type: type,
      original_source: firstSource,
    };

    const { error } = await supabase
      .from('conversions')
      .insert([conversionData]);

    if (error) {
      console.error('Erreur trackConversion:', error);
    }
  } catch (error) {
    console.error('Erreur trackConversion:', error);
  }
};

// Hook principal pour tracker automatiquement
export const useAnalytics = () => {
  const visitIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const maxScrollRef = useRef<number>(0);

  useEffect(() => {
    // Tracker la page view au montage
    trackPageView().then((id) => {
      if (id) {
        visitIdRef.current = id;
      }
    });

    // Tracker le scroll
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercent = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100
      );
      
      if (scrollPercent > maxScrollRef.current) {
        maxScrollRef.current = scrollPercent;
        if (visitIdRef.current) {
          updateScrollDepth(visitIdRef.current, scrollPercent);
        }
      }
    };

    // Mettre à jour le temps passé toutes les 10 secondes
    const timeInterval = setInterval(() => {
      if (visitIdRef.current) {
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        updateTimeOnPage(visitIdRef.current, timeSpent);
      }
    }, 10000);

    window.addEventListener('scroll', handleScroll);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timeInterval);
      
      // Dernier update avant de partir
      if (visitIdRef.current) {
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        updateTimeOnPage(visitIdRef.current, timeSpent);
      }
    };
  }, []);

  return { trackConversion };
};

export default useAnalytics;
