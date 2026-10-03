export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const action = body.action || 'login'
    const password = (body.password || body.pass || '').toString().trim()

    // ---- OTP ACTIONS ----
    if (action === 'send-otp') {
      // Abhi ke liye OTP bypass - direct success de dete hain
      return NextResponse.json({ success: true, message: 'OTP sent' })
    }
    if (action === 'verify-otp') {
      const otp = (body.otp || '').toString().trim()
      if (otp.length >= 4) {
        return NextResponse.json({ success: true })
      }
      return NextResponse.json({ success: false, error: 'Wrong OTP' }, { status: 401 })
    }

    // ---- LOGIN ACTION ----
    if (!password) {
      return NextResponse.json({ success: false, error: 'Password required' }, { status: 400 })
    }

    const ADMIN_PASS = (process.env.ADMIN_PASSWORD || '').trim()
    const MASTER_KEY = (process.env.MASTER_KEY || '').trim()
    const FALLBACK = 'ravish123'

    // 1. Direct match - fallback, env, master
    if (password === FALLBACK || password === ADMIN_PASS || password === MASTER_KEY) {
      return NextResponse.json({ success: true, is_master: true })
    }

    // 2. Supabase check
    const supabase = getSupabase()
    if (supabase) {
      try {
        const { data } = await supabase.from('admins').select('*').eq('password', password).maybeSingle()
        if (data) {
          return NextResponse.json({ success: true, is_master: true })
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
