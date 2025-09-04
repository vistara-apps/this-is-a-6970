import React, { useState } from 'react'
import { Wand2, Copy, Download, Loader, AlertCircle } from 'lucide-react'
import { generateContent } from '../services/openai'
import { useToast } from './ToastProvider'

const contentTypes = [
  { value: 'social-post', label: 'Social Media Post' },
  { value: 'blog-outline', label: 'Blog Article Outline' },
  { value: 'email-subject', label: 'Email Subject Lines' },
  { value: 'product-description', label: 'Product Description' },
  { value: 'video-script', label: 'Video Script' },
  { value: 'ad-copy', label: 'Ad Copy' },
]

export function ContentGenerator({ user, setUser, onUpgrade }) {
  const [prompt, setPrompt] = useState('')
  const [contentType, setContentType] = useState('social-post')
  const [generatedContent, setGeneratedContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const { showToast } = useToast()

  const canGenerate = user.subscriptionPlan === 'pro' || user.generationsUsed < user.generationsLimit

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('Please enter a prompt', 'error')
      return
    }

    if (!canGenerate) {
      showToast('Generation limit reached. Please upgrade to continue.', 'error')
      onUpgrade()
      return
    }

    setIsGenerating(true)
    
    try {
      const content = await generateContent(prompt, contentType)
      setGeneratedContent(content)
      
      // Update user usage
      if (user.subscriptionPlan !== 'pro') {
        setUser(prev => ({
          ...prev,
          generationsUsed: prev.generationsUsed + 1
        }))
      }
      
      showToast('Content generated successfully!', 'success')
    } catch (error) {
      showToast('Failed to generate content. Please try again.', 'error')
      console.error('Generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent)
      showToast('Content copied to clipboard!', 'success')
    } catch (error) {
      showToast('Failed to copy content', 'error')
    }
  }

  const handleDownload = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `generated-content-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('Content downloaded!', 'success')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-display text-text-primary mb-4">AI Content Generator</h1>
        <p className="text-body text-text-secondary">
          Transform your ideas into compelling content with AI assistance.
        </p>
      </div>

      {/* Usage Warning */}
      {!canGenerate && (
        <div className="card bg-red-50 border border-red-200">
          <div className="flex items-center space-x-3">
            <AlertCircle size={20} className="text-red-500" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Generation Limit Reached</h3>
              <p className="text-sm text-red-600">
                You've used all {user.generationsLimit} generations for this month. Upgrade to Pro for unlimited access.
              </p>
            </div>
            <button onClick={onUpgrade} className="btn-primary ml-auto">
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-heading text-text-primary mb-4">Content Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Content Type
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="input-base"
                >
                  {contentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Prompt or Topic
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want to create. Be specific about tone, audience, and key points..."
                  className="input-base h-32 resize-none"
                  disabled={isGenerating}
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !canGenerate}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={20} />
                    <span>Generate Content</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-heading text-text-primary">Generated Content</h3>
              {generatedContent && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-md transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-md transition-colors"
                    title="Download as text file"
                  >
                    <Download size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="min-h-64 p-4 bg-gray-50 rounded-md border">
              {isGenerating ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader size={32} className="animate-spin text-primary mb-4 mx-auto" />
                    <p className="text-text-secondary">Generating your content...</p>
                  </div>
                </div>
              ) : generatedContent ? (
                <div className="whitespace-pre-wrap text-body text-text-primary">
                  {generatedContent}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-text-secondary text-center">
                    Your generated content will appear here.
                    <br />
                    Enter a prompt and click generate to start.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}