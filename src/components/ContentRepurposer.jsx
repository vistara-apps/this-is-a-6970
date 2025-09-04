import React, { useState } from 'react'
import { Video, Upload, Download, Scissors, FileText, Clock } from 'lucide-react'

const ContentRepurposer = ({ user, setUser }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [urlInput, setUrlInput] = useState('')
  const [outputFormat, setOutputFormat] = useState('short-clips')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedContent, setProcessedContent] = useState(null)
  const [error, setError] = useState('')

  const outputFormats = [
    { id: 'short-clips', label: 'Short Video Clips', icon: Scissors },
    { id: 'transcript', label: 'Text Transcript', icon: FileText },
    { id: 'highlights', label: 'Key Highlights', icon: Clock }
  ]

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        setError('File size must be less than 100MB')
        return
      }
      setSelectedFile(file)
      setUrlInput('')
      setError('')
    }
  }

  const handleUrlChange = (event) => {
    setUrlInput(event.target.value)
    setSelectedFile(null)
    setError('')
  }

  const handleProcess = async () => {
    if (!selectedFile && !urlInput.trim()) {
      setError('Please select a file or enter a URL')
      return
    }

    if (user.contentGenerations >= user.maxGenerations && user.maxGenerations !== Infinity) {
      setError('You have reached your monthly generation limit. Please upgrade to continue.')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      // Simulate processing (in real app, this would call a backend service)
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const mockResults = {
        'short-clips': [
          { title: 'Key Insight #1', duration: '0:15', timestamp: '2:30-2:45' },
          { title: 'Main Point Discussion', duration: '0:30', timestamp: '5:15-5:45' },
          { title: 'Conclusion Summary', duration: '0:20', timestamp: '8:10-8:30' }
        ],
        'transcript': 'This is a sample transcript of the processed content. In a real implementation, this would contain the full transcript extracted from the video or audio content.',
        'highlights': [
          'Key insight about content creation strategies',
          'Important statistics mentioned at 3:45',
          'Call to action discussed in the conclusion'
        ]
      }

      setProcessedContent(mockResults[outputFormat])
      setUser(prev => ({ ...prev, contentGenerations: prev.contentGenerations + 1 }))
    } catch (error) {
      console.error('Processing failed:', error)
      setError('Failed to process content. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    let content = ''
    let filename = ''

    if (outputFormat === 'short-clips') {
      content = processedContent.map(clip => 
        `${clip.title}\nDuration: ${clip.duration}\nTimestamp: ${clip.timestamp}\n\n`
      ).join('')
      filename = 'short-clips.txt'
    } else if (outputFormat === 'transcript') {
      content = processedContent
      filename = 'transcript.txt'
    } else if (outputFormat === 'highlights') {
      content = processedContent.map((highlight, index) => 
        `${index + 1}. ${highlight}`
      ).join('\n')
      filename = 'highlights.txt'
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="bg-surface rounded-lg p-6 sm:p-8 shadow-card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <Video size={20} className="text-white" />
          </div>
          <h2 className="text-heading text-text-primary">Content Repurposer</h2>
        </div>

        {/* Input Method */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-primary mb-3">Input Source</label>
          
          {/* File Upload */}
          <div className="mb-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload size={32} className="mx-auto mb-3 text-gray-400" />
              <p className="text-text-secondary mb-2">Upload a video or audio file</p>
              <p className="text-sm text-gray-500 mb-3">MP4, MP3, WAV (max 100MB)</p>
              <input
                type="file"
                accept="video/*,audio/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors"
              >
                Choose File
              </label>
              {selectedFile && (
                <p className="mt-2 text-sm text-text-primary">{selectedFile.name}</p>
              )}
            </div>
          </div>

          {/* URL Input */}
          <div className="relative">
            <input
              type="url"
              value={urlInput}
              onChange={handleUrlChange}
              placeholder="Or paste a YouTube/video URL..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Output Format Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-primary mb-3">Output Format</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {outputFormats.map((format) => {
              const Icon = format.icon
              return (
                <button
                  key={format.id}
                  onClick={() => setOutputFormat(format.id)}
                  className={`
                    flex items-center space-x-3 p-3 rounded-lg border-2 transition-all
                    ${outputFormat === format.id 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-gray-200 hover:border-gray-300 text-text-secondary'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{format.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Process Button */}
        <button
          onClick={handleProcess}
          disabled={isProcessing || (!selectedFile && !urlInput.trim())}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Scissors size={16} />
              <span>Process Content</span>
            </>
          )}
        </button>

        {/* Usage Info */}
        <div className="mt-4 text-center text-sm text-text-secondary">
          {user.contentGenerations} / {user.maxGenerations === Infinity ? '∞' : user.maxGenerations} generations used this month
        </div>
      </div>

      {/* Processed Content Results */}
      {processedContent && (
        <div className="bg-surface rounded-lg p-6 sm:p-8 shadow-card animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h3 className="text-heading text-text-primary mb-2 sm:mb-0">Processed Results</h3>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Download size={16} />
              <span className="text-sm">Download</span>
            </button>
          </div>

          <div className="space-y-4">
            {outputFormat === 'short-clips' && Array.isArray(processedContent) && (
              <div className="space-y-3">
                {processedContent.map((clip, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-text-primary mb-1">{clip.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-text-secondary">
                      <span>Duration: {clip.duration}</span>
                      <span>Timestamp: {clip.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {outputFormat === 'transcript' && typeof processedContent === 'string' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-text-primary leading-relaxed">{processedContent}</p>
              </div>
            )}

            {outputFormat === 'highlights' && Array.isArray(processedContent) && (
              <div className="space-y-2">
                {processedContent.map((highlight, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-text-primary">{index + 1}. {highlight}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ContentRepurposer