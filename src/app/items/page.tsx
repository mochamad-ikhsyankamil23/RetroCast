'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { supabase } from '@/lib/supabase'
import { Plus, LayoutGrid, List } from 'lucide-react'

export default function ItemsPage() {
  const [items, setItems] = useState<any[]>([])
  const [view, setView] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase.from('items').select('*').order('created_at', { ascending: false })
      if (data) setItems(data)
    }
    fetchItems()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-aero-text to-blue-600">Diecast Catalog</h2>
          <p className="text-aero-text/70">Manage your preorder catalog and collection items.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-white/30 backdrop-blur-md rounded-lg">
            <button onClick={() => setView('grid')} className={`p-2 rounded-md transition-colors ${view === 'grid' ? 'bg-white shadow-sm text-aero-text' : 'text-aero-text/60'}`}>
              <LayoutGrid size={18} />
            </button>
            <button onClick={() => setView('list')} className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-white shadow-sm text-aero-text' : 'text-aero-text/60'}`}>
              <List size={18} />
            </button>
          </div>
          <Button variant="primary" className="gap-2">
            <Plus size={20} /> Add Item
          </Button>
        </div>
      </div>

      <div className={view === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
        {items.length > 0 ? items.map((item) => (
          <Card key={item.id} className={`overflow-hidden transition-all duration-300 hover:shadow-glow hover:-translate-y-1 ${view === 'list' ? 'flex flex-row items-center p-4' : 'p-0'}`}>
            <div className={`${view === 'list' ? 'w-24 h-24 mr-4' : 'w-full h-48'} bg-white/40 flex items-center justify-center`}>
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">🚗</span>
              )}
            </div>
            <div className={`flex flex-col justify-between ${view === 'grid' ? 'p-4' : 'flex-1'}`}>
              <div>
                <Badge className="mb-2 uppercase text-[10px] tracking-wider">{item.brand}</Badge>
                <h3 className="font-bold text-aero-text leading-tight mb-1">{item.name}</h3>
                <p className="text-xs text-aero-text/60 font-medium">Scale {item.scale}</p>
              </div>
              <div className={`mt-4 ${view === 'list' ? 'mt-0 text-right' : ''}`}>
                <p className="font-bold text-lg text-aero-cyan drop-shadow-sm">Rp {item.price.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </Card>
        )) : (
          <div className="col-span-full py-12 text-center text-aero-text/60">
            No items in the catalog yet.
          </div>
        )}
      </div>
    </div>
  )
}
