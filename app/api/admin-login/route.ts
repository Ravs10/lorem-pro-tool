
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Missing Supabase env')
  }
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username password required' }, { status: 400 })
    }

    // Admin check from supabase table
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Agar aap plain password use kar rahe ho to
    if (data.password !== password) {
       return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    return NextResponse.json({ ok: true, message: 'Login success' })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
