import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const { EMAIL_USER, EMAIL_PASS } = process.env;

class EmailHelper {
  transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });
  }

  async sendNotificationEmailToAffiliate(
    email: string,
    month: number,
    year: number
  ) {
    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: 'Is not up to date notification',
      html: `
            <h1>Banned account notification</h1>
            <p>Dear affiliate, we regret to inform to you that your account has been desactivated, because you didn't pay your quote since ${month}/${year}.</p>
        `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendNotificationEmailToUnion(email: string, affiliates: string[]) {
    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: 'Is not up to date notification',
      html: `
            <h1>Banned account notification</h1>
            <p>
              The following affiliates has been desactivated, because they haven't paid in the last 3 months:
              <ul>
              ${affiliates
                .map((affiliate) => {
                  return `<li>${affiliate}</li>`;
                })
                .join('')}
              </ul>
            </p>
        `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

export default new EmailHelper();
