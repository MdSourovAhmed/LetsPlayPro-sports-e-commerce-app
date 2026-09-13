import { useState } from "react";
import { MapPin, Star, Pencil, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import {
  useAddresses,
  useAddAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from "../../hooks/useAddresses";
import { AddressForm } from "../../components/account/AddressForm";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Skeleton } from "../../components/ui/Skeleton";

export default function AddressBook() {
  const { data: addresses, isLoading, isError, error, refetch } = useAddresses();
  const addAddress = useAddAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const setDefaultAddress = useSetDefaultAddress();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  async function handleAdd(values) {
    try {
      await addAddress.mutateAsync(values);
      toast.success("Address saved");
      setIsAdding(false);
    } catch (err) {
      toast.error(err.message || "Couldn't save this address.");
    }
  }

  async function handleUpdate(addressId, values) {
    try {
      await updateAddress.mutateAsync({ addressId, payload: values });
      toast.success("Address updated");
      setEditingId(null);
    } catch (err) {
      toast.error(err.message || "Couldn't update this address.");
    }
  }

  async function handleDelete(addressId) {
    try {
      await deleteAddress.mutateAsync(addressId);
      toast.success("Address removed");
    } catch (err) {
      toast.error(err.message || "Couldn't remove this address.");
    }
  }

  async function handleSetDefault(addressId) {
    try {
      await setDefaultAddress.mutateAsync(addressId);
    } catch (err) {
      toast.error(err.message || "Couldn't update your default address.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex max-w-2xl flex-col gap-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (isError) {
    return <ErrorState message={error?.message} onRetry={refetch} />;
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl text-ink">Address Book</h2>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="flex items-center gap-1.5 text-sm text-ink hover:underline">
            <Plus className="h-4 w-4" /> Add Address
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mb-6 border border-line p-5">
          <AddressForm onSubmit={handleAdd} onCancel={() => setIsAdding(false)} submitLabel="Add Address" />
        </div>
      )}

      {addresses.length === 0 && !isAdding ? (
        <EmptyState
          icon={<MapPin className="h-10 w-10" strokeWidth={1.25} />}
          title="No saved addresses"
          description="Add an address to speed up checkout next time."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {addresses.map((address) =>
            editingId === address._id ? (
              <div key={address._id} className="border border-line p-5">
                <AddressForm
                  defaultValues={address}
                  onSubmit={(values) => handleUpdate(address._id, values)}
                  onCancel={() => setEditingId(null)}
                  submitLabel="Update Address"
                />
              </div>
            ) : (
              <div key={address._id} className="flex items-start justify-between gap-4 border border-line p-5">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-medium text-ink">{address.label}</span>
                    {address.isDefault && (
                      <span className="flex items-center gap-1 text-[11px] text-accent-dark">
                        <Star className="h-3 w-3 fill-current" /> Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-ink-soft">
                    {address.firstName} {address.lastName}
                  </p>
                  <p className="text-sm text-ink-soft">{address.street}</p>
                  <p className="text-sm text-ink-soft">
                    {address.city}, {address.zip}, {address.country}
                  </p>
                  <p className="text-sm text-ink-soft">{address.phone}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2 text-xs">
                  <button onClick={() => setEditingId(address._id)} className="flex items-center gap-1 text-ink-soft hover:text-ink">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(address._id)}
                    className="flex items-center gap-1 text-ink-soft hover:text-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                  {!address.isDefault && (
                    <button onClick={() => handleSetDefault(address._id)} className="text-ink-soft hover:text-ink">
                      Set as default
                    </button>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
