import nodemailer from "nodemailer";

export async function sendResultsEmail({
  to,
  flowId,
}: {
  to: string;
  flowId: string;
}) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email not configured — set EMAIL_USER and EMAIL_PASS in .env.local");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const resultsUrl = `${process.env.NEXT_PUBLIC_APP_URL}/results/${flowId}`;

  console.log(`[email] Sending results email to ${to} for flow ${flowId}`);
  await transporter.sendMail({
    from: `"Homi" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your roommate compatibility results are ready 🏠",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 16px;color:#0f172a">
        <h1 style="font-size:22px;font-weight:600;margin-bottom:8px">Your results are in!</h1>
        <p style="color:#475569;margin-bottom:24px">
          Your potential roommate has completed their Homi interview.
          See how compatible you are:
        </p>
        <a href="${resultsUrl}"
           style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;
                  padding:12px 24px;border-radius:8px;font-weight:500;font-size:15px">
          View compatibility results →
        </a>
        <p style="margin-top:32px;font-size:12px;color:#94a3b8">
          Homi · You're receiving this because you requested a notification.
        </p>
      </div>
    `,
  });
  console.log(`[email] ✓ Sent to ${to}`);
}
