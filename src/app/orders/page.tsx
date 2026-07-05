'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { supabase } from '@/lib/supabase'
import { Plus, Eye, Download, Upload } from 'lucide-react'
import Link from 'next/link'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          sellers (name, platform),
          items (name, price)
        `)
        .order('created_at', { ascending: false })
      if (data) setOrders(data)
    }
    fetchOrders()
  }, [])

  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'booking': return 'warning';
      case 'dp': return 'info';
      case 'lunas': return 'success';
      case 'batal': return 'danger';
      case 'sudah_tiba': return 'default';
      default: return 'default';
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-aero-text to-blue-600">Preorders</h2>
          <p className="text-aero-text/70">Track and manage all your diecast preorders.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="gap-2 border border-white/40"><Upload size={18} /> Import</Button>
          <Button variant="ghost" className="gap-2 border border-white/40"><Download size={18} /> Export</Button>
          <Button variant="primary" className="gap-2 ml-2">
            <Plus size={20} /> New Order
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length > 0 ? orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-semibold text-aero-text">
                    <div className="flex flex-col">
                      <span>{order.items?.name || 'Unknown Item'}</span>
                      <span className="text-xs text-aero-text/50 font-normal">Qty: {order.quantity}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-aero-text/80">{order.sellers?.name}</span>
                      <span className="text-xs text-aero-text/50 capitalize">{order.sellers?.platform}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-aero-text/90">
                    Rp {order.total_price.toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell className="text-aero-text/80">{order.eta_date}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)} className="uppercase text-[10px]">
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1 text-blue-600 hover:bg-blue-500/10">
                        <Eye size={16} /> View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-aero-text/50">
                    No orders found. Add a new preorder to track it here.
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
