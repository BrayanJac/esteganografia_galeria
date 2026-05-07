import React, { useState } from 'react';
import { useCreateAlbum } from '@hooks/useGallery';
import { X } from 'lucide-react';

interface AlbumModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AlbumModal: React.FC<AlbumModalProps> = ({ isOpen, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const createAlbum = useCreateAlbum();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createAlbum.mutateAsync({ title, description, isPublic });
            setTitle('');
            setDescription('');
            setIsPublic(true);
            onClose();
        } catch (error) {
            console.error('Error creating album:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold">Crear nuevo álbum</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Título</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Descripción</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isPublic"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="rounded"
                        />
                        <label htmlFor="isPublic" className="ml-2 text-gray-700">
                            Público
                        </label>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 rounded-md"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={createAlbum.isPending}
                            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-md disabled:opacity-50"
                        >
                            {createAlbum.isPending ? 'Creando...' : 'Crear'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
