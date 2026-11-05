
import "server-only";

import { render } from "@react-email/render";

import { getEmailTransporter } from "./email.client";
import { getEmailConfig } from "./email.config";

import {
  EmailDeliveryError,
  type SendEmailOptions,
  type SendEmailResult,
} from "./email.types";

export async function sendEmail(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  const {
    to,
    subject,
    html,
    text,
    react,
    cc,
    bcc,
    replyTo,
  } = options;

  // Validate input
  if (!to || (Array.isArray(to) && to.length === 0)) {
    throw new EmailDeliveryError("Email recipient is required");
  }

  if (!subject?.trim()) {
    throw new EmailDeliveryError("Email subject is required");
  }

  if (!html && !react) {
    throw new EmailDeliveryError(
      "HTML content or a React Email component is required"
    );
  }

  if (html && react) {
    throw new EmailDeliveryError(
      "Provide either HTML content or a React Email component, not both"
    );
  }

  try {
    const config = getEmailConfig();
    const transporter = getEmailTransporter();

    let emailHtml = html;
    let emailText = text;

    // Convert React Email component into HTML.
    if (react) {
      emailHtml = await render(react);

      // Generate plain-text alternative if not provided.
      if (!emailText) {
        emailText = await render(react, {
          plainText: true,
        });
      }
    }

    const result = await transporter.sendMail({
      from: config.from,
      to,
      subject,
      html: emailHtml,
      ...(emailText ? { text: emailText } : {}),
      ...(cc ? { cc } : {}),
      ...(bcc ? { bcc } : {}),
      replyTo: replyTo || config.replyTo,
    });

    return {
      messageId: result.messageId,
      accepted: (result.accepted ?? []).map(String),
      rejected: (result.rejected ?? []).map(String),
    };
  } catch (error) {
    // Keep sensitive SMTP credentials and email content out of logs.
    console.error("[Email Service] Delivery failed");

    if (error instanceof EmailDeliveryError) {
      throw error;
    }

    const code =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "string"
        ? error.code
        : undefined;

    throw new EmailDeliveryError(
      "Unable to send email. Please check the SMTP configuration and provider.",
      code
    );
  }
}
