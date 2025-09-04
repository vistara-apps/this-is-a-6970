/**
 * Simple health check utility to verify app initialization
 */
export function performHealthCheck() {
  const checks = {
    dom: typeof document !== 'undefined',
    localStorage: typeof localStorage !== 'undefined',
    fetch: typeof fetch !== 'undefined'
  }
  
  const failed = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([check]) => check)
  
  if (failed.length > 0) {
    console.warn('Health check failed for:', failed)
    return false
  }
  
  console.log('✅ Application health check passed')
  return true
}

export function getEnvironmentInfo() {
  return {
    nodeEnv: import.meta.env.MODE,
    hasOpenAIKey: !!import.meta.env.VITE_OPENAI_API_KEY,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  }
}
