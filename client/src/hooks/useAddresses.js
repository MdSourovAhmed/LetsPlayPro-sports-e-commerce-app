import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/authApi";

const ADDRESSES_KEY = ["user", "addresses"];

export function useAddresses() {
  return useQuery({
    queryKey: ADDRESSES_KEY,
    queryFn: () => authApi.getAddresses(),
    staleTime: 60 * 1000,
  });
}

/** Every address mutation's response is the full updated list — just replace the cache with it. */
function useAddressMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (addresses) => queryClient.setQueryData(ADDRESSES_KEY, addresses),
  });
}

export function useAddAddress() {
  return useAddressMutation((payload) => authApi.addAddress(payload));
}

export function useUpdateAddress() {
  return useAddressMutation(({ addressId, payload }) => authApi.updateAddress(addressId, payload));
}

export function useDeleteAddress() {
  return useAddressMutation((addressId) => authApi.deleteAddress(addressId));
}

export function useSetDefaultAddress() {
  return useAddressMutation((addressId) => authApi.setDefaultAddress(addressId));
}
