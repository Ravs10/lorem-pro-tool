import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Build time pe hi key inject ho jati hai kyunki aapne Build variables me daala hai
    const apiKey = process.env.RESEND_API_KEY;
    const emailTo = process.env.RECOVERY_EMAIL_TO;
    const emailFrom = process.env.RECOVERY_EMAIL_FROM || 'onboarding@resend.dev';

    console.log('DEBUG ENV:', { hasKey: !!apiKey, hasTo: !!emailTo, hasFrom: !!emailFrom });

    if (!apiKey) {
      return NextResponse.json({ error: `RESEND_API_KEY still missing. Build variables me hai par code tak nahi aa rahi.` }, { status: 500 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Resend SDK ki jagah direct fetch — no constructor error
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: emailTo,
        subject: 'Your Lorem Tool Recovery OTP',
        html: `<div style="font-family: sans-serif; padding: 20px;"><h2>Password Recovery</h2><p>Your OTP is:</p><h1 style="letter-spacing: 5px;">${otp}</h1><p>Expires in 5 minutes.</p></div>`,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: `Resend API failed: ${JSON.stringify(data)}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, otp: otp, id: data.id });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
