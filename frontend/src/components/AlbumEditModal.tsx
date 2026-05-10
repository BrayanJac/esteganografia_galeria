import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

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
    } | null;
    mode: 'user' | 'supervisor';
    onSubmit: (payload: AlbumEditPayload) => Promise<unknown>;
    isSubmitting?: boolean;
}

export const AlbumEditModal: React.FC<AlbumEditModalProps> = ({
    isOpen,
    onClose,
    album,
    mode,
    onSubmit,
    isSubmitting = false,
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [reviewComment, setReviewComment] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!isOpen || !album) {
            return;
        }

        setTitle(album.title || '');
        setDescription(album.description || '');
        setIsPublic(album.is_public ?? true);
        setReviewComment(album.review_comment || '');
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
                ...(mode === 'supervisor' ? { isPublic, reviewComment } : {}),
            });
            onClose();
        } catch (error) {
            setErrorMessage(extractErrorMessage(error));
        }
    };

    if (!isOpen || !album) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Editar álbum</h2>
                        <p className="text-sm text-gray-500">{mode === 'user' ? 'Puedes modificar nombre y descripción' : 'Puedes editar el álbum y registrar un comentario'}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 transition hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
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

                    {mode === 'supervisor' && (
                        <>
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
                        </>
                    )}

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