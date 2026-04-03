export function StepBadge({ n }: { n: number }) {
  return (
    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-white text-xs font-medium flex items-center justify-center">
      {n}
    </span>
  );
}
