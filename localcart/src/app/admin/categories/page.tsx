'use client'

import { useState, useEffect } from 'react'
import { AdminNavbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toast'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  const fetchCats = () => {
    fetch('/api/admin/categories').then(r => r.json()).then(d => { setCategories(d.categories ?? []); setLoading(false) })
  }

  useEffect(() => { fetchCats() }, [])

  const addCategory = async () => {
    if (!name.trim()) return
    setSaving(true)
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    })
    setSaving(false)
    if (res.ok) {
      showToast('Category added', 'success')
      setName('')
      setAddOpen(false)
      fetchCats()
    } else {
      const d = await res.json()
      showToast(d.error ?? 'Failed', 'error')
    }
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category? This may affect shops using it.')) return
    await fetch('/api/admin/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    showToast('Category deleted', 'info')
    fetchCats()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <Button size="sm" onClick={() => setAddOpen(true)}>+ Add</Button>
        </div>

        {loading ? <div className="flex justify-center py-12"><Spinner /></div> : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {categories.length === 0 ? (
              <p className="text-center py-12 text-sm text-gray-400">No categories yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {categories.map(cat => (
                  <li key={cat.id} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                    <button onClick={() => deleteCategory(cat.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add category" size="sm">
        <div className="space-y-4">
          <Input
            label="Category name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Vegetables"
            onKeyDown={e => e.key === 'Enter' && addCategory()}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button loading={saving} onClick={addCategory}>Add</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
