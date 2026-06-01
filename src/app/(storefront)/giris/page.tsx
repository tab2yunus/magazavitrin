import { Metadata } from 'next'
import LoginClient from './login-client'

export const metadata: Metadata = {
  title: 'Giriş Yap - MağazaVitrin',
  description: 'Hesabınıza giriş yapın',
}

export default function LoginPage() {
  return <LoginClient />
}
