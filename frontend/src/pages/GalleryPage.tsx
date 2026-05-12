import React, { useState } from 'react';
import { Navbar } from '@components/Navbar';
import { useDeleteImage, useUserAlbums, useUpdateAlbum, useUploadImage } from '@hooks/useGallery';
import { AlbumModal } from '@components/AlbumModal';
import { AlbumEditModal } from '@components/AlbumEditModal';
import { UploadProgressDialog } from '@components/UploadProgressDialog';
import { Plus, Upload, Loader, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

export const GalleryPage: React.FC = () => {
    const { data: albums, isLoading } = useUserAlbums();
    const uploadImage = useUploadImage();
    const deleteImage = useDeleteImage();
    const updateAlbum = useUpdateAlbum();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploadingAlbumId, setUploadingAlbumId] = useState<number | null>(null);
    const [editingAlbum, setEditingAlbum] = useState<any | null>(null);
    const [uploadError, setUploadError] = useState('');
    const [uploadProgressDialog, setUploadProgressDialog] = useState<{
        isOpen: boolean;
        currentFileName: string;
        currentFileIndex: number;
        totalFiles: number;
    }>({
        isOpen: false,
        currentFileName: '',
        currentFileIndex: 0,
        totalFiles: 0
    });
    const { user, isAdmin, isSupervisor } = useAuth();
    const maxFileSize = 10 * 1024 * 1024;

    const renderVisibilityBadge = (isPublic?: boolean) => {
        if (isPublic) {
            return <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">🌐 Público</span>;
        }

        return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">🔒 Privado</span>;
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, albumId: number) => {
        const files = e.target.files;
        if (!files) return;

        const selectedFiles = Array.from(files);
        const validFiles = selectedFiles.filter((file) => file.size <= maxFileSize);
        const oversizedFiles = selectedFiles.filter((file) => file.size > maxFileSize);

        if (oversizedFiles.length > 0) {
            setUploadError(
                `Se omitieron ${oversizedFiles.length} imagen(es) que superan 10 MB. Las demás se subirán normalmente.`
            );
        } else {
            setUploadError('');
        }

        if (validFiles.length === 0) {
            return;
        }

        // Mostrar diálogo de progreso
        setUploadProgressDialog({
            isOpen: true,
            currentFileName: validFiles[0].name,
            currentFileIndex: 1,
            totalFiles: validFiles.length
        });

        setUploadingAlbumId(albumId);
        try {
            for (let i = 0; i < validFiles.length; i++) {
                // Actualizar el diálogo con el archivo actual
                setUploadProgressDialog(prev => ({
                    ...prev,
                    currentFileName: validFiles[i].name,
                    currentFileIndex: i + 1
                }));

                await uploadImage.mutateAsync({ albumId, file: validFiles[i] });
            }
        } catch (error) {
            console.error('Error uploading images:', error);
        } finally {
            setUploadingAlbumId(null);
            // Cerrar diálogo de progreso
            setUploadProgressDialog({
                isOpen: false,
                currentFileName: '',
                currentFileIndex: 0,
                totalFiles: 0
            });
        }
    };

    if (isAdmin || isSupervisor) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Acceso Denegado</h1>
                        <p className="text-gray-600">Solo los usuarios pueden crear y administrar álbumes. Usa el panel si eres supervisor o administrador.</p>
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
                    {uploadError && (
                        <div className="mb-6 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                            {uploadError}
                        </div>
                    )}

                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Mi Galería</h1>
                        {!isAdmin && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
                            >
                                <Plus size={20} />
                                <span>Nuevo Álbum</span>
                            </button>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        </div>
                    ) : albums && albums.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {albums.map((album: any) => (
                                <div key={album.id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                                    <div className="bg-gray-100 h-44 overflow-hidden">
                                        {album.cover_image_filename ? (
                                            <img
                                                src={`/api/uploads/${album.cover_image_filename}`}
                                                alt={album.title}
                                                className="h-full w-full object-cover transition duration-500 hover:scale-105"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                                                <span className="text-4xl">📷</span>
                                            </div>
                                        )}
                                    </div>
                                    {album.status === 'approved' ? (
                                        <Link to={`/album/${album.id}`} className="block">
                                            <div className="p-4">
                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="font-bold text-lg truncate">{album.title}</h3>
                                                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{album.description}</p>
                                                    </div>
                                                    <div className="flex shrink-0 flex-col items-end gap-2">
                                                        <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-medium">✅ Aprobado</span>
                                                        {renderVisibilityBadge(album.is_public)}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-500 mb-3">
                                                    <span>Creado por: <strong>{album.owner}</strong></span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm text-gray-500 gap-3">
                                                    <span>{album.image_count ?? album.images?.length ?? 0} imágenes</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div className="block opacity-75 cursor-default">
                                            <div className="p-4">
                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="font-bold text-lg truncate">{album.title}</h3>
                                                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{album.description}</p>
                                                    </div>
                                                    <div className="flex shrink-0 flex-col items-end gap-2">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${album.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                            {album.status === 'pending' ? '⏳ Pendiente' : '❌ Rechazado'}
                                                        </span>
                                                        {renderVisibilityBadge(album.is_public)}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-500 mb-3">
                                                    <span>Creado por: <strong>{album.owner}</strong></span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm text-gray-500 gap-3">
                                                    <span>{album.image_count ?? album.images?.length ?? 0} imágenes</span>
                                                </div>
                                                <p className="mt-3 text-xs text-gray-500">Disponible cuando sea aprobado</p>
                                            </div>
                                        </div>
                                    )}
                                    {album.owner_id === user?.id && album.status === 'approved' && (
                                        <div className="p-4 border-t">
                                            <div className="space-y-3">
                                                <label className="cursor-pointer block">
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        onChange={(e) => handleImageUpload(e, album.id)}
                                                        className="hidden"
                                                        disabled={uploadingAlbumId === album.id}
                                                    />
                                                    <div className="flex items-center justify-center space-x-2 bg-primary-50 hover:bg-primary-100 text-primary-600 px-4 py-2 rounded transition">
                                                        {uploadingAlbumId === album.id ? (
                                                            <>
                                                                <Loader size={18} className="animate-spin" />
                                                                <span>Subiendo...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Upload size={18} />
                                                                <span>Subir imágenes</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </label>
                                                <p className="text-xs text-gray-500">Puedes seleccionar varias imágenes. Cada archivo debe pesar como máximo 10 MB.</p>

                                                {album.status !== 'pending' && album.owner_id === user?.id && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingAlbum(album)}
                                                        className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                                    >
                                                        <Pencil size={16} />
                                                        <span>Editar álbum</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {album.owner_id === user?.id && album.status !== 'approved' && album.status !== 'pending' && (
                                        <div className="p-4 border-t">
                                            <button
                                                type="button"
                                                onClick={() => setEditingAlbum(album)}
                                                className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                            >
                                                <Pencil size={16} />
                                                <span>Editar álbum</span>
                                            </button>
                                        </div>
                                    )}
                                    {album.owner_id === user?.id && album.status === 'rejected' && (
                                        <div className="px-4 pb-4 text-xs text-gray-500">
                                            Puedes corregir el álbum y volver a revisarlo.
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">No tienes álbumes aún</p>
                            {!isAdmin && (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md inline-flex items-center space-x-2"
                                >
                                    <Plus size={20} />
                                    <span>Crear primer álbum</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <AlbumModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <AlbumEditModal
                isOpen={!!editingAlbum}
                onClose={() => setEditingAlbum(null)}
                album={editingAlbum}
                mode="user"
                isSubmitting={updateAlbum.isPending}
                onSubmit={async (payload) => {
                    if (!editingAlbum) {
                        return;
                    }

                    await updateAlbum.mutateAsync({
                        albumId: editingAlbum.id,
                        title: payload.title,
                        description: payload.description,
                                isPublic: payload.isPublic,
                    });
                }}
                        onDeleteImage={async (imageId) => {
                            await deleteImage.mutateAsync(imageId);
                        }}
            />
            <UploadProgressDialog
                isOpen={uploadProgressDialog.isOpen}
                currentFileName={uploadProgressDialog.currentFileName}
                currentFileIndex={uploadProgressDialog.currentFileIndex}
                totalFiles={uploadProgressDialog.totalFiles}
                showCancelButton={false}
            />
        </>
    );
};
