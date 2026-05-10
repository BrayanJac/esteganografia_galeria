import React, { useEffect, useState } from 'react';
import { Navbar } from '@components/Navbar';
import { usePublicGallery } from '@hooks/useGallery';
import { Link } from 'react-router-dom';
import { Image as ImageIcon } from 'lucide-react';

export const HomePage: React.FC = () => {
    const { data: gallery, isLoading, error } = usePublicGallery();
    const [featuredIndex, setFeaturedIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);
    const rotationDelayMs = 30000;

    useEffect(() => {
        if (!gallery?.length) {
            setFeaturedIndex(0);
        } else if (featuredIndex >= gallery.length) {
            setFeaturedIndex(0);
        }
    }, [gallery?.length, featuredIndex]);

    useEffect(() => {
        if (!gallery?.length || gallery.length < 2) {
            return;
        }

        let timeoutId: number | undefined;
        const intervalId = window.setInterval(() => {
            setIsFading(true);
            timeoutId = window.setTimeout(() => {
                setFeaturedIndex((currentIndex) => (currentIndex + 1) % gallery.length);
                setIsFading(false);
            }, 450);
        }, rotationDelayMs);

        return () => {
            window.clearInterval(intervalId);
            if (timeoutId) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [gallery]);

    const featuredAlbum = gallery?.length ? gallery[featuredIndex % gallery.length] : null;

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50">
                {/* Gallery Section */}
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900">Galería Pública</h1>
                        <p className="mt-2 text-gray-600">Explora los álbumes públicos aprobados por la comunidad.</p>
                    </div>

                    {featuredAlbum && (
                        <Link
                            to={`/gallery/${featuredAlbum.id}`}
                            className={`mb-10 block overflow-hidden rounded-3xl border bg-white shadow-lg transition duration-500 ${isFading ? 'opacity-70 scale-[0.995]' : 'opacity-100'}`}
                        >
                            <div className="grid md:grid-cols-[1.15fr_0.85fr]">
                                <div className="relative min-h-[260px] bg-gray-900">
                                    {featuredAlbum.cover_image_filename ? (
                                        <img
                                            src={`/api/uploads/${featuredAlbum.cover_image_filename}`}
                                            alt={featuredAlbum.title}
                                            className="h-full w-full object-cover transition duration-700"
                                        />
                                    ) : (
                                        <div className="flex h-full min-h-[260px] items-center justify-center bg-gradient-to-br from-primary-200 to-primary-400">
                                            <ImageIcon size={72} className="text-white/80" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
                                </div>
                                <div className="flex flex-col justify-center gap-4 p-8">
                                    <span className="inline-flex w-fit rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700">
                                        Destacado en rotación
                                    </span>
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-900">{featuredAlbum.title}</h2>
                                        <p className="mt-3 text-gray-600">{featuredAlbum.description}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                        <span>Por: <strong>{featuredAlbum.owner}</strong></span>
                                        <span>{featuredAlbum.image_count || 0} imágenes</span>
                                    </div>
                                    <p className="text-sm font-medium text-primary-700">Álbumes destacados de la semana.</p>
                                </div>
                            </div>
                        </Link>
                    )}

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
                                    <div className="bg-primary-100 h-48 overflow-hidden">
                                        {album.cover_image_filename ? (
                                            <img
                                                src={`/api/uploads/${album.cover_image_filename}`}
                                                alt={album.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <ImageIcon size={64} className="text-primary-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg mb-2">{album.title}</h3>
                                        <p className="text-gray-600 text-sm mb-3">{album.description}</p>
                                        <div className="text-xs text-gray-500">
                                            {album.image_count || 0} imágenes
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
