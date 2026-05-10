import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ImageLightboxProps {
    isOpen: boolean;
    src: string;
    alt: string;
    title?: string;
    onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ isOpen, src, alt, title, onClose }) => {
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);

        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6" onClick={onClose}>
            <div
                className="relative w-full max-w-6xl rounded-xl bg-white p-4 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-gray-700 shadow hover:text-gray-900"
                    aria-label="Cerrar vista previa"
                >
                    <X size={20} />
                </button>

                {title && <h3 className="mb-3 pr-12 text-lg font-semibold text-gray-800">{title}</h3>}

                <div className="flex max-h-[85vh] items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                    <img
                        src={src}
                        alt={alt}
                        className="max-h-[85vh] max-w-full object-contain"
                    />
                </div>
            </div>
        </div>
    );
};