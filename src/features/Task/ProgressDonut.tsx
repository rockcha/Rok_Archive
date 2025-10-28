"use client";

type Props = { percent: number; size?: number; label?: string };

export default function ProgressDonut({ percent, size = 72, label }: Props) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (p / 100) * c;

  return (
    <div className="inline-flex items-center gap-3">
      <svg
        width={size}
        height={size}
        className="shrink-0"
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`완료율 ${p}%`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
          className="opacity-60"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-500"
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-foreground text-xs font-semibold"
        >
          {p}%
        </text>
      </svg>
      {label && (
        <div className="text-sm text-muted-foreground">
          <div className="font-medium text-foreground">{label}</div>
          <div className="text-xs">오늘의 목표 진행률</div>
        </div>
      )}
    </div>
  );
}
