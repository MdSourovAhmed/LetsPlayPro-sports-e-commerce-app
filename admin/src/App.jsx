import { Toaster } from 'react-hot-toast';
import { AppRouter } from '@/routes';
import { useAuthBoot } from '@/hooks/useAuthBoot';
import { useAuthStore } from '@/store/authStore';
import { FullPageSpinner } from '@/components/common/Spinner';

export default function App() {
  // Kicks off the boot-time silent refresh-token exchange (cookie-based — see
  // hooks/useAuthBoot.js) and drives useAuthStore's isBooting flag. This is the fix for a
  // real class of "session doesn't persist" bug: without this gate, ProtectedRoute/
  // PublicOnlyRoute would make their redirect decision on the very first render, before the
  // network call that would confirm a valid session cookie exists has any chance to resolve,
  // and could bounce an actually-logged-in admin to /login. Unlike the old localStorage-based
  // approach this replaced, this spinner reflects a REAL network round-trip, not just a
  // storage read — expect it on screen for a brief but genuine moment on every hard refresh,
  // not just a single tick.
  const isBooting = useAuthStore((s) => s.isBooting);
  useAuthBoot();

  if (isBooting) return <FullPageSpinner />;

  return (
    <>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg, #fff)',
            color: 'var(--toast-color, #1A1B1E)',
            fontSize: '14px',
          },
        }}
      />
    </>
  );
}
