import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, Cart } from '@/lib/api';

export function useCartQuery() {
    const queryClient = useQueryClient();

    const cartQuery = useQuery({
        queryKey: ['cart'],
        queryFn: apiClient.getCart,
        retry: 1,
        staleTime: 1000 * 60, // 1 minute
    });

    const verifyCartData = (data: any): Cart => {
        if (!data) return { id: 0, userId: '', items: [] };
        // Ensure items is always an array
        return {
            ...data,
            items: Array.isArray(data.items) ? data.items : []
        };
    };

    const addToCartMutation = useMutation({
        mutationFn: apiClient.addToCart,
        onSuccess: (newCart) => {
            queryClient.setQueryData(['cart'], verifyCartData(newCart));
        },
    });

    const updateQuantityMutation = useMutation({
        mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
            apiClient.updateCartItem(productId, quantity),
        onSuccess: (newCart) => {
            queryClient.setQueryData(['cart'], verifyCartData(newCart));
        },
    });

    const removeFromCartMutation = useMutation({
        mutationFn: apiClient.removeCartItem,
        onSuccess: (newCart) => {
            queryClient.setQueryData(['cart'], verifyCartData(newCart));
        },
    });

    const clearCartMutation = useMutation({
        mutationFn: apiClient.clearCart,
        onSuccess: () => {
            queryClient.setQueryData(['cart'], { id: 0, userId: '', items: [] });
        },
    });

    return {
        cart: verifyCartData(cartQuery.data),
        isLoading: cartQuery.isLoading,
        isError: cartQuery.isError,
        addToCart: addToCartMutation.mutate,
        updateQuantity: updateQuantityMutation.mutate,
        removeFromCart: removeFromCartMutation.mutate,
        clearCart: clearCartMutation.mutate,
    };
}
