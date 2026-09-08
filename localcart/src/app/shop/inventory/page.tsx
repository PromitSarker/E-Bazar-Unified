'use client'

import { useState, useEffect } from 'react'
import { ShopNavbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createItemSchema } from '@/lib/validations'
import { formatBDT } from '@/lib/utils'
import { z } from 'zod'

type ItemForm = z.infer<typeof createItemSchema>

const UNITS = ['kg', 'g', 'pcs', 'liter', 'ml', 'dozen', 'pack', 'bundle', 'bag', 'box']

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([])
  const [shopId, setShopId] = useState('')
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const { showToast } = useToast()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ItemForm>({
    resolver: zodResolver(createItemSchema),
    defaultValues: { inStock: true, stockQty: 0, price: 0 },
  })

  const fetchData = async () => {
    const statsRes = await fetch('/api/shop/stats')
    const stats = await statsRes.json()
    if (!stats.shopId) return
    setShopId(stats.shopId)

    const [itemsRes, catRes] = await Promise.all([
      fetch(`/api/shops/${stats.shopId}/items`),
      fetch('/api/admin/categories'),
    ])
    const itemsData = await itemsRes.json()
    const catData = await catRes.json()
    setItems(itemsData.items ?? [])
    setCategories(catData.categories ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const onSubmit = async (data: ItemForm) => {
    setSaving(true)
    try {
      const url = editItem
        ? `/api/shops/${shopId}/items/${editItem.id}`
        : `/api/shops/${shopId}/items`
      const res = await fetch(url, {
        method: editItem ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        showToast(editItem ? 'Item updated' : 'Item added', 'success')
        setAddOpen(false)
        setEditItem(null)
        reset()
        fetchData()
      }
    } finally {
      setSaving(false)
    }
  }

  const toggleStock = async (item: any) => {
    await fetch(`/api/shops/${shopId}/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inStock: !item.inStock }),
    })
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, inStock: !i.inStock } : i))
  }

  const updateStock = async (item: any, qty: number) => {
    await fetch(`/api/shops/${shopId}/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stockQty: qty }),
    })
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, stockQty: qty } : i))
  }

  const deleteItem = async (itemId: string) => {
    if (!confirm('Delete this item?')) return
    await fetch(`/api/shops/${shopId}/items/${itemId}`, { method: 'DELETE' })
    setItems(prev => prev.filter(i => i.id !== itemId))
    showToast('Item deleted', 'info')
  }

  const openEdit = (item: any) => {
    setEditItem(item)
    reset({
      name: item.name,
      unit: item.unit,
      price: item.price,
      stockQty: item.stockQty,
      inStock: item.inStock,
      categoryId: item.categoryId,
    })
    setAddOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopNavbar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-gray-900">Inventory</h1>
          <Button size="sm" onClick={() => { setEditItem(null); reset({ inStock: true, stockQty: 0, price: 0 }); setAddOpen(true) }}>
            + Add item
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No items yet. Add your first item!</div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Item</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Unit</th>
                  <th className="text-left px-4 py-3">Price</th>
                  <th className="text-left px-4 py-3">Stock</th>
                  <th className="text-center px-4 py-3">In Stock</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map(item => (
                  <tr key={item.id} className={!item.inStock ? 'opacity-50' : ''}>
                    <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{item.unit}</td>
                    <td className="px-4 py-3 text-gray-900">{formatBDT(item.price)}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        value={item.stockQty}
                        onChange={e => updateStock(item, parseInt(e.target.value) || 0)}
                        className="w-16 rounded border border-gray-200 px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleStock(item)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${item.inStock ? 'bg-emerald-500' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${item.inStock ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openEdit(item)} className="text-xs text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => deleteItem(item.id)} className="text-xs text-red-500 hover:underline">Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Add/Edit modal */}
      <Modal open={addOpen} onClose={() => { setAddOpen(false); setEditItem(null) }} title={editItem ? 'Edit item' : 'Add item'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" placeholder="e.g. Atta Flour" error={errors.name?.message} {...register('name')} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Unit</label>
              <select {...register('unit')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
              {errors.unit && <p className="text-xs text-red-600 mt-1">{errors.unit.message}</p>}
            </div>
            <Input label="Price (৳)" type="number" step="0.5" placeholder="0" error={errors.price?.message} {...register('price', { valueAsNumber: true })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Stock qty" type="number" min={0} placeholder="0" error={errors.stockQty?.message} {...register('stockQty', { valueAsNumber: true })} />
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
              <select {...register('categoryId')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">None</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <Input label="Photo URL" type="url" placeholder="https://… (optional)" {...register('photoUrl')} />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="inStock" {...register('inStock')} className="rounded border-gray-300 text-emerald-600" />
            <label htmlFor="inStock" className="text-sm text-gray-700">In stock</label>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => { setAddOpen(false); setEditItem(null) }}>Cancel</Button>
            <Button type="submit" loading={saving}>{editItem ? 'Update' : 'Add item'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
