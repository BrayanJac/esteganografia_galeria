import React, { useState } from 'react';
import { Navbar } from '@components/Navbar';
import { useLibraryAlbums, useUploadImage } from '@hooks/useGallery';
import { AlbumModal } from '@components/AlbumModal';
import { Plus, Upload, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

export const GalleryPage: React.FC = () => {
    const { data: albums, isLoading } = useLibraryAlbums();
    const uploadImage = useUploadImage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploadingAlbumId, setUploadingAlbumId] = useState<number | null>(null);
    const { user } = useAuth();

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, albumId: number) => {
        const files = e.target.files;
        if (!files) return;

        setUploadingAlbumId(albumId);
        try {
            for (let i = 0; i < files.length; i++) {
                await uploadImage.mutateAsync({ albumId, file: files[i] });
            }
        } catch (error) {
            console.error('Error uploading images:', error);
        } finally {
            setUploadingAlbumId(null);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Mi Galería</h1>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
                        >
                            <Plus size={20} />
                            <span>Nuevo Álbum</span>
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        </div>
                    ) : albums && albums.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {albums.map((album: any) => (
                                <div key={album.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                                    {album.status === 'approved' ? (
                                        <Link to={`/album/${album.id}`} className="block">
                                            <div className="bg-gradient-to-br from-primary-100 to-primary-200 h-40 flex items-center justify-center">
                                                <span className="text-4xl">📷</span>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-lg mb-2">{album.title}</h3>
                                                <p className="text-gray-600 text-sm mb-3">{album.description}</p>
                                                <div className="flex justify-between items-center text-sm text-gray-500">
                                                    <span>{album.image_count ?? album.images?.length ?? 0} imágenes</span>
                                                    <span className={`px-2 py-1 rounded ${album.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                            album.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-red-100 text-red-700'
                                                        }`}>
                                                        {album.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div className="block opacity-75 cursor-default">
                                            <div className="bg-gradient-to-br from-primary-100 to-primary-200 h-40 flex items-center justify-center">
                                                <span className="text-4xl">🔒</span>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-lg mb-2">{album.title}</h3>
                                                <p className="text-gray-600 text-sm mb-3">{album.description}</p>
                                                <div className="flex justify-between items-center text-sm text-gray-500">
                                                    <span>{album.image_count ?? album.images?.length ?? 0} imágenes</span>
                                                    <span className={`px-2 py-1 rounded ${album.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                            album.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-red-100 text-red-700'
                                                        }`}>
                                                        {album.status}
                                                    </span>
                                                </div>
                                                <p className="mt-3 text-xs text-gray-500">Disponible cuando sea aprobado</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="p-4 border-t">
                                        <label className="cursor-pointer">
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, album.id)}
                                                className="hidden"
                                                disabled={uploadingAlbumId === album.id || album.status !== 'approved' || album.owner_id !== user?.id}
                                            />
                                            <div className="flex items-center justify-center space-x-2 bg-primary-50 hover:bg-primary-100 text-primary-600 px-4 py-2 rounded transition">
                                                {uploadingAlbumId === album.id ? (
                                                    <>
                                                        <Loader size={18} className="animate-spin" />
                                                        <span>Subiendo...</span>
                                                    </>
                                                ) : album.status !== 'approved' ? (
                                                    <>
                                                        <Upload size={18} />
                                                        <span>Bloqueado</span>
                                                    </>
                                                ) : album.owner_id !== user?.id ? (
                                                    <>
                                                        <Upload size={18} />
                                                        <span>Solo lectura</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload size={18} />
                                                        <span>Subir imagen</span>
                                                    </>
                                                )}
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">No tienes álbumes aún</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md inline-flex items-center space-x-2"
                            >
                                <Plus size={20} />
                                <span>Crear primer álbum</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <AlbumModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};
