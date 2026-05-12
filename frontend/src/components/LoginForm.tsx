import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import api from '@services/api';

export const LoginForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const redirectTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        const stateMessage = (location.state as { message?: string } | null)?.message;
        if (stateMessage) {
            setSuccess(stateMessage);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.pathname, location.state, navigate]);

    useEffect(() => {
        return () => {
            if (redirectTimeoutRef.current) {
                window.clearTimeout(redirectTimeoutRef.current);
            }
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await api.login(username, password);
            const token = response.data.access_token;
            const userData = response.data.usuario;
            
            // Guardar token y usuario
            localStorage.setItem('access_token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Actualizar el store
            login(userData, token);

            setSuccess('Credenciales válidas. Redirigiendo...');
            
            redirectTimeoutRef.current = window.setTimeout(() => {
                navigate('/gallery');
            }, 1800);
        } catch (err: any) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            setSuccess('');
            setError(err.response?.data?.detail || 'Error al iniciar sesión');
            setUsername('');
            setPassword('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {success}
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-gray-700 font-medium mb-2">Usuario</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                    required
                />
            </div>

            <div>
                <label className="block text-gray-700 font-medium mb-2">Contraseña</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-md disabled:opacity-50"
            >
                {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>
        </form>
    );
};
