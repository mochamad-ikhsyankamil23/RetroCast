'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { supabase } from '@/lib/supabase'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export default function SellersPage() {
  const [sellers, setSellers] = useState<any[]>([])

  useEffect(() => {
    const fetchSellers = async () => {
      const { data, error } = await supabase.from('sellers').select('*').order('created_at', { ascending: false })
      if (data) setSellers(data)
    }
    fetchSellers()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-aero-text to-blue-600">Sellers</h2>
          <p className="text-aero-text/70">Manage your preorder sources and trusted sellers.</p>
        </div>
        <Button variant="primary" className="gap-2">
          <Plus size={20} /> Add Seller
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellers.length > 0 ? sellers.map((seller) => (
                <TableRow key={seller.id}>
                  <TableCell className="font-semibold text-aero-text">{seller.name}</TableCell>
                  <TableCell>
                    <Badge variant={seller.platform === 'tokopedia' ? 'success' : 'info'}>
                      {seller.platform}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-aero-text/80">{seller.contact}</TableCell>
                  <TableCell>⭐ {seller.rating}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm"><Edit2 size={16} /></Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-500/10"><Trash2 size={16} /></Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-aero-text/50">
                    No sellers found. Add some to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
