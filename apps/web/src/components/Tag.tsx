export function Tag({ children }: { children: string }) {
  return (
    <span className="inline-block rounded-full bg-ink/15 px-2.5 py-0.5 text-xs font-medium text-ink">
      {children}
    </span>
  );
}
