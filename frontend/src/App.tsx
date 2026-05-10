import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@store/authStore';
import { ProtectedRoute } from '@components/ProtectedRoute';
import { GuestRoute } from '@components/GuestRoute';
import { HomePage } from '@pages/HomePage';
import { LoginPage } from '@pages/LoginPage';
import { RegisterPage } from '@pages/RegisterPage';
import { GalleryPage } from '@pages/GalleryPage';
import { AdminPage } from '@pages/AdminPage';
import { UsersPage } from '@pages/UsersPage';
import { AlbumDetailPage } from '@pages/AlbumDetailPage';

const queryClient = new QueryClient();

function App() {
    const initializeAuth = useAuthStore((state) => state.initializeAuth);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route
                        path="/login"
                        element={
                            <GuestRoute>
                                <LoginPage />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <GuestRoute>
                                <RegisterPage />
                            </GuestRoute>
                        }
                    />

                    <Route
                        path="/gallery"
                        element={
                            <ProtectedRoute>
                                <GalleryPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/gallery/:albumId"
                        element={<AlbumDetailPage />}
                    />

                    <Route
                        path="/album/:albumId"
                        element={
                            <ProtectedRoute>
                                <AlbumDetailPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute requiredRole="supervisor">
                                <AdminPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/users"
                        element={
                            <ProtectedRoute requiredRole="admin">
                                <UsersPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </QueryClientProvider>
    );
}

export default App;
