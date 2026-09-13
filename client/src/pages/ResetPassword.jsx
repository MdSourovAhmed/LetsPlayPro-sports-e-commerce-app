import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { AuthLayout } from "../components/auth/AuthLayout";
import { resetPasswordSchema } from "../utils/validationSchemas";
import { authApi } from "../api/authApi";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(resetPasswordSchema) });

  async function onSubmit(values) {
    if (!token) {
      toast.error("This reset link is invalid or has expired.");
      return;
    }
    setIsSubmitting(true);
    try {
      await authApi.resetPassword({ token, password: values.password });
      toast.success("Password reset — please log in with your new password.");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(err.message || "Couldn't reset your password. The link may have expired.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <AuthLayout title="Invalid Link">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-ink-soft">
            This password reset link is missing or invalid. Please request a new one.
          </p>
          <Link to="/forgot-password" className="btn-primary mt-2">
            Request New Link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset Password">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
        <div>
          <input
            type="password"
            placeholder="New Password"
            {...register("password")}
            className="input-field"
            aria-invalid={Boolean(errors.password)}
          />
          {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
        </div>
        <div>
          <input
            type="password"
            placeholder="Confirm New Password"
            {...register("confirmPassword")}
            className="input-field"
            aria-invalid={Boolean(errors.confirmPassword)}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-danger">{errors.confirmPassword.message}</p>
          )}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary mt-2">
          {isSubmitting ? "Resetting…" : "Reset Password"}
        </button>
      </form>
    </AuthLayout>
  );
}
