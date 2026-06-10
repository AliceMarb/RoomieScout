import nodemailer from "nodemailer";

// "ready"  — sent when a match completes and results are available.
// "saved"  — sent when someone asks us to email them their results link so they
//            don't lose it (the link is easy to misplace otherwise).
type NotificationKind = "ready" | "saved";

const COPY: Record<NotificationKind, { subject: string; heading: string; body: string }> = {
  ready: {
    subject: "Your roommate compatibility results are ready 🏠",
    heading: "Your results are in!",
    body: "Your potential roommate has completed their Homi interview. See how compatible you are:",
  },
  saved: {
    subject: "Your Homi compatibility results — saved 🏠",
    heading: "Here's your results link",
    body: "Keep this email so you can reopen your compatibility results anytime:",
  },
};

// Notification concept — alert a person by email with a link.
// The caller is responsible for constructing the URL.
export async function sendNotification({
  to,
  url,
  kind = "ready",
}: {
  to: string;
  url: string;
  kind?: NotificationKind;
}) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email not configured — set EMAIL_USER and EMAIL_PASS in .env.local");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const { subject, heading, body } = COPY[kind];

  console.log(`[notification] Sending ${kind} email to ${to}`);
  await transporter.sendMail({
    from: `"Homi" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 16px;color:#0f172a">
        <h1 style="font-size:22px;font-weight:600;margin-bottom:8px">${heading}</h1>
        <p style="color:#475569;margin-bottom:24px">${body}</p>
        <a href="${url}"
           style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;
                  padding:12px 24px;border-radius:8px;font-weight:500;font-size:15px">
          View compatibility results →
        </a>
        <p style="margin-top:32px;font-size:12px;color:#94a3b8">
          Homi · You're receiving this because you requested it.
        </p>
      </div>
    `,
  });
  console.log(`[notification] ✓ Sent to ${to}`);
}
