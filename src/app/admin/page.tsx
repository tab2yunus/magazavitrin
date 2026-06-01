'use client'

import AdminPanel from '@/components/admin/admin-panel'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()
  
  function handleBack() {
    router.push('/')
  }
  
  return <AdminPanel onBack={handleBack} />
}
