export type UserRole = 'user' | 'supervisor' | 'admin';
export type AlbumStatus = 'pending' | 'approved' | 'rejected';
export type ImageStatus = 'pending_analysis' | 'clean' | 'quarantined' | 'approved' | 'rejected';

export interface User {
    id: number;
    username: string;
    email: string;
    role: UserRole;
    is_active: boolean;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export interface Album {
    id: number;
    title: string;
    description?: string;
    status: AlbumStatus;
    is_public: boolean;
    owner_id: number;
    reviewer_id?: number;
    review_comment?: string;
    created_at: string;
    updated_at: string;
    images?: Image[];
}

export interface Image {
    id: number;
    filename: string;
    status: ImageStatus;
    album_id: number;
    steganography_detected: boolean;
    analysis_result?: {
        techniques: string[];
        confidence: number;
    };
    uploaded_at: string;
    analyzed_at?: string;
}

export interface HealthCheck {
    estado: string;
    timestamp: string;
    database: string;
}
