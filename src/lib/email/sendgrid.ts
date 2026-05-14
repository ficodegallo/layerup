type SendGridEmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
  customArgs?: Record<string, string>;
};

type SendGridSendResult = {
  statusCode: number;
  messageId: string | null;
};

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

export async function sendEmailWithSendGrid(
  payload: SendGridEmailPayload,
): Promise<SendGridSendResult> {
  const apiKey = getRequiredEnv("SENDGRID_API_KEY");
  const fromEmail = getRequiredEnv("SENDGRID_FROM_EMAIL");
  const fromName = process.env.SENDGRID_FROM_NAME?.trim() || "Layer Up";
  const replyToEmail = process.env.SENDGRID_REPLY_TO_EMAIL?.trim();

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: payload.to }],
          custom_args: payload.customArgs,
        },
      ],
      from: {
        email: fromEmail,
        name: fromName,
      },
      ...(replyToEmail
        ? {
            reply_to: {
              email: replyToEmail,
            },
          }
        : undefined),
      subject: payload.subject,
      content: [
        {
          type: "text/plain",
          value: payload.text,
        },
        {
          type: "text/html",
          value: payload.html,
        },
      ],
    }),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    const detail = responseBody ? ` ${responseBody}` : "";

    throw new Error(
      `SendGrid send failed with status ${response.status}.${detail}`.trim(),
    );
  }

  return {
    statusCode: response.status,
    messageId: response.headers.get("x-message-id"),
  };
}
