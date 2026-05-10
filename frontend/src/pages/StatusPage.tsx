import React, { useState } from 'react';
import { Navbar } from '@components/Navbar';
import { useQuery } from '@tanstack/react-query';
import api from '@services/api';
import { Loader, Shield, LogIn, LogOut, Users, Image as ImageIcon } from 'lucide-react';

const formatDate = (iso?: string | null) => {
    if (!iso) return 'N/A';
    try {
        return new Date(iso).toLocaleString(undefined, { timeZone: 'America/Guayaquil' });
    } catch {
        return new Date(iso).toLocaleString();
    }
};

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
        <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{title}</h3>
                <button onClick={onClose} className="text-gray-500">Cerrar</button>
            </div>
            <div>{children}</div>
        </div>
    </div>
);

export const StatusPage: React.FC = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['admin', 'stats'],
        queryFn: async () => {
            const response = await api.getAdminStats();
            return response.data;
        },
    });

    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    const openUsers = async () => {
        const res = await api.getAdminUsers();
        setModalTitle('Usuarios');
        setModalContent(
            <div className="space-y-2 max-h-[60vh] overflow-auto">
                {res.data.map((u: any) => (
                    <div key={u.id} className="rounded-md border p-3 flex items-center justify-between">
                        <div>
                            <div className="font-semibold">{u.username}</div>
                            <div className="text-xs text-gray-500">{u.email} · {u.role}</div>
                        </div>
                        <div className="text-xs text-gray-500">Último ingreso: {formatDate(u.last_login_attempt)}</div>
                    </div>
                ))}
            </div>
        );
        setModalOpen(true);
    };

    const openAlbums = async () => {
        const res = await api.getAdminAlbums();
        setModalTitle('Álbumes');
        setModalContent(
            <div className="space-y-2 max-h-[60vh] overflow-auto">
                {res.data.map((a: any) => (
                    <div key={a.id} className="rounded-md border p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-semibold">{a.title}</div>
                                <div className="text-xs text-gray-500">Por: {a.owner || 'N/A'}</div>
                            </div>
                            <div className="text-xs text-gray-500">{a.status}</div>
                        </div>
                        <div className="text-xs text-gray-400 mt-2">Imágenes: {a.image_count}</div>
                    </div>
                ))}
            </div>
        );
        setModalOpen(true);
    };

    const openEvents = async (direction?: string) => {
        const res = await api.getAdminEvents(direction);
        setModalTitle(direction === 'ingress' ? 'Ingresos' : direction === 'egress' ? 'Salidas' : 'Eventos');
        // separate by role
        const byRole: Record<string, any[]> = {};
        for (const ev of res.data) {
            const role = ev.role || 'system';
            byRole[role] = byRole[role] || [];
            byRole[role].push(ev);
        }

        setModalContent(
            <div className="space-y-4 max-h-[60vh] overflow-auto">
                {Object.keys(byRole).map((role) => (
                    <div key={role}>
                        <h4 className="font-semibold mb-2">{role}</h4>
                        <div className="space-y-2">
                            {byRole[role].map((ev: any) => (
                                <div key={ev.id} className="rounded-md border p-2 flex justify-between text-sm">
                                    <div>
                                        <div className="font-medium">{ev.event_type}</div>
                                        <div className="text-gray-600">{ev.description}</div>
                                    </div>
                                    <div className="text-gray-500">{ev.username || 'Sistema'} · {formatDate(ev.created_at)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
        setModalOpen(true);
    };

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
                                        { label: 'Usuarios', value: data?.summary?.users ?? 0, icon: Users, onClick: openUsers },
                                        { label: 'Supervisores', value: data?.summary?.supervisors ?? 0, icon: Shield, onClick: () => openUsers() },
                                        { label: 'Ingresos', value: data?.summary?.login_events ?? 0, icon: LogIn, onClick: () => openEvents('ingress') },
                                        { label: 'Salidas', value: data?.summary?.logout_events ?? 0, icon: LogOut, onClick: () => openEvents('egress') },
                                        { label: 'Álbumes', value: data?.summary?.albums ?? 0, icon: ImageIcon, onClick: openAlbums },
                                        { label: 'Álbumes aprobados', value: data?.summary?.approved_albums ?? 0, icon: ImageIcon, onClick: openAlbums },
                                        { label: 'Imágenes', value: data?.summary?.images ?? 0, icon: ImageIcon, onClick: () => openEvents() },
                                        { label: 'En cuarentena', value: data?.summary?.quarantined_images ?? 0, icon: Shield, onClick: () => openAlbums() },
                                    ].map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <button key={item.label} onClick={item.onClick} className="text-left rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-gray-500">{item.label}</p>
                                                        <p className="mt-2 text-3xl font-bold text-gray-900">{item.value}</p>
                                                    </div>
                                                    <div className="rounded-full bg-primary-50 p-3 text-primary-600">
                                                        <Icon size={20} />
                                                    </div>
                                                </div>
                                            </button>
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
                                                <p className="mt-3 text-xs text-gray-500">Último acceso: {user.last_login_attempt ? formatDate(user.last_login_attempt) : 'N/A'}</p>
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
                                                    <div>Última revisión: {supervisor.last_review_at ? formatDate(supervisor.last_review_at) : 'N/A'}</div>
                                                </div>
                                                <p className="mt-3 text-xs text-gray-500">Último acceso: {supervisor.last_login_attempt ? formatDate(supervisor.last_login_attempt) : 'N/A'}</p>
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
                                                <p>{formatDate(event.created_at)}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-gray-500">Aún no hay eventos recientes.</p>
                                    )}
                                </div>
                            </div>
                            {modalOpen && (
                                <Modal title={modalTitle} onClose={() => setModalOpen(false)}>
                                    {modalContent}
                                </Modal>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};