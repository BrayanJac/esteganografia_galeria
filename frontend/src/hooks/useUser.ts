import { useAuthStore } from '@store/authStore';

/**
 * Hook personalizado para obtener el usuario actual
 */
export const useCurrentUser = () => {
    const user = useAuthStore((state) => state.user);
    return user;
};

/**
 * Hook personalizado para obtener el token actual
 */
export const useToken = () => {
    const token = localStorage.getItem('access_token');
    return token;
};
