import { supabase } from "./supabase";

// For MVP: we'll call a Supabase Edge Function to send emails.
// The edge function uses Resend to deliver.
// If the edge function isn't deployed yet, these gracefully fail.

export async function sendInviteEmail(params: {
  recipientEmail: string;
  poolName: string;
  hostName: string;
  poolUrl: string;
}): Promise<boolean> {
  try {
    const { error } = await supabase.functions.invoke("send-email", {
      body: {
        type: "invite",
        to: params.recipientEmail,
        poolName: params.poolName,
        hostName: params.hostName,
        poolUrl: params.poolUrl,
      },
    });
    return !error;
  } catch {
    console.warn("Email notification failed (edge function may not be deployed)");
    return false;
  }
}

export async function sendRevealEmails(params: {
  poolId: string;
  poolName: string;
  babyName: string;
  announcementUrl: string;
}): Promise<boolean> {
  try {
    const { error } = await supabase.functions.invoke("send-email", {
      body: {
        type: "reveal",
        poolId: params.poolId,
        poolName: params.poolName,
        babyName: params.babyName,
        announcementUrl: params.announcementUrl,
      },
    });
    return !error;
  } catch {
    console.warn("Reveal notification failed (edge function may not be deployed)");
    return false;
  }
}
