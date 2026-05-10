import React, { useState } from 'react';
import { useEffect } from 'react';
import { Navbar } from '@components/Navbar';
import { ImageLightbox } from '@components/ImageLightbox';
import { useAuth } from '@hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApproveAlbum, useDeleteAlbum, usePendingAlbums, useQuarantinedImages, useReviewedAlbums, useReviewImage } from '@hooks/useGallery';
import { CheckCircle, Loader, Trash2, XCircle, ShieldAlert } from 'lucide-react';

const getLastComment = (commentString: string | null | undefined): string | null => {
    if (!commentString) return null;
    const lines = commentString.trim().split('\n');
    return lines.length > 0 ? lines[lines.length - 1] : null;
};

export const AdminPage: React.FC = () => {
    const { user, isSupervisor, isAdmin } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { data: pendingAlbums, isLoading: isLoadingPending } = usePendingAlbums();
    const { data: reviewedAlbums, isLoading: isLoadingReviewedAlbums } = useReviewedAlbums();
    const { data: quarantinedImages, isLoading: isLoadingQuarantined } = useQuarantinedImages();
    const approveAlbum = useApproveAlbum();
    const reviewImage = useReviewImage();
    const deleteAlbum = useDeleteAlbum();
    const [approvalComment, setApprovalComment] = useState<Record<number, string>>({});
    const [imageComment, setImageComment] = useState<Record<number, string>>({});
    const [activeView, setActiveView] = useState<'pending' | 'reviewed' | 'quarantine'>('pending');
    const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; title?: string } | null>(null);
    const [expandedAnalysisImageId, setExpandedAnalysisImageId] = useState<number | null>(null);

    useEffect(() => {
        const tab = new URLSearchParams(location.search).get('tab');

        if (tab === 'pending' || tab === 'reviewed' || tab === 'quarantine') {
            setActiveView(tab);
        }
    }, [location.search]);

    if (!isSupervisor) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Acceso Denegado</h1>
                        <p className="text-gray-600">No tienes permisos para acceder a esta página</p>
                    </div>
                </div>
            </>
        );
    }

    const handleApprove = async (albumId: number, approved: boolean) => {
        await approveAlbum.mutateAsync({
            albumId,
            approved,
            comment: approvalComment[albumId] || undefined,
        });

        setApprovalComment((previousComments) => {
            const nextComments = { ...previousComments };
            delete nextComments[albumId];
            return nextComments;
        });
    };

    const handleDeleteAlbum = async (albumId: number) => {
        await deleteAlbum.mutateAsync(albumId);
    };
    const reviewedAlbumList = reviewedAlbums?.albums || [];
    const quarantinedImageList = quarantinedImages || [];

    const handleReviewImage = async (imageId: number, approved: boolean) => {
        await reviewImage.mutateAsync({
            imageId,
            approved,
            comment: imageComment[imageId] || undefined,
        });

        setImageComment((previousComments) => {
            const nextComments = { ...previousComments };
            delete nextComments[imageId];
            return nextComments;
        });
    };

    const renderStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
        if (status === 'approved') {
            return <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">✓ Aprobado</span>;
        }

        if (status === 'rejected') {
            return <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">✗ Rechazado</span>;
        }

        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">⏳ Pendiente</span>;
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">
                        {isAdmin ? 'Panel de Administración' : 'Panel de Supervisión'}
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Estadísticas</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tu rol:</span>
                                    <span className="font-bold text-primary-600 capitalize">
                                        {user?.role === 'admin' ? 'Superadministrador' : 'Supervisor'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Pendientes:</span>
                                    <span className="font-bold text-yellow-600">{pendingAlbums?.length || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Revisadas:</span>
                                    <span className="font-bold text-primary-600">{reviewedAlbumList.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">En cuarentena:</span>
                                    <span className="font-bold text-red-600">{quarantinedImageList.length}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Acciones Rápidas</h2>
                            <div className="space-y-2">
                                <button
                                    onClick={() => navigate('/admin?tab=reviewed')}
                                    className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-left"
                                >
                                    👁️ Revisar galerías
                                </button>
                                <button
                                    onClick={() => navigate('/admin?tab=quarantine')}
                                    className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-left"
                                >
                                    🔍 Revisar imágenes en cuarentena
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                        <button
                            onClick={() => setActiveView('pending')}
                            className={`px-4 py-2 rounded-md font-medium border ${activeView === 'pending'
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            Pendientes
                        </button>
                        <button
                            onClick={() => setActiveView('reviewed')}
                            className={`px-4 py-2 rounded-md font-medium border ${activeView === 'reviewed'
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            Revisadas
                        </button>
                        <button
                            onClick={() => setActiveView('quarantine')}
                            className={`px-4 py-2 rounded-md font-medium border ${activeView === 'quarantine'
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            Cuarentena
                        </button>
                    </div>

                    {activeView === 'pending' && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-6">Álbumes en Revisión</h2>

                            {isLoadingPending ? (
                                <div className="flex justify-center py-8">
                                    <Loader className="animate-spin text-primary-600" size={32} />
                                </div>
                            ) : pendingAlbums && pendingAlbums.length > 0 ? (
                                <div className="space-y-4">
                                    {pendingAlbums.map((album: any) => (
                                        <div key={album.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                                            <div className="mb-4">
                                                <div className="flex justify-between items-start mb-2 gap-4">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-bold text-gray-800">{album.title}</h3>
                                                        <p className="text-sm text-gray-600 mt-1">{album.description}</p>
                                                        <div className="text-xs text-gray-500 mt-2">
                                                            <span className="font-medium">Creado por:</span> <strong>{album.owner}</strong>
                                                        </div>
                                                    </div>
                                                    {renderStatusBadge('pending')}
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-3">
                                                    <div>
                                                        <span className="font-medium">Fecha:</span> {new Date(album.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <textarea
                                                    placeholder="Añade un comentario (opcional)"
                                                    value={approvalComment[album.id] || ''}
                                                    onChange={(event) =>
                                                        setApprovalComment((previousComments) => ({
                                                            ...previousComments,
                                                            [album.id]: event.target.value,
                                                        }))
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                                                    rows={2}
                                                />

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApprove(album.id, true)}
                                                        disabled={approveAlbum.isPending}
                                                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-md flex items-center justify-center space-x-2 font-medium"
                                                    >
                                                        <CheckCircle size={18} />
                                                        <span>{approveAlbum.isPending ? 'Procesando...' : 'Aprobar'}</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleApprove(album.id, false)}
                                                        disabled={approveAlbum.isPending}
                                                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-md flex items-center justify-center space-x-2 font-medium"
                                                    >
                                                        <XCircle size={18} />
                                                        <span>{approveAlbum.isPending ? 'Procesando...' : 'Rechazar'}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">No hay álbumes pendientes de revisión</div>
                            )}
                        </div>
                    )}

                    {activeView === 'reviewed' && (
                        <div className="bg-white rounded-lg shadow p-6 mt-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-6">Galerías revisadas</h2>

                            {isLoadingReviewedAlbums ? (
                                <div className="flex justify-center py-8">
                                    <Loader className="animate-spin text-primary-600" size={32} />
                                </div>
                            ) : reviewedAlbumList.length > 0 ? (
                                <div className="space-y-4">
                                    {reviewedAlbumList.map((album: any) => {
                                        const currentStatus = album.status as 'pending' | 'approved' | 'rejected';
                                        const nextApproved = currentStatus !== 'approved';
                                        const toggleLabel = currentStatus === 'approved' ? 'Rechazar' : 'Aprobar';

                                        return (
                                            <div key={album.id} className="border rounded-lg p-4 bg-gray-50">
                                                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <h3 className="text-lg font-bold text-gray-800">{album.title}</h3>
                                                            {renderStatusBadge(currentStatus)}
                                                            {album.is_public && (
                                                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                                                                    🌐 Público
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="text-sm text-gray-600">{album.description || 'Sin descripción'}</p>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                                            <div>
                                                                <span className="font-medium">Creado por:</span> {album.owner}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Imágenes:</span> {album.image_count || 0}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Revisor:</span> {album.reviewer || 'N/A'}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Fecha:</span>{' '}
                                                                {album.created_at ? new Date(album.created_at).toLocaleDateString() : 'N/A'}
                                                            </div>
                                                        </div>

                                                        {album.review_comment && getLastComment(album.review_comment) && (
                                                            <div className="text-sm text-gray-700 bg-white border rounded-md p-3">
                                                                <span className="font-medium">Último comentario:</span>
                                                                <div className="mt-2 text-gray-600">{getLastComment(album.review_comment)}</div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="w-full lg:w-80 space-y-3">
                                                        <textarea
                                                            placeholder="Añade un comentario de revisión (opcional)"
                                                            value={approvalComment[album.id] || ''}
                                                            onChange={(event) =>
                                                                setApprovalComment((previousComments) => ({
                                                                    ...previousComments,
                                                                    [album.id]: event.target.value,
                                                                }))
                                                            }
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                                                            rows={3}
                                                        />

                                                        <div className="flex flex-col gap-2">
                                                            <button
                                                                onClick={() => handleApprove(album.id, nextApproved)}
                                                                disabled={approveAlbum.isPending || deleteAlbum.isPending}
                                                                className={`w-full px-4 py-2 rounded-md text-white font-medium flex items-center justify-center gap-2 ${currentStatus === 'approved' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} disabled:opacity-50`}
                                                            >
                                                                {currentStatus === 'approved' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                                                                <span>{approveAlbum.isPending ? 'Procesando...' : toggleLabel}</span>
                                                            </button>

                                                            {isAdmin && (
                                                                <button
                                                                    onClick={() => handleDeleteAlbum(album.id)}
                                                                    disabled={deleteAlbum.isPending || approveAlbum.isPending}
                                                                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-md font-medium flex items-center justify-center gap-2"
                                                                >
                                                                    <Trash2 size={18} />
                                                                    <span>{deleteAlbum.isPending ? 'Eliminando...' : 'Eliminar'}</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">No hay galerías revisadas</div>
                            )}
                        </div>
                    )}

                    {activeView === 'quarantine' && (
                        <div className="bg-white rounded-lg shadow p-6 mt-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <ShieldAlert size={20} />
                                <span>Imágenes en cuarentena</span>
                            </h2>

                            {isLoadingQuarantined ? (
                                <div className="flex justify-center py-8">
                                    <Loader className="animate-spin text-primary-600" size={32} />
                                </div>
                            ) : quarantinedImageList.length > 0 ? (
                                <div className="space-y-4">
                                    {quarantinedImageList.map((image: any) => (
                                        <div key={image.id} className="border border-red-200 bg-red-50 rounded-lg p-4">
                                            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <h3 className="text-lg font-bold text-gray-800">{image.original_filename}</h3>
                                                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                                                            ⚠️ Cuarentena
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedImage({
                                                            src: `/api/uploads/${image.filename}`,
                                                            alt: image.original_filename,
                                                            title: image.original_filename,
                                                        })}
                                                        className="block w-full overflow-hidden rounded-lg border border-red-200 bg-white text-left shadow-sm"
                                                    >
                                                        <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden">
                                                            <img
                                                                src={`/api/uploads/${image.filename}`}
                                                                alt={image.original_filename}
                                                                className="h-full w-full object-contain"
                                                                onError={(event) => {
                                                                    (event.target as HTMLImageElement).style.display = 'none';
                                                                }}
                                                            />
                                                        </div>
                                                    </button>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                                        <div><span className="font-medium">Álbum:</span> {image.album}</div>
                                                        <div><span className="font-medium">Subido por:</span> {image.uploader}</div>
                                                        <div><span className="font-medium">Nombre original:</span> {image.original_filename}</div>
                                                        <div><span className="font-medium">Tipo:</span> {image.mime_type || 'N/A'}</div>
                                                        <div><span className="font-medium">Tamaño:</span> {typeof image.file_size === 'number' ? `${(image.file_size / (1024 * 1024)).toFixed(2)} MB` : 'N/A'}</div>
                                                        <div><span className="font-medium">Score:</span> {typeof image.steganography_score === 'number' ? image.steganography_score.toFixed(3) : 'N/A'}</div>
                                                        <div><span className="font-medium">Fecha:</span> {image.created_at ? new Date(image.created_at).toLocaleDateString() : 'N/A'}</div>
                                                    </div>

                                                    {image.quarantine_reason && (
                                                        <div className="text-sm text-gray-700 bg-white border rounded-md p-3">
                                                            <span className="font-medium">Motivo:</span> {image.quarantine_reason}
                                                        </div>
                                                    )}

                                                    <div className="rounded-md border border-red-200 bg-white p-3 text-sm text-gray-700">
                                                        <button
                                                            type="button"
                                                            onClick={() => setExpandedAnalysisImageId((currentId) => currentId === image.id ? null : image.id)}
                                                            className="font-medium text-primary-600 hover:text-primary-700"
                                                        >
                                                            {expandedAnalysisImageId === image.id ? 'Ocultar metadatos técnicos' : 'Ver metadatos técnicos'}
                                                        </button>

                                                        {expandedAnalysisImageId === image.id && (
                                                            <div className="mt-3 space-y-3">
                                                                <div>
                                                                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Detalles del análisis</div>
                                                                    <pre className="mt-2 overflow-auto rounded-md bg-gray-50 p-3 text-xs leading-5 text-gray-700">
                                                                        {JSON.stringify(image.analysis_details || {}, null, 2)}
                                                                    </pre>
                                                                </div>

                                                                <div>
                                                                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Hash del archivo</div>
                                                                    <div className="mt-1 break-all rounded-md bg-gray-50 p-3 text-xs text-gray-700">
                                                                        {image.file_hash || 'N/A'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="w-full lg:w-80 space-y-3">
                                                    <textarea
                                                        placeholder="Añade un comentario de revisión (opcional)"
                                                        value={imageComment[image.id] || ''}
                                                        onChange={(event) =>
                                                            setImageComment((previousComments) => ({
                                                                ...previousComments,
                                                                [image.id]: event.target.value,
                                                            }))
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                                                        rows={3}
                                                    />

                                                    <div className="flex flex-col gap-2">
                                                        <button
                                                            onClick={() => handleReviewImage(image.id, true)}
                                                            disabled={reviewImage.isPending}
                                                            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-md font-medium flex items-center justify-center gap-2"
                                                        >
                                                            <CheckCircle size={18} />
                                                            <span>{reviewImage.isPending ? 'Procesando...' : 'Aprobar imagen'}</span>
                                                        </button>

                                                        <button
                                                            onClick={() => handleReviewImage(image.id, false)}
                                                            disabled={reviewImage.isPending}
                                                            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-md font-medium flex items-center justify-center gap-2"
                                                        >
                                                            <XCircle size={18} />
                                                            <span>{reviewImage.isPending ? 'Procesando...' : 'Rechazar imagen'}</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">No hay imágenes en cuarentena</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <ImageLightbox
                isOpen={!!selectedImage}
                src={selectedImage?.src || ''}
                alt={selectedImage?.alt || ''}
                title={selectedImage?.title}
                onClose={() => setSelectedImage(null)}
            />
        </>
    );
};
