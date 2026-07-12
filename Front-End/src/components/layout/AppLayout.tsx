import DynamicSidebar from './DynamicSidebar'

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
  storeId?: string
}

export default function AppLayout({ children, title = 'Vista', storeId }: AppLayoutProps) {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-bg-base">
      <DynamicSidebar currentPath={currentPath} storeId={storeId} />
      <main className="flex-1 flex flex-col bg-bg-base overflow-hidden">
        <header className="px-6 lg:px-10 py-5 border-b border-border flex items-center gap-3">
          <h2 className="title-font text-[18px] font-medium text-text-primary">{title}</h2>
        </header>
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  )
}
