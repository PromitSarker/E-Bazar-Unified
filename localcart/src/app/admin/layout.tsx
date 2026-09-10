import { AuthGuard } from '@/components/layout/AuthGuard'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={['ADMIN']}>{children}</AuthGuard>
}
