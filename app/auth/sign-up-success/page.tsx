import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignUpSuccessPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Conta Criada com Sucesso!</CardTitle>
          <CardDescription className="text-center">Verifique seu email para confirmar sua conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">
            Enviamos um email de confirmação para você. Clique no link no email para ativar sua conta.
          </p>
          <Link href="/auth/login" className="block">
            <Button className="w-full">Voltar ao Login</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
