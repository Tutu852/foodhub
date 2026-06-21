export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const dns = await import('dns')
      dns.setDefaultResultOrder('ipv4first')
      console.log('=== Next.js Node.js instrumentation initialized ===')
    } catch (err) {
      console.warn('Next.js Node.js instrumentation initialization failed:', err)
    }
  }
}
