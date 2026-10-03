export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing Supabase env')
  }
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { current, next, username } = await req.json()

    if (!next) {
      return NextResponse.json({ error: 'New password required' }, { status: 400 })
    }

    // update password
    const { error } = await supabase
      .from('admins')
      .update({ password: next })
      .eq('username', username || 'admin')

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
