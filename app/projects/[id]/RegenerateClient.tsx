'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function RegenerateClient({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleRegenerate() {
    setLoading(true)
    await fetch(`/api/projects/${projectId}/regenerate`, { method: 'POST', body: JSON.stringify({}) })
    router.refresh()
    setLoading(false)
  }

  return (
    <Button variant="outline" onClick={handleRegenerate} disabled={loading} size="sm">
      {loading ? 'Regenerating...' : 'Regenerate'}
    </Button>
  )
}
