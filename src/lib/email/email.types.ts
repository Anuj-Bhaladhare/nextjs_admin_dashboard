
import type { ReactElement } from "react";

export type EmailRecipient = string | string[];

export interface SendEmailOptions {
  to: EmailRecipient;
  subject: string;

  // Existing HTML template support
  html?: string;

  // Optional plain-text email
  text?: string;

  // React Email component support
  react?: ReactElement;

  cc?: EmailRecipient;
  bcc?: EmailRecipient;

  replyTo?: string | string[];
}

export interface SendEmailResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
}

export class EmailDeliveryError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);

    this.name = "EmailDeliveryError";

    Object.setPrototypeOf(this, EmailDeliveryError.prototype);
  }
}
