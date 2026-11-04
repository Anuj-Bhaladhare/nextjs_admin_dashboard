import {
  escapeHtml,
  renderBaseLayout,
  renderEmailButton,
  type EmailTemplate,
} from "../layouts/base-layout";

export interface SecurityAlertTemplateOptions {
  recipientName?: string;
  eventTitle: string;
  eventDescription: string;
  occurredAt: string;
  location?: string;
  ipAddress?: string;
  dashboardUrl: string;
}

export function securityAlertTemplate({
  recipientName,
  eventTitle,
  eventDescription,
  occurredAt,
  location,
  ipAddress,
  dashboardUrl,
}: SecurityAlertTemplateOptions): EmailTemplate {
  const greeting = recipientName
    ? `Hi ${escapeHtml(recipientName)},`
    : "Hello,";
  const details = [
    `<tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #e8edef; color: #64777d; font-size: 13px;">Time</td>
      <td align="right" style="padding: 10px 0; border-bottom: 1px solid #e8edef; color: #243940; font-size: 13px;">${escapeHtml(occurredAt)}</td>
    </tr>`,
    ...(location
      ? [
          `<tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e8edef; color: #64777d; font-size: 13px;">Location</td>
            <td align="right" style="padding: 10px 0; border-bottom: 1px solid #e8edef; color: #243940; font-size: 13px;">${escapeHtml(location)}</td>
          </tr>`,
        ]
      : []),
    ...(ipAddress
      ? [
          `<tr>
            <td style="padding: 10px 0; color: #64777d; font-size: 13px;">IP address</td>
            <td align="right" style="padding: 10px 0; color: #243940; font-size: 13px;">${escapeHtml(ipAddress)}</td>
          </tr>`,
        ]
      : []),
  ].join("");
  const subject = `Security alert: ${eventTitle}`;
  const preheader = `A security event needs your attention: ${eventTitle}.`;
  const textDetails = [
    `Time: ${occurredAt}`,
    ...(location ? [`Location: ${location}`] : []),
    ...(ipAddress ? [`IP address: ${ipAddress}`] : []),
  ].join("\n");

  return {
    subject,
    html: renderBaseLayout({
      preheader,
      content: `<h1 style="margin: 0 0 16px; color: #123b47; font-size: 24px; line-height: 30px;">Security alert</h1>
        <p style="margin: 0 0 16px; color: #40545b; font-size: 15px; line-height: 24px;">${greeting}</p>
        <div style="margin: 0 0 20px; padding: 16px; border-left: 4px solid #d97706; border-radius: 4px; background-color: #fff8eb;">
          <p style="margin: 0 0 6px; color: #7c3d12; font-size: 16px; font-weight: 700; line-height: 22px;">${escapeHtml(eventTitle)}</p>
          <p style="margin: 0; color: #654d3c; font-size: 14px; line-height: 22px;">${escapeHtml(eventDescription)}</p>
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${details}</table>
        ${renderEmailButton(dashboardUrl, "Review security activity")}
        <p style="margin: 0; color: #64777d; font-size: 13px; line-height: 20px;">If you do not recognize this activity, contact your organization administrator.</p>`,
    }),
    text: `${recipientName ? `Hi ${recipientName},` : "Hello,"}

Security alert: ${eventTitle}
${eventDescription}

${textDetails}

Review security activity: ${dashboardUrl}

If you do not recognize this activity, contact your organization administrator.`,
  };
}