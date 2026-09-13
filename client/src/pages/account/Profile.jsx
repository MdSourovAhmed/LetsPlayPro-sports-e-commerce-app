import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { authApi } from "../../api/authApi";
import { useAuthStore } from "../../store/useAuthStore";
import { Skeleton } from "../../components/ui/Skeleton";
import { ErrorState } from "../../components/ui/ErrorState";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  phone: z.string().optional(),
});

export default function Profile() {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["user", "profile"],
    queryFn: () => authApi.getProfile(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    if (data?.user) {
      reset({ name: data.user.name ?? "", email: data.user.email ?? "", phone: data.user.phone ?? "" });
    }
  }, [data, reset]);

  const updateMutation = useMutation({
    mutationFn: (values) => authApi.updateProfile(values),
    onSuccess: (res) => {
      setUser(res.user);
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
      toast.success("Profile updated");
    },
    onError: (err) => toast.error(err.message || "Couldn't update your profile."),
  });

  if (isLoading) {
    return (
      <div className="flex max-w-md flex-col gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  if (isError) {
    return <ErrorState message={error?.message} onRetry={refetch} />;
  }

  return (
    <div className="max-w-md">
      <h2 className="mb-6 font-display text-2xl text-ink">Profile</h2>
      <form onSubmit={handleSubmit((values) => updateMutation.mutate(values))} className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs text-ink-soft">Full Name</label>
          <input {...register("name")} className="input-field" />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-soft">Email</label>
          <input type="email" {...register("email")} className="input-field" />
          {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-soft">Phone</label>
          <input {...register("phone")} className="input-field" />
        </div>
        <button
          type="submit"
          disabled={!isDirty || updateMutation.isPending}
          className="btn-primary mt-2 self-start"
        >
          {updateMutation.isPending ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
