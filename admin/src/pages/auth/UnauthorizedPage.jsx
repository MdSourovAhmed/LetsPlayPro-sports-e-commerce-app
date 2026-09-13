import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/common/Button';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface dark:bg-surface-dark px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-attention-50 dark:bg-attention-500/10">
        <ShieldAlert className="h-7 w-7 text-attention-500" />
      </div>
      <div>
        <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">
          You don't have access to this page
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted dark:text-muted-dark">
          Your account role doesn't include permission for this section. Contact a super admin if
          you think this is a mistake.
        </p>
      </div>
      <Link to="/">
        <Button variant="secondary">Back to dashboard</Button>
      </Link>
    </div>
  );
}
