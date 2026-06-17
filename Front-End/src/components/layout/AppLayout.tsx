import Sidebar, { defaultAdminItems, defaultDeliveryItems } from './Sidebar'

interface AppLayoutProps {
  children: React.ReactNode
  brand?: string
  navItems?: Array<{ label: string; href: string; icon: React.ReactNode }>
}

export default function AppLayout({ children, brand = 'HX Admin', navItems }: AppLayoutProps) {
  const items = navItems || defaultAdminItems

  return (
    <div className="flex min-h-screen bg-dark-bg">
      <Sidebar brand={brand} items={items} />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}

export { defaultAdminItems, defaultDeliveryItems }
