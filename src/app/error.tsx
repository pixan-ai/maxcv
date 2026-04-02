"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-000 px-5">
      <div className="text-center max-w-md">
        <h2 className="text-lg font-medium text-ink-900 mb-2">
          Algo salió mal
        </h2>
        <p className="text-sm text-ink-500 mb-6">
          Hubo un error inesperado. Intenta de nuevo.
        </p>
        <button
          onClick={reset}
          className="bg-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium
                     hover:bg-accent-dim transition cursor-pointer"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
