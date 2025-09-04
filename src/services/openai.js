import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'your-api-key-here',
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
})

const contentPrompts = {
  'social-media': (prompt) => `Create an engaging social media post about: ${prompt}. Make it concise, compelling, and include relevant hashtags.`,
  'article': (prompt) => `Create a detailed article outline about: ${prompt}. Include main sections, key points, and a compelling introduction and conclusion.`,
  'email': (prompt) => `Write an engaging email newsletter about: ${prompt}. Include a catchy subject line, compelling content, and clear call-to-action.`,
  'blog': (prompt) => `Write a comprehensive blog post about: ${prompt}. Make it informative, engaging, and SEO-friendly with proper structure.`
}

export const generateContent = async (prompt, contentType) => {
  try {
    const systemPrompt = contentPrompts[contentType](prompt)
    
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        {
          role: "system",
          content: "You are a creative content writer who creates engaging, high-quality content for various purposes. Always provide well-structured, original content that matches the requested format."
        },
        {
          role: "user",
          content: systemPrompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    return completion.choices[0].message.content
  } catch (error) {
    console.error('OpenAI API error:', error)
    
    // Fallback content for demo purposes
    const fallbackContent = {
      'social-media': `🚀 Exciting insights about ${prompt}! 

This is a game-changer for anyone looking to improve their approach. Here's what you need to know:

✨ Key benefits that matter
💡 Practical tips you can use today
🎯 Results that speak for themselves

What's your experience with this? Share in the comments! 👇

#ContentCreation #Innovation #Growth #Success`,

      'article': `# ${prompt}: A Comprehensive Guide

## Introduction
Understanding ${prompt} is crucial in today's digital landscape...

## Main Sections

### 1. Foundation Concepts
- Core principles and definitions
- Historical context and evolution
- Current industry standards

### 2. Practical Applications
- Real-world use cases
- Implementation strategies
- Common challenges and solutions

### 3. Best Practices
- Expert recommendations
- Proven methodologies
- Tools and resources

### 4. Future Outlook
- Emerging trends
- Predictions and forecasts
- Preparation strategies

## Conclusion
By implementing these insights about ${prompt}, you'll be well-positioned to...`,

      'email': `Subject: Transform Your Approach to ${prompt} 🎯

Hi there!

Hope you're having a fantastic week! I wanted to share some exciting insights about ${prompt} that could revolutionize how you think about this topic.

Here's what I've discovered:

🔍 The Problem: Many people struggle with understanding ${prompt} effectively.

💡 The Solution: A strategic approach that focuses on practical implementation.

✅ Key Benefits:
- Improved efficiency and results
- Better understanding of core concepts
- Actionable insights you can use immediately

Ready to dive deeper? Click here to learn more about maximizing your ${prompt} strategy.

Best regards,
Your Content Team`,

      'blog': `# The Ultimate Guide to ${prompt}: Everything You Need to Know

## Introduction

In today's fast-paced digital world, understanding ${prompt} has become more important than ever. Whether you're a beginner or looking to enhance your existing knowledge, this comprehensive guide will provide you with actionable insights and practical strategies.

## What is ${prompt}?

${prompt} represents a fundamental concept that impacts various aspects of modern business and personal development. Let's break down the key components...

## Why ${prompt} Matters

The importance of ${prompt} cannot be overstated. Here are the main reasons why you should care:

1. **Competitive Advantage**: Understanding ${prompt} gives you an edge
2. **Efficiency Gains**: Proper implementation saves time and resources
3. **Long-term Success**: Building strong foundations for future growth

## Getting Started with ${prompt}

### Step 1: Assessment
Begin by evaluating your current situation...

### Step 2: Planning
Develop a strategic approach that aligns with your goals...

### Step 3: Implementation
Execute your plan with careful attention to detail...

## Best Practices and Tips

- Focus on quality over quantity
- Stay updated with latest trends
- Measure and optimize your results
- Learn from industry experts

## Common Mistakes to Avoid

Many people make these critical errors when dealing with ${prompt}:
- Rushing the process without proper planning
- Ignoring fundamental principles
- Failing to measure progress

## Conclusion

Mastering ${prompt} is a journey that requires dedication and continuous learning. By following the strategies outlined in this guide, you'll be well on your way to achieving your goals.

Remember: consistency is key to long-term success.`
    }

    return fallbackContent[contentType] || `Generated content about: ${prompt}\n\nThis is a placeholder response. In a production environment, this would be generated by the OpenAI API.`
  }
}