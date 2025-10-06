import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.EMAIL_FROM!;

type Attachment = { filename: string; contentType: string; content: string };

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  attachments?: Attachment[];
}) {
    const {to, subject, attachments, html} = params;
    await resend.emails.send({
        from: FROM,
        to,
        subject,
        html,
        attachments: attachments?.map(a => ({
            filename: a.filename,
            content: a.content,
            contentType: a.contentType
        }))
    })
}
