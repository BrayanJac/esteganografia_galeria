import React from 'react';
import { Navbar } from '@components/Navbar';
import { RegisterForm } from '@components/RegisterForm';

export const RegisterPage: React.FC = () => {
    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center px-4 py-8">
                <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-primary-600">🖼️ SecureGallery</h1>
                        <p className="text-gray-600 mt-2">Crea tu cuenta</p>
                    </div>

                    <RegisterForm />
                </div>
            </div>
        </>
    );
};
