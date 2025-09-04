import React, { useState } from 'react'
import { Sparkles, Copy, Download, Wand2, FileText, Hash, MessageSquare } from 'lucide-react'
import { generateContent } from '../services/openai'

const ContentGenerator = ({ user, setUser }) => {
  const [prompt, setPrompt] = useState('')
  const [contentType, setContentType] = useState('social-media')
  const [generatedContent, setGeneratedContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const contentTypes = [
    { id: 'social-media', label: 'Social Media Post', icon: Hash },
    { id: 'article', label: 'Article Outline', icon: FileText },
    { id: 'email', label: 'Email Newsletter', icon: MessageSquare },
    { id: 'blog', label: 'Blog Post', icon: Wand2 }
  ]

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    if (user.contentGenerations >= user.maxGenerations && user.maxGenerations !== Infinity) {
      setError('You have reached your monthly generation limit. Please upgrade to continue.')
      return
    }

    setIsGenerating(true)
    setError('')
    
    try {
      const content = await generateContent(prompt, contentType)
      setGeneratedContent(content)
      setUser(prev => ({ ...prev, contentGenerations: prev.contentGenerations + 1 }))
    } catch (error) {
      console.error('Generation failed:', error)
      setError('Failed to generate content. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent)
  }

  const handleDownload = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `generated-content-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="bg-surface rounded-lg p-6 sm:p-8 shadow-card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <h2 className="text-heading text-text-primary">AI Content Generator</h2>
        </div>

        {/* Content Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-primary mb-3">Content Type</label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {contentTypes.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.id}
                  onClick={() => setContentType(type.id)}
                  className={`
                    flex flex-col items-center p-3 rounded-lg border-2 transition-all
                    ${contentType === type.id 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-gray-200 hover:border-gray-300 text-text-secondary'
                    }
                  `}
                >
                  <Icon size={20} className="mb-2" />
                  <span className="text-xs font-medium text-center">{type.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Prompt Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Describe what you want to create
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Write a social media post about the benefits of morning meditation for productivity..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={4}
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Generate Content</span>
            </>
          )}
        </button>

        {/* Usage Info */}
        <div className="mt-4 text-center text-sm text-text-secondary">
          {user.contentGenerations} / {user.maxGenerations === Infinity ? '∞' : user.maxGenerations} generations used this month
        </div>
      </div>

      {/* Generated Content */}
      {generatedContent && (
        <div className="bg-surface rounded-lg p-6 sm:p-8 shadow-card animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h3 className="text-heading text-text-primary mb-2 sm:mb-0">Generated Content</h3>
            <div className="flex space-x-2">
              <button
                onClick={handleCopy}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Copy size={16} />
                <span className="text-sm">Copy</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Download size={16} />
                <span className="text-sm">Download</span>
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-text-primary leading-relaxed">
            {generatedContent}
          </div>
        </div>
      )}
    </div>
  )
}

export default ContentGenerator