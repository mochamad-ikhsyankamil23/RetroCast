import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// For server-side cron tasks, we should ideally use the SERVICE_ROLE_KEY to bypass RLS, 
// but we will use ANON key for now since RLS is likely permissive for cron or we assume open for the admin.
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const resend = new Resend(process.env.RESEND_API_KEY)
const senderEmail = process.env.NEXT_PUBLIC_EMAIL_SENDER || 'onboarding@resend.dev'
// Ideally fetch admin email from DB, using a static one for now or relying on Resend limits.
const adminEmail = 'admin@retrocast.app' // Placeholder

export async function GET(request: Request) {
  try {
    // 1. Find all active 'tanggal' reminders due today
    const today = new Date().toISOString().split('T')[0]
    
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('*, orders(items(name))')
      .eq('type', 'tanggal')
      .eq('date', today)
      .eq('is_active', true)

    if (error) throw error

    if (!reminders || reminders.length === 0) {
      return NextResponse.json({ message: 'No daily reminders for today.' })
    }

    // 2. Process and send emails
    for (const reminder of reminders) {
      const itemName = reminder.orders?.items?.name || 'Unknown Item'
      
      try {
        await resend.emails.send({
          from: `RetroCast <${senderEmail}>`,
          to: [adminEmail],
          subject: `Reminder: ${reminder.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background: linear-gradient(180deg, #e0f7fa 0%, #b2dfdb 100%);">
              <div style="background: rgba(255,255,255,0.8); padding: 20px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #00C9FF;">${reminder.title}</h2>
                <p>This is an automated reminder for your preorder:</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                  <strong>Item:</strong> ${itemName}
                </div>
                <p>Log in to <a href="https://retrocast.app">RetroCast</a> to manage this order.</p>
              </div>
            </div>
          `
        })
        
        // Log notification
        await supabase.from('notifications').insert({
          reminder_id: reminder.id,
          channel: 'email',
          status: 'success'
        })
      } catch (emailErr: any) {
        await supabase.from('notifications').insert({
          reminder_id: reminder.id,
          channel: 'email',
          status: 'failed',
          error_message: emailErr.message
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: reminders.length 
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
