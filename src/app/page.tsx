'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ShoppingCart, DollarSign, PackageCheck, Users, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const dummyChartData = [
  { name: 'Jan', expense: 1500000 },
  { name: 'Feb', expense: 800000 },
  { name: 'Mar', expense: 3500000 },
  { name: 'Apr', expense: 500000 },
  { name: 'May', expense: 2200000 },
  { name: 'Jun', expense: 1200000 },
]

export default function Dashboard() {
  const [stats, setStats] = useState({
    activeOrders: 0,
    monthlyExpense: 0,
    itemsArrived: 0,
    totalSellers: 0
  })

  useEffect(() => {
    // Attempt to fetch dashboard view if available
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase.from('dashboard_stats').select('*').single()
        if (data && !error) {
          setStats({
            activeOrders: data.active_orders,
            monthlyExpense: data.monthly_expense,
            itemsArrived: data.items_arrived_this_month,
            totalSellers: data.total_sellers
          })
        }
      } catch (e) {
        console.error("Supabase not fully setup yet or view missing.")
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      {/* Priority Reminders */}
      <Card className="border-l-4 border-l-red-400 bg-white/30">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-red-400/20 p-3 rounded-full">
              <Clock className="text-red-500" size={24} />
            </div>
            <div>
              <h4 className="font-bold text-lg text-aero-text">Priority Reminder</h4>
              <p className="text-sm text-aero-text/70">Bayar Pelunasan RLC Skyline - Due Today!</p>
            </div>
          </div>
          <Badge variant="danger" className="animate-pulse">Due Today</Badge>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Orders" value={stats.activeOrders || 8} icon={ShoppingCart} color="text-blue-500" bg="bg-blue-500/20" />
        <StatCard title="Expense (This Month)" value={`Rp ${(stats.monthlyExpense || 1200000).toLocaleString('id-ID')}`} icon={DollarSign} color="text-green-500" bg="bg-green-500/20" />
        <StatCard title="Items Arrived" value={stats.itemsArrived || 3} icon={PackageCheck} color="text-purple-500" bg="bg-purple-500/20" />
        <StatCard title="Total Sellers" value={stats.totalSellers || 12} icon={Users} color="text-pink-500" bg="bg-pink-500/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Expenditure Trend (6 Months)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dummyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" vertical={false} />
                <XAxis dataKey="name" stroke="#1a237e" axisLine={false} tickLine={false} />
                <YAxis stroke="#1a237e" axisLine={false} tickLine={false} tickFormatter={(val) => `Rp ${val / 1000}k`} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.1)' }} contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }} />
                <Bar dataKey="expense" fill="#00C9FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Hot Wheels RLC Skyline R34', status: 'dp', price: 1500000 },
                { name: 'Tomica LV Nissan GTR', status: 'booking', price: 850000 },
                { name: 'MiniGT Porsche 911 GT3', status: 'sudah_tiba', price: 350000 },
              ].map((order, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/20 hover:bg-white/40 transition-colors cursor-pointer border border-white/20">
                  <div className="truncate pr-4">
                    <p className="font-semibold text-sm truncate text-aero-text">{order.name}</p>
                    <p className="text-xs text-aero-text/60 font-mono">Rp {order.price.toLocaleString('id-ID')}</p>
                  </div>
                  <Badge variant={order.status === 'sudah_tiba' ? 'default' : order.status === 'dp' ? 'info' : 'warning'}>
                    {order.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-4 rounded-2xl ${bg}`}>
          <Icon className={color} size={28} />
        </div>
        <div>
          <p className="text-sm font-medium text-aero-text/70">{title}</p>
          <h4 className="text-2xl font-bold text-aero-text">{value}</h4>
        </div>
      </CardContent>
    </Card>
  )
}
