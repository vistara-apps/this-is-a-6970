import React, { useState } from 'react'
import { Upload, Link, Scissors, Download, Loader, AlertCircle, Play } from 'lucide-react'
import { useToast } from './ToastProvider'

const outputFormats = [
  { value: 'short-clips', label: 'Short Video Clips (30-60s)' },
  { value: 'highlights', label: 'Key Highlights' },
  { value: 'transcript', label: 'Formatted Transcript' },
  { value: 'social-posts', label: 'Social Media Posts' },
  { value: 'quotes', label: 'Quote Cards' },
]

export function ContentRepurposer({ user, setUser, onUpgrade }) {
  const [inputType, setInputType] = useState('upload')
  const [file, setFile] = useState(null)
  const [url, setUrl] = useState('')
  const [outputFormat, setOutputFormat] = useState('short-clips')
  const [isProcessing, setIsProcessing] = useState(false)
  const [repurposedContent, setRepurposedContent] = useState(null)
  const { showToast } = useToast()

  const canRepurpose = user.subscriptionPlan === 'pro' || user.generationsUsed < user.generationsLimit

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) { // 100MB limit
        showToast('File size must be less than 100MB', 'error')
        return
      }
      setFile(selectedFile)
      showToast('File uploaded successfully!', 'success')
    }
  }

  const handleRepurpose = async () => {
    if (!canRepurpose) {
      showToast('Generation limit reached. Please upgrade to continue.', 'error')
      onUpgrade()
      return
    }

    if (inputType === 'upload' && !file) {
      showToast('Please upload a file', 'error')
      return
    }

    if (inputType === 'url' && !url.trim()) {
      showToast('Please enter a URL', 'error')
      return
    }

    setIsProcessing(true)

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Mock repurposed content based on format
      const mockContent = generateMockContent(outputFormat)
      setRepurposedContent(mockContent)

      // Update user usage
      if (user.subscriptionPlan !== 'pro') {
        setUser(prev => ({
          ...prev,
          generationsUsed: prev.generationsUsed + 1
        }))
      }

      showToast('Content repurposed successfully!', 'success')
    } catch (error) {
      showToast('Failed to repurpose content. Please try again.', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const generateMockContent = (format) => {
    switch (format) {
      case 'short-clips':
        return {
          type: 'clips',
          data: [
            { title: 'Clip 1: Key Insight', duration: '45s', timestamp: '2:15-3:00' },
            { title: 'Clip 2: Main Point', duration: '32s', timestamp: '5:30-6:02' },
            { title: 'Clip 3: Call to Action', duration: '28s', timestamp: '8:45-9:13' },
          ]
        }
      case 'highlights':
        return {
          type: 'highlights',
          data: [
            'The most important insight was about the future of AI in content creation',
            'Statistics show 80% improvement in productivity when using AI tools',
            'Three key strategies for implementing AI in your workflow',
            'Common mistakes to avoid when starting with AI content generation',
          ]
        }
      case 'social-posts':
        return {
          type: 'posts',
          data: [
            '🚀 Just learned something amazing about AI content creation! The future is here and it\'s incredible. #AI #Content',
            '💡 Did you know that AI can improve your content productivity by 80%? Game-changing stuff! #ProductivityTips',
            '🎯 Three strategies that will transform how you create content. Thread below 👇 #ContentStrategy',
          ]
        }
      default:
        return {
          type: 'text',
          data: 'This is a sample repurposed content output. In a real implementation, this would contain the processed content based on your input and selected format.'
        }
    }
  }

  const handleDownload = () => {
    const content = JSON.stringify(repurposedContent, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `repurposed-content-${Date.now()}.json`
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
        <h1 className="text-display text-text-primary mb-4">Content Repurposer</h1>
        <p className="text-body text-text-secondary">
          Transform your long-form content into engaging short-form clips and posts.
        </p>
      </div>

      {/* Usage Warning */}
      {!canRepurpose && (
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
            <h3 className="text-heading text-text-primary mb-4">Source Content</h3>
            
            <div className="space-y-4">
              {/* Input Type Selection */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setInputType('upload')}
                  className={`flex-1 py-3 px-4 rounded-md border text-sm font-medium transition-colors ${
                    inputType === 'upload'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface text-text-secondary border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Upload size={16} className="mr-2 inline" />
                  Upload File
                </button>
                <button
                  onClick={() => setInputType('url')}
                  className={`flex-1 py-3 px-4 rounded-md border text-sm font-medium transition-colors ${
                    inputType === 'url'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface text-text-secondary border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Link size={16} className="mr-2 inline" />
                  From URL
                </button>
              </div>

              {/* File Upload */}
              {inputType === 'upload' && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Upload Video or Audio File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept="video/*,audio/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-text-secondary">
                        {file ? file.name : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        MP4, MOV, MP3, WAV (max 100MB)
                      </p>
                    </label>
                  </div>
                </div>
              )}

              {/* URL Input */}
              {inputType === 'url' && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Content URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="input-base"
                  />
                  <p className="text-xs text-text-secondary mt-1">
                    Supports YouTube, Vimeo, podcast links, and more
                  </p>
                </div>
              )}

              {/* Output Format */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Output Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="input-base"
                >
                  {outputFormats.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleRepurpose}
                disabled={isProcessing || !canRepurpose}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Scissors size={20} />
                    <span>Repurpose Content</span>
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
              <h3 className="text-heading text-text-primary">Repurposed Content</h3>
              {repurposedContent && (
                <button
                  onClick={handleDownload}
                  className="p-2 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-md transition-colors"
                  title="Download content"
                >
                  <Download size={16} />
                </button>
              )}
            </div>

            <div className="min-h-64 p-4 bg-gray-50 rounded-md border">
              {isProcessing ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader size={32} className="animate-spin text-primary mb-4 mx-auto" />
                    <p className="text-text-secondary">Processing your content...</p>
                    <p className="text-xs text-text-secondary mt-2">This may take a few minutes</p>
                  </div>
                </div>
              ) : repurposedContent ? (
                <div className="space-y-4">
                  {repurposedContent.type === 'clips' && (
                    <div className="space-y-3">
                      {repurposedContent.data.map((clip, index) => (
                        <div key={index} className="bg-surface p-4 rounded-md border">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-text-primary">{clip.title}</h4>
                            <Play size={16} className="text-primary" />
                          </div>
                          <p className="text-sm text-text-secondary">
                            Duration: {clip.duration} | Timestamp: {clip.timestamp}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {repurposedContent.type === 'highlights' && (
                    <div className="space-y-3">
                      {repurposedContent.data.map((highlight, index) => (
                        <div key={index} className="bg-surface p-4 rounded-md border">
                          <p className="text-body text-text-primary">{highlight}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {repurposedContent.type === 'posts' && (
                    <div className="space-y-3">
                      {repurposedContent.data.map((post, index) => (
                        <div key={index} className="bg-surface p-4 rounded-md border">
                          <p className="text-body text-text-primary">{post}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {repurposedContent.type === 'text' && (
                    <div className="bg-surface p-4 rounded-md border">
                      <p className="text-body text-text-primary">{repurposedContent.data}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-text-secondary text-center">
                    Your repurposed content will appear here.
                    <br />
                    Upload a file or enter a URL to start.
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