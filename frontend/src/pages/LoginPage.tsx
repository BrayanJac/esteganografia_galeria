import React from 'react';
import { Navbar } from '@components/Navbar';
import { LoginForm } from '@components/LoginForm';
import { Link } from 'react-router-dom';

export const LoginPage: React.FC = () => {
    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-primary-600">🖼️ SecureGallery</h1>
                        <p className="text-gray-600 mt-2">Galería segura con detección de esteganografía</p>
                    </div>

                    <LoginForm />

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            ¿No tienes cuenta?{' '}
                            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                                Regístrate aquí
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};
