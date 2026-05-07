import React from 'react';
import { Navbar } from '@components/Navbar';
import { usePublicGallery } from '@hooks/useGallery';
import { Link } from 'react-router-dom';
import { Image as ImageIcon } from 'lucide-react';

export const HomePage: React.FC = () => {
    const { data: gallery, isLoading, error } = usePublicGallery();

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
                    <div className="max-w-7xl mx-auto px-4 text-center">
                        <h1 className="text-4xl font-bold mb-4">🖼️ SecureGallery</h1>
                        <p className="text-lg mb-6">Galería multimedia segura con detección de esteganografía</p>
                        <div className="space-x-4">
                            <Link
                                to="/login"
                                className="inline-block bg-white text-primary-600 px-6 py-2 rounded-md font-medium hover:bg-gray-100"
                            >
                                Iniciar Sesión
                            </Link>
                            <Link
                                to="/register"
                                className="inline-block border border-white text-white px-6 py-2 rounded-md font-medium hover:bg-primary-700"
                            >
                                Registrarse
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Gallery Section */}
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <h2 className="text-3xl font-bold mb-8 text-gray-800">Galería Pública</h2>

                    {isLoading ? (
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            Error al cargar la galería
                        </div>
                    ) : gallery && gallery.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {gallery.map((album: any) => (
                                <Link
                                    key={album.id}
                                    to={`/gallery/${album.id}`}
                                    className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                                >
                                    <div className="bg-primary-100 h-48 flex items-center justify-center">
                                        <ImageIcon size={64} className="text-primary-400" />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg mb-2">{album.title}</h3>
                                        <p className="text-gray-600 text-sm mb-3">{album.description}</p>
                                        <div className="text-xs text-gray-500">
                                            {album.images?.length || 0} imágenes
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-12">
                            No hay álbumes públicos disponibles
                        </div>
                    )}
                </div>

                {/* Features Section */}
                <div className="bg-white py-12">
                    <div className="max-w-7xl mx-auto px-4">
                        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Características</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">🔒</span>
                                </div>
                                <h3 className="font-bold text-lg mb-2">Seguridad</h3>
                                <p className="text-gray-600">Autenticación JWT y encriptación de contraseñas con Argon2</p>
                            </div>

                            <div className="text-center">
                                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">🔍</span>
                                </div>
                                <h3 className="font-bold text-lg mb-2">Detección</h3>
                                <p className="text-gray-600">Análisis automático de esteganografía en imágenes</p>
                            </div>

                            <div className="text-center">
                                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">👥</span>
                                </div>
                                <h3 className="font-bold text-lg mb-2">Roles</h3>
                                <p className="text-gray-600">Sistema de usuarios con diferentes niveles de acceso</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
