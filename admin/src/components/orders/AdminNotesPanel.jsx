import { useState } from 'react';
import { StickyNote } from 'lucide-react';
import { formatDateTime } from '@/utils/formatters';
import { Button } from '../common/Button';
import { useAuthStore } from '@/store/authStore';

/**
 * @param {{notes: Array, onAddNote: (note: string) => Promise<void>}} props
 */
export function AdminNotesPanel({ notes, onAddNote }) {
  const [draft, setDraft] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentUserId = useAuthStore((s) => s.user?.id);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddNote(draft.trim());
      setDraft('');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark p-5">
      <h2 className="flex items-center gap-2 font-display text-sm font-semibold text-ink dark:text-ink-dark">
        <StickyNote className="h-4 w-4" /> Internal Notes
      </h2>
      <p className="mt-1 text-xs text-muted dark:text-muted-dark">Only visible to staff — never shown to the customer.</p>

      <div className="mt-4 flex flex-col gap-3">
        {notes.length === 0 && <p className="text-sm text-muted dark:text-muted-dark">No notes yet.</p>}
        {notes.map((note, i) => (
          <div key={i} className="rounded-lg bg-surface dark:bg-surface-dark p-3">
            <p className="text-sm text-ink dark:text-ink-dark">{note.note}</p>
            <p className="mt-1 text-xs text-muted dark:text-muted-dark">
              {note.addedBy === currentUserId ? 'You' : 'Staff'} · {formatDateTime(note.addedAt)}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <textarea
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a note…"
          className="flex-1 rounded-lg border border-border dark:border-border-dark bg-panel dark:bg-panel-dark px-3 py-2 text-sm text-ink dark:text-ink-dark focus:border-brand-500"
        />
        <Button type="submit" size="sm" isLoading={isSubmitting} disabled={!draft.trim()}>
          Add
        </Button>
      </form>
    </div>
  );
}
