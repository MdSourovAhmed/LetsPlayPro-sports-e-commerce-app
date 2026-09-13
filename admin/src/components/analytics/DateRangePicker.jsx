const RANGES = [
  { value: 'daily', label: 'Last 24 Hours' },
  { value: 'weekly', label: 'Last 7 Days' },
  { value: 'monthly', label: 'Last 30 Days' },
  { value: 'yearly', label: 'Last Year' },
  { value: 'custom', label: 'Custom' },
];

/**
 * @param {{value: {range: string, from: string, to: string}, onChange: (next: object) => void}} props
 */
export function DateRangePicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <select
        value={value.range}
        onChange={(e) => onChange({ ...value, range: e.target.value })}
        className="h-10 rounded-lg border border-border dark:border-border-dark bg-panel dark:bg-panel-dark px-3 text-sm text-ink dark:text-ink-dark"
      >
        {RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
      </select>

      {value.range === 'custom' && (
        <>
          <input
            type="date"
            value={value.from}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
            className="h-10 rounded-lg border border-border dark:border-border-dark bg-panel dark:bg-panel-dark px-3 text-sm text-ink dark:text-ink-dark"
          />
          <span className="text-sm text-muted dark:text-muted-dark">to</span>
          <input
            type="date"
            value={value.to}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
            className="h-10 rounded-lg border border-border dark:border-border-dark bg-panel dark:bg-panel-dark px-3 text-sm text-ink dark:text-ink-dark"
          />
        </>
      )}
    </div>
  );
}
