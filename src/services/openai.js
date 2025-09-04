import OpenAI from 'openai'

// Initialize OpenAI client with proper error handling
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'demo-key',
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
})

const contentPrompts = {
  'social-post': (topic) => `Create an engaging social media post about ${topic}. Make it catchy, include relevant hashtags, and keep it under 280 characters.`,
  'blog-outline': (topic) => `Create a detailed blog post outline about ${topic}. Include an introduction, 3-5 main points with subpoints, and a conclusion.`,
  'email-subject': (topic) => `Generate 5 compelling email subject lines about ${topic}. Make them attention-grabbing and action-oriented.`,
  'product-description': (topic) => `Write a compelling product description for ${topic}. Focus on benefits, features, and include a call to action.`,
  'video-script': (topic) => `Create a 2-3 minute video script about ${topic}. Include hook, main content, and call to action. Format with timestamps.`,
  'ad-copy': (topic) => `Write persuasive ad copy for ${topic}. Include headline, body text, and call to action. Focus on benefits and urgency.`,
}

export async function generateContent(prompt, contentType) {
  try {
    // Validate input parameters
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt provided')
    }

    // For demo purposes, return mock content if no API key
    if (!import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY === 'demo-key') {
      return generateMockContent(prompt, contentType)
    }

    const systemPrompt = contentPrompts[contentType] || contentPrompts['social-post']
    
    const response = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      messages: [
        {
          role: 'system',
          content: 'You are a professional content creator and copywriter. Create engaging, high-quality content that resonates with the target audience.'
        },
        {
          role: 'user',
          content: systemPrompt(prompt)
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from AI service')
    }

    return response.choices[0].message.content.trim()
  } catch (error) {
    console.error('OpenAI API error:', error)
    // Fallback to mock content on API errors
    if (error.message.includes('API') || error.message.includes('network')) {
      console.warn('Falling back to mock content due to API error')
      return generateMockContent(prompt, contentType)
    }
    throw new Error('Failed to generate content')
  }
}

function generateMockContent(prompt, contentType) {
  const mockContent = {
    'social-post': `🚀 Exciting news about ${prompt}! This could be a game-changer for creators everywhere. The future of content is here and it's incredible! 

What do you think? Drop your thoughts below 👇

#ContentCreation #AI #Innovation #FutureIsNow`,

    'blog-outline': `# ${prompt}: A Comprehensive Guide

## Introduction
- Hook: Why ${prompt} matters now more than ever
- Overview of what readers will learn
- Brief statistics or compelling facts

## Main Content

### 1. Understanding the Basics
- Definition and core concepts
- Current landscape and trends
- Key players and technologies

### 2. Benefits and Opportunities
- Primary advantages for users
- Market opportunities
- Success stories and case studies

### 3. Implementation Strategies
- Step-by-step approach
- Best practices and tips
- Common pitfalls to avoid

### 4. Future Outlook
- Emerging trends
- Predictions and forecasts
- Preparing for what's next

## Conclusion
- Key takeaways
- Action steps for readers
- Call to action for engagement`,

    'email-subject': `Here are 5 compelling email subject lines about ${prompt}:

1. 🚨 This ${prompt} breakthrough changes everything
2. The ${prompt} secret successful creators don't want you to know
3. Why ${prompt} is the #1 priority for 2024 (inside details)
4. [URGENT] ${prompt} opportunity ends in 24 hours
5. The simple ${prompt} hack that saves 10 hours per week`,

    'product-description': `Transform Your ${prompt} Experience Forever

Discover the revolutionary solution that's changing how people approach ${prompt}. Our cutting-edge platform combines innovative technology with user-friendly design to deliver results that exceed expectations.

✅ Key Features:
• Advanced AI-powered capabilities
• Intuitive interface designed for all skill levels
• Real-time results and feedback
• Seamless integration with existing workflows

✅ Benefits:
• Save 80% of your time on ${prompt}
• Achieve professional-quality results instantly
• Scale your output without compromising quality
• Join thousands of satisfied customers

Don't let another day pass struggling with outdated methods. Upgrade your ${prompt} game today and see the difference quality tools make.

🎯 Ready to get started? Click below for instant access!`,

    'video-script': `🎬 Video Script: ${prompt}

[0:00-0:15] HOOK
"What if I told you that ${prompt} could change your entire approach to content creation? Stay tuned because I'm about to share something that will blow your mind."

[0:15-0:45] PROBLEM
"Here's the thing - most people struggle with ${prompt} because they're using outdated methods. They waste hours on tasks that should take minutes, and the results are often disappointing."

[0:45-1:30] SOLUTION
"But there's a better way. Let me introduce you to the game-changing approach that's revolutionizing ${prompt}. This method has helped thousands of creators like you achieve incredible results in record time."

[1:30-2:15] PROOF/BENEFITS
"Just look at these results... [show examples]. Users report 5x faster completion times, professional-quality outputs, and significantly better engagement rates."

[2:15-2:30] CALL TO ACTION
"Ready to transform your ${prompt} experience? Check the link in the description to get started today. Don't forget to like this video and subscribe for more game-changing tips!"`,

    'ad-copy': `🎯 Headline: Revolutionary ${prompt} Solution Changes Everything!

Tired of struggling with ${prompt}? You're not alone. Thousands of creators face the same challenges every day - wasted time, poor results, and endless frustration.

But what if there was a better way?

Introducing the breakthrough solution that's transforming how people approach ${prompt}. Our innovative platform delivers:

✅ 10x faster results
✅ Professional-quality output
✅ Zero learning curve
✅ Guaranteed satisfaction

"This completely changed my workflow. I can't imagine going back to the old way!" - Sarah K., Content Creator

⚡ LIMITED TIME: Get 50% off your first month when you sign up today!

🚀 Join 10,000+ satisfied customers who've already transformed their ${prompt} experience.

👆 CLICK NOW - Offer expires in 24 hours!`
  }

  return mockContent[contentType] || mockContent['social-post']
}
