
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
  replyTo?: string;
  appName: string;
  appUrl: string;
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getEmailConfig(): EmailConfig {
  const portValue = process.env.SMTP_PORT || "587";
  const port = Number(portValue);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error("SMTP_PORT must be a valid port number");
  }

  const secureValue = process.env.SMTP_SECURE;

  const secure =
    secureValue !== undefined
      ? secureValue.toLowerCase() === "true"
      : port === 465;

  return {
    host: requiredEnv("SMTP_HOST"),
    port,
    secure,
    user: requiredEnv("SMTP_USER"),
    password: requiredEnv("SMTP_PASSWORD"),
    from: requiredEnv("EMAIL_FROM"),
    replyTo: process.env.EMAIL_REPLY_TO?.trim() || undefined,
    appName: process.env.APP_NAME || "SecureGateControl",
    appUrl: process.env.APP_URL || "http://localhost:3000",
  };
}
