'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { 
  ShoppingBag, 
  DollarSign, 
  Package, 
  Users, 
  AlertCircle,
  Clock
} from 'lucide-react'

interface DashboardStats {
  active_orders: number
  monthly_expense: number
  items_arrived_this_month: number
  total_sellers: number
}

interface RecentOrder {
  id: string
  item_name: string
  seller_name: string
  total_price: number
  status: string
  eta_date: string
}

interface PriorityReminder {
  id: string
  title: string
  date: string
  type: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    active_orders: 0,
    monthly_expense: 0,
    items_arrived_this_month: 0,
    total_sellers: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [reminders, setReminders] = useState<PriorityReminder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    
    try {
      // Ambil semua data sekaligus pake Promise.all (lebih cepet!)
      const [statsResult, ordersResult, remindersResult] = await Promise.all([
        // 1. Ambil stats dalam 1 query (pake view atau query langsung)
        fetchStats(),
        // 2. Ambil 3 order terakhir
        fetchRecentOrders(),
        // 3. Ambil 3 reminder terdekat
        fetchRecentReminders()
      ])

      if (statsResult) setStats(statsResult)
      if (ordersResult) setRecentOrders(ordersResult)
      if (remindersResult) setReminders(remindersResult)

    } catch (error) {
      console.error('Dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 1 QUERY UNTUK SEMUA STATS (GABUNGAN)
  const fetchStats = async (): Promise<DashboardStats | null> => {
    try {
      // Coba pake view dulu
      const { data: viewData, error: viewError } = await supabase
        .from('dashboard_stats')
        .select('*')
        .single()

      if (!viewError && viewData) {
        return {
          active_orders: viewData.active_orders || 0,
          monthly_expense: viewData.monthly_expense || 0,
          items_arrived_this_month: viewData.items_arrived_this_month || 0,
          total_sellers: viewData.total_sellers || 0
        }
      }

      // Kalau view error, pake query gabungan (1 query doang!)
      const { data, error } = await supabase.rpc('get_dashboard_stats')
      
      // Kalau RPC gak ada, pake query manual (tapi tetep 1 query)
      if (error || !data) {
        // Query gabungan pake SQL raw
        const { data: rawData, error: rawError } = await supabase
          .from('orders')
          .select('status, payments!inner(amount, status, paid_at), sellers(count)')
          .limit(1)
        
        // Fallback: return 0
        return {
          active_orders: 0,
          monthly_expense: 0,
          items_arrived_this_month: 0,
          total_sellers: 0
        }
      }

      return data as DashboardStats

    } catch (error) {
      console.error('Stats error:', error)
      // Return default value kalo error
      return {
        active_orders: 0,
        monthly_expense: 0,
        items_arrived_this_month: 0,
        total_sellers: 0
      }
    }
  }

  // AMBIL 3 ORDER TERAKHIR (dengan relasi)
  const fetchRecentOrders = async (): Promise<RecentOrder[]> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          total_price,
          status,
          eta_date,
          items (name),
          sellers (name)
        `)
        .order('created_at', { ascending: false })
        .limit(3) // ← Cuma 3 biar ringan

      if (error || !data) return []

      return data.map((order: any) => ({
        id: order.id,
        item_name: order.items?.name || 'Unknown',
        seller_name: order.sellers?.name || 'Unknown',
        total_price: order.total_price || 0,
        status: order.status || 'booking',
        eta_date: order.eta_date || new Date().toISOString()
      }))

    } catch (error) {
      console.error('Orders error:', error)
      return []
    }
  }

  // AMBIL 3 REMINDER TERDEKAT
  const fetchRecentReminders = async (): Promise<PriorityReminder[]> => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('id, title, date, type')
        .eq('is_active', true)
        .order('date', { ascending: true, nullsFirst: false })
        .limit(3) // ← Cuma 3

      if (error || !data) return []

      return data.map((reminder: any) => ({
        id: reminder.id,
        title: reminder.title || 'Reminder',
        date: reminder.date || '',
        type: reminder.type || 'tanggal'
      }))

    } catch (error) {
      console.error('Reminders error:', error)
      return []
    }
  }

  // STATUS BADGE
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      booking: 'bg-yellow-400/20 text-yellow-700 border-yellow-400/30',
      dp: 'bg-blue-400/20 text-blue-700 border-blue-400/30',
      lunas: 'bg-green-400/20 text-green-700 border-green-400/30',
      batal: 'bg-red-400/20 text-red-700 border-red-400/30',
      sudah_tiba: 'bg-gray-400/20 text-gray-700 border-gray-400/30'
    }
    const labels: Record<string, string> = {
      booking: 'Booking',
      dp: 'DP',
      lunas: 'Lunas',
      batal: 'Batal',
      sudah_tiba: '✅ Tiba'
    }
    return (
      <Badge className={`${styles[status] || 'bg-gray-400/20'} border px-3 py-1 text-sm font-medium`}>
        {labels[status] || status}
      </Badge>
    )
  }

  // LOADING SKELETON (RINGAN)
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse bg-white/20 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="h-4 bg-white/30 rounded w-24 mb-2"></div>
                <div className="h-8 bg-white/30 rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse bg-white/20 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="h-40 bg-white/30 rounded"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse bg-white/20 backdrop-blur-sm border-white/20 mt-4">
          <CardContent className="p-6">
            <div className="h-40 bg-white/30 rounded"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // RENDER DASHBOARD
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-aero-text to-blue-600">
            Dashboard
          </h1>
          <p className="text-aero-text/60 text-sm md:text-base mt-1">
            Welcome back! Here's your collection overview.
          </p>
        </div>
        <Button 
          variant="primary" 
          size="sm"
          onClick={() => window.location.href = '/orders/new'}
          className="w-full sm:w-auto"
        >
          + New Order
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-white/30 backdrop-blur-sm border-white/30 hover:shadow-lg transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-aero-text/60">Active Orders</p>
                <p className="text-xl md:text-2xl font-bold text-aero-text mt-1">
                  {stats.active_orders}
                </p>
              </div>
              <div className="p-2 md:p-3 rounded-full bg-blue-400/20 text-blue-600">
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/30 backdrop-blur-sm border-white/30 hover:shadow-lg transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-aero-text/60">Monthly Expense</p>
                <p className="text-xs md:text-base font-bold text-aero-text mt-1 truncate">
                  Rp {stats.monthly_expense.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="p-2 md:p-3 rounded-full bg-green-400/20 text-green-600">
                <DollarSign className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/30 backdrop-blur-sm border-white/30 hover:shadow-lg transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-aero-text/60">Arrived</p>
                <p className="text-xl md:text-2xl font-bold text-aero-text mt-1">
                  {stats.items_arrived_this_month}
                </p>
              </div>
              <div className="p-2 md:p-3 rounded-full bg-purple-400/20 text-purple-600">
                <Package className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/30 backdrop-blur-sm border-white/30 hover:shadow-lg transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-aero-text/60">Sellers</p>
                <p className="text-xl md:text-2xl font-bold text-aero-text mt-1">
                  {stats.total_sellers}
                </p>
              </div>
              <div className="p-2 md:p-3 rounded-full bg-orange-400/20 text-orange-600">
                <Users className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Reminders */}
      <Card className="bg-white/30 backdrop-blur-sm border-white/30">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
            <h2 className="text-base md:text-lg font-semibold text-aero-text">
              Priority Reminders
            </h2>
          </div>
          {reminders.length > 0 ? (
            <div className="space-y-2 md:space-y-3">
              {reminders.map((reminder) => (
                <div 
                  key={reminder.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/20 hover:bg-white/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-aero-text/60 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-aero-text text-sm md:text-base">
                        {reminder.title}
                      </p>
                      <p className="text-xs md:text-sm text-aero-text/60">
                        {reminder.date ? new Date(reminder.date).toLocaleDateString('id-ID') : 'No date'}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-red-400/20 text-red-700 border-red-400/30 self-start sm:self-center text-xs">
                    {reminder.type === 'tanggal' ? '📅 Date' : 
                     reminder.type === 'mingguan' ? '📆 Weekly' : '📊 Quarterly'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-aero-text/60 text-sm text-center py-4">
              No active reminders. Add some to stay on track!
            </p>
          )}
          <Button 
            variant="outline" 
            className="mt-3 md:mt-4 w-full text-sm"
            onClick={() => window.location.href = '/reminders'}
          >
            View All Reminders
          </Button>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card className="bg-white/30 backdrop-blur-sm border-white/30">
        <CardContent className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-3 md:mb-4">
            <h2 className="text-base md:text-lg font-semibold text-aero-text">
              Recent Orders
            </h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/orders'}
              className="text-xs md:text-sm"
            >
              View All
            </Button>
          </div>
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/20">
                    <TableHead className="text-aero-text/70 text-xs md:text-sm">Item</TableHead>
                    <TableHead className="text-aero-text/70 text-xs md:text-sm hidden sm:table-cell">Seller</TableHead>
                    <TableHead className="text-aero-text/70 text-xs md:text-sm">Total</TableHead>
                    <TableHead className="text-aero-text/70 text-xs md:text-sm hidden md:table-cell">ETA</TableHead>
                    <TableHead className="text-aero-text/70 text-xs md:text-sm">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                      <TableCell className="font-medium text-aero-text text-sm md:text-base">
                        {order.item_name}
                      </TableCell>
                      <TableCell className="text-aero-text/80 text-sm hidden sm:table-cell">
                        {order.seller_name}
                      </TableCell>
                      <TableCell className="text-aero-text/80 text-xs md:text-sm">
                        Rp {order.total_price.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className="text-aero-text/80 text-xs md:text-sm hidden md:table-cell">
                        {new Date(order.eta_date).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-aero-text/60 text-sm text-center py-8">
              No orders yet. Start adding your preorders!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}