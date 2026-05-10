import React, { useState } from 'react';
import { Navbar } from '@components/Navbar';
import { useAuth } from '@hooks/useAuth';
import { Plus, Users, Shield, Trash2, Loader, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@services/api';

export const UsersPage: React.FC = () => {
    const { isAdmin } = useAuth();
    const [isCreateSupervisorModalOpen, setIsCreateSupervisorModalOpen] = useState(false);
    const [supervisorForm, setSupervisorForm] = useState({ username: '', email: '', password: '' });
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'user' | 'supervisor'; id: number; name: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // Queries
    const { data: supervisorsData, isLoading: loadingSupervisors } = useQuery({
        queryKey: ['supervisors'],
        queryFn: () => apiClient.getSupervisors(),
        enabled: isAdmin
    });

    const { data: usersData, isLoading: loadingUsers } = useQuery({
        queryKey: ['users'],
        queryFn: () => apiClient.getUsers(),
        enabled: isAdmin
    });

    const supervisors = supervisorsData?.data?.supervisors || [];
    const users = usersData?.data?.users || [];

    // Mutations
    const createSupervisorMutation = useMutation({
        mutationFn: () => apiClient.createSupervisor(supervisorForm.username, supervisorForm.email, supervisorForm.password),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supervisors'] });
            setIsCreateSupervisorModalOpen(false);
            setSupervisorForm({ username: '', email: '', password: '' });
            setError(null);
        },
        onError: (err: any) => {
            setError(err.response?.data?.detail || 'Error al crear supervisor');
        }
    });

    const deleteSupervisorMutation = useMutation({
        mutationFn: (id: number) => apiClient.deleteSupervisor(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supervisors'] });
            setDeleteConfirm(null);
            setError(null);
        },
        onError: (err: any) => {
            setError(err.response?.data?.detail || 'Error al eliminar supervisor');
        }
    });

    const deleteUserMutation = useMutation({
        mutationFn: (id: number) => apiClient.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setDeleteConfirm(null);
            setError(null);
        },
        onError: (err: any) => {
            setError(err.response?.data?.detail || 'Error al eliminar usuario');
        }
    });

    if (!isAdmin) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Acceso Denegado</h1>
                        <p className="text-gray-600">Solo administradores pueden acceder a esta página</p>
                    </div>
                </div>
            </>
        );
    }

    const handleDeleteConfirm = () => {
        if (!deleteConfirm) return;
        if (deleteConfirm.type === 'supervisor') {
            deleteSupervisorMutation.mutate(deleteConfirm.id);
        } else {
            deleteUserMutation.mutate(deleteConfirm.id);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">Gestión de Usuarios</h1>

                    {/* Supervisors Section */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                                <Shield size={24} />
                                <span>Supervisores</span>
                            </h2>
                            <button
                                onClick={() => setIsCreateSupervisorModalOpen(true)}
                                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
                            >
                                <Plus size={20} />
                                <span>Crear Supervisor</span>
                            </button>
                        </div>

                        {loadingSupervisors ? (
                            <div className="flex justify-center py-8">
                                <Loader className="animate-spin text-primary-600" size={24} />
                            </div>
                        ) : supervisors.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-100 border-b">
                                        <tr>
                                            <th className="px-4 py-2 font-semibold">Nombre</th>
                                            <th className="px-4 py-2 font-semibold">Email</th>
                                            <th className="px-4 py-2 font-semibold">Estado</th>
                                            <th className="px-4 py-2 font-semibold">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {supervisors.map((supervisor: any) => (
                                            <tr key={supervisor.id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3">{supervisor.username}</td>
                                                <td className="px-4 py-3">{supervisor.email}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${supervisor.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {supervisor.is_active ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => setDeleteConfirm({ type: 'supervisor', id: supervisor.id, name: supervisor.username })}
                                                        className="text-red-600 hover:text-red-800 flex items-center space-x-1"
                                                    >
                                                        <Trash2 size={18} />
                                                        <span>Eliminar</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>No hay supervisores creados</p>
                            </div>
                        )}
                    </div>

                    {/* Users Section */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                            <Users size={24} />
                            <span>Usuarios</span>
                        </h2>

                        {loadingUsers ? (
                            <div className="flex justify-center py-8">
                                <Loader className="animate-spin text-primary-600" size={24} />
                            </div>
                        ) : users.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-100 border-b">
                                        <tr>
                                            <th className="px-4 py-2 font-semibold">Nombre</th>
                                            <th className="px-4 py-2 font-semibold">Email</th>
                                            <th className="px-4 py-2 font-semibold">Álbumes</th>
                                            <th className="px-4 py-2 font-semibold">Estado</th>
                                            <th className="px-4 py-2 font-semibold">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user: any) => (
                                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3">{user.username}</td>
                                                <td className="px-4 py-3">{user.email}</td>
                                                <td className="px-4 py-3">{user.album_count || 0}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {user.is_active ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => setDeleteConfirm({ type: 'user', id: user.id, name: user.username })}
                                                        disabled={user.album_count > 0}
                                                        className={`flex items-center space-x-1 ${user.album_count > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-800'
                                                            }`}
                                                        title={user.album_count > 0 ? 'El usuario tiene álbumes' : ''}
                                                    >
                                                        <Trash2 size={18} />
                                                        <span>Eliminar</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>No hay usuarios registrados</p>
                            </div>
                        )}
                    </div>

                    {/* Create Supervisor Modal */}
                    {isCreateSupervisorModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">Crear Nuevo Supervisor</h3>

                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
                                        <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-red-700 text-sm">{error}</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre de usuario
                                        </label>
                                        <input
                                            type="text"
                                            value={supervisorForm.username}
                                            onChange={(e) =>
                                                setSupervisorForm((prev) => ({
                                                    ...prev,
                                                    username: e.target.value,
                                                }))
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                                            placeholder="supervisor_nombre"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={supervisorForm.email}
                                            onChange={(e) =>
                                                setSupervisorForm((prev) => ({
                                                    ...prev,
                                                    email: e.target.value,
                                                }))
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                                            placeholder="supervisor@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Contraseña
                                        </label>
                                        <input
                                            type="password"
                                            value={supervisorForm.password}
                                            onChange={(e) =>
                                                setSupervisorForm((prev) => ({
                                                    ...prev,
                                                    password: e.target.value,
                                                }))
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
                                            placeholder="Contraseña segura (mín. 12 caracteres)"
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <button
                                            onClick={() => {
                                                setIsCreateSupervisorModalOpen(false);
                                                setSupervisorForm({ username: '', email: '', password: '' });
                                                setError(null);
                                            }}
                                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={() => {
                                                setError(null);
                                                createSupervisorMutation.mutate();
                                            }}
                                            disabled={createSupervisorMutation.isPending || !supervisorForm.username || !supervisorForm.email || !supervisorForm.password}
                                            className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center justify-center space-x-2"
                                        >
                                            {createSupervisorMutation.isPending ? (
                                                <>
                                                    <Loader size={18} className="animate-spin" />
                                                    <span>Creando...</span>
                                                </>
                                            ) : (
                                                <span>Crear</span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delete Confirmation Modal */}
                    {deleteConfirm && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">Confirmar Eliminación</h3>
                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
                                        <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-red-700 text-sm">{error}</p>
                                    </div>
                                )}
                                <p className="text-gray-600 mb-6">
                                    ¿Estás seguro de que deseas eliminar a <strong>{deleteConfirm.name}</strong>? Esta acción no se puede deshacer.
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setDeleteConfirm(null);
                                            setError(null);
                                        }}
                                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDeleteConfirm}
                                        disabled={deleteSupervisorMutation.isPending || deleteUserMutation.isPending}
                                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center justify-center space-x-2"
                                    >
                                        {deleteSupervisorMutation.isPending || deleteUserMutation.isPending ? (
                                            <>
                                                <Loader size={18} className="animate-spin" />
                                                <span>Eliminando...</span>
                                            </>
                                        ) : (
                                            <span>Eliminar</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
