'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface TableTest {
  name: string
  status: 'testing' | 'success' | 'error'
  count?: number
  error?: string
}

export default function SupabaseTest() {
  const [isClient, setIsClient] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing')
  const [tables, setTables] = useState<TableTest[]>([
    { name: 'students', status: 'testing' },
    { name: 'lecturers', status: 'testing' },
    { name: 'courses', status: 'testing' },
    { name: 'enrollments', status: 'testing' }
  ])

  // Ensure component only renders after hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    
    async function testTables() {
      const tableTests = [...tables]
      
      for (let i = 0; i < tableTests.length; i++) {
        try {
          const { error, count } = await supabase
            .from(tableTests[i].name as any)
            .select('*', { count: 'exact', head: true })
          
          if (error) {
            throw error
          }
          
          tableTests[i] = {
            ...tableTests[i],
            status: 'success',
            count: count || 0
          }
        } catch (err: any) {
          tableTests[i] = {
            ...tableTests[i],
            status: 'error',
            error: err.message
          }
        }
        
        setTables([...tableTests])
      }
      
      const allSuccess = tableTests.every(t => t.status === 'success')
      setConnectionStatus(allSuccess ? 'connected' : 'error')
    }

    testTables()
  }, [isClient])

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="p-4 border rounded-lg bg-white">
        <h3 className="text-lg font-semibold mb-4">Supabase Connection Test</h3>
        <div className="text-blue-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-4">Supabase Connection Test</h3>
      
      <div className="mb-4">
        {connectionStatus === 'testing' && (
          <div className="text-blue-600">Testing connection...</div>
        )}
        
        {connectionStatus === 'connected' && (
          <div className="text-green-600">✅ Successfully connected to Supabase!</div>
        )}
        
        {connectionStatus === 'error' && (
          <div className="text-red-600">❌ Some tables have connection issues</div>
        )}
      </div>

      <div className="space-y-2">
        {tables.map((table) => (
          <div key={table.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="font-medium">{table.name}</span>
            <div className="flex items-center gap-2">
              {table.status === 'testing' && (
                <span className="text-blue-600">Testing...</span>
              )}
              {table.status === 'success' && (
                <span className="text-green-600">✅ {table.count} rows</span>
              )}
              {table.status === 'error' && (
                <span className="text-red-600 text-sm">❌ {table.error}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        URL: {typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : 'Loading...'}
      </div>
    </div>
  )
}