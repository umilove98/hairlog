export default function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-5 flex items-start justify-between gap-2">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-black/60">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
