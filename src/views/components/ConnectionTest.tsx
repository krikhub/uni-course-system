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
    <div className="card">
      <div className="card-content">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-3 h-3 rounded-full ${
            status === 'testing' ? 'bg-[#9DA69F] animate-pulse' :
            status === 'connected' ? 'bg-[#565D56]' : 'bg-[#383B39]'
          }`}></div>
          <h3 className="text-sm font-semibold text-[#383B39]">Datenbankverbindung</h3>
        </div>
        
        {status === 'testing' && (
          <div className="flex items-center gap-2 text-sm text-[#565D56]">
            <div className="w-4 h-4 border-2 border-[#C5CDC7] border-t-[#565D56] rounded-full animate-spin"></div>
            Verbindung wird getestet...
          </div>
        )}
        
        {status === 'connected' && (
          <div className="flex items-center gap-2 text-sm text-[#565D56]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Erfolgreich verbunden
          </div>
        )}
        
        {status === 'error' && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-sm text-[#383B39]">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="font-medium">Verbindung fehlgeschlagen</div>
                <div className="text-xs mt-1 text-[#565D56]">{error}</div>
              </div>
            </div>
            <button 
              onClick={testConnection}
              className="px-3 py-1.5 text-xs font-medium bg-[#383B39]/10 text-[#383B39] hover:bg-[#383B39]/20 rounded-md transition-colors"
            >
              Erneut versuchen
            </button>
          </div>
        )}
        
        <div className="mt-4 pt-3 border-t border-[#C5CDC7]/40">
          <div className="text-xs text-[#9DA69F] space-y-1">
            <div className="flex justify-between">
              <span>URL:</span>
              <span className="font-mono">{process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Konfiguriert' : '✗ Fehlt'}</span>
            </div>
            <div className="flex justify-between">
              <span>API Key:</span>
              <span className="font-mono">{process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Konfiguriert' : '✗ Fehlt'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}