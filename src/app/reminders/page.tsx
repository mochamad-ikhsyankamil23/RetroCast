'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { Bell, Play, Power } from 'lucide-react'

export default function RemindersPage() {
  const [reminders, setReminders] = useState<any[]>([])

  useEffect(() => {
    const fetchReminders = async () => {
      const { data, error } = await supabase
        .from('reminders')
        .select('*, orders(items(name))')
        .order('created_at', { ascending: false })
      if (data) setReminders(data)
    }
    fetchReminders()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-aero-text to-blue-600">Reminders</h2>
          <p className="text-aero-text/70">Manage notification schedules for your preorders.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Order Item</TableHead>
                <TableHead>Schedule / Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reminders.length > 0 ? reminders.map((reminder) => (
                <TableRow key={reminder.id}>
                  <TableCell>
                    <Badge variant={reminder.type === 'tanggal' ? 'danger' : reminder.type === 'mingguan' ? 'info' : 'warning'} className="uppercase text-[10px]">
                      {reminder.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-aero-text">{reminder.title}</TableCell>
                  <TableCell className="text-aero-text/80">{reminder.orders?.items?.name || 'N/A'}</TableCell>
                  <TableCell className="text-sm font-mono text-aero-text/70">
                    {reminder.type === 'tanggal' && reminder.date}
                    {reminder.type === 'mingguan' && `Day ${reminder.day_of_week}`}
                    {reminder.type === 'quarterly' && `Month ${reminder.quarter_month}`}
                    <span className="ml-2 text-aero-text/50">@ {reminder.time}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={reminder.is_active ? 'success' : 'default'}>
                      {reminder.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" className="gap-1 text-aero-cyan hover:bg-aero-cyan/10">
                      <Play size={14} /> Test
                    </Button>
                    <Button variant="ghost" size="sm" className={reminder.is_active ? 'text-red-500 hover:bg-red-500/10' : 'text-green-500 hover:bg-green-500/10'}>
                      <Power size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-aero-text/50">
                    No reminders configured.
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
