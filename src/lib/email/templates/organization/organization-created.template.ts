import {
  escapeHtml,
  renderBaseLayout,
  renderEmailButton,
  type EmailTemplate,
} from "../layouts/base-layout";

export interface OrganizationCreatedTemplateOptions {
  recipientName?: string;
  organizationName: string;
  dashboardUrl: string;
}

export function organizationCreatedTemplate({
  recipientName,
  organizationName,
  dashboardUrl,
}: OrganizationCreatedTemplateOptions): EmailTemplate {
  const greeting = recipientName
    ? `Hi ${escapeHtml(recipientName)},`
    : "Hello,";
  const subject = `${organizationName} is ready on Smart Gate`;
  const preheader = `Your ${organizationName} workspace is ready to use.`;

  return {
    subject,
    html: renderBaseLayout({
      preheader,
      content: `<h1 style="margin: 0 0 16px; color: #123b47; font-size: 24px; line-height: 30px;">Your organization is ready</h1>
        <p style="margin: 0 0 16px; color: #40545b; font-size: 15px; line-height: 24px;">${greeting}</p>
        <p style="margin: 0; color: #40545b; font-size: 15px; line-height: 24px;"><strong>${escapeHtml(organizationName)}</strong> has been created in Smart Gate Monitoring. You can now open its dashboard and begin managing your gate monitoring workspace.</p>
        ${renderEmailButton(dashboardUrl, "Open dashboard")}
        <p style="margin: 0; color: #64777d; font-size: 13px; line-height: 20px;">For security, only invite people who should have access to this organization.</p>`,
    }),
    text: `${recipientName ? `Hi ${recipientName},` : "Hello,"}

${organizationName} has been created in Smart Gate Monitoring. You can now open its dashboard and begin managing your gate monitoring workspace.

Open dashboard: ${dashboardUrl}

For security, only invite people who should have access to this organization.`,
  };
}