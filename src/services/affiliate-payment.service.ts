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
    let lastProccessedMonth = null;
    let lastProccessedYear = null;

    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.split('\n');

      console.log('procesando pagos...');

      const fields = lines[0]
        .trim()
        .split('|')
        .map((value) => value.trim())
        .filter((value) => value !== '');

      const [, , , paymentDateTime, , , , , , , , , , , ,] = fields;

      const paymentDateTimeMoment = moment(
        paymentDateTime,
        'DD/MM/YYYY HH:mm:ss'
      ).toDate();
      const monthMoment = paymentDateTimeMoment.getMonth() + 1;
      const yearMoment = paymentDateTimeMoment.getFullYear();

      console.log(`fechaArchivo: ${paymentDateTime},
        transformada: ${paymentDateTimeMoment},
        mes: ${monthMoment},
        Anio: ${yearMoment}`);

      console.log(`fecha del archivo: ${monthMoment}-${yearMoment}`);

      const existingFile = await AffiliatePaymentModel.findOne({
        month: monthMoment,
        year: yearMoment,
      });

      console.log('Existing File', existingFile);

      if (existingFile) {
        throw new Error(
          `The payment file of ${monthMoment}-${yearMoment} has already been processed. Please check the file before uploading again`
        );
      }

      lastProccessedMonth = monthMoment;
      lastProccessedYear = yearMoment;

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
            paymentDateTime,
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

          const paymentDateTimeMoment = moment(
            paymentDateTime,
            'DD/MM/YYYY HH:mm:ss'
          ).toDate();
          const monthMoment = paymentDateTimeMoment.getMonth() + 1;
          const yearMoment = paymentDateTimeMoment.getFullYear();

          const paidBool = paid?.toLowerCase() === 'false';

          const existingPayent = await AffiliatePaymentModel.findOne({
            affiliateId: parseInt(affiliateId),
            month: monthMoment,
            year: yearMoment,
          });

          if (existingPayent) {
            console.log(
              `The affiliate with ID ${affiliateId} already has a registered payment on ${monthMoment}/${yearMoment}`
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
            paymentDateTime: paymentDateTimeMoment,
            month: monthMoment,
            year: yearMoment,
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
        lastProccessedMonth!,
        lastProccessedYear!
      );

      return { message: 'file processed successfully.' };
    } catch (error: any) {
      console.error('Error processing the file.', error.message);
      return { message: `Error: ${error.message}` };
    } finally {
      fs.unlinkSync(filePath);
    }
  }

  async checkInactiveAffiliates(month: number, year: number) {
    try {
      const lastMonthMoment = moment(`${year}-${month}-01`, 'YYYY-MM-DD');
      const twoMonthsAgo = lastMonthMoment.clone().subtract(2, 'months');
      const oneMonthsAgo = lastMonthMoment.clone().subtract(1, 'months');

      const affiliates = await AffiliatePaymentModel.distinct('affiliatedId');

      for (const affiliate of affiliates) {
        const { affiliateId, email } = affiliate as AffiliateI;

        const payments = await AffiliatePaymentModel.find({
          affiliateId,
          $or: [
            { year: twoMonthsAgo.format('YYYY'), month: twoMonthsAgo },
            { year: oneMonthsAgo.format('YYYY'), month: oneMonthsAgo },
            { year: lastMonthMoment.format('YYYY'), month: lastMonthMoment },
          ],
        });

        if (payments.length === 0) {
          console.log(
            `The affiliate with ID ${affiliateId} Has not paid in the last 3 months. Sending notification...`
          );

          await EmailHelper.sendNotificationEmail(
            email,
            Number(twoMonthsAgo),
            Number(twoMonthsAgo.format('YYYY'))
          );

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
