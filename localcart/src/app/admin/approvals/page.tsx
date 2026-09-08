'use client'

import { useState, useEffect } from 'react'
import { AdminNavbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/utils'

export default function ApprovalsPage() {
  const [shops, setShops] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const { showToast } = useToast()

  const fetchShops = () => {
    fetch('/api/admin/shops?status=PENDING')
      .then(r => r.json())
      .then(d => { setShops(d.shops ?? []); setLoading(false) })
  }

  useEffect(() => { fetchShops() }, [])

  const handleAction = async (shopId: string, status: 'APPROVED' | 'SUSPENDED', reason?: string) => {
    setProcessing(true)
    const res = await fetch(`/api/admin/shops/${shopId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, rejectionReason: reason }),
    })
    setProcessing(false)
    if (res.ok) {
      showToast(status === 'APPROVED' ? 'Shop approved!' : 'Shop rejected', status === 'APPROVED' ? 'success' : 'info')
      setSelected(null)
      fetchShops()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Shop Approvals</h1>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : shops.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No pending approvals.</div>
        ) : (
          <div className="space-y-3">
            {shops.map(shop => (
              <div key={shop.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-gray-900">{shop.name}</h2>
                    <p className="text-sm text-gray-500">{shop.address}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Owner: {shop.owner?.name} · {shop.owner?.email} · {shop.owner?.phone}
                    </p>
                    <p className="text-xs text-gray-400">Category: {shop.category?.name ?? 'None'}</p>
                    <p className="text-xs text-gray-400">Submitted: {formatDate(shop.createdAt)}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" onClick={() => handleAction(shop.id, 'APPROVED')} loading={processing}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => setSelected(shop)}>Reject</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Reject modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Reject shop" size="sm">
        {selected && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Rejecting <strong>{selected.name}</strong>. Provide a reason (optional):</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="e.g. Missing required information"
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setSelected(null)}>Cancel</Button>
              <Button variant="danger" loading={processing} onClick={() => handleAction(selected.id, 'SUSPENDED', rejectReason)}>
                Reject
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
