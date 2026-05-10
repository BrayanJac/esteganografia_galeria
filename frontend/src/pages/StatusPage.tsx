import React from 'react';
import { Navbar } from '@components/Navbar';
import { useQuery } from '@tanstack/react-query';
import api from '@services/api';
import { Loader, Shield, LogIn, LogOut, Users, Image as ImageIcon } from 'lucide-react';

export const StatusPage: React.FC = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['admin', 'stats'],
        queryFn: async () => {
            const response = await api.getAdminStats();
            return response.data;
        },
    });

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Estado</h1>
                        <p className="mt-2 text-gray-600">Seguimiento de accesos, actividad y revisiones del sistema.</p>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-16">
                            <Loader className="animate-spin text-primary-600" size={36} />
                        </div>
                    ) : error ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                            No se pudo cargar el estado del sistema.
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                {[
                                    { label: 'Usuarios', value: data?.summary?.users ?? 0, icon: Users },
                                    { label: 'Supervisores', value: data?.summary?.supervisors ?? 0, icon: Shield },
                                    { label: 'Ingresos', value: data?.summary?.login_events ?? 0, icon: LogIn },
                                    { label: 'Salidas', value: data?.summary?.logout_events ?? 0, icon: LogOut },
                                    { label: 'Álbumes', value: data?.summary?.albums ?? 0, icon: ImageIcon },
                                    { label: 'Álbumes aprobados', value: data?.summary?.approved_albums ?? 0, icon: ImageIcon },
                                    { label: 'Imágenes', value: data?.summary?.images ?? 0, icon: ImageIcon },
                                    { label: 'En cuarentena', value: data?.summary?.quarantined_images ?? 0, icon: Shield },
                                ].map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={item.label} className="rounded-2xl border bg-white p-5 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-500">{item.label}</p>
                                                    <p className="mt-2 text-3xl font-bold text-gray-900">{item.value}</p>
                                                </div>
                                                <div className="rounded-full bg-primary-50 p-3 text-primary-600">
                                                    <Icon size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 grid gap-6 xl:grid-cols-2">
                                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                                    <h2 className="text-lg font-semibold text-gray-900">Usuarios</h2>
                                    <div className="mt-4 space-y-3">
                                        {data?.users?.map((user: any) => (
                                            <div key={user.id} className="rounded-xl border bg-gray-50 p-4">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{user.username}</p>
                                                        <p className="text-sm text-gray-500">{user.role} · {user.email}</p>
                                                    </div>
                                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {user.is_active ? 'Activo' : 'Bloqueado'}
                                                    </span>
                                                </div>
                                                <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600 md:grid-cols-4">
                                                    <div>Álbumes: {user.album_count ?? 0}</div>
                                                    <div>Imágenes: {user.image_count ?? 0}</div>
                                                    <div>Ingresos: {user.login_success_count ?? 0}</div>
                                                    <div>Fallos: {user.login_failure_count ?? 0}</div>
                                                </div>
                                                <p className="mt-3 text-xs text-gray-500">Último acceso: {user.last_login_attempt ? new Date(user.last_login_attempt).toLocaleString() : 'N/A'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                                    <h2 className="text-lg font-semibold text-gray-900">Supervisores</h2>
                                    <div className="mt-4 space-y-3">
                                        {data?.supervisors?.map((supervisor: any) => (
                                            <div key={supervisor.id} className="rounded-xl border bg-gray-50 p-4">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{supervisor.username}</p>
                                                        <p className="text-sm text-gray-500">{supervisor.email}</p>
                                                    </div>
                                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${supervisor.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {supervisor.is_active ? 'Activo' : 'Bloqueado'}
                                                    </span>
                                                </div>
                                                <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600 md:grid-cols-4">
                                                    <div>Revisados: {supervisor.reviewed_album_count ?? 0}</div>
                                                    <div>Aprobados: {supervisor.approved_album_count ?? 0}</div>
                                                    <div>Rechazados: {supervisor.rejected_album_count ?? 0}</div>
                                                    <div>Última revisión: {supervisor.last_review_at ? new Date(supervisor.last_review_at).toLocaleString() : 'N/A'}</div>
                                                </div>
                                                <p className="mt-3 text-xs text-gray-500">Último acceso: {supervisor.last_login_attempt ? new Date(supervisor.last_login_attempt).toLocaleString() : 'N/A'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-gray-900">Actividad reciente</h2>
                                <div className="mt-4 space-y-3">
                                    {data?.recent_events?.length > 0 ? data.recent_events.map((event: any) => (
                                        <div key={event.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-gray-50 p-4 text-sm">
                                            <div>
                                                <p className="font-medium text-gray-900">{event.event_type}</p>
                                                <p className="text-gray-600">{event.description}</p>
                                            </div>
                                            <div className="text-right text-gray-500">
                                                <p>{event.username || 'Sistema'}</p>
                                                <p>{event.created_at ? new Date(event.created_at).toLocaleString() : 'N/A'}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-gray-500">Aún no hay eventos recientes.</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};