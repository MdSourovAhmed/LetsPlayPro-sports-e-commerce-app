import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { AuthLayout } from "../components/auth/AuthLayout";
import { GoogleAuthButton } from "../components/auth/GoogleAuthButton";
import { OrDivider } from "../components/auth/OrDivider";
import { registerSchema } from "../utils/validationSchemas";
import { authApi } from "../api/authApi";
import { useAuthStore } from "../store/useAuthStore";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loginSuccess = useAuthStore((s) => s.loginSuccess);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values) {
    setIsSubmitting(true);
    try {
      const res = await authApi.signup({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      loginSuccess(res);
      toast.success("Account created! Welcome to LetsPlayPro.");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err.message || "Couldn't create your account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Sign Up">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
        <div>
          <input
            placeholder="Name"
            {...register("name")}
            className="input-field"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
        </div>

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

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            {...register("password")}
            className="input-field pr-10"
            aria-invalid={Boolean(errors.password)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
        </div>

        <div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            {...register("confirmPassword")}
            className="input-field"
            aria-invalid={Boolean(errors.confirmPassword)}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-danger">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex items-center justify-end text-xs">
          <Link to="/login" className="text-ink-soft hover:text-ink">
            Login Here
          </Link>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary mt-2">
          {isSubmitting ? "Creating account…" : "Sign Up"}
        </button>
      </form>

      <OrDivider />
      <GoogleAuthButton redirectTo="/" />
    </AuthLayout>
  );
}
