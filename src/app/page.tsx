import { Suspense } from 'react'
import { App } from '@/components/App'

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <p className="text-gray-600 text-sm">Carregando…</p>
        </div>
      }
    >
      <App />
    </Suspense>
  )
}
