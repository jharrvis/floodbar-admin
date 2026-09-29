type OpenAIQueue = (...args: unknown[]) => void

declare global {
  interface Window {
    oaiq?: OpenAIQueue
  }
}

export function trackOpenAILeadCreated() {
  if (typeof window === 'undefined' || typeof window.oaiq !== 'function') {
    return
  }

  window.oaiq('measure', 'lead_created', { type: 'customer_action' })
}