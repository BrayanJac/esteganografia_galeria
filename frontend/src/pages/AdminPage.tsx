import React, { useState } from 'react';
import { Navbar } from '@components/Navbar';
import { useAuth } from '@hooks/useAuth';
import { usePendingAlbums, useApproveAlbum } from '@hooks/useGallery';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export const AdminPage: React.FC = () => {
    const { user, isSupervisor } = useAuth();
    const { data: pendingAlbums, isLoading: isLoadingPending } = usePendingAlbums();
    const approveAlbum = useApproveAlbum();
    const [approvalComment, setApprovalComment] = useState<{ [key: number]: string }>({});

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

    const handleApprove = async (albumId: number, approved: boolean) => {
        await approveAlbum.mutateAsync({
            albumId,
            approved,
            comment: approvalComment[albumId] || undefined,
        });
        setApprovalComment((prev) => {
            const newComments = { ...prev };
            delete newComments[albumId];
            return newComments;
        });
    };

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
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Álbumes pendientes:</span>
                                    <span className="font-bold text-yellow-600">{pendingAlbums?.length || 0}</span>
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
                        <h2 className="text-lg font-bold text-gray-800 mb-6">Álbumes en Revisión</h2>

                        {isLoadingPending ? (
                            <div className="flex justify-center py-8">
                                <Loader className="animate-spin text-primary-600" size={32} />
                            </div>
                        ) : pendingAlbums && pendingAlbums.length > 0 ? (
                            <div className="space-y-4">
                                {pendingAlbums.map((album: any) => (
                                    <div key={album.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                                        <div className="mb-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-800">{album.title}</h3>
                                                    <p className="text-sm text-gray-600 mt-1">{album.description}</p>
                                                </div>
                                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                                                    ⏳ Pendiente
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-3">
                                                <div>
                                                    <span className="font-medium">Propietario:</span> {album.owner}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Fecha:</span> {new Date(album.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <textarea
                                                placeholder="Añade un comentario (opcional)"
                                                value={approvalComment[album.id] || ''}
                                                onChange={(e) =>
                                                    setApprovalComment((prev) => ({
                                                        ...prev,
                                                        [album.id]: e.target.value,
                                                    }))
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                                                rows={2}
                                            />

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApprove(album.id, true)}
                                                    disabled={approveAlbum.isPending}
                                                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-md flex items-center justify-center space-x-2 font-medium"
                                                >
                                                    <CheckCircle size={18} />
                                                    <span>{approveAlbum.isPending ? 'Procesando...' : 'Aprobar'}</span>
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(album.id, false)}
                                                    disabled={approveAlbum.isPending}
                                                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-md flex items-center justify-center space-x-2 font-medium"
                                                >
                                                    <XCircle size={18} />
                                                    <span>{approveAlbum.isPending ? 'Procesando...' : 'Rechazar'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No hay álbumes pendientes de revisión
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
