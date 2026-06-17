interface CardProps {
  title?: string
  children: React.ReactNode
  className?: string
  headerAction?: React.ReactNode
  description?: string
}

export default function Card({ title, description, children, className = '', headerAction }: CardProps) {
  return (
    <div className={`bg-dark-card border border-dark-border rounded-xl ${className}`}>
      {(title || headerAction) && (
        <div className="flex items-start justify-between px-6 py-5 border-b border-dark-border">
          <div>
            {title && <h3 className="text-base font-semibold text-text-primary">{title}</h3>}
            {description && <p className="text-xs text-text-muted mt-1">{description}</p>}
          </div>
          {headerAction}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}
