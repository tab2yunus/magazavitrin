import { Metadata } from 'next'
import RegisterClient from './register-client'

export const metadata: Metadata = {
  title: 'Kayıt Ol - MağazaVitrin',
  description: 'Yeni hesap oluşturun',
}

export default function RegisterPage() {
  return <RegisterClient />
}
