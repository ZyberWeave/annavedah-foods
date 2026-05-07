import React from 'react'
import AdminShell from './AdminShell'

export const metadata = {
  title: 'Console | Annavedah Foods',
  robots: 'noindex, nofollow',
}

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
