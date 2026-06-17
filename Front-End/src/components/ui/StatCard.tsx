interface StatCardProps {
  label: string
  value: string | number
  sublabel?: string
  accent?: 'green' | 'yellow' | 'red' | 'blue'
}

export default function StatCard({ label, value, sublabel, accent = 'green' }: StatCardProps) {
  const accentColors = {
    green: 'text-accent-green',
    yellow: 'text-accent-yellow',
    red: 'text-accent-red',
    blue: 'text-accent-blue',
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-5">
      <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${accentColors[accent]}`}>{value}</p>
      {sublabel && <p className="text-xs text-text-secondary mt-1.5">{sublabel}</p>}
    </div>
  )
}
