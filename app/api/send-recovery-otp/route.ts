import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function POST() {
  try {
    // Cloudflare se env lena
    const { env } = await getCloudflareContext({ async: true }) as any;
    
    const apiKey = env.RESEND_API_KEY || process.env.RESEND_API_KEY;
    const emailTo = env.RECOVERY_EMAIL_TO || process.env.RECOVERY_EMAIL_TO;
    const emailFrom = env.RECOVERY_EMAIL_FROM || process.env.RECOVERY_EMAIL_FROM || 'onboarding@resend.dev';

    if (!apiKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY not found in Cloudflare env' }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: emailTo,
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

    return NextResponse.json({ success: true, otp: otp, id: data?.id });
    
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
