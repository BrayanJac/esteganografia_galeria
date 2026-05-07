import { useAuthStore } from '@store/authStore';

export const useAuth = () => {
    const { user, isAuthenticated, isLoading, login, logout, setUser } = useAuthStore();

    const isAdmin = user?.role === 'admin';
    const isSupervisor = user?.role === 'supervisor' || user?.role === 'admin';

    return {
        user,
        isAuthenticated,
        isLoading,
        isAdmin,
        isSupervisor,
        login,
        logout,
        setUser,
    };
};
