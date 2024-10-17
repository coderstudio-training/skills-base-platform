'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { logger } from '@/lib/utils'

export default function AuthError() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams?.get('error')
    logger.error('Auth Error:', error)
  }, [searchParams])

  return (
    <div>
      <h1>Authentication Error</h1>
      <p>An error occurred during authentication. Please try again or contact support if the problem persists.</p>
    </div>
  )
}
