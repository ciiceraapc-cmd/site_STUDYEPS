'use client'

import { createClient } from '@/lib/supabase/client'
import React, { useEffect } from 'react'

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Supabase client once on mount
    createClient()
  }, [])

  return <>{children}</>
}
