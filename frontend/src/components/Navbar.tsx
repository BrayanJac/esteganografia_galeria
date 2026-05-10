import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import api from '@services/api';

export const Navbar: React.FC = () => {
    const { isAuthenticated, user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await api.logout();
        } catch {
            // Si el token ya expiró, cerramos sesión localmente de todos modos.
        }

        logout();
        navigate('/login');
        setIsOpen(false);
    };

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold text-primary-600">
                            🖼️ SecureGallery
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                {!isAdmin && user?.role === 'user' && (
                                    <Link to="/gallery" className="text-gray-700 hover:text-primary-600">
                                        Galería
                                    </Link>
                                )}
                                {user?.role === 'supervisor' && (
                                    <Link to="/admin" className="text-gray-700 hover:text-primary-600">
                                        Panel
                                    </Link>
                                )}
                                {isAdmin && (
                                    <>
                                        <Link to="/admin" className="text-gray-700 hover:text-primary-600">
                                            Panel
                                        </Link>
                                        <Link to="/state" className="text-gray-700 hover:text-primary-600">
                                            Estado
                                        </Link>
                                        <Link to="/users" className="text-gray-700 hover:text-primary-600">
                                            Usuarios
                                        </Link>
                                    </>
                                )}
                                <div className="flex items-center space-x-2">
                                    <User size={20} className="text-gray-600" />
                                    <span className="text-gray-700">{user?.username}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center space-x-2"
                                >
                                    <LogOut size={18} />
                                    <span>Salir</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
                                >
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    to="/register"
                                    className="border border-primary-600 text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-md"
                                >
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-700 hover:text-primary-600"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden pb-4 space-y-2">
                        {isAuthenticated ? (
                            <>
                                {!isAdmin && user?.role === 'user' && (
                                    <Link
                                        to="/gallery"
                                        className="block text-gray-700 hover:text-primary-600 py-2"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Galería
                                    </Link>
                                )}
                                {user?.role === 'supervisor' && (
                                    <Link
                                        to="/admin"
                                        className="block text-gray-700 hover:text-primary-600 py-2"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Panel
                                    </Link>
                                )}
                                {isAdmin && (
                                    <>
                                        <Link
                                            to="/admin"
                                            className="block text-gray-700 hover:text-primary-600 py-2"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Panel
                                        </Link>
                                        <Link
                                            to="/state"
                                            className="block text-gray-700 hover:text-primary-600 py-2"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Estado
                                        </Link>
                                        <Link
                                            to="/users"
                                            className="block text-gray-700 hover:text-primary-600 py-2"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Usuarios
                                        </Link>
                                    </>
                                )}
                                <div
                                    className="block text-gray-700 py-2"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <User size={16} className="inline mr-2" />
                                    {user?.username}
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                                >
                                    <LogOut size={16} className="inline mr-2" />
                                    Salir
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="block bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-center"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    to="/register"
                                    className="block border border-primary-600 text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-md text-center"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};
