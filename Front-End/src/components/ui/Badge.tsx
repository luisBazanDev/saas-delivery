interface BadgeProps {
  label: string
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default'
}

export default function Badge({ label, variant = 'default' }: BadgeProps) {
  const variants = {
    success: 'bg-accent-green/15 text-accent-green border-accent-green/30',
    warning: 'bg-accent-yellow/15 text-accent-yellow border-accent-yellow/30',
    danger: 'bg-accent-red/15 text-accent-red border-accent-red/30',
    info: 'bg-accent-blue/15 text-accent-blue border-accent-blue/30',
    default: 'bg-dark-hover text-text-secondary border-dark-border',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}
    >
      {label}
    </span>
  )
}
