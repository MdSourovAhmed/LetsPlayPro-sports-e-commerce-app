import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { loginSchema } from '@/utils/validationSchemas';
import { authApi } from '@/api/authApi';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = async (values) => {
    try {
      const { data } = await authApi.login(values);
      setSession(data);
      toast.success(`Welcome back, ${data.user.name}`);
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface dark:bg-surface-dark px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 font-display text-lg font-bold text-white">
            LP
          </div>
          <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">
            LetsPlayPro Admin
          </h1>
          <p className="mt-1 text-sm text-muted dark:text-muted-dark">
            Manage products, orders, and customers
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-[34px] text-muted hover:text-ink dark:text-muted-dark dark:hover:text-ink-dark"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-muted dark:text-muted-dark">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border dark:border-border-dark text-brand-500 focus-visible:ring-brand-500"
                {...register('rememberMe')}
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" isLoading={isSubmitting} icon={LogIn} className="mt-1">
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted dark:text-muted-dark">
          Setting up a test environment?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
            Create a test admin account
          </Link>
        </p>
      </div>
    </div>
  );
}
