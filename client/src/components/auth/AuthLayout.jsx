/**
 * @param {{title: string, children: React.ReactNode}} props
 */
export function AuthLayout({ title, children }) {
  return (
    <div className="container-page flex justify-center py-20">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <h1 className="flex items-center justify-center gap-3 font-display text-3xl text-ink">
          {title} <span className="h-px w-8 bg-ink" />
        </h1>
        {children}
      </div>
    </div>
  );
}
