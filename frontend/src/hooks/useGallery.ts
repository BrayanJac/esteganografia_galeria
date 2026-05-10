import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@services/api';

export const usePublicGallery = () => {
    return useQuery({
        queryKey: ['gallery', 'public'],
        queryFn: async () => {
            const response = await api.getPublicGallery();
            return response.data;
        },
    });
};

export const useGalleryAlbum = (albumId: number) => {
    return useQuery({
        queryKey: ['gallery', 'album', albumId],
        queryFn: async () => {
            const response = await api.getGalleryAlbum(albumId);
            return response.data;
        },
        enabled: !!albumId,
    });
};

export const useUserAlbums = () => {
    return useQuery({
        queryKey: ['albums', 'user'],
        queryFn: async () => {
            const response = await api.getAlbums();
            return response.data;
        },
    });
};

export const useLibraryAlbums = () => {
    return useQuery({
        queryKey: ['albums', 'library'],
        queryFn: async () => {
            const response = await api.getAccessibleAlbums();
            return response.data;
        },
    });
};

export const useCreateAlbum = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { title: string; description?: string; isPublic?: boolean }) =>
            api.createAlbum(data.title, data.description, data.isPublic),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['albums'] });
        },
    });
};

export const useUpdateAlbum = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { albumId: number; title?: string; description?: string; isPublic?: boolean }) =>
            api.updateAlbum(data.albumId, { title: data.title, description: data.description, is_public: data.isPublic }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['albums'] });
            queryClient.invalidateQueries({ queryKey: ['gallery'] });
        },
    });
};

export const useUploadImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { albumId: number; file: File }) =>
            api.uploadImage(data.albumId, data.file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['images'] });
            queryClient.invalidateQueries({ queryKey: ['albums'] });
        },
    });
};

export const usePendingAlbums = () => {
    return useQuery({
        queryKey: ['albums', 'pending'],
        queryFn: async () => {
            const response = await api.getPendingAlbums();
            return response.data;
        },
    });
};

export const useAdminAlbums = () => {
    return useQuery({
        queryKey: ['albums', 'admin'],
        queryFn: async () => {
            const response = await api.getAdminAlbums();
            return response.data;
        },
    });
};

export const useReviewedAlbums = () => {
    return useQuery({
        queryKey: ['albums', 'reviewed'],
        queryFn: async () => {
            const response = await api.getReviewedAlbums();
            return response.data;
        },
    });
};

export const useQuarantinedImages = () => {
    return useQuery({
        queryKey: ['images', 'quarantined'],
        queryFn: async () => {
            const response = await api.getQuarantinedImages();
            return response.data;
        },
    });
};

export const useApproveAlbum = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { albumId: number; approved: boolean; comment?: string }) =>
            api.approveAlbum(data.albumId, data.approved, data.comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['albums', 'pending'] });
            queryClient.invalidateQueries({ queryKey: ['albums', 'admin'] });
            queryClient.invalidateQueries({ queryKey: ['albums', 'reviewed'] });
        },
    });
};

export const useDeleteAlbum = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (albumId: number) => api.deleteAlbum(albumId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['albums', 'pending'] });
            queryClient.invalidateQueries({ queryKey: ['albums', 'admin'] });
            queryClient.invalidateQueries({ queryKey: ['albums'] });
            queryClient.invalidateQueries({ queryKey: ['gallery'] });
        },
    });
};

export const useReviewImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { imageId: number; approved: boolean; comment?: string }) =>
            api.reviewImage(data.imageId, data.approved, data.comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['images', 'quarantined'] });
            queryClient.invalidateQueries({ queryKey: ['gallery'] });
            queryClient.invalidateQueries({ queryKey: ['albums'] });
            queryClient.invalidateQueries({ queryKey: ['albums', 'reviewed'] });
        },
    });
};

export const useUpdateAlbumReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { albumId: number; approved?: boolean; isPublic?: boolean; reviewComment?: string }) =>
            api.updateAlbumReview(data.albumId, {
                approved: data.approved,
                isPublic: data.isPublic,
                reviewComment: data.reviewComment,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['albums'] });
            queryClient.invalidateQueries({ queryKey: ['gallery'] });
        },
    });
};

export const useDeleteImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (imageId: number) => api.deleteImage(imageId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['images'] });
            queryClient.invalidateQueries({ queryKey: ['albums'] });
            queryClient.invalidateQueries({ queryKey: ['gallery'] });
        },
    });
};
