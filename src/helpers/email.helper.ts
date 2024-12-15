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

  async sendNotificationEmail(email: string, month: number, year: number) {
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
}

export default new EmailHelper();
