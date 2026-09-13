import { useQuery } from "@tanstack/react-query";
import { productApi } from "../api/productApi";

/** Filtered / paginated product listing (Shop page). */
export function useFilteredProducts(filters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => productApi.getFilteredProducts(filters),
    placeholderData: (previousData) => previousData, // keep old page visible while next loads
    staleTime: 30 * 1000,
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => productApi.getProductById(id),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}

/**
 * @param {{sport?: string, type?: string, excludeId?: string}} params
 */
export function useRelatedProducts({ sport, type, excludeId } = {}) {
  return useQuery({
    queryKey: ["products", "related", sport, type, excludeId],
    queryFn: () => productApi.getRelatedProducts({ sport, type, excludeId }),
    enabled: Boolean(sport || type),
  });
}

export function useLatestProducts(limit = 8) {
  return useQuery({
    queryKey: ["products", "latest", limit],
    queryFn: () => productApi.getLatestProducts(limit),
    staleTime: 60 * 1000,
  });
}

export function useBestSellers(limit = 8) {
  return useQuery({
    queryKey: ["products", "bestsellers", limit],
    queryFn: () => productApi.getBestSellers(limit),
    staleTime: 60 * 1000,
  });
}
