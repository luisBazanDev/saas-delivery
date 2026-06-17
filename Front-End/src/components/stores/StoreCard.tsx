import type { Store } from '../../lib/types'
import Card from '../ui/Card'

interface StoreCardProps {
  store: Store
}

export default function StoreCard({ store }: StoreCardProps) {
  return (
    <Card title={store.name}>
      <p>{store.address}</p>
      <a href={`/store/${store.id}`}>View</a>
    </Card>
  )
}
