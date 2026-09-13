import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const addressSchema = z.object({
  label: z.string().min(1, "Give this address a label (e.g. Home, Office)"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  zip: z.string().min(1, "ZIP / postal code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().min(6, "Enter a valid phone number"),
});

/**
 * @param {{defaultValues?: object, onSubmit: (values: object) => void, onCancel: () => void, submitLabel?: string}} props
 */
export function AddressForm({ defaultValues, onSubmit, onCancel, submitLabel = "Save Address" }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(addressSchema), defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
      <div>
        <input placeholder="Label (e.g. Home, Office)" {...register("label")} className="input-field" />
        {errors.label && <p className="mt-1 text-xs text-danger">{errors.label.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <input placeholder="First Name" {...register("firstName")} className="input-field" />
          {errors.firstName && <p className="mt-1 text-xs text-danger">{errors.firstName.message}</p>}
        </div>
        <div>
          <input placeholder="Last Name" {...register("lastName")} className="input-field" />
          {errors.lastName && <p className="mt-1 text-xs text-danger">{errors.lastName.message}</p>}
        </div>
      </div>
      <div>
        <input placeholder="Street Address" {...register("street")} className="input-field" />
        {errors.street && <p className="mt-1 text-xs text-danger">{errors.street.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <input placeholder="City" {...register("city")} className="input-field" />
          {errors.city && <p className="mt-1 text-xs text-danger">{errors.city.message}</p>}
        </div>
        <div>
          <input placeholder="ZIP / Postal Code" {...register("zip")} className="input-field" />
          {errors.zip && <p className="mt-1 text-xs text-danger">{errors.zip.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <input placeholder="Country" {...register("country")} className="input-field" />
          {errors.country && <p className="mt-1 text-xs text-danger">{errors.country.message}</p>}
        </div>
        <div>
          <input placeholder="Phone" {...register("phone")} className="input-field" />
          {errors.phone && <p className="mt-1 text-xs text-danger">{errors.phone.message}</p>}
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" className="btn-primary">
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}
