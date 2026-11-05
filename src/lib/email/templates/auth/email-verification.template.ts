import {
  escapeHtml,
  renderBaseLayout,
  renderEmailButton,
  type EmailTemplate,
} from "../layouts/base-layout";

export interface EmailVerificationTemplateOptions {
  recipientName?: string;
  verificationUrl: string;
  expiresInHours: number;
}

export function emailVerificationTemplate({
  recipientName,
  verificationUrl,
  expiresInHours,
}: EmailVerificationTemplateOptions): EmailTemplate {
  const greeting = recipientName
    ? `Hi ${escapeHtml(recipientName)},`
    : "Hello,";
  const subject = "Verify your Smart Gate email address";
  const preheader = "Confirm your email address to finish setting up your account.";

  return {
    subject,
    html: renderBaseLayout({
      preheader,
      content: `<h1 style="margin: 0 0 16px; color: #123b47; font-size: 24px; line-height: 30px;">Verify your email</h1>
        <p style="margin: 0 0 16px; color: #40545b; font-size: 15px; line-height: 24px;">${greeting}</p>
        <p style="margin: 0; color: #40545b; font-size: 15px; line-height: 24px;">Thanks for creating a Smart Gate Monitoring account. Confirm that this is your email address to complete setup.</p>
        ${renderEmailButton(verificationUrl, "Verify email address")}
        <p style="margin: 0; color: #64777d; font-size: 13px; line-height: 20px;">This verification link expires in ${escapeHtml(String(expiresInHours))} hours. If you did not create an account, you can safely ignore this email.</p>`,
    }),
    text: `${recipientName ? `Hi ${recipientName},` : "Hello,"}

Thanks for creating a Smart Gate Monitoring account. Confirm that this is your email address to complete setup.

Verify your email address: ${verificationUrl}

This verification link expires in ${expiresInHours} hours. If you did not create an account, you can safely ignore this email.`,
  };
}