import React, { useState } from 'react';
import { Navbar } from '@components/Navbar';
import { ImageLightbox } from '@components/ImageLightbox';
import { ConfirmDialog } from '@components/ConfirmDialog';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@services/api';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { useDeleteImage } from '@hooks/useGallery';

export const AlbumDetailPage: React.FC = () => {
    const { albumId } = useParams<{ albumId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const isPublicView = location.pathname.startsWith('/gallery/');
    const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
    const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{ isOpen: boolean; imageId: number | null }>({
        isOpen: false,
        imageId: null
    });
    const { user } = useAuth();
    const deleteImage = useDeleteImage();
    const queryClient = useQueryClient();

    const { data: album, isLoading, error } = useQuery({
        queryKey: ['album', albumId, isPublicView ? 'public' : 'private'],
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

    const handleDeleteImage = (imageId: number) => {
        setDeleteConfirmDialog({ isOpen: true, imageId });
    };

    const confirmDeleteImage = async () => {
        if (deleteConfirmDialog.imageId) {
            try {
                await deleteImage.mutateAsync(deleteConfirmDialog.imageId);
                queryClient.invalidateQueries({
                    queryKey: ['album', albumId, isPublicView ? 'public' : 'private']
                });
            } catch (error) {
                console.error('Error deleting image:', error);
            } finally {
                setDeleteConfirmDialog({ isOpen: false, imageId: null });
            }
        }
    };

    const cancelDeleteImage = () => {
        setDeleteConfirmDialog({ isOpen: false, imageId: null });
    };

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
                                        <button
                                            type="button"
                                            onClick={() => setSelectedImage({ src: `/api/uploads/${image.filename}`, alt: image.filename })}
                                            className="block w-full text-left"
                                        >
                                            <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
                                                <img
                                                    src={`/api/uploads/${image.filename}`}
                                                    alt={image.filename}
                                                    className="h-full w-full object-contain"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        </button>

                                        <div className="p-4">
                                            <p className="text-sm text-gray-600 mb-2 truncate">{image.filename}</p>

                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Estado:</span>
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${image.status === 'clean' ? 'bg-green-100 text-green-700' :
                                                        image.status === 'quarantined' ? 'bg-red-100 text-red-700' :
                                                        image.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        image.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {image.status === 'clean' ? '✓ Limpia' :
                                                            image.status === 'quarantined' ? '⚠️ Cuarentena' :
                                                            image.status === 'approved' ? '✓ Aprobada' :
                                                            image.status === 'rejected' ? '✗ Rechazada' :
                                                                'Analizando'}
                                                    </span>
                                                </div>

                                                {image.steganography_detected && (
                                                    <div className="bg-orange-100 border border-orange-300 text-orange-700 px-2 py-1 rounded text-xs">
                                                        ⚠️ Esteganografía detectada
                                                    </div>
                                                )}
                                            </div>

                                            {user?.id === image.uploader_id && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteImage(image.id)}
                                                    disabled={deleteImage.isPending}
                                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Trash2 size={16} />
                                                    <span>{deleteImage.isPending ? 'Eliminando...' : 'Eliminar imagen'}</span>
                                                </button>
                                            )}
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
            <ImageLightbox
                isOpen={!!selectedImage}
                src={selectedImage?.src || ''}
                alt={selectedImage?.alt || ''}
                title={selectedImage?.alt}
                onClose={() => setSelectedImage(null)}
            />
            <ConfirmDialog
                isOpen={deleteConfirmDialog.isOpen}
                title="Eliminar Imagen"
                message="¿Estás seguro de que deseas eliminar esta imagen? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
                onConfirm={confirmDeleteImage}
                onCancel={cancelDeleteImage}
                type="danger"
            />
        </>
    );
};
