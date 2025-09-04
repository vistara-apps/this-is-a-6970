import React from 'react'
import { Sparkles, Video, TrendingUp, Crown } from 'lucide-react'

const Dashboard = ({ user, onUpgrade }) => {
  const stats = [
    {
      label: 'Content Generated',
      value: user.contentGenerations,
      icon: Sparkles,
      color: 'from-purple-500 to-blue-600'
    },
    {
      label: 'Content Repurposed',
      value: 0,
      icon: Video,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      label: 'This Month',
      value: user.contentGenerations,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-600'
    }
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <div className="gradient-bg rounded-lg p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome to ContentSpark</h2>
            <p className="text-white/80">Generate and repurpose content effortlessly with AI</p>
          </div>
          <div className="glass-effect rounded-lg p-4">
            <div className="text-center">
              <p className="text-white/80 text-sm">Current Plan</p>
              <p className="font-semibold capitalize">{user.subscriptionPlan}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-surface rounded-lg p-6 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-text-primary mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Usage Progress */}
      <div className="bg-surface rounded-lg p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h3 className="text-heading text-text-primary mb-2 sm:mb-0">Monthly Usage</h3>
          {user.subscriptionPlan === 'basic' && (
            <button
              onClick={onUpgrade}
              className="flex items-center space-x-2 text-primary hover:text-blue-700 transition-colors"
            >
              <Crown size={16} />
              <span>Upgrade for unlimited</span>
            </button>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Content Generations</span>
            <span className="text-text-primary">
              {user.contentGenerations} / {user.maxGenerations === Infinity ? '∞' : user.maxGenerations}
            </span>
          </div>
          
          {user.maxGenerations !== Infinity && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(user.contentGenerations / user.maxGenerations) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-surface rounded-lg p-6 shadow-card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <h3 className="text-heading text-text-primary">AI Content Generator</h3>
          </div>
          <p className="text-text-secondary mb-4">Create engaging content from simple prompts using advanced AI.</p>
          <button className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all">
            Start Generating
          </button>
        </div>

        <div className="bg-surface rounded-lg p-6 shadow-card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Video size={20} className="text-white" />
            </div>
            <h3 className="text-heading text-text-primary">Content Repurposer</h3>
          </div>
          <p className="text-text-secondary mb-4">Transform long-form content into engaging short-form clips.</p>
          <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all">
            Start Repurposing
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard