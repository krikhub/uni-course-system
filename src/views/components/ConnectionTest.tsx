'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ConnectionTest() {
  const [status, setStatus] = useState<'testing' | 'connected' | 'error'>('testing')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      console.log('Testing Supabase connection...')
      console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      
      // Simple connection test - just check if we can query the students table
      const { error } = await supabase
        .from('students')
        .select('count', { count: 'exact', head: true })

      if (error) {
        console.error('Connection error:', error)
        setError(`Connection failed: ${error.message}`)
        setStatus('error')
        return
      }

      console.log('Connection test passed!')
      setStatus('connected')
    } catch (err: any) {
      console.error('Connection error:', err)
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-2">Supabase Verbindungstest</h3>
      
      {status === 'testing' && (
        <div className="text-blue-600">Verbindung wird getestet...</div>
      )}
      
      {status === 'connected' && (
        <div className="text-green-600">✅ Erfolgreich verbunden!</div>
      )}
      
      {status === 'error' && (
        <div className="text-red-600">
          ❌ Verbindung fehlgeschlagen: {error}
          <button 
            onClick={testConnection}
            className="ml-2 px-2 py-1 bg-red-100 rounded text-sm"
          >
            Erneut versuchen
          </button>
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-500">
        <div>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</div>
        <div>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Gesetzt' : 'Fehlt'}</div>
      </div>
    </div>
  )
}