import React from 'react';
import { Navbar } from '@components/Navbar';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@services/api';
import { ArrowLeft } from 'lucide-react';

export const AlbumDetailPage: React.FC = () => {
    const { albumId } = useParams<{ albumId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const isPublicView = location.pathname.startsWith('/gallery/');

    const { data: album, isLoading, error } = useQuery({
        queryKey: ['album', albumId],
        queryFn: async () => {
            const response = isPublicView
                ? await api.getGalleryAlbum(Number(albumId))
                : await api.getAlbumById(Number(albumId));

            return {
                ...response.data.album,
                images: response.data.images,
            };
        },
    });

    if (isLoading) {
        return (
            <>
                <Navbar />
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Error</h1>
                        <p className="text-gray-600 mb-4">No se pudo cargar el álbum</p>
                        <button
                            onClick={() => navigate(isPublicView ? '/' : '/gallery')}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
                        >
                            Volver a galería
                        </button>
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
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => navigate(isPublicView ? '/' : '/gallery')}
                            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-4"
                        >
                            <ArrowLeft size={20} />
                            <span>Volver</span>
                        </button>

                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{album?.title}</h1>
                        <p className="text-gray-600">{album?.description}</p>

                        <div className="mt-4 flex space-x-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${album?.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    album?.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                }`}>
                                {album?.status === 'approved' ? '✓ Aprobado' :
                                    album?.status === 'pending' ? '⏳ Pendiente' :
                                        '✗ Rechazado'}
                            </span>
                            {album?.is_public && (
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                                    🌐 Público
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Images Grid */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            Imágenes ({album?.images?.length || 0})
                        </h2>

                        {album?.images && album.images.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {album.images.map((image: any) => (
                                    <div key={image.id} className="bg-white rounded-lg shadow overflow-hidden">
                                        <div className="bg-gray-200 h-48 flex items-center justify-center">
                                            <img
                                                src={`/api/uploads/${image.filename}`}
                                                alt={image.filename}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        </div>

                                        <div className="p-4">
                                            <p className="text-sm text-gray-600 mb-2 truncate">{image.filename}</p>

                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Estado:</span>
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${image.status === 'clean' ? 'bg-green-100 text-green-700' :
                                                            image.status === 'quarantined' ? 'bg-red-100 text-red-700' :
                                                                'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {image.status === 'clean' ? '✓ Limpia' :
                                                            image.status === 'quarantined' ? '⚠️ Cuarentena' :
                                                                'Analizando'}
                                                    </span>
                                                </div>

                                                {image.steganography_detected && (
                                                    <div className="bg-orange-100 border border-orange-300 text-orange-700 px-2 py-1 rounded text-xs">
                                                        ⚠️ Esteganografía detectada
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                No hay imágenes en este álbum
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
