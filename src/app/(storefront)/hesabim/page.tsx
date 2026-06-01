import { Metadata } from 'next'
import AccountClient from './account-client'

export const metadata: Metadata = {
  title: 'Hesabım - MağazaVitrin',
  description: 'Hesap bilgilerinizi yönetin',
}

export default function AccountPage() {
  return <AccountClient />
}
