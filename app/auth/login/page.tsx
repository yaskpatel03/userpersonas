'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else window.location.href = '/dashboard'
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) setError(error.message)
      else if (data.session) window.location.href = '/dashboard'
      else setMessage('Check your email to confirm your account.')
    }
    setLoading(false)
  }

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-sm border border-zinc-100">
        <h1 className="text-2xl font-bold text-zinc-900 mb-1">UserPersonas</h1>
        <p className="text-sm text-zinc-500 mb-6">
          {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
        </p>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        {message && <p className="text-sm text-green-600 mb-4">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : mode === 'login' ? 'Sign in' : 'Sign up'}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-100" />
          </div>
          <div className="relative text-center text-xs text-zinc-400 bg-white px-2 w-fit mx-auto">or</div>
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogle}>
          Continue with Google
        </Button>

        <p className="text-center text-sm text-zinc-500 mt-4">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            className="text-zinc-900 font-medium underline"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
