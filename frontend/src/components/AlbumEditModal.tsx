import React, { useEffect, useState } from 'react';
import { Image as ImageIcon, Trash2, X } from 'lucide-react';

type AlbumEditPayload = {
    title: string;
    description?: string;
    isPublic?: boolean;
    reviewComment?: string;
};

interface AlbumEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    album: {
        id: number;
        title: string;
        description?: string | null;
        is_public?: boolean;
        review_comment?: string | null;
        images?: Array<{
            id: number;
            filename: string;
            original_filename?: string | null;
        }>;
    } | null;
    mode: 'user' | 'supervisor';
    onSubmit: (payload: AlbumEditPayload) => Promise<unknown>;
    onDeleteImage?: (imageId: number) => Promise<unknown>;
    isSubmitting?: boolean;
}

export const AlbumEditModal: React.FC<AlbumEditModalProps> = ({
    isOpen,
    onClose,
    album,
    mode,
    onSubmit,
    onDeleteImage,
    isSubmitting = false,
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [reviewComment, setReviewComment] = useState('');
    const [albumImages, setAlbumImages] = useState<Array<{ id: number; filename: string; original_filename?: string | null }>>([]);
    const [deletingImageId, setDeletingImageId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!isOpen || !album) {
            return;
        }

        setTitle(album.title || '');
        setDescription(album.description || '');
        setIsPublic(album.is_public ?? true);
        setReviewComment(album.review_comment || '');
        setAlbumImages(album.images || []);
        setErrorMessage('');
    }, [album, isOpen]);

    const extractErrorMessage = (error: unknown) => {
        const cleanMessage = (message: string) => message.replace(/^Value error,\s*/i, '');

        if (error && typeof error === 'object' && 'response' in error) {
            const response = (error as { response?: { data?: { detail?: unknown } } }).response;
            const detail = response?.data?.detail;

            if (typeof detail === 'string') {
                return cleanMessage(detail);
            }

            if (Array.isArray(detail) && detail.length > 0) {
                const firstError = detail[0] as { msg?: string };
                if (typeof firstError?.msg === 'string') {
                    return cleanMessage(firstError.msg);
                }
            }
        }

        return 'No se pudo actualizar el álbum.';
    };

    const handleDeleteImage = async (imageId: number) => {
        if (!onDeleteImage) return;

        setDeletingImageId(imageId);
        setErrorMessage('');

        try {
            await onDeleteImage(imageId);
            setAlbumImages((previousImages) => previousImages.filter((image) => image.id !== imageId));
        } catch {
            setErrorMessage('No se pudo eliminar la imagen.');
        } finally {
            setDeletingImageId(null);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!album) {
            return;
        }

        setErrorMessage('');

        try {
            await onSubmit({
                title: title.trim(),
                description,
                isPublic,
                ...(mode === 'supervisor' ? { reviewComment } : {}),
            });
            onClose();
        } catch (error) {
            setErrorMessage(extractErrorMessage(error));
        }
    };

    if (!isOpen || !album) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-4 py-6">
            <div className="mx-auto w-full max-w-4xl rounded-xl bg-white shadow-2xl max-h-[calc(100vh-3rem)] flex flex-col">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Editar álbum</h2>
                        <p className="text-sm text-gray-500">Ajusta privacidad, contenido y fotos del álbum</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 transition hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5 overflow-y-auto">
                    {errorMessage && (
                        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {errorMessage}
                        </div>
                    )}

                    <div>
                        <label className="mb-2 block font-medium text-gray-700">Título</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-2 block font-medium text-gray-700">Descripción</label>
                        <textarea
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
                            rows={4}
                        />
                    </div>

                    <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
                        <input
                            type="checkbox"
                            id={`album-public-${album.id}`}
                            checked={isPublic}
                            onChange={(event) => setIsPublic(event.target.checked)}
                            className="rounded"
                        />
                        <label htmlFor={`album-public-${album.id}`} className="text-sm font-medium text-gray-700">
                            Álbum público
                        </label>
                    </div>

                    {mode === 'supervisor' && (
                        <div>
                            <label className="mb-2 block font-medium text-gray-700">Comentario de revisión</label>
                            <textarea
                                value={reviewComment}
                                onChange={(event) => setReviewComment(event.target.value)}
                                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
                                rows={4}
                                placeholder="Añade un comentario para esta galería"
                            />
                        </div>
                    )}

                    <div className="rounded-xl border bg-white p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <ImageIcon size={16} />
                            <span>Imágenes del álbum</span>
                        </div>

                        {albumImages.length > 0 ? (
                            <div className="grid gap-3 md:grid-cols-2">
                                {albumImages.map((image) => (
                                    <div key={image.id} className="rounded-lg border bg-gray-50 p-3">
                                        <div className="flex items-start gap-3">
                                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-200">
                                                <img
                                                    src={`/api/uploads/${image.filename}`}
                                                    alt={image.original_filename || image.filename}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-900">
                                                    {image.original_filename || image.filename}
                                                </p>
                                                <p className="text-xs text-gray-500">ID: {image.id}</p>
                                            </div>
                                        </div>

                                        {onDeleteImage && (
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteImage(image.id)}
                                                disabled={deletingImageId === image.id}
                                                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Trash2 size={16} />
                                                <span>{deletingImageId === image.id ? 'Eliminando...' : 'Eliminar imagen'}</span>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Este álbum todavía no tiene imágenes.</p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-md bg-gray-200 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-300"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 rounded-md bg-primary-600 px-4 py-2 font-medium text-white transition hover:bg-primary-700 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};