import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@services/api';

export const RegisterForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!emailRegex.test(email.trim())) {
            setError('Ingresa un correo válido, por ejemplo usuario@dominio.com');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 12) {
            setError('La contraseña debe tener al menos 12 caracteres');
            return;
        }

        setLoading(true);

        try {
            await api.register(username, email, password);
            navigate('/login', { state: { message: 'Registro exitoso. Por favor inicia sesión' } });
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al registrarse');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="block text-gray-700 font-medium mb-2">Email</label>
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
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
                <p className="text-sm text-gray-600 mt-1">Mínimo 12 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales</p>
            </div>

            <div>
                <label className="block text-gray-700 font-medium mb-2">Confirmar Contraseña</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-md disabled:opacity-50"
            >
                {loading ? 'Registrando...' : 'Registrarse'}
            </button>

            <p className="text-center text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700">
                    Inicia sesión
                </Link>
            </p>
        </form>
    );
};
