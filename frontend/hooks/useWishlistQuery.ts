import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, Wishlist } from '@/lib/api';

export function useWishlistQuery() {
    const queryClient = useQueryClient();

    const wishlistQuery = useQuery({
        queryKey: ['wishlist'],
        queryFn: apiClient.getWishlist,
        retry: 1,
        staleTime: 1000 * 60, // 1 minute
    });

    const verifyWishlistData = (data: any): Wishlist => {
        if (!data) return { id: 0, userId: '', items: [] };
        return {
            ...data,
            items: Array.isArray(data.items) ? data.items : []
        };
    };

    const addToWishlistMutation = useMutation({
        mutationFn: apiClient.addToWishlist,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        },
    });

    const removeFromWishlistMutation = useMutation({
        mutationFn: apiClient.removeFromWishlist,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        },
    });

    return {
        wishlist: verifyWishlistData(wishlistQuery.data),
        isLoading: wishlistQuery.isLoading,
        isError: wishlistQuery.isError,
        addToWishlist: addToWishlistMutation.mutate,
        removeFromWishlist: removeFromWishlistMutation.mutate,
    };
}
