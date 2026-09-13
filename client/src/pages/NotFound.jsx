import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center gap-4 py-32 text-center">
      <span className="font-display text-6xl text-ink">404</span>
      <h1 className="font-display text-2xl text-ink">Page not found</h1>
      <p className="max-w-sm text-sm text-ink-soft">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary mt-2">
        Back to Home
      </Link>
    </div>
  );
}
