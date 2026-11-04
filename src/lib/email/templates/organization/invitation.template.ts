import {
  escapeHtml,
  renderBaseLayout,
  renderEmailButton,
  type EmailTemplate,
} from "../layouts/base-layout";

export interface OrganizationInvitationTemplateOptions {
  recipientName?: string;
  organizationName: string;
  inviterName: string;
  role: string;
  invitationUrl: string;
  expiresInDays: number;
}

export function organizationInvitationTemplate({
  recipientName,
  organizationName,
  inviterName,
  role,
  invitationUrl,
  expiresInDays,
}: OrganizationInvitationTemplateOptions): EmailTemplate {
  const greeting = recipientName
    ? `Hi ${escapeHtml(recipientName)},`
    : "Hello,";
  const subject = `Invitation to join ${organizationName} on Smart Gate`;
  const preheader = `${inviterName} invited you to join ${organizationName}.`;

  return {
    subject,
    html: renderBaseLayout({
      preheader,
      content: `<h1 style="margin: 0 0 16px; color: #123b47; font-size: 24px; line-height: 30px;">You're invited</h1>
        <p style="margin: 0 0 16px; color: #40545b; font-size: 15px; line-height: 24px;">${greeting}</p>
        <p style="margin: 0 0 16px; color: #40545b; font-size: 15px; line-height: 24px;"><strong>${escapeHtml(inviterName)}</strong> invited you to join <strong>${escapeHtml(organizationName)}</strong> in Smart Gate Monitoring.</p>
        <p style="margin: 0; color: #40545b; font-size: 15px; line-height: 24px;">Your assigned role is <strong>${escapeHtml(role)}</strong>.</p>
        ${renderEmailButton(invitationUrl, "Accept invitation")}
        <p style="margin: 0; color: #64777d; font-size: 13px; line-height: 20px;">This invitation expires in ${escapeHtml(String(expiresInDays))} days. If you were not expecting this invitation, you can safely ignore this email.</p>`,
    }),
    text: `${recipientName ? `Hi ${recipientName},` : "Hello,"}

${inviterName} invited you to join ${organizationName} in Smart Gate Monitoring.
Your assigned role is ${role}.

Accept invitation: ${invitationUrl}

This invitation expires in ${expiresInDays} days. If you were not expecting this invitation, you can safely ignore this email.`,
  };
}