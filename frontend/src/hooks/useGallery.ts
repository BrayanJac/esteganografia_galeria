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

export const useApproveAlbum = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { albumId: number; approved: boolean; comment?: string }) =>
            api.approveAlbum(data.albumId, data.approved, data.comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['albums', 'pending'] });
        },
    });
};
