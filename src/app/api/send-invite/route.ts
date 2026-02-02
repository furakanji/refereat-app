import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    try {
        const { email, link, restaurantName } = await req.json();

        const { data, error } = await resend.emails.send({
            from: 'ReferEat <onboarding@resend.dev>', // Recommended default for testing
            to: [email],
            subject: `${restaurantName} invited you to become an Ambassador!`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Only one step left! 🚀</h1>
            <p><strong>${restaurantName}</strong> wants you to be their ambassador on ReferEat.</p>
            <p>Click the link below to accept the invitation and start earning credits:</p>
            <a href="${link}" style="display: inline-block; background-color: #ea580c; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Accept Invitation</a>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">If the button doesn't work, copy this link: ${link}</p>
        </div>
      `,
        });

        if (error) {
            return NextResponse.json({ error }, { status: 400 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}
