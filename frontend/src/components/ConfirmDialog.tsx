import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    type = 'danger'
}) => {
    if (!isOpen) return null;

    const getIconAndColors = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: AlertTriangle,
                    iconBg: 'bg-red-100',
                    iconColor: 'text-red-600',
                    confirmBg: 'bg-red-600 hover:bg-red-700',
                    confirmTextColor: 'text-white'
                };
            case 'warning':
                return {
                    icon: AlertTriangle,
                    iconBg: 'bg-yellow-100',
                    iconColor: 'text-yellow-600',
                    confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
                    confirmTextColor: 'text-white'
                };
            case 'info':
                return {
                    icon: AlertTriangle,
                    iconBg: 'bg-blue-100',
                    iconColor: 'text-blue-600',
                    confirmBg: 'bg-blue-600 hover:bg-blue-700',
                    confirmTextColor: 'text-white'
                };
            default:
                return {
                    icon: AlertTriangle,
                    iconBg: 'bg-red-100',
                    iconColor: 'text-red-600',
                    confirmBg: 'bg-red-600 hover:bg-red-700',
                    confirmTextColor: 'text-white'
                };
        }
    };

    const { icon: Icon, iconBg, iconColor, confirmBg, confirmTextColor } = getIconAndColors();

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={onCancel}
                />

                {/* Dialog */}
                <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                    {/* Close button */}
                    <button
                        onClick={onCancel}
                        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Cerrar</span>
                    </button>

                    <div className="p-6">
                        {/* Icon */}
                        <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${iconBg} mb-4`}>
                            <Icon className={`h-6 w-6 ${iconColor}`} />
                        </div>

                        {/* Content */}
                        <div className="text-center">
                            <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-2">
                                {title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-6">
                                {message}
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
                            <button
                                onClick={onCancel}
                                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors ${confirmBg} ${confirmTextColor}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
