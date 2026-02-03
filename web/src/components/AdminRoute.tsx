import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiUrl } from '../utils/api';

interface AdminRouteProps {
    children: ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (authLoading) return;

            if (!user) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch(apiUrl('/api/auth/admin-check'), {
                    credentials: 'include',
                });
                const data = await response.json();

                if (data.isAdmin) {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                    // Redirect non-admins to dashboard
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('Error checking admin status:', error);
                setIsAdmin(false);
                navigate('/dashboard');
            } finally {
                setIsChecking(false);
            }
        };

        checkAdminStatus();
    }, [authLoading, user, navigate]);

    if (authLoading || isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-surface-50 via-primary-50/20 to-secondary-50/20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-surface-600">Verifying access...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return <>{children}</>;
};

export default AdminRoute;
