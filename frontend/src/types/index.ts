export type UserRole = 'user' | 'supervisor' | 'admin';
export type AlbumStatus = 'pending' | 'approved' | 'rejected';
export type ImageStatus = 'pending_analysis' | 'clean' | 'quarantined' | 'approved' | 'rejected';

export interface User {
    id: number;
    username: string;
    email: string;
    role: UserRole;
    is_active: boolean;
    created_at?: string;
    last_login_attempt?: string | null;
    failed_login_attempts?: number;
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
    owner?: string;
    reviewer_id?: number;
    reviewer?: string | null;
    review_comment?: string;
    created_at: string;
    updated_at?: string;
    image_count?: number;
    cover_image_filename?: string | null;
    latest_image_filename?: string | null;
    latest_image_created_at?: string | null;
    images?: Image[];
}

export interface Image {
    id: number;
    filename: string;
    original_filename?: string;
    status: ImageStatus;
    album_id?: number;
    steganography_detected: boolean;
    uploader_id?: number;
    uploader?: string | null;
    review_comment?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    analysis_result?: {
        techniques: string[];
        confidence: number;
    };
    uploaded_at: string;
    analyzed_at?: string;
}

export interface AdminStatistics {
    summary: {
        users: number;
        supervisors: number;
        albums: number;
        approved_albums: number;
        pending_albums: number;
        images: number;
        quarantined_images: number;
        login_events: number;
        logout_events: number;
    };
    users: Array<Record<string, unknown>>;
    supervisors: Array<Record<string, unknown>>;
    recent_events: Array<Record<string, unknown>>;
}

export interface HealthCheck {
    estado: string;
    timestamp: string;
    database: string;
}
