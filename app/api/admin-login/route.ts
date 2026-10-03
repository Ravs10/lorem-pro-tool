export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing Supabase env: ' + JSON.stringify({ hasUrl: !!url, hasKey: !!key }))
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    let password = (body.password || body.next || body.current || '').toString().trim()

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 })
    }

    // 1. FALLBACK - ye hamesha kaam karega
    if (password === 'ravish123') {
      return NextResponse.json({ ok: true, source: 'fallback' })
    }

    // 2. Supabase check
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('password', password)
        .maybeSingle()

      if (error) {
        // agar table error hai to fallback se login kara do
        console.log('supabase error', error.message)
        if (password === 'ravish123') {
          return NextResponse.json({ ok: true, source: 'fallback-after-error' })
        }
        throw error
      }
      
      if (data) {
        return NextResponse.json({ ok: true, source: 'supabase' })
      }
    } catch (e: any) {
      console.log('catch error', e.message)
      // env missing hone pe bhi fallback chalega
      if (password === 'ravish123') {
        return NextResponse.json({ ok: true, source: 'fallback-env-error' })
      }
      return NextResponse.json({ error: e.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })

  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
  }
}
