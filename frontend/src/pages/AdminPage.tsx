import React from 'react';
import { Navbar } from '@components/Navbar';
import { useAuth } from '@hooks/useAuth';

export const AdminPage: React.FC = () => {
    const { user, isSupervisor } = useAuth();

    if (!isSupervisor) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Acceso Denegado</h1>
                        <p className="text-gray-600">No tienes permisos para acceder a esta página</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">Panel de Administración</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Stats */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Estadísticas</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tu rol:</span>
                                    <span className="font-bold text-primary-600 capitalize">{user?.role}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Acciones Rápidas</h2>
                            <div className="space-y-2">
                                <button className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-left">
                                    👁️ Revisar Álbumes
                                </button>
                                <button className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-left">
                                    🔍 Revisar Imágenes en Cuarentena
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Pending Reviews */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Álbumes en Revisión</h2>
                        <div className="text-center py-8 text-gray-500">
                            No hay álbumes pendientes de revisión
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
