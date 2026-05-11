import React from 'react';
import { Upload, Loader2, X } from 'lucide-react';

interface UploadProgressDialogProps {
    isOpen: boolean;
    currentFileName?: string;
    currentProgress?: number;
    totalFiles?: number;
    currentFileIndex?: number;
    onCancel?: () => void;
    showCancelButton?: boolean;
}

export const UploadProgressDialog: React.FC<UploadProgressDialogProps> = ({
    isOpen,
    currentFileName = "Subiendo imagen...",
    currentProgress = 0,
    totalFiles = 1,
    currentFileIndex = 1,
    onCancel,
    showCancelButton = false
}) => {
    if (!isOpen) return null;

    const progressPercentage = Math.round(currentProgress);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

                {/* Dialog */}
                <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                        <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                                <Upload className="h-5 w-5 text-primary-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Subiendo imágenes
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Archivo {currentFileIndex} de {totalFiles}
                                </p>
                            </div>
                        </div>
                        {showCancelButton && onCancel && (
                            <button
                                onClick={onCancel}
                                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Cerrar</span>
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Current file info */}
                        <div className="mb-6">
                            <div className="flex items-center space-x-3 mb-3">
                                <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {currentFileName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Procesando archivo...
                                    </p>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-xs text-gray-500">
                                    {progressPercentage}% completado
                                </p>
                                <p className="text-xs text-gray-500">
                                    {currentFileIndex} / {totalFiles} archivos
                                </p>
                            </div>
                        </div>

                        {/* Message */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Por favor, espera mientras se suben tus imágenes.
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                                No cierres esta ventana ni navegues a otra página.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4">
                        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Analizando esteganografía...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
