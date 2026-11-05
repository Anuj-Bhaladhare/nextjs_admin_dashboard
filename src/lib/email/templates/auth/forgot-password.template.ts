import {
  escapeHtml,
  renderBaseLayout,
  renderEmailButton,
  type EmailTemplate,
} from "../layouts/base-layout";

export interface ForgotPasswordTemplateOptions {
  recipientName?: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export function forgotPasswordTemplate({
  recipientName,
  resetUrl,
  expiresInMinutes,
}: ForgotPasswordTemplateOptions): EmailTemplate {
  const greeting = recipientName
    ? `Hi ${escapeHtml(recipientName)},`
    : "Hello,";
  const subject = "Reset your Smart Gate password";
  const preheader = "Use the secure link to choose a new password.";

  return {
    subject,
    html: renderBaseLayout({
      preheader,
      content: `<h1 style="margin: 0 0 16px; color: #123b47; font-size: 24px; line-height: 30px;">Reset your password</h1>
        <p style="margin: 0 0 16px; color: #40545b; font-size: 15px; line-height: 24px;">${greeting}</p>
        <p style="margin: 0; color: #40545b; font-size: 15px; line-height: 24px;">We received a request to reset the password for your Smart Gate Monitoring account. Use the button below to choose a new password.</p>
        ${renderEmailButton(resetUrl, "Reset password")}
        <p style="margin: 0 0 12px; color: #64777d; font-size: 13px; line-height: 20px;">This link expires in ${escapeHtml(String(expiresInMinutes))} minutes and can only be used once.</p>
        <p style="margin: 0; color: #64777d; font-size: 13px; line-height: 20px;">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>`,
    }),
    text: `${recipientName ? `Hi ${recipientName},` : "Hello,"}

We received a request to reset the password for your Smart Gate Monitoring account.

Reset your password: ${resetUrl}

This link expires in ${expiresInMinutes} minutes and can only be used once. If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.`,
  };
}