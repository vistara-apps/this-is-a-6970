import OpenAI from 'openai'
import { logger } from '../utils/logger.js'
import { ApiError } from '../middleware/errorHandler.js'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"
})

// Content generation prompts
const contentPrompts = {
  'social-post': (topic) => `Create an engaging social media post about ${topic}. Make it catchy, include relevant hashtags, and keep it under 280 characters. Focus on engagement and shareability.`,
  
  'blog-outline': (topic) => `Create a comprehensive blog post outline about ${topic}. Include:
    - An attention-grabbing introduction
    - 4-6 main sections with descriptive headings
    - 2-3 subpoints for each main section
    - A compelling conclusion with call-to-action
    Format as a structured outline with clear hierarchy.`,
  
  'email-subject': (topic) => `Generate 5 compelling email subject lines about ${topic}. Make them:
    - Attention-grabbing and curiosity-inducing
    - Action-oriented with urgency when appropriate
    - Personalized and relevant
    - Under 50 characters each
    - Varied in style (question, benefit, urgency, curiosity, direct)`,
  
  'product-description': (topic) => `Write a compelling product description for ${topic}. Include:
    - A powerful headline that captures attention
    - Key benefits (not just features)
    - Social proof or credibility elements
    - Clear value proposition
    - Strong call-to-action
    - SEO-friendly language
    Keep it scannable with bullet points where appropriate.`,
  
  'video-script': (topic) => `Create a 2-3 minute video script about ${topic}. Structure:
    - Hook (0-15 seconds): Grab attention immediately
    - Introduction (15-30 seconds): Introduce the topic and value
    - Main content (60-120 seconds): Core information with 3 key points
    - Call-to-action (15-30 seconds): Clear next steps
    Include timestamps and speaker notes. Make it conversational and engaging.`,
  
  'ad-copy': (topic) => `Write persuasive advertisement copy for ${topic}. Include:
    - Compelling headline that stops the scroll
    - Problem-focused opening that resonates
    - Solution-oriented body text highlighting benefits
    - Social proof or credibility indicators
    - Urgency or scarcity elements
    - Clear, action-oriented call-to-action
    - Multiple variations (short and long form)`
}

// Generate content using OpenAI
export async function generateContent(prompt, contentType) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'demo-key') {
      logger.warn('OpenAI API key not configured, returning mock content')
      return generateMockContent(prompt, contentType)
    }

    const systemPrompt = contentPrompts[contentType] || contentPrompts['social-post']
    
    logger.info(`Generating ${contentType} content for prompt: "${prompt.substring(0, 50)}..."`)

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a professional content creator and copywriter with expertise in ${contentType.replace('-', ' ')}. Create high-quality, engaging content that resonates with the target audience. Be creative, authentic, and actionable.`
        },
        {
          role: 'user',
          content: systemPrompt(prompt)
        }
      ],
      max_tokens: getMaxTokensForContentType(contentType),
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    })

    const generatedContent = response.choices[0].message.content.trim()
    
    logger.info(`Content generated successfully: ${generatedContent.length} characters`)
    
    return generatedContent

  } catch (error) {
    logger.error('OpenAI API error:', error.message)
    
    // Handle specific OpenAI errors
    if (error.status === 401) {
      throw new ApiError(500, 'OpenAI API authentication failed')
    } else if (error.status === 429) {
      throw new ApiError(429, 'OpenAI API rate limit exceeded. Please try again later.')
    } else if (error.status === 500) {
      throw new ApiError(500, 'OpenAI API service unavailable')
    }
    
    // Fallback to mock content for other errors
    logger.warn('Falling back to mock content due to API error')
    return generateMockContent(prompt, contentType)
  }
}

// Generate content with streaming (for real-time updates)
export async function generateContentStream(prompt, contentType, onChunk) {
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'demo-key') {
      // Simulate streaming for mock content
      const mockContent = generateMockContent(prompt, contentType)
      const words = mockContent.split(' ')
      
      for (let i = 0; i < words.length; i++) {
        const chunk = words.slice(0, i + 1).join(' ')
        onChunk(chunk)
        await new Promise(resolve => setTimeout(resolve, 50)) // Simulate delay
      }
      
      return mockContent
    }

    const systemPrompt = contentPrompts[contentType] || contentPrompts['social-post']
    
    const stream = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a professional content creator and copywriter with expertise in ${contentType.replace('-', ' ')}. Create high-quality, engaging content that resonates with the target audience.`
        },
        {
          role: 'user',
          content: systemPrompt(prompt)
        }
      ],
      max_tokens: getMaxTokensForContentType(contentType),
      temperature: 0.7,
      stream: true
    })

    let fullContent = ''
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      fullContent += content
      onChunk(fullContent)
    }

    return fullContent

  } catch (error) {
    logger.error('OpenAI streaming error:', error.message)
    throw new ApiError(500, 'Failed to generate content with streaming')
  }
}

// Get appropriate max tokens for content type
function getMaxTokensForContentType(contentType) {
  const tokenLimits = {
    'social-post': 100,
    'blog-outline': 800,
    'email-subject': 200,
    'product-description': 600,
    'video-script': 1200,
    'ad-copy': 800
  }
  
  return tokenLimits[contentType] || 500
}

// Generate mock content for demo/fallback
function generateMockContent(prompt, contentType) {
  const mockContent = {
    'social-post': `🚀 Exciting news about ${prompt}! This is a game-changer for anyone looking to level up their content strategy. What are your thoughts? #ContentCreation #Innovation #${prompt.replace(/\s+/g, '')}`,
    
    'blog-outline': `# The Ultimate Guide to ${prompt}

## Introduction
- Hook: Why ${prompt} matters now more than ever
- Problem statement and audience pain points
- What readers will learn from this guide

## Section 1: Understanding ${prompt}
- Definition and core concepts
- Current market landscape
- Key benefits and opportunities

## Section 2: Getting Started with ${prompt}
- Essential tools and resources
- Step-by-step implementation guide
- Common beginner mistakes to avoid

## Section 3: Advanced Strategies for ${prompt}
- Pro tips and best practices
- Case studies and success stories
- Optimization techniques

## Section 4: Measuring Success
- Key metrics to track
- Analytics and reporting tools
- ROI calculation methods

## Conclusion
- Recap of key takeaways
- Next steps and action items
- Call-to-action for further engagement`,

    'email-subject': `Here are 5 compelling email subject lines about ${prompt}:

1. "🔥 The ${prompt} secret everyone's talking about"
2. "Last chance: Your ${prompt} guide expires tonight"
3. "Why ${prompt} is your competitive advantage in 2024"
4. "Quick question about your ${prompt} strategy..."
5. "The #1 ${prompt} mistake (and how to fix it)"`,

    'product-description': `**Transform Your ${prompt} Experience Today**

Discover the power of ${prompt} with our revolutionary solution that delivers results you can see and feel immediately.

✅ **Key Benefits:**
• Saves you 10+ hours per week
• Increases efficiency by 300%
• Proven results in just 30 days
• Used by 10,000+ satisfied customers

✅ **What's Included:**
• Complete ${prompt} system
• Step-by-step implementation guide
• 24/7 customer support
• 30-day money-back guarantee

**Limited Time Offer:** Get started today and receive exclusive bonuses worth $297 absolutely free!

*Join thousands of successful users who've already transformed their ${prompt} results.*

**Ready to get started? Click "Add to Cart" now!**`,

    'video-script': `**${prompt} Video Script (2-3 minutes)**

**[0:00-0:15] HOOK**
"If you're struggling with ${prompt}, this video will change everything. In the next 2 minutes, I'll show you exactly how to master ${prompt} using a simple strategy that most people completely overlook."

**[0:15-0:30] INTRODUCTION**
"Hi, I'm [Your Name], and I've helped thousands of people succeed with ${prompt}. Today, I'm sharing the exact 3-step system that's generated incredible results."

**[0:30-1:45] MAIN CONTENT**
"Here's the thing about ${prompt} - most people get it wrong from the start. Let me break down the 3 key elements:

First: [Key Point 1] - This is crucial because...
Second: [Key Point 2] - Here's why this matters...
Third: [Key Point 3] - This is the game-changer...

The magic happens when you combine all three elements together."

**[1:45-2:00] CALL-TO-ACTION**
"Want to dive deeper? I've created a free guide that walks you through each step in detail. Click the link below to download it now, and let's transform your ${prompt} results together!"

**[Speaker Notes: Maintain enthusiastic but professional tone, use hand gestures for emphasis, include relevant visuals/graphics]**`,

    'ad-copy': `**HEADLINE:** Finally! The ${prompt} Solution You've Been Searching For

**Are you tired of struggling with ${prompt}?**

You're not alone. 87% of people face the same challenges you do, but there's a better way.

**Introducing the breakthrough ${prompt} system that's changing everything:**

✅ Get results in just 24 hours
✅ No technical skills required  
✅ Works for beginners and experts
✅ 100% satisfaction guaranteed

**SOCIAL PROOF:** "This ${prompt} solution saved me 20 hours a week!" - Sarah M., Verified Customer

**LIMITED TIME:** Save 50% when you order in the next 24 hours!

**🔥 BONUS:** Order now and get our exclusive ${prompt} masterclass FREE ($197 value)

**Don't wait - this offer expires soon!**

[GET INSTANT ACCESS NOW]

---

**Short Version:**
🚀 Master ${prompt} in 24 hours or less
✅ Proven system, guaranteed results
🎁 50% OFF + FREE bonus today only
[CLAIM YOUR SPOT NOW]`
  }

  return mockContent[contentType] || `Here's your generated content about ${prompt}. This is a comprehensive response tailored for ${contentType} that provides valuable insights and actionable information.`
}

// Validate content quality (basic checks)
export function validateGeneratedContent(content, contentType) {
  if (!content || content.trim().length === 0) {
    throw new ApiError(500, 'Generated content is empty')
  }

  const minLengths = {
    'social-post': 50,
    'blog-outline': 200,
    'email-subject': 30,
    'product-description': 100,
    'video-script': 300,
    'ad-copy': 100
  }

  const minLength = minLengths[contentType] || 50
  
  if (content.length < minLength) {
    throw new ApiError(500, `Generated content is too short for ${contentType}`)
  }

  return true
}
