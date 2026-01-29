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
      
      // Test 1: Basic connection
      const { data: basicTest, error: basicError } = await supabase
        .from('students')
        .select('count', { count: 'exact', head: true })

      if (basicError) {
        console.error('Basic connection error:', basicError)
        setError(`Basic connection failed: ${basicError.message}`)
        setStatus('error')
        return
      }

      // Test 2: Check if tables exist
      const { data: tables, error: tablesError } = await supabase
        .rpc('get_table_names')
        .then(() => ({ data: 'Tables accessible', error: null }))
        .catch(() => ({ data: null, error: { message: 'Tables might not exist' } }))

      // Test 3: Try to create a student
      const testStudent = {
        first_name: 'Test',
        last_name: 'User',
        email: `test-${Date.now()}@example.com`,
        student_number: `TEST-${Date.now()}`
      }

      const { data: createTest, error: createError } = await supabase
        .from('students')
        .insert(testStudent)
        .select()
        .single()

      if (createError) {
        console.error('Create test error:', createError)
        setError(`Create test failed: ${createError.message}`)
        setStatus('error')
        return
      }

      // Clean up test data
      if (createTest) {
        await supabase.from('students').delete().eq('id', createTest.id)
      }

      console.log('All tests passed!')
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