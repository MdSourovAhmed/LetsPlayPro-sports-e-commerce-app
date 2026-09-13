import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { ArrowLeft, MailCheck, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { forgotPasswordSchema } from '@/utils/validationSchemas';
import { authApi } from '@/api/authApi';

export default function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: '' } });

  const onSubmit = async ({ email }) => {
    try {
      await authApi.forgotPassword(email);
      setSubmittedEmail(email);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface dark:bg-surface-dark px-4">
      <div className="w-full max-w-sm">
        {submittedEmail ? (
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-50 dark:bg-success-500/10">
              <MailCheck className="h-6 w-6 text-success-500" />
            </div>
            <h1 className="font-display text-lg font-semibold text-ink dark:text-ink-dark">
              Check your email
            </h1>
            <p className="mt-2 text-sm text-muted dark:text-muted-dark">
              If an account exists for <span className="font-medium">{submittedEmail}</span>, a
              password reset link is on its way.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              <ArrowLeft className="h-4 w-4" /> Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">
                Reset your password
              </h1>
              <p className="mt-1 text-sm text-muted dark:text-muted-dark">
                Enter your email and we'll send you a reset link
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
              <Button type="submit" isLoading={isSubmitting} icon={Send}>
                Send reset link
              </Button>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-muted hover:text-ink dark:text-muted-dark dark:hover:text-ink-dark"
              >
                <ArrowLeft className="h-4 w-4" /> Back to sign in
              </Link>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
