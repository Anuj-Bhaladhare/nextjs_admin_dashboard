export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface BaseLayoutOptions {
  preheader: string;
  content: string;
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

function getSafeHref(value: string): string {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new TypeError("Email action links must be absolute HTTP or HTTPS URLs.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new TypeError("Email action links must use HTTP or HTTPS.");
  }

  return escapeHtml(url.toString());
}

export function renderEmailButton(href: string, label: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0;">
    <tr>
      <td align="center" bgcolor="#123b47" style="border-radius: 8px;">
        <a href="${getSafeHref(href)}" style="display: inline-block; padding: 14px 24px; color: #ffffff; font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: 700; line-height: 20px; text-decoration: none;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

export function renderBaseLayout({
  preheader,
  content,
}: BaseLayoutOptions): string {
  const year = new Date().getFullYear();

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>Smart Gate Monitoring</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f3f6f7; color: #172b32; font-family: Arial, Helvetica, sans-serif;">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f6f7;">
      <tr>
        <td align="center" style="padding: 36px 16px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 600px;">
            <tr>
              <td style="padding: 0 0 18px; color: #123b47; font-size: 18px; font-weight: 700; letter-spacing: 0.2px;">
                <span style="display: inline-block; width: 10px; height: 10px; margin-right: 8px; border-radius: 3px; background-color: #1c8998; vertical-align: 1px;"></span>Smart Gate Monitoring
              </td>
            </tr>
            <tr>
              <td style="padding: 32px; border: 1px solid #e1e8ea; border-radius: 12px; background-color: #ffffff;">
                ${content}
              </td>
            </tr>
            <tr>
              <td style="padding: 22px 8px 0; color: #64777d; font-size: 12px; line-height: 18px; text-align: center;">
                This is an automated message from Smart Gate Monitoring. Please do not reply to this email.<br>
                &copy; ${year} Smart Gate Monitoring
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
