import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-000 px-5">
      <div className="text-center max-w-md">
        <p className="font-[family-name:var(--font-mono)] text-[13px] text-ink-300 tracking-wide mb-4">404</p>
        <h1 className="text-lg font-medium text-ink-900 mb-1">Página no encontrada</h1>
        <p className="text-sm text-ink-500 mb-1">Page not found</p>
        <p className="text-sm text-ink-400 mb-6">
          La página que buscas no existe o fue movida.<br />
          The page you're looking for doesn't exist or was moved.
        </p>
        <Link href="/"
          className="inline-block bg-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-dim transition">
          Ir al inicio / Go home
        </Link>
      </div>
    </div>
  );
}
