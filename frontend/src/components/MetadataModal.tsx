import React, { useState } from 'react';
import { X, FileText, Activity, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface MetadataModalProps {
    isOpen: boolean;
    onClose: () => void;
    image: any;
}

export const MetadataModal: React.FC<MetadataModalProps> = ({ isOpen, onClose, image }) => {
    if (!isOpen || !image) return null;

    const analysisDetails = image.analysis_details || {};
    const [selectedAnalysis, setSelectedAnalysis] = useState<string>('lsb');

    // Definir los análisis disponibles con nombres amigables
    const analysisOptions = [
        { key: 'lsb', name: 'Análisis LSB', icon: Activity },
        { key: 'histogram', name: 'Análisis de Histograma', icon: TrendingUp },
        { key: 'eof', name: 'Análisis de Archivo', icon: FileText },
        { key: 'frequency', name: 'Análisis de Frecuencia', icon: Activity },
        { key: 'details', name: 'Detalles Completos', icon: FileText }
    ];

    const renderAnalysisValue = (value: any) => {
        // Función para formatear números con máximos 4 decimales
        const formatNumber = (num: number) => {
            return parseFloat(num.toFixed(4));
        };

        // Función para renderizar arrays de números en formato vertical
        const renderNumberArray = (arr: number[]) => {
            return (
                <div className="space-y-1">
                    {arr.map((num, index) => (
                        <div key={index} className="flex items-center justify-between text-xs bg-white rounded px-2 py-1 border border-gray-200">
                            <span className="text-gray-600">[{index}]:</span>
                            <span className="font-medium text-gray-800">{formatNumber(num)}</span>
                        </div>
                    ))}
                </div>
            );
        };

        if (typeof value === 'number') {
            const formattedValue = formatNumber(value);
            const percentage = (formattedValue * 100).toFixed(1);
            const color = formattedValue > 0.5 ? 'text-red-600' : formattedValue > 0.3 ? 'text-yellow-600' : 'text-green-600';
            const icon = formattedValue > 0.5 ? AlertTriangle : formattedValue > 0.3 ? TrendingUp : CheckCircle;
            
            return (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {React.createElement(icon, { className: `h-4 w-4 ${color}` })}
                        <span className={`font-medium ${color}`}>{formattedValue}</span>
                    </div>
                    <span className="text-sm text-gray-600">{percentage}%</span>
                </div>
            );
        }
        
        if (typeof value === 'object' && value !== null) {
            // Si es un objeto pero está vacío
            if (Object.keys(value).length === 0) {
                return <div className="text-sm text-gray-500 italic">Objeto vacío</div>;
            }
            
            return (
                <div className="space-y-3">
                    {Object.entries(value).map(([subKey, subValue]) => (
                        <div key={subKey} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                                {subKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </div>
                            <div className="text-sm text-gray-800">
                                {typeof subValue === 'number' ? (
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{formatNumber(subValue)}</span>
                                        <span className="text-xs text-gray-600">{(formatNumber(subValue) * 100).toFixed(1)}%</span>
                                    </div>
                                ) : Array.isArray(subValue) && subValue.every(item => typeof item === 'number') ? (
                                    renderNumberArray(subValue)
                                ) : typeof subValue === 'object' && subValue !== null ? (
                                    <div className="space-y-2">
                                        {Object.entries(subValue).map(([nestedKey, nestedValue]) => (
                                            <div key={nestedKey} className="bg-white rounded p-2 border border-gray-200">
                                                <div className="text-xs font-medium text-gray-700 mb-1 capitalize">
                                                    {nestedKey.replace(/_/g, ' ')}
                                                </div>
                                                <div>
                                                    {Array.isArray(nestedValue) && nestedValue.every(item => typeof item === 'number') ? (
                                                        renderNumberArray(nestedValue)
                                                    ) : (
                                                        <div className="text-xs">
                                                            {typeof nestedValue === 'number' ? (
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Value:</span>
                                                                    <span className="font-medium text-gray-800">{formatNumber(nestedValue)}</span>
                                                                </div>
                                                            ) : (
                                                                <div className="text-gray-800">{String(nestedValue)}</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <span>{String(subValue)}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
        
        return <div className="font-medium text-gray-800">{String(value)}</div>;
    };

    const getAnalysisIcon = (key: string) => {
        if (key.includes('lsb')) return Activity;
        if (key.includes('histogram')) return TrendingUp;
        if (key.includes('frequency')) return Activity;
        if (key.includes('eof')) return FileText;
        return Activity;
    };

    const getAnalysisDescription = (key: string) => {
        const descriptions: Record<string, string> = {
            'lsb': 'Analiza los bits menos significativos de los píxeles para detectar si ocultan información secreta',
            'histogram': 'Revisa la distribución de colores de la imagen para encontrar patrones anormales',
            'frequency': 'Examina las frecuencias de la imagen para detectar anomalías ocultas',
            'eof': 'Busca datos extra ocultos al final del archivo de imagen',
            'details': 'Muestra todos los resultados detallados del análisis completo'
        };
        
        for (const [pattern, desc] of Object.entries(descriptions)) {
            if (key.includes(pattern)) return desc;
        }
        return 'Análisis técnico de esteganografía';
    };

    const getSimpleDescription = (key: string) => {
        const descriptions: Record<string, string> = {
            'lsb': '✨ Busca mensajes ocultos en los píxeles',
            'histogram': '📊 Revisa colores extraños en la imagen',
            'frequency': '🌈 Analiza patrones de frecuencia',
            'eof': '📁 Busca datos escondidos en el archivo',
            'details': '📋 Todos los resultados en detalle'
        };
        
        for (const [pattern, desc] of Object.entries(descriptions)) {
            if (key.includes(pattern)) return desc;
        }
        return '🔍 Análisis de imagen';
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative w-full max-w-5xl transform overflow-hidden rounded-xl bg-white shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Análisis Técnico de Esteganografía</h3>
                                <p className="text-sm text-gray-600">{image.original_filename}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Cerrar</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="max-h-[80vh] overflow-y-auto p-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Columna izquierda - Resumen de todos los análisis */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Análisis</h3>
                                {analysisDetails.details && Object.entries(analysisDetails.details).filter(([key]) => key !== 'details').map(([key, value]) => {
                                    const Icon = getAnalysisIcon(key);
                                    const simpleDesc = getSimpleDescription(key);
                                    const score = typeof value === 'object' && value !== null && 'score' in value ? (value as any).score : 0;
                                    const scoreColor = score > 0.5 ? 'text-red-600' : score > 0.3 ? 'text-yellow-600' : 'text-green-600';
                                    
                                    return (
                                        <div key={key} className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 hover:shadow-md transition-shadow cursor-pointer"
                                                onClick={() => setSelectedAnalysis(key)}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-start gap-2">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                                                        <Icon className="h-3 w-3 text-blue-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 text-sm capitalize">
                                                            {key.replace(/_/g, ' ')}
                                                        </h4>
                                                        <p className="text-xs text-gray-600 mt-1">{simpleDesc}</p>
                                                    </div>
                                                </div>
                                                <div className={`text-lg font-bold ${scoreColor}`}>
                                                    {typeof score === 'number' ? score.toFixed(3) : 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Columna derecha - Análisis seleccionado */}
                            <div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Seleccionar análisis para ver detalles:
                                    </label>
                                    <select 
                                        value={selectedAnalysis}
                                        onChange={(e) => setSelectedAnalysis(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {analysisOptions.map(option => (
                                            <option key={option.key} value={option.key}>
                                                {option.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-5 hover:shadow-md transition-shadow sticky top-6">
                                    {(() => {
                                        const selectedData = selectedAnalysis === 'details' ? analysisDetails.details : 
                                            (analysisDetails.details && analysisDetails.details[selectedAnalysis]) ? analysisDetails.details[selectedAnalysis] : null;
                                        const Icon = analysisOptions.find(opt => opt.key === selectedAnalysis)?.icon || Activity;
                                        const description = getAnalysisDescription(selectedAnalysis);
                                        const title = analysisOptions.find(opt => opt.key === selectedAnalysis)?.name || 'Análisis';
                                        
                                        return (
                                            <>
                                                <div className="flex items-start gap-3 mb-4">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                        <Icon className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900">{title}</h4>
                                                        <p className="text-xs text-gray-600 mt-1">{description}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-white rounded-lg border p-4">
                                                    {selectedData ? renderAnalysisValue(selectedData) : (
                                                        <div className="text-center py-4 text-gray-500">
                                                            <p className="text-sm">No hay datos disponibles para este análisis</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        {Object.keys(analysisDetails).length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                                <p className="text-lg font-medium">No hay metadatos de análisis disponibles</p>
                                <p className="text-sm text-gray-400 mt-2">Esta imagen no contiene detalles técnicos del análisis</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t bg-gray-50 px-6 py-4">
                        <div className="flex justify-between items-center">
                            <div className="text-xs text-gray-500">
                                {Object.keys(analysisDetails).length} tipos de análisis realizados • 
                                Score general: {typeof image.steganography_score === 'number' 
                                    ? image.steganography_score.toFixed(3) 
                                    : 'N/A'}
                            </div>
                            <button
                                onClick={onClose}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
