import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { authApi } from "../../api/authApi";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function Settings() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(changePasswordSchema) });

  async function onSubmit(values) {
    setIsSubmitting(true);
    try {
      await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success("Password changed successfully");
      reset();
    } catch (err) {
      toast.error(err.message || "Couldn't change your password. Check your current password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-md">
      <h2 className="mb-6 font-display text-2xl text-ink">Settings</h2>

      <div className="border-t border-line pt-6">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink">Change Password</h3>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
          <div>
            <input
              type="password"
              placeholder="Current Password"
              {...register("currentPassword")}
              className="input-field"
            />
            {errors.currentPassword && (
              <p className="mt-1 text-xs text-danger">{errors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <input
              type="password"
              placeholder="New Password"
              {...register("newPassword")}
              className="input-field"
            />
            {errors.newPassword && <p className="mt-1 text-xs text-danger">{errors.newPassword.message}</p>}
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirm New Password"
              {...register("confirmPassword")}
              className="input-field"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-danger">{errors.confirmPassword.message}</p>
            )}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary mt-2 self-start">
            {isSubmitting ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
