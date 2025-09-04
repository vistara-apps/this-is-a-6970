import React from 'react'
import { Home, Wand2, Scissors, BarChart3, Settings } from 'lucide-react'
import { clsx } from 'clsx'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'generator', label: 'Generate Content', icon: Wand2 },
  { id: 'repurposer', label: 'Repurpose Content', icon: Scissors },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ activeView, onViewChange }) {
  return (
    <aside className="w-16 sm:w-64 bg-surface border-r border-gray-200 flex flex-col">
      <div className="p-4 sm:p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <Wand2 size={16} className="text-white" />
          </div>
          <span className="hidden sm:block text-heading text-text-primary">ContentSpark</span>
        </div>
      </div>
      
      <nav className="flex-1 px-2 sm:px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={clsx(
                    'w-full flex items-center space-x-3 px-3 py-3 rounded-md transition-colors duration-200',
                    isActive 
                      ? 'bg-primary text-white' 
                      : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                  )}
                >
                  <Icon size={20} />
                  <span className="hidden sm:block text-sm font-medium">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}