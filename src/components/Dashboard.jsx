import React from 'react'
import { Wand2, Scissors, TrendingUp, Clock } from 'lucide-react'

export function Dashboard({ user, onViewChange }) {
  const recentContent = [
    { id: 1, type: 'generated', title: 'Social Media Post about AI', createdAt: '2 hours ago' },
    { id: 2, type: 'repurposed', title: 'Podcast Clips from Episode 42', createdAt: '1 day ago' },
    { id: 3, type: 'generated', title: 'Blog Article Outline', createdAt: '2 days ago' },
  ]

  const stats = [
    { label: 'Content Generated', value: user.generationsUsed, icon: Wand2 },
    { label: 'Items Repurposed', value: 8, icon: Scissors },
    { label: 'Total Saves', value: 156, icon: TrendingUp },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center sm:text-left">
        <h1 className="text-display text-text-primary mb-4">
          Welcome back to ContentSpark
        </h1>
        <p className="text-body text-text-secondary max-w-2xl">
          Transform your content creation workflow with AI-powered generation and intelligent repurposing tools.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <button
          onClick={() => onViewChange('generator')}
          className="card hover:shadow-lg transition-shadow duration-200 text-left group"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Wand2 size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="text-heading text-text-primary">Generate Content</h3>
              <p className="text-sm text-text-secondary">Create new content with AI</p>
            </div>
          </div>
          <p className="text-body text-text-secondary">
            Input a topic or prompt and get AI-generated drafts for social media, articles, and more.
          </p>
        </button>

        <button
          onClick={() => onViewChange('repurposer')}
          className="card hover:shadow-lg transition-shadow duration-200 text-left group"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <Scissors size={24} className="text-accent" />
            </div>
            <div>
              <h3 className="text-heading text-text-primary">Repurpose Content</h3>
              <p className="text-sm text-text-secondary">Transform long-form to short-form</p>
            </div>
          </div>
          <p className="text-body text-text-secondary">
            Upload videos or provide links to extract key segments and create engaging clips.
          </p>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon size={20} className="text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
                  <div className="text-sm text-text-secondary">{stat.label}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Content */}
      <div className="card">
        <h3 className="text-heading text-text-primary mb-6">Recent Content</h3>
        <div className="space-y-4">
          {recentContent.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  {item.type === 'generated' ? (
                    <Wand2 size={16} className="text-primary" />
                  ) : (
                    <Scissors size={16} className="text-accent" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">{item.title}</div>
                  <div className="text-xs text-text-secondary capitalize">{item.type}</div>
                </div>
              </div>
              <div className="flex items-center text-xs text-text-secondary">
                <Clock size={12} className="mr-1" />
                {item.createdAt}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}