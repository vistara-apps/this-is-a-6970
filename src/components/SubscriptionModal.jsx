import React, { useState } from 'react'
import { X, Check, Crown, Zap } from 'lucide-react'
import { useToast } from './ToastProvider'

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 15,
    description: 'Perfect for getting started',
    features: [
      '10 content generations per month',
      '10 content repurposing tasks',
      'Basic templates',
      'Email support',
    ],
    icon: Zap,
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 45,
    description: 'For serious content creators',
    features: [
      'Unlimited content generations',
      'Unlimited repurposing tasks',
      'Advanced templates',
      'Priority support',
      'Custom branding',
      'Analytics dashboard',
    ],
    icon: Crown,
    popular: true,
  },
]

export function SubscriptionModal({ currentPlan, onClose, onSuccess }) {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan === 'basic' ? 'pro' : currentPlan)
  const [isProcessing, setIsProcessing] = useState(false)
  const { showToast } = useToast()

  const handleSubscribe = async (planId) => {
    setIsProcessing(true)
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      showToast(`Successfully upgraded to ${planId === 'pro' ? 'Pro' : 'Basic'} plan!`, 'success')
      onSuccess(planId)
    } catch (error) {
      showToast('Payment failed. Please try again.', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto animate-slide-up">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-heading text-text-primary">Choose Your Plan</h2>
              <p className="text-body text-text-secondary">
                Unlock the full potential of ContentSpark
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon
              const isCurrentPlan = currentPlan === plan.id
              const isSelected = selectedPlan === plan.id

              return (
                <div
                  key={plan.id}
                  className={`relative card border-2 transition-all duration-200 ${
                    isSelected ? 'border-primary' : 'border-gray-200'
                  } ${plan.popular ? 'ring-2 ring-accent/20' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-accent text-white px-3 py-1 rounded-full text-xs font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon size={24} className="text-primary" />
                    </div>
                    
                    <h3 className="text-heading text-text-primary mb-2">{plan.name}</h3>
                    <p className="text-text-secondary mb-4">{plan.description}</p>
                    
                    <div className="mb-6">
                      <span className="text-3xl font-bold text-text-primary">${plan.price}</span>
                      <span className="text-text-secondary">/month</span>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check size={16} className="text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-text-secondary">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {isCurrentPlan ? (
                      <button
                        disabled
                        className="w-full py-3 px-4 bg-gray-100 text-gray-500 rounded-md font-medium"
                      >
                        Current Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={isProcessing}
                        className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                          plan.popular
                            ? 'bg-primary text-white hover:bg-primary/90'
                            : 'bg-surface border border-gray-200 text-text-primary hover:bg-gray-50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isProcessing ? 'Processing...' : `Subscribe to ${plan.name}`}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-text-secondary">
              All plans include a 14-day free trial. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}