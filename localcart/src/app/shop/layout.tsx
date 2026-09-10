import { AuthGuard } from '@/components/layout/AuthGuard'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={['SHOP_OWNER']}>{children}</AuthGuard>
}
