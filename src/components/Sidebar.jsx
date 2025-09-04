import React from 'react'
import { LayoutDashboard, Sparkles, Video, FileText } from 'lucide-react'

const Sidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'generate', label: 'Generate Content', icon: Sparkles },
    { id: 'repurpose', label: 'Repurpose Content', icon: Video },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-surface border-r border-gray-200 transform transition-transform duration-200 ease-in-out z-50
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setSidebarOpen(false)
                }}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                  ${activeTab === item.id 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white' 
                    : 'text-text-secondary hover:bg-gray-100'
                  }
                `}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar