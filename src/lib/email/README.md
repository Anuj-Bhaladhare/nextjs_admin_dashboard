For your Next.js project, I recommend creating a centralized Email Service Architecture.

The idea is that you should configure email sending only once and create reusable email templates. Then any API in your application can send emails without repeating SMTP configuration or writing HTML every time.

For example, you should be able to send emails from:

- Forgot Password
- User Registration
- Email Verification
- Organization Invitations
- Account Activation
- Password Changed Notification
- Admin Notifications
- Security Alerts

Let's design the directory structure first.

# 1. Recommended directory structure

Inside your `src` directory:

src/

&#x20;lib/

Shared infrastructure

&#x20;email/

&#x20;`email.config.ts`

SMTP configuration and environment variables

&#x20;`email.client.ts`

Reusable Nodemailer transporter

&#x20;`email.service.ts`

Central sendEmail() function

&#x20;`email.types.ts`

TypeScript types for email messages

&#x20;templates/

&#x20;layouts/

&#x20;`base-layout.ts`

&#x20;auth/

`forgot-password.template.ts`

`reset-password-success.template.ts`

`email-verification.template.ts`

&#x20;organization/

`invitation.template.ts`

`organization-created.template.ts`

&#x20;notifications/

`security-alert.template.ts`

&#x20;app/

&#x20;api/auth/

`forgot-password/route.ts`

`reset-password/route.ts`

This is a recommended structure; you can keep your existing `app` and API directories unchanged.

# 2. Responsibilities of each file

| File               | Responsibility                              |
| ------------------ | ------------------------------------------- |
| `email.config.ts`  | Read SMTP host, port, username and password |
| `email.client.ts`  | Create and reuse the Nodemailer transporter |
| `email.service.ts` | Provide the global email sending function   |
| `email.types.ts`   | Define email input types                    |
| `base-layout.ts`   | Common HTML email layout and branding       |
| `*.template.ts`    | Generate individual email content           |

The most important separation is:

- Email service: How an email is sent.
- Email template: What the email looks like and says.
- API route: When and why the email should be sent.

# 3. How the global email system works

Here is the architecture I recommend:

Application API routes

Forgot Password · Registration · Invitation · Security Alert

Email Templates

HTML content + dynamic data + common layout

Global Email Service

sendEmail({ to, subject, html })

Nodemailer Transporter

SMTP connection and message delivery

Email Provider / Recipient Inbox

For example, your forgot-password API should not know anything about SMTP configuration. It simply calls the email service with a generated template.

# 4. Environment configuration

Your `.env.local` should contain the common configuration:

```
# Application
APP_NAME=SecureGateControl
APP_URL=http://localhost:3000

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-google-app-password
SMTP_FROM="SecureGateControl <your-email@gmail.com>"
```

For Gmail, use a Google App Password when your account supports it. Do not use your normal Gmail password.

# 5. How other modules will use this system

For example, suppose you want to send a password reset email.

Your API route will do something conceptually like this:

```
import { sendEmail } from "@/lib/email/email.service";

import { forgotPasswordTemplate } from "@/lib/email/templates/auth/forgot-password.template";

const emailContent = forgotPasswordTemplate({
    name: "Anuj",
    resetUrl: "https://example.com/reset-password?token=...",
});

await sendEmail({
    to: "user@example.com",
    subject: "Reset Your Password",
    html: emailContent,
});
```

The same service can be reused for organization invitations:

```
await sendEmail({
    to: "admin@example.com",
    subject: "Organization Invitation",
    html: invitationTemplate({
        name: "Admin",
        invitationUrl: "https://example.com/invitation/...",
    }),
});
```

Notice that both use the same `sendEmail()` function. Only the template and email data change.

# 6. My recommendations for production

For your application, I recommend these design decisions:

| Area               | Recommendation                            |
| ------------------ | ----------------------------------------- |
| Email library      | Nodemailer                                |
| SMTP configuration | Centralized environment variables         |
| Transporter        | One reusable transporter                  |
| Templates          | Separate TypeScript template files        |
| Common layout      | One reusable branded layout               |
| Email design       | Responsive HTML with plain-text fallback  |
| Error handling     | Centralized error handling and logging    |
| Security           | Never expose SMTP credentials to frontend |
| Future scaling     | Add a background email queue when needed  |

One additional recommendation: eventually add a `notifications` or `email_logs` module to record delivery attempts, provider responses and failures. Do not log passwords, reset tokens or other sensitive email contents.

# 7. Implementation order

I suggest building the email system in this order:

1. Email configuration

   `email.config.ts`
2. Email client

   `email.client.ts`
3. Global email service

   `email.service.ts`
4. Common email layout

   `base-layout.ts`
5. Email templates

   Start with forgot password and email verification.
6. Test email delivery

   Send a test email before integrating authentication APIs.
7. Integrate forgot-password API

   Connect the template and email service to PostgreSQL token generation.

My suggestion: First complete the global email infrastructure independently. Then every future module can reuse it without duplicating code.

Next, we can implement the first four files (`email.config.ts`, `email.client.ts`, `email.types.ts`, and `email.service.ts`) with complete TypeScript code, following this directory structure.
