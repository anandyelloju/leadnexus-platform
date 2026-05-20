type StatusTone = 'blue' | 'green' | 'amber' | 'red' | 'slate';

interface Props {
  label: string;
  tone?: StatusTone;
}

const toneClasses: Record<StatusTone, string> = {
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  red: 'border-rose-200 bg-rose-50 text-rose-700',
  slate: 'border-slate-200 bg-slate-50 text-slate-600',
};

export default function StatusChip({
  label,
  tone = 'slate',
}: Props) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase leading-4 ${toneClasses[tone]}`}>
      {label}
    </span>
  );
}
