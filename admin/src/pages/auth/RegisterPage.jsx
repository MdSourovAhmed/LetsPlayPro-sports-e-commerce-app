import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, FlaskConical } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { adminRegisterSchema } from '@/utils/validationSchemas';
import { authApi } from '@/api/authApi';
import { useAuthStore } from '@/store/authStore';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(adminRegisterSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', role: 'staff', inviteCode: '' },
  });

  const onSubmit = async (values) => {
    try {
      const { data } = await authApi.adminRegister(values);
      setSession(data);
      toast.success(`Test account created — welcome, ${data.user.name}`);
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface dark:bg-surface-dark px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 font-display text-lg font-bold text-white">
            LP
          </div>
          <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">
            Create a Test Account
          </h1>
          <p className="mt-1 text-sm text-muted dark:text-muted-dark">
            For development and testing only
          </p>
        </div>

        <div className="mb-5 flex gap-2.5 rounded-lg border border-attention-500/30 bg-attention-50 p-3 text-xs text-attention-600 dark:bg-attention-500/10 dark:text-attention-500">
          <FlaskConical className="h-4 w-4 shrink-0" />
          <p>
            This creates a real staff/admin account and only works if your backend has
            explicitly enabled it (<code className="font-mono">ADMIN_REGISTRATION_CODE</code>
            {' '}set). It's off by default and should never be turned on in production — ask
            whoever set up this environment for the invite code.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Input label="Full Name" error={errors.name?.message} {...register('name')} />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
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

          <Input
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink dark:text-ink-dark">Role</label>
            <select
              className="h-10 rounded-lg border border-border dark:border-border-dark bg-panel dark:bg-panel-dark px-3 text-sm text-ink dark:text-ink-dark focus:border-brand-500"
              {...register('role')}
            >
              <option value="staff">Staff — view access, limited actions</option>
              <option value="admin">Admin — full management access</option>
            </select>
            <p className="text-xs text-muted dark:text-muted-dark">
              Super Admin can't be self-registered — that role is reserved for manual setup.
            </p>
          </div>

          <Input
            label="Invite Code"
            error={errors.inviteCode?.message}
            placeholder="From ADMIN_REGISTRATION_CODE"
            {...register('inviteCode')}
          />

          <Button type="submit" isLoading={isSubmitting} icon={UserPlus} className="mt-1">
            Create Test Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted dark:text-muted-dark">
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
