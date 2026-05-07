import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Interceptor de request para agregar token
        this.client.interceptors.request.use((config) => {
            const token = localStorage.getItem('access_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        // Interceptor de response para manejar errores
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    // Auth endpoints
    async register(username: string, email: string, password: string) {
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('email', email);
        params.append('password', password);

        return this.client.post('/auth/register', params);
    }

    async login(username: string, password: string) {
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);

        return this.client.post('/auth/login', params);
    }

    async getCurrentUser() {
        return this.client.get('/auth/me');
    }

    // Album endpoints
    async getAlbums() {
        return this.client.get('/albums');
    }

    async getAlbumById(albumId: number) {
        return this.client.get(`/albums/${albumId}`);
    }

    async createAlbum(title: string, description?: string, isPublic?: boolean) {
        const params = new URLSearchParams();
        params.append('title', title);
        if (description) params.append('description', description);
        if (isPublic !== undefined) params.append('is_public', String(isPublic));

        return this.client.post('/albums', params);
    }

    async updateAlbum(albumId: number, data: any) {
        const params = new URLSearchParams();
        Object.keys(data).forEach((key) => {
            if (data[key] !== undefined) {
                params.append(key, String(data[key]));
            }
        });

        return this.client.put(`/albums/${albumId}`, params);
    }

    async deleteAlbum(albumId: number) {
        return this.client.delete(`/albums/${albumId}`);
    }

    // Image endpoints
    async uploadImage(albumId: number, file: File) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('album_id', String(albumId));

        return this.client.post('/images/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    async getImages(albumId: number) {
        return this.client.get(`/images?album_id=${albumId}`);
    }

    async deleteImage(imageId: number) {
        return this.client.delete(`/images/${imageId}`);
    }

    // Gallery endpoints
    async getPublicGallery() {
        return this.client.get('/gallery');
    }

    async getGalleryAlbum(albumId: number) {
        return this.client.get(`/gallery/${albumId}`);
    }

    // Health check
    async healthCheck() {
        return this.client.get('/health');
    }
}

export default new ApiClient();
