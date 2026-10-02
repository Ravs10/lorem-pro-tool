import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // OTP ko 5 min ke liye Cloudflare KV me save karna best hai,
    // abhi ke liye hum email bhej rahe hain

    const { data, error } = await resend.emails.send({
      from: process.env.RECOVERY_EMAIL_FROM || 'onboarding@resend.dev',
      to: process.env.RECOVERY_EMAIL_TO!,
      subject: 'Your Lorem Tool Recovery OTP',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Password Recovery</h2>
          <p>Your OTP is:</p>
          <h1 style="letter-spacing: 5px; color: #000;">${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // OTP ko response me bhej rahe hain taaki aap test kar sako (baad me hata denge)
    return NextResponse.json({ success: true, otp: otp, id: data?.id });
    
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
