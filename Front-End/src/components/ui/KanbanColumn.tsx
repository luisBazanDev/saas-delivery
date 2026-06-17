interface KanbanCard {
  id: string
  title: string
  subtitle?: string
}

interface KanbanColumnProps {
  title: string
  cards: KanbanCard[]
  accent?: 'green' | 'yellow' | 'red' | 'blue'
}

export default function KanbanColumn({ title, cards, accent = 'blue' }: KanbanColumnProps) {
  const accentBorders = {
    green: 'border-t-accent-green',
    yellow: 'border-t-accent-yellow',
    red: 'border-t-accent-red',
    blue: 'border-t-accent-blue',
  }

  return (
    <div className="flex-1 min-w-[240px]">
      <div className={`bg-dark-card border border-dark-border border-t-2 ${accentBorders[accent]} rounded-xl p-4`}>
        <h3 className="text-xs font-semibold text-text-muted mb-4 uppercase tracking-wider">
          {title}
        </h3>
        <div className="space-y-3">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-dark-bg border border-dark-border rounded-lg p-3.5 hover:border-dark-border/80 transition-colors cursor-pointer group"
            >
              <p className="text-[11px] text-text-muted font-mono">{card.id}</p>
              <p className="text-sm text-text-primary mt-1 font-medium">{card.title}</p>
              {card.subtitle && (
                <p className="text-xs text-text-secondary mt-1">{card.subtitle}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export type { KanbanCard }
