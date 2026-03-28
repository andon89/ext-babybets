// Supabase Edge Function for sending emails via Resend
// Deploy with: supabase functions deploy send-email
// Set secret: supabase secrets set RESEND_API_KEY=re_xxxxx
//
// This function handles two email types:
// 1. "invite" - Send pool invite to a guest
// 2. "reveal" - Notify all guests with emails that results are revealed

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { type } = body;

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (type === "invite") {
      const { to, poolName, hostName, poolUrl } = body;
      await sendEmail({
        to,
        subject: `${hostName} invited you to predict ${poolName}'s stats!`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
            <h1 style="font-size: 24px; color: #2D2A26;">👶 Baby Bets</h1>
            <p style="color: #6B6560; font-size: 16px;">
              ${hostName} invited you to make your predictions for <strong>${poolName}</strong>!
            </p>
            <p style="color: #6B6560; font-size: 16px;">
              Guess the gender, birthday, weight, and more. See how close you get when the baby arrives!
            </p>
            <a href="${poolUrl}" style="display: inline-block; background: #E8A0B4; color: white; padding: 14px 28px; border-radius: 14px; text-decoration: none; font-weight: bold; font-size: 16px; margin-top: 16px;">
              Make My Prediction ✨
            </a>
            <p style="color: #A49E96; font-size: 12px; margin-top: 24px;">
              babybets.cc
            </p>
          </div>
        `,
      });
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (type === "reveal") {
      const { poolId, poolName, babyName, announcementUrl } = body;

      // Get all predictions with emails for this pool
      const { data: predictions } = await supabase
        .from("bb_predictions")
        .select("guest_email, guest_name")
        .eq("pool_id", poolId)
        .not("guest_email", "is", null);

      if (predictions && predictions.length > 0) {
        const emails = predictions
          .filter((p: any) => p.guest_email)
          .map((p: any) => p.guest_email);

        // Send to each guest (Resend free tier: 100/day)
        for (const email of emails) {
          await sendEmail({
            to: email,
            subject: `🎉 ${babyName} is here! See how your predictions did`,
            html: `
              <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
                <h1 style="font-size: 24px; color: #2D2A26;">🎉 The results are in!</h1>
                <p style="color: #6B6560; font-size: 16px;">
                  <strong>${babyName}</strong> has arrived! See how your predictions
                  stacked up against everyone else.
                </p>
                <a href="${announcementUrl}" style="display: inline-block; background: #7ABED6; color: white; padding: 14px 28px; border-radius: 14px; text-decoration: none; font-weight: bold; font-size: 16px; margin-top: 16px;">
                  View Announcement & Results
                </a>
                <p style="color: #A49E96; font-size: 12px; margin-top: 24px;">
                  babybets.cc
                </p>
              </div>
            `,
          });
        }
      }

      return new Response(JSON.stringify({ success: true, sent: predictions?.length ?? 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown email type" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

async function sendEmail(params: { to: string; subject: string; html: string }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Baby Bets <noreply@babybets.cc>",
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("Resend error:", text);
  }
  return res;
}
