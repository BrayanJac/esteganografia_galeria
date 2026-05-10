import React from 'react';
import { X, Calendar, User, Image as ImageIcon, MessageSquare } from 'lucide-react';

const getLastComment = (commentString: string | null | undefined): string | null => {
    if (!commentString) return null;
    const lines = commentString.trim().split('\n');
    return lines.length > 0 ? lines[lines.length - 1] : null;
};

interface AlbumDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    album: any | null;
}

export const AlbumDetailsModal: React.FC<AlbumDetailsModalProps> = ({ isOpen, onClose, album }) => {
    if (!isOpen || !album) return null;

    const latestComment = getLastComment(album.review_comment);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
            <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b px-6 py-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{album.title}</h2>
                        <p className="mt-1 text-sm text-gray-600">Detalle completo del álbum</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                        <X size={22} />
                    </button>
                </div>

                <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.4fr_0.9fr]">
                    <div className="space-y-6">
                        <div className="overflow-hidden rounded-2xl border bg-gray-50">
                            {album.cover_image_filename ? (
                                <img
                                    src={`/api/uploads/${album.cover_image_filename}`}
                                    alt={album.title}
                                    className="h-80 w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-80 items-center justify-center text-gray-400">
                                    <ImageIcon size={56} />
                                </div>
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border bg-white p-4">
                                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <User size={16} />
                                    <span>Propietario</span>
                                </div>
                                <p className="text-gray-900">{album.owner}</p>
                                <p className="text-sm text-gray-500">ID: {album.owner_id}</p>
                            </div>

                            <div className="rounded-xl border bg-white p-4">
                                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Calendar size={16} />
                                    <span>Actividad reciente</span>
                                </div>
                                <p className="text-sm text-gray-700">Última actualización: {album.updated_at ? new Date(album.updated_at).toLocaleString() : 'N/A'}</p>
                                <p className="text-sm text-gray-700">Última imagen: {album.latest_image_created_at ? new Date(album.latest_image_created_at).toLocaleString() : 'N/A'}</p>
                            </div>
                        </div>

                        <div className="rounded-xl border bg-white p-4">
                            <h3 className="text-lg font-semibold text-gray-900">Fotos del álbum</h3>
                            {album.images && album.images.length > 0 ? (
                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {album.images.map((image: any) => (
                                        <div key={image.id} className="overflow-hidden rounded-xl border bg-gray-50 shadow-sm">
                                            <div className="aspect-[4/3] bg-gray-100">
                                                <img
                                                    src={`/api/uploads/${image.filename}`}
                                                    alt={image.original_filename || image.filename}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="space-y-2 p-3 text-sm">
                                                <p className="font-medium text-gray-900 truncate">{image.original_filename || image.filename}</p>
                                                <p className="text-gray-600">Subida por: {image.uploader || `Usuario ${image.uploader_id ?? 'N/A'}`}</p>
                                                <p className="text-gray-600">Estado: {image.status}</p>
                                                <p className="text-gray-600">Fecha: {image.created_at ? new Date(image.created_at).toLocaleString() : 'N/A'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-3 text-sm text-gray-500">No hay imágenes registradas en este álbum.</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-xl border bg-white p-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <MessageSquare size={16} />
                                <span>Comentarios de revisión</span>
                            </div>
                            {latestComment ? (
                                <div className="mt-3 rounded-lg border border-primary-100 bg-primary-50 p-3 text-sm text-gray-700">
                                    <p className="font-semibold text-gray-900">Último comentario</p>
                                    <p className="mt-2 whitespace-pre-wrap">{latestComment}</p>
                                </div>
                            ) : (
                                <p className="mt-3 text-sm text-gray-500">No hay comentarios de revisión todavía.</p>
                            )}
                        </div>

                        <div className="rounded-xl border bg-white p-4 space-y-3 text-sm text-gray-700">
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">Estado</span>
                                <span className="font-medium capitalize">{album.status}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">Público</span>
                                <span className="font-medium">{album.is_public ? 'Sí' : 'No'}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">Último revisor</span>
                                <span className="font-medium">{album.reviewer || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">Imágenes</span>
                                <span className="font-medium">{album.image_count ?? album.images?.length ?? 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};