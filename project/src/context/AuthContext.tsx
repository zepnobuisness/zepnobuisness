import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUser(session.user.id, true); // true indicates this is the initial load
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        try {
          // Check if user exists in our database
          const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
          }

          if (!existingUser) {
            // Create new user profile
            const { error: insertError } = await supabase
              .from('users')
              .insert([
                {
                  id: session.user.id,
                  email: session.user.email,
                  name: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
                  balance: 50, // Starting balance
                  is_admin: false,
                }
              ]);

            if (insertError) throw insertError;
          }

          // Fetch the user data (either existing or newly created)
          await fetchUser(session.user.id);
          
          // Only navigate on initial sign in
          if (event === 'SIGNED_IN') {
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Error handling sign in:', error);
          await supabase.auth.signOut();
          setUser(null);
          setIsAuthenticated(false);
          navigate('/login');
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        if (event === 'SIGNED_OUT') {
          navigate('/login');
        }
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchUser = async (userId: string, isInitialLoad = false) => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // On initial load, don't clear auth state on error - the session might still be valid
        // but there could be a temporary DB issue
        if (!isInitialLoad) {
          throw error;
        } else {
          console.error('Error fetching user on initial load:', error);
          // Try to create the user if it doesn't exist and we have a valid session
          const session = await supabase.auth.getSession();
          if (session?.data?.session?.user) {
            const user = session.data.session.user;
            const { error: insertError } = await supabase
              .from('users')
              .insert([{
                id: user.id,
                email: user.email,
                name: user.user_metadata.full_name || user.email?.split('@')[0],
                balance: 50, // Starting balance
                is_admin: false,
              }]);
            
            if (!insertError) {
              // Try fetching again after insert
              return fetchUser(userId, false);
            }
          }
        }
      }

      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      // Only clear auth state if this is not the initial page load
      if (!isInitialLoad) {
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Google sign in failed:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        await fetchUser(data.user.id);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email,
              name,
              balance: 50, // Starting balance
              is_admin: false,
            }
          ]);

        if (profileError) throw profileError;
        await fetchUser(data.user.id);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        isAuthenticated, 
        login, 
        signup,
        signInWithGoogle,
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};