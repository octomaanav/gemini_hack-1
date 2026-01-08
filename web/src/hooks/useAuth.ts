import { useState, useEffect } from 'react';

interface User {
  user_id: string;
  email: string;
  name: string;
  disabilities?: string[];
  grade?: string;
  curriculum?: string;
  subjects?: string[];
  isProfileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthData {
  user: User;
}

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data: AuthData = await response.json();
        const normalizedSubjects = Array.isArray(data.user.subjects) ? data.user.subjects : [];
        setUser({ ...data.user, subjects: normalizedSubjects });
      } else if (response.status === 401) {
        setUser(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isProfileComplete: user?.isProfileComplete ?? false,
    error,
    refetch: fetchUser
  };
};
