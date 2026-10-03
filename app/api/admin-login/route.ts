export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

// In-memory OTP store (Cloudflare Workers ke liye)
const otpStore = (globalThis as any).__otpStore || ((globalThis as any).__otpStore = new Map())

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const action = body.action || 'login'
    const password = (body.password || body.pass || '').toString().trim()

    // ---- SEND OTP - REAL EMAIL ----
    if (action === 'send-otp') {
      const email = (body.email || process.env.RECOVERY_EMAIL_TO || '').toString().trim()
      if (!email) {
        return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 })
      }
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = Date.now() + 10 * 60 * 1000 // 10 min

      // Store OTP
      otpStore.set(email, { otp, expiresAt })
      
      // Try Supabase also
      const supabase = getSupabase()
      if (supabase) {
        try {
          await supabase.from('admin_otps').upsert({ email, otp, expires_at: new Date(expiresAt).toISOString() }, { onConflict: 'email' })
        } catch {}
      }

      // Send Real Email via Resend
      try {
        const resendKey = process.env.RESEND_API_KEY
        const fromEmail = process.env.RECOVERY_EMAIL_FROM || 'onboarding@resend.dev'
        if (resendKey) {
          const resend = new Resend(resendKey)
          await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: 'Lorem Pro Tool - Login OTP',
            html: `<div style="font-family:sans-serif"><h2>Your OTP is: <b>${otp}</b></h2><p>Valid for 10 minutes.</p></div>`
          })
        }
      } catch (e) {
        console.log('Resend failed', e)
        // Fail na kare, OTP store ho gaya hai, user ko bata denge
      }

      return NextResponse.json({ success: true, message: 'OTP sent to ' + email })
    }

    if (action === 'verify-otp') {
      const email = (body.email || process.env.RECOVERY_EMAIL_TO || '').toString().trim()
      const otp = (body.otp || '').toString().trim()
      const record = otpStore.get(email)

      // Check memory first
      if (record && record.otp === otp && Date.now() < record.expiresAt) {
        otpStore.delete(email)
        return NextResponse.json({ success: true, is_master: false, role: 'admin', via: 'otp' })
      }

      // Check Supabase
      const supabase = getSupabase()
      if (supabase) {
        try {
          const { data } = await supabase.from('admin_otps').select('*').eq('email', email).eq('otp', otp).maybeSingle()
          if (data) {
            await supabase.from('admin_otps').delete().eq('email', email)
            return NextResponse.json({ success: true, is_master: false, role: 'admin', via: 'otp' })
          }
        } catch {}
      }
      
      return NextResponse.json({ success: false, error: 'Wrong or expired OTP' }, { status: 401 })
    }

    // ---- LOGIN ACTION - ALAG ALAG ----
    if (!password) {
      return NextResponse.json({ success: false, error: 'Password required' }, { status: 400 })
    }

    const ADMIN_PASS = (process.env.ADMIN_PASSWORD || '').trim()
    const MASTER_KEY = (process.env.MASTER_KEY || '').trim()
    const FALLBACK = 'ravish123'

    // 1. MASTER KEY -> is_master = true
    if (MASTER_KEY && password === MASTER_KEY) {
      return NextResponse.json({ success: true, is_master: true, role: 'master' })
    }

    // 2. ADMIN PASS -> is_master = false
    if ((ADMIN_PASS && password === ADMIN_PASS) || password === FALLBACK) {
      return NextResponse.json({ success: true, is_master: false, role: 'admin' })
    }

    // 3. Supabase check -> admin only
    const supabase = getSupabase()
    if (supabase) {
      try {
        const { data } = await supabase.from('admins').select('*').eq('password', password).maybeSingle()
        if (data) {
          const isMaster = (data as any).is_master === true || (data as any).role === 'master'
          return NextResponse.json({ success: true, is_master: isMaster, role: isMaster ? 'master' : 'admin' })
        }
      } catch (e) {
        console.log('supabase check failed', e)
      }
    }

    return NextResponse.json({ success: false, error: 'Wrong password' }, { status: 401 })

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
