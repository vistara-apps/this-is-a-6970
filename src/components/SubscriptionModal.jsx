import React from 'react'
import { X, Check, Crown, Zap } from 'lucide-react'

const SubscriptionModal = ({ isOpen, onClose, onSuccess, currentPlan }) => {
  if (!isOpen) return null

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$15',
      period: 'month',
      features: [
        '10 content generations per month',
        'AI content generator',
        'Content repurposer',
        'Email support'
      ],
      icon: Crown,
      color: 'from-gray-500 to-gray-600'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$45',
      period: 'month',
      features: [
        'Unlimited content generations',
        'AI content generator',
        'Content repurposer',
        'Priority support',
        'Advanced templates',
        'Export to multiple formats'
      ],
      icon: Zap,
      color: 'from-purple-500 to-blue-600',
      popular: true
    }
  ]

  const handleSelectPlan = (planId) => {
    // In a real app, this would integrate with Stripe
    console.log('Selected plan:', planId)
    
    // Simulate payment success
    setTimeout(() => {
      onSuccess(planId)
    }, 1000)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-text-primary">Choose Your Plan</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-text-secondary mt-2">Upgrade to unlock unlimited content generation</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon
              return (
                <div
                  key={plan.id}
                  className={`
                    relative rounded-lg border-2 p-6 transition-all
                    ${currentPlan === plan.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                    ${plan.popular ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}
                  `}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className={`w-12 h-12 bg-gradient-to-r ${plan.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary">{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-text-primary">{plan.price}</span>
                      <span className="text-text-secondary">/{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <Check size={16} className="text-green-500 flex-shrink-0" />
                        <span className="text-text-secondary">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={currentPlan === plan.id}
                    className={`
                      w-full py-3 px-4 rounded-lg font-medium transition-all
                      ${currentPlan === plan.id
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                      }
                    `}
                  >
                    {currentPlan === plan.id ? 'Current Plan' : 'Select Plan'}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="mt-8 text-center text-sm text-text-secondary">
            <p>All plans include a 14-day free trial. Cancel anytime.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionModal