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
                config.headers['Authorization'] = `Bearer ${token}`;
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
        return this.client.post('/auth/register', {
            username,
            email,
            password
        });
    }

    async login(username: string, password: string) {
        return this.client.post('/auth/login', {
            username,
            password
        });
    }

    async getCurrentUser() {
        return this.client.get('/auth/me');
    }

    // Admin/Supervisor management endpoints
    async createSupervisor(username: string, email: string, password: string) {
        return this.client.post('/auth/supervisors', {
            username,
            email,
            password
        });
    }

    async deleteSupervisor(supervisorId: number) {
        return this.client.delete(`/auth/supervisors/${supervisorId}`);
    }

    async deleteUser(userId: number) {
        return this.client.delete(`/auth/users/${userId}`);
    }

    // Album endpoints
    async getAlbums() {
        return this.client.get('/albums');
    }

    async getAccessibleAlbums() {
        return this.client.get('/albums/library');
    }

    async getAlbumById(albumId: number) {
        return this.client.get(`/albums/${albumId}`);
    }

    async getPendingAlbums() {
        return this.client.get('/albums/pending');
    }

    async getAdminAlbums() {
        return this.client.get('/albums/admin');
    }

    async getReviewedAlbums() {
        return this.client.get('/albums/reviewed');
    }

    async createAlbum(title: string, description?: string, isPublic?: boolean) {
        return this.client.post('/albums', {
            title,
            description,
            is_public: isPublic ?? true
        });
    }

    async updateAlbum(albumId: number, data: { title?: string; description?: string }) {
        return this.client.put(`/albums/${albumId}`, data);
    }

    async updateAlbumReview(albumId: number, data: { approved?: boolean; reviewComment?: string }) {
        return this.client.put(`/albums/${albumId}/review`, {
            approved: data.approved,
            review_comment: data.reviewComment,
        });
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

    async deleteUserImage(imageId: number) {
        return this.client.delete(`/images/${imageId}`);
    }

    async getQuarantinedImages() {
        return this.client.get('/images/quarantined');
    }

    async approveAlbum(albumId: number, approved: boolean, comment?: string) {
        return this.client.post(`/albums/${albumId}/approve`, {
            approved,
            comment
        });
    }

    async reviewImage(imageId: number, approved: boolean, comment?: string) {
        return this.client.post(`/images/${imageId}/review`, {
            approved,
            comment
        });
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

    async getSupervisors() {
        return this.client.get('/auth/supervisors');
    }

    async getUsers() {
        return this.client.get('/auth/users');
    }
}

export default new ApiClient();
