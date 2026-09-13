import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "../api/orderApi";

export function useMyOrders() {
  return useQuery({
    queryKey: ["orders", "my"],
    queryFn: () => orderApi.getMyOrders(),
    staleTime: 30 * 1000,
  });
}

export function useOrder(orderId) {
  return useQuery({
    queryKey: ["orders", "my", orderId],
    queryFn: () => orderApi.getOrderById(orderId),
    enabled: Boolean(orderId),
    staleTime: 30 * 1000,
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason }) => orderApi.cancelOrder(orderId, reason),
    // Invalidating ["orders", "my"] also covers ["orders", "my", orderId] —
    // TanStack Query matches query keys by prefix.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders", "my"] }),
  });
}
