import React, { useState } from 'react'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { ContentGenerator } from './components/ContentGenerator'
import { ContentRepurposer } from './components/ContentRepurposer'
import { Dashboard } from './components/Dashboard'
import { SubscriptionModal } from './components/SubscriptionModal'
import { ToastProvider } from './components/ToastProvider'

function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [user, setUser] = useState({
    email: 'demo@contentspark.com',
    subscriptionPlan: 'basic',
    generationsUsed: 3,
    generationsLimit: 10
  })
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

  const handleViewChange = (view) => {
    setActiveView(view)
  }

  const handleUpgrade = () => {
    setShowSubscriptionModal(true)
  }

  const handleSubscriptionSuccess = (plan) => {
    setUser(prev => ({
      ...prev,
      subscriptionPlan: plan,
      generationsLimit: plan === 'pro' ? Infinity : 10
    }))
    setShowSubscriptionModal(false)
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'generator':
        return <ContentGenerator user={user} setUser={setUser} onUpgrade={handleUpgrade} />
      case 'repurposer':
        return <ContentRepurposer user={user} setUser={setUser} onUpgrade={handleUpgrade} />
      default:
        return <Dashboard user={user} onViewChange={handleViewChange} />
    }
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-bg">
        <div className="flex">
          <Sidebar activeView={activeView} onViewChange={handleViewChange} />
          <div className="flex-1 flex flex-col min-h-screen">
            <Header user={user} onUpgrade={handleUpgrade} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              <div className="container">
                {renderActiveView()}
              </div>
            </main>
          </div>
        </div>
        
        {showSubscriptionModal && (
          <SubscriptionModal
            currentPlan={user.subscriptionPlan}
            onClose={() => setShowSubscriptionModal(false)}
            onSuccess={handleSubscriptionSuccess}
          />
        )}
      </div>
    </ToastProvider>
  )
}

export default App