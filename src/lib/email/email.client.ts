
import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

import { getEmailConfig } from "./email.config";

let transporter: Transporter | null = null;

export function getEmailTransporter(): Transporter {
  if (transporter) {
    return transporter;
  }

  const config = getEmailConfig();

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,

    auth: {
      user: config.user,
      pass: config.password,
    },

    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 30_000,

    pool: true,
    maxConnections: 3,
    maxMessages: 100,

    tls: {
      minVersion: "TLSv1.2",
    },
  });

  return transporter;
}

/**
 * Check SMTP connection and authentication.
 * Useful for testing or application health checks.
 */
export async function verifyEmailConnection(): Promise<boolean> {
  const mailer = getEmailTransporter();

  await mailer.verify();

  return true;
}
