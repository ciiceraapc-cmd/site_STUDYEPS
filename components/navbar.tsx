'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setLoading(false)
    }
    getUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return <nav className="h-16 bg-white border-b border-gray-200"></nav>
  }

  return (
    <nav className="h-16 bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <span className="font-bold text-lg text-gray-900">ETE Study</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/dashboard" className="text-gray-700 hover:text-gray-900 font-medium">
            Dashboard
          </Link>
          <Link href="/simulados" className="text-gray-700 hover:text-gray-900 font-medium">
            Simulados
          </Link>
          <Link href="/tutor" className="text-gray-700 hover:text-gray-900 font-medium">
            Tutor IA
          </Link>
          <Link href="/challenges" className="text-gray-700 hover:text-gray-900 font-medium">
            Desafios
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative w-10 h-10 rounded-full bg-indigo-100">
                <span className="text-sm font-bold text-indigo-600">
                  {user?.email?.[0].toUpperCase()}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem disabled>
                <span className="text-xs text-gray-500">{user?.email}</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/profile" className="w-full">
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/settings" className="w-full">
                  Configurações
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600"
              >
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
