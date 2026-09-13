import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { authApi } from '@/api/authApi';
import { useAuthStore } from '@/store/authStore';
import { profileSchema, changePasswordSchema } from '@/utils/validationSchemas';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';

function ProfileSection() {
  const updateUser = useAuthStore((s) => s.updateUser);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    authApi
      .getProfile()
      .then(({ data }) => {
        // GET /user/profile returns the user object directly, no wrapper — see authApi.js
        reset({ name: data.name, email: data.email, phone: data.phone || '' });
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoading(false));
  }, [reset]);

  async function onSubmit(values) {
    try {
      const { data } = await authApi.updateProfile(values);
      updateUser(data.user);
      reset(values); // clears isDirty so Save disables again until the next real change
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark p-5">
        <Skeleton className="h-5 w-32 mb-4" />
        <Skeleton className="h-10 w-full mb-3" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark p-5"
    >
      <h2 className="font-display text-sm font-semibold text-ink dark:text-ink-dark">Profile</h2>
      <div className="mt-4 flex flex-col gap-4">
        <Input label="Full Name" error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
      </div>
      <div className="mt-5 flex justify-end">
        <Button type="submit" disabled={!isDirty} isLoading={isSubmitting}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}

function ChangePasswordSection() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(changePasswordSchema) });

  async function onSubmit(values) {
    try {
      await authApi.changePassword(values);
      toast.success('Password updated');
      reset();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark p-5"
    >
      <h2 className="font-display text-sm font-semibold text-ink dark:text-ink-dark">Change Password</h2>
      <div className="mt-4 flex flex-col gap-4">
        <Input
          label="Current Password"
          type="password"
          error={errors.currentPassword?.message}
          {...register('currentPassword')}
        />
        <Input
          label="New Password"
          type="password"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <Input
          label="Confirm New Password"
          type="password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </div>
      <div className="mt-5 flex justify-end">
        <Button type="submit" isLoading={isSubmitting}>Update Password</Button>
      </div>
    </form>
  );
}

export default function SettingsPage() {
  return (
    <div className="flex max-w-xl flex-col gap-6 pb-10">
      <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">Settings</h1>
      <ProfileSection />
      <ChangePasswordSection />
    </div>
  );
}
