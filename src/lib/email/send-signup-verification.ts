import { sendEmailWithSendGrid } from "@/lib/email/sendgrid";

type SendSignupVerificationEmailInput = {
  to: string;
  firstName?: string | null;
  confirmationUrl: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function sendSignupVerificationEmail({
  to,
  firstName,
  confirmationUrl,
}: SendSignupVerificationEmailInput) {
  const greeting = firstName?.trim()
    ? `Hi ${firstName.trim()},`
    : "Hi there,";
  const safeGreeting = escapeHtml(greeting);
  const safeUrl = escapeHtml(confirmationUrl);

  await sendEmailWithSendGrid({
    to,
    subject: "Confirm your Layer Up beta signup",
    text: `${greeting}

Please confirm your Layer Up beta signup by opening this secure link:
${confirmationUrl}

This link expires in 24 hours.

If you did not request this, you can ignore this email.`,
    html: `
      <div style="margin:0; padding:32px 20px; background:#edf4fb; font-family:Arial, sans-serif; color:#17324d;">
        <div style="max-width:560px; margin:0 auto; background:#ffffff; border:1px solid #d8e4f0; border-radius:24px; padding:32px;">
          <p style="margin:0 0 18px; font-size:16px; line-height:24px;">${safeGreeting}</p>
          <h1 style="margin:0 0 14px; font-size:28px; line-height:34px; color:#17324d;">
            Confirm your Layer Up beta signup
          </h1>
          <p style="margin:0 0 22px; font-size:16px; line-height:24px; color:#48637d;">
            Use the secure confirmation link below to finish joining the beta. We verify email ownership before activating subscriptions or updating household details.
          </p>
          <p style="margin:0 0 26px;">
            <a href="${safeUrl}" style="display:inline-block; padding:14px 20px; border-radius:999px; background:#224e84; color:#ffffff; font-size:15px; font-weight:700; text-decoration:none;">
              Confirm my signup
            </a>
          </p>
          <p style="margin:0 0 12px; font-size:14px; line-height:22px; color:#48637d;">
            If the button does not open, copy and paste this URL into your browser:
          </p>
          <p style="margin:0 0 18px; font-size:13px; line-height:20px; word-break:break-all; color:#224e84;">
            ${safeUrl}
          </p>
          <p style="margin:0; font-size:13px; line-height:20px; color:#6a8198;">
            This link expires in 24 hours. If you did not request this, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  });
}
