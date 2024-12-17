import path from 'path';
import fs from 'fs';
import AffiliatePaymentModel, {
  AffiliateI,
} from '../data/models/affiliate-payment.models';
import moment from 'moment';
import EmailHelper from '../helpers/email.helper';

class PaymentService {
  async setAffiliatePayment(
    file: Express.Multer.File
  ): Promise<{ message: string }> {
    const filePath = path.join(__dirname, '../../dist/uploads', file.filename);

    try {
      if (fs.existsSync(filePath)) {
        console.log(
          `El archivo ${file.filename} ya fue cargado con anterioridad`
        );
        return {
          message:
            'El archivo que se intenta cargar ya fue cargado anteriormente',
        };
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.split('\n');

      console.log('procesando pagos...');

      for (const line of lines) {
        if (line.trim()) {
          const fields = line
            .split('|')
            .map((value) => value.trim())
            .filter((value) => value !== '');

          const [
            dni,
            affiliateId,
            name,
            affiliateSince,
            paymentTypeCode,
            paymentTypeDescription,
            transactionNumber,
            conceptDescription,
            netAmount,
            taxes,
            appliedRate,
            referencePeriod,
            totalAmount,
            paidAmount,
            category,
            hashId,
            companyCUIT,
            paid,
          ] = fields;

          const affiliateSinceMoment = moment(
            affiliateSince,
            'DD/MM/YYYY HH:mm:ss'
          ).toDate();

          const paidBool = paid?.toLowerCase() === 'false';

          const existingPayent = await AffiliatePaymentModel.findOne({
            affiliateId: parseInt(affiliateId),
            month: new Date().getMonth(),
            year: new Date().getFullYear(),
          });

          if (existingPayent) {
            console.log(
              `The affiliate with ID ${affiliateId} already has a registered payment on ${new Date().getMonth()}/${new Date().getFullYear()}`
            );
            continue;
          }

          // console.log(`Affiliate: {
          //   dni: ${dni},
          //   affiliateId: ${affiliateId},
          //   name: ${name},
          //   paymentDateTime: ${paymentDateTime},
          //   paymentTypeCode: ${paymentTypeCode},
          //   paymentTypeDescription: ${paymentTypeDescription},
          //   transactionNumber: ${transactionNumber},
          //   conceptDescription: ${conceptDescription},
          //   netAmount: ${netAmount},
          //   taxes: ${taxes},
          //   appliedRate: ${appliedRate},
          //   referencePeriod: ${referencePeriod},
          //   totalAmount: ${totalAmount},
          //   paidAmount: ${paidAmount},
          //   category: ${category},
          //   hashId: ${hashId},
          //   companyCUIT: ${companyCUIT},
          //   paid: ${paid},
          //   }`);

          await AffiliatePaymentModel.create({
            dni: parseInt(dni),
            affiliateId: parseInt(affiliateId),
            name,
            email: `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
            affiliateSince: affiliateSinceMoment,
            month: new Date().getMonth(),
            year: new Date().getFullYear(),
            paymentTypeCode: parseInt(paymentTypeCode),
            paymentTypeDescription,
            transactionNumber: parseInt(transactionNumber),
            conceptDescription,
            netAmount: parseFloat(netAmount),
            taxes: parseFloat(taxes),
            appliedRate: parseFloat(appliedRate),
            referencePeriod: parseInt(referencePeriod),
            totalAmount: parseFloat(totalAmount),
            paidAmount: parseFloat(paidAmount),
            category,
            hashId,
            companyCUIT,
            paid: paidBool,
            isBanned: false,
          });
        }
      }

      console.log('Archivo procesado y pagos guardados exitosamente.');

      await this.checkInactiveAffiliates(
        new Date().getMonth(),
        new Date().getFullYear()
      );

      return { message: 'file processed successfully.' };
    } catch (error: any) {
      console.error('Error processing the file.', error.message);
      return { message: `Error: ${error.message}` };
    }
  }

  async checkInactiveAffiliates(month: number, year: number) {
    try {
      const lastMonthMoment = month;
      const twoMonthsAgo = month - 2;
      const oneMonthsAgo = month - 1;

      const affiliates = await AffiliatePaymentModel.distinct('affiliatedId');

      for (const affiliate of affiliates) {
        const { affiliateId, email } = affiliate as AffiliateI;

        const payments = await AffiliatePaymentModel.find({
          affiliateId,
          $or: [
            { month: lastMonthMoment },
            { month: oneMonthsAgo },
            { month: twoMonthsAgo },
          ],
        });

        if (payments.length === 0) {
          console.log(
            `The affiliate with ID ${affiliateId} Has not paid in the last 3 months. Sending notification...`
          );

          await EmailHelper.sendNotificationEmail(email, twoMonthsAgo, year);

          await AffiliatePaymentModel.updateMany(
            { affiliateId },
            { $set: { isBanned: true } }
          );
        }
      }
    } catch (error) {
      console.error(error);
      throw new Error('There has been an error during the payment check.');
    }
  }
}

export default new PaymentService();
