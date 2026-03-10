import sgMail from '@sendgrid/mail'

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL ?? process.env.FROM_EMAIL ?? 'hello@layerup.email'
const FROM_NAME = 'LayerUp'

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

const isSandbox = process.env.NODE_ENV !== 'production'

interface SendDailyOptions {
  to: string
  subject: string
  html: string
  subscriberId: string
  dateFor: string
}

/**
 * Send the daily weather email. Returns the SendGrid message ID if available.
 */
export async function sendDailyEmail(opts: SendDailyOptions): Promise<string | null> {
  const msg: sgMail.MailDataRequired = {
    to: opts.to,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: opts.subject,
    html: opts.html,
    customArgs: {
      subscriber_id: opts.subscriberId,
      date_for: opts.dateFor,
    },
    trackingSettings: {
      clickTracking: { enable: true, enableText: false },
      openTracking: { enable: true },
    },
    mailSettings: {
      sandboxMode: { enable: isSandbox },
    },
  }

  const [response] = await sgMail.send(msg)
  const msgId = response.headers['x-message-id'] as string | undefined
  return msgId ?? null
}

interface SendConfirmOptions {
  to: string
  name?: string | null
  html: string
}

/**
 * Send the double opt-in confirmation email.
 */
export async function sendConfirmEmail(opts: SendConfirmOptions): Promise<void> {
  const msg: sgMail.MailDataRequired = {
    to: opts.to,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: 'Confirm your LayerUp subscription',
    html: opts.html,
    mailSettings: {
      sandboxMode: { enable: isSandbox },
    },
  }

  await sgMail.send(msg)
}
