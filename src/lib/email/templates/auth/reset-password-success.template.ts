import {
  escapeHtml,
  renderBaseLayout,
  renderEmailButton,
  type EmailTemplate,
} from "../layouts/base-layout";

export interface ResetPasswordSuccessTemplateOptions {
  recipientName?: string;
  signInUrl: string;
}

export function resetPasswordSuccessTemplate({
  recipientName,
  signInUrl,
}: ResetPasswordSuccessTemplateOptions): EmailTemplate {
  const greeting = recipientName
    ? `Hi ${escapeHtml(recipientName)},`
    : "Hello,";
  const subject = "Your Smart Gate password was changed";
  const preheader = "Your account password has been updated.";

  return {
    subject,
    html: renderBaseLayout({
      preheader,
      content: `<h1 style="margin: 0 0 16px; color: #123b47; font-size: 24px; line-height: 30px;">Password updated</h1>
        <p style="margin: 0 0 16px; color: #40545b; font-size: 15px; line-height: 24px;">${greeting}</p>
        <p style="margin: 0 0 16px; color: #40545b; font-size: 15px; line-height: 24px;">The password for your Smart Gate Monitoring account was changed successfully.</p>
        <p style="margin: 0; color: #40545b; font-size: 15px; line-height: 24px;">If you did not make this change, secure your account immediately by contacting your administrator.</p>
        ${renderEmailButton(signInUrl, "Sign in to your account")}`,
    }),
    text: `${recipientName ? `Hi ${recipientName},` : "Hello,"}

The password for your Smart Gate Monitoring account was changed successfully.

Sign in to your account: ${signInUrl}

If you did not make this change, secure your account immediately by contacting your administrator.`,
  };
}
