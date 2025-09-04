import React from 'react'
import { User, Crown, Settings } from 'lucide-react'

export function Header({ user, onUpgrade }) {
  const isBasicPlan = user.subscriptionPlan === 'basic'
  const usagePercentage = user.subscriptionPlan === 'pro' 
    ? 0 
    : (user.generationsUsed / user.generationsLimit) * 100

  return (
    <header className="bg-surface border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
      <div className="container flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-heading text-text-primary">ContentSpark</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Usage Indicator */}
          <div className="hidden sm:flex items-center space-x-2">
            {user.subscriptionPlan === 'pro' ? (
              <div className="flex items-center space-x-2 text-accent">
                <Crown size={16} />
                <span className="text-sm font-medium">Pro Plan</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="text-sm text-text-secondary">
                  {user.generationsUsed}/{user.generationsLimit} used
                </div>
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Upgrade Button */}
          {isBasicPlan && (
            <button
              onClick={onUpgrade}
              className="btn-primary text-sm py-2 px-4"
            >
              Upgrade
            </button>
          )}
          
          {/* User Menu */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="hidden sm:block text-sm text-text-secondary">
              {user.email}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}