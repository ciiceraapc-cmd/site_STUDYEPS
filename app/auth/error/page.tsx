import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthErrorPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 p-3">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Erro de Autenticação</CardTitle>
          <CardDescription className="text-center">Ocorreu um erro durante o login</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">
            Desculpe, não foi possível processar seu login. Tente novamente.
          </p>
          <Link href="/auth/login" className="block">
            <Button className="w-full">Voltar ao Login</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
