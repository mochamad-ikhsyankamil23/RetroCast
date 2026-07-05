'use client'

import React, { useEffect, useState, use } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, CheckCircle2, Circle, Clock, DollarSign, Package } from 'lucide-react'
import Link from 'next/link'

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const id = resolvedParams.id
  
  const [order, setOrder] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [reminders, setReminders] = useState<any[]>([])

  useEffect(() => {
    const fetchOrderDetail = async () => {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*, sellers(*), items(*)')
        .eq('id', id)
        .single()
        
      if (orderData) {
        setOrder(orderData)
        
        const { data: pData } = await supabase.from('payments').select('*').eq('order_id', id).order('due_date', { ascending: true })
        if (pData) setPayments(pData)
        
        const { data: rData } = await supabase.from('reminders').select('*').eq('order_id', id).order('created_at', { ascending: true })
        if (rData) setReminders(rData)
      }
    }
    fetchOrderDetail()
  }, [id])

  if (!order) return <div className="p-8 text-center text-aero-text/50">Loading order details...</div>

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link href="/orders">
        <Button variant="ghost" size="sm" className="mb-2 gap-2 text-aero-text/70 hover:text-aero-text">
          <ArrowLeft size={16} /> Back to Orders
        </Button>
      </Link>

      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-aero-text to-blue-600">
            Order Detail
          </h2>
          <p className="text-aero-text/70 text-sm font-mono mt-1">ID: {order.id}</p>
        </div>
        <Badge className="text-sm px-4 py-1.5 uppercase tracking-wide">
          Status: {order.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Item & Seller Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Package size={20}/> Item Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 p-4 rounded-xl bg-white/20 border border-white/30">
              <div className="w-24 h-24 bg-white/40 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                {order.items?.image_url ? (
                  <img src={order.items.image_url} alt={order.items.name} className="w-full h-full object-cover" />
                ) : <span className="text-3xl">🚗</span>}
              </div>
              <div className="flex-1">
                <Badge className="mb-1 text-[10px]">{order.items?.brand}</Badge>
                <h3 className="font-bold text-lg text-aero-text leading-tight">{order.items?.name}</h3>
                <div className="flex gap-4 mt-2 text-sm text-aero-text/80">
                  <p>Scale: {order.items?.scale}</p>
                  <p>Category: {order.items?.category}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/20 border border-white/30">
                <p className="text-xs text-aero-text/60 uppercase font-semibold mb-1">Seller</p>
                <p className="font-bold text-aero-text">{order.sellers?.name}</p>
                <p className="text-sm text-aero-text/80 capitalize">{order.sellers?.platform} • {order.sellers?.contact}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/20 border border-white/30">
                <p className="text-xs text-aero-text/60 uppercase font-semibold mb-1">Order Summary</p>
                <div className="flex justify-between text-sm"><span>Quantity:</span> <span className="font-bold">{order.quantity}</span></div>
                <div className="flex justify-between text-sm"><span>Total Price:</span> <span className="font-bold text-aero-cyan drop-shadow-sm">Rp {order.total_price.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between text-sm"><span>Order Date:</span> <span className="font-medium">{order.order_date}</span></div>
                <div className="flex justify-between text-sm"><span>ETA:</span> <span className="font-medium text-red-500">{order.eta_date}</span></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><DollarSign size={20}/> Payment Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {payments.map(payment => (
              <div key={payment.id} className="p-3 rounded-lg border border-white/30 bg-white/10 hover:bg-white/30 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <Badge variant={payment.status === 'sudah_bayar' ? 'success' : 'warning'} className="uppercase text-[10px]">
                    {payment.type}
                  </Badge>
                  <span className="text-xs font-semibold text-aero-text/60">Due: {payment.due_date}</span>
                </div>
                <p className="font-bold text-aero-text text-lg">Rp {payment.amount.toLocaleString('id-ID')}</p>
                <div className="mt-2 flex items-center gap-1 text-sm text-aero-text/80">
                  {payment.status === 'sudah_bayar' ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} className="text-yellow-500" />}
                  <span>{payment.status === 'sudah_bayar' ? `Paid on ${new Date(payment.paid_at).toLocaleDateString()}` : 'Unpaid'}</span>
                </div>
              </div>
            ))}
            {payments.length === 0 && <p className="text-sm text-center py-4 text-aero-text/50">No payments scheduled.</p>}
          </CardContent>
        </Card>
      </div>

      {/* Reminders List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Clock size={20}/> Associated Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {reminders.map(reminder => (
              <div key={reminder.id} className="p-3 rounded-lg border border-white/30 bg-white/20 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between">
                    <Badge className="text-[10px] uppercase bg-white/50">{reminder.type}</Badge>
                    <span className={`w-2 h-2 rounded-full ${reminder.is_active ? 'bg-green-500 shadow-glow' : 'bg-gray-400'}`} />
                  </div>
                  <p className="font-semibold text-aero-text mt-2">{reminder.title}</p>
                </div>
                <p className="text-xs text-aero-text/70 mt-3 flex items-center gap-1">
                  <Clock size={12} /> Time: {reminder.time}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
