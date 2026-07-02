export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn()
    } catch (error) {
      const isBusy = error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'SQLITE_BUSY'
      if (!isBusy || attempt >= maxRetries) {
        throw error
      }
      const delay = Math.min(100 * Math.pow(2, attempt) + Math.random() * 50, 1000)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
}
