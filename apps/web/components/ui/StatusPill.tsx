type StatusPillProps = {
  label: string;
  tone?: "default" | "success" | "warning" | "danger" | "muted";
};

export function StatusPill({ label, tone = "default" }: StatusPillProps) {
  return <span className={`statusPill ${tone}`}>{label}</span>;
}