// src/contexts/AuthContext.tsx
// Context pour gérer l'authentification des admins

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'super_admin';
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  admin: AdminUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger les données admin
  const loadAdminData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      
      setAdmin(data);
      return data;
    } catch (error) {
      console.error('Erreur chargement admin:', error);
      setAdmin(null);
      return null;
    }
  };

  // Initialiser la session
  useEffect(() => {
    // Récupérer la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadAdminData(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadAdminData(session.user.id);
      } else {
        setAdmin(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Connexion
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const adminData = await loadAdminData(data.user.id);
        
        if (!adminData) {
          // Pas un admin, déconnecter
          await supabase.auth.signOut();
          throw new Error('Accès refusé. Vous devez être administrateur.');
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Erreur connexion:', error);
      return { error: error as Error };
    }
  };

  // Déconnexion
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAdmin(null);
    setSession(null);
  };

  const value = {
    user,
    admin,
    session,
    loading,
    signIn,
    signOut,
    isAdmin: !!admin,
    isSuperAdmin: admin?.role === 'super_admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
