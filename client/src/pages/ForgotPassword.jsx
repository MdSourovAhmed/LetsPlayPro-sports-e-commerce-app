import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { AuthLayout } from "../components/auth/AuthLayout";
import { forgotPasswordSchema } from "../utils/validationSchemas";
import { authApi } from "../api/authApi";

export default function ForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values) {
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(values.email);
    } catch {
      // Intentionally don't surface errors here — don't reveal whether an email is registered.
    } finally {
      setIsSubmitting(false);
      setSent(true);
    }
  }

  if (sent) {
    return (
      <AuthLayout title="Check Your Email">
        <div className="flex flex-col items-center gap-3 text-center">
          <MailCheck className="h-8 w-8 text-ink" strokeWidth={1.25} />
          <p className="text-sm text-ink-soft">
            If an account exists with that email, we've sent a link to reset your password.
          </p>
          <Link to="/login" className="btn-ghost mt-2">
            Back to Login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot Password">
      <p className="-mt-2 text-center text-sm text-ink-soft">
        Enter your email and we'll send you a link to reset your password.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
        <div>
          <input
            type="email"
            placeholder="Email"
            {...register("email")}
            className="input-field"
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary mt-2">
          {isSubmitting ? "Sending…" : "Send Reset Link"}
        </button>
        <Link to="/login" className="text-center text-xs text-ink-soft hover:text-ink">
          Back to Login
        </Link>
      </form>
    </AuthLayout>
  );
}
