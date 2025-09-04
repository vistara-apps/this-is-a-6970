import React from 'react'
import { Sparkles, Crown, Menu, X } from 'lucide-react'

const Header = ({ user, onUpgrade, sidebarOpen, setSidebarOpen }) => {
  return (
    <header className="bg-surface shadow-card border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md text-text-secondary hover:bg-gray-100"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            <div className="flex items-center ml-2 lg:ml-0">
              <Sparkles className="w-8 h-8 text-primary mr-3" />
              <h1 className="text-xl font-bold text-text-primary">ContentSpark</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-text-secondary">
              <span>{user.contentGenerations}/{user.maxGenerations === Infinity ? '∞' : user.maxGenerations} generations</span>
            </div>
            
            {user.subscriptionPlan === 'basic' && (
              <button
                onClick={onUpgrade}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all"
              >
                <Crown size={16} />
                <span className="hidden sm:inline">Upgrade</span>
              </button>
            )}
            
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user.email.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header