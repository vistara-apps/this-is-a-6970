import React, { useState } from 'react'
import { Sparkles, FileText, Video, Crown, Menu, X } from 'lucide-react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import ContentGenerator from './components/ContentGenerator'
import ContentRepurposer from './components/ContentRepurposer'
import SubscriptionModal from './components/SubscriptionModal'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false)
  const [user, setUser] = useState({
    email: 'user@example.com',
    subscriptionPlan: 'basic',
    contentGenerations: 3,
    maxGenerations: 10
  })

  const handleUpgrade = () => {
    setSubscriptionModalOpen(true)
  }

  const handleSubscriptionSuccess = (plan) => {
    setUser(prev => ({
      ...prev,
      subscriptionPlan: plan,
      maxGenerations: plan === 'pro' ? Infinity : 10
    }))
    setSubscriptionModalOpen(false)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} onUpgrade={handleUpgrade} />
      case 'generate':
        return <ContentGenerator user={user} setUser={setUser} />
      case 'repurpose':
        return <ContentRepurposer user={user} setUser={setUser} />
      default:
        return <Dashboard user={user} onUpgrade={handleUpgrade} />
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header 
        user={user} 
        onUpgrade={handleUpgrade}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      <div className="flex">
        <Sidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-64">
          <div className="max-w-5xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        onSuccess={handleSubscriptionSuccess}
        currentPlan={user.subscriptionPlan}
      />
    </div>
  )
}

export default App