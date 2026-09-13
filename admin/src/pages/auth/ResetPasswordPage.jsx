import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { KeyRound, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { ErrorState } from '@/components/common/States';
import { resetPasswordSchema } from '@/utils/validationSchemas';
import { authApi } from '@/api/authApi';

// Token verification: most backends validate the reset token only when the
// new password is actually submitted (avoids leaking whether a token is
// valid before the user commits to a new password). If your backend exposes
// a separate GET /auth/verify-reset-token?token=... endpoint, call it in the
// useEffect below and set tokenStatus accordingly before rendering the form.
export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (!token) {
      toast.error('Reset link is missing or invalid');
    }
  }, [token]);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface dark:bg-surface-dark px-4">
        <ErrorState
          title="Invalid reset link"
          description="This password reset link is missing its token. Request a new one to continue."
        />
      </div>
    );
  }

  const onSubmit = async ({ password }) => {
    try {
      await authApi.resetPassword({ token, password });
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface dark:bg-surface-dark px-4">
      <div className="w-full max-w-sm">
        {isSuccess ? (
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-50 dark:bg-success-500/10">
              <CheckCircle2 className="h-6 w-6 text-success-500" />
            </div>
            <h1 className="font-display text-lg font-semibold text-ink dark:text-ink-dark">
              Password updated
            </h1>
            <p className="mt-2 text-sm text-muted dark:text-muted-dark">
              Redirecting you to sign in…
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">
                Set a new password
              </h1>
              <p className="mt-1 text-sm text-muted dark:text-muted-dark">
                Make it at least 8 characters with a number and an uppercase letter
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              <Input
                label="New password"
                type="password"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register('password')}
              />
              <Input
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
              <Button type="submit" isLoading={isSubmitting} icon={KeyRound}>
                Update password
              </Button>
              <Link
                to="/login"
                className="text-center text-sm font-medium text-muted hover:text-ink dark:text-muted-dark dark:hover:text-ink-dark"
              >
                Back to sign in
              </Link>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
