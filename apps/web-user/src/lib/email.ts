export async function sendEmail(to: string, link: string) {
  console.log(`\n[Email Mock] ---------------------------------------`);
  console.log(`[Email Mock] To: ${to}`);
  console.log(`[Email Mock] Login Link: ${link}`);
  console.log(`[Email Mock] ---------------------------------------\n`);
  
  // TODO: Integrate your custom email provider here
  // Example:
  // import { Resend } from 'resend';
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'onboarding@resend.dev',
  //   to,
  //   subject: 'Your Login Link',
  //   html: `<p>Click <a href="${link}">here</a> to login.</p>`
  // });
}
