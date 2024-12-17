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
            affiliate_id: parseInt(affiliateId),
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
          //   affiliate_id: ${affiliateId},
          //   name: ${name},
          //   affiliate_since: ${affiliateSince},
          //   payment_type_code: ${paymentTypeCode},
          //   payment_type_description: ${paymentTypeDescription},
          //   transaction_number: ${transactionNumber},
          //   concept_description: ${conceptDescription},
          //   net_amount: ${netAmount},
          //   taxes: ${taxes},
          //   applied_rate: ${appliedRate},
          //   reference_period: ${referencePeriod},
          //   total_amount: ${totalAmount},
          //   paid_amount: ${paidAmount},
          //   category: ${category},
          //   hash_id: ${hashId},
          //   company_CUIT: ${companyCUIT},
          //   paid: ${paid},
          //   }`);

          await AffiliatePaymentModel.create({
            dni: parseInt(dni),
            affiliate_id: parseInt(affiliateId),
            name,
            email: `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
            affiliate_since: affiliateSinceMoment,
            month: new Date().getMonth(),
            year: new Date().getFullYear(),
            payment_type_code: parseInt(paymentTypeCode),
            paymentTypeDescription,
            transaction_number: parseInt(transactionNumber),
            conceptDescription,
            net_amount: parseFloat(netAmount),
            taxes: parseFloat(taxes),
            applied_rate: parseFloat(appliedRate),
            reference_period: parseInt(referencePeriod),
            total_amount: parseFloat(totalAmount),
            paid_amount: parseFloat(paidAmount),
            category,
            hashId,
            companyCUIT,
            paid: paidBool,
            is_banned: false,
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
        const { affiliate_id, email } = affiliate as AffiliateI;

        const payments = await AffiliatePaymentModel.find({
          affiliate_id,
          $or: [
            { month: lastMonthMoment },
            { month: oneMonthsAgo },
            { month: twoMonthsAgo },
          ],
        });

        if (payments.length === 0) {
          console.log(
            `The affiliate with ID ${affiliate_id} Has not paid in the last 3 months. Sending notification...`
          );

          await EmailHelper.sendNotificationEmail(email, twoMonthsAgo, year);

          await AffiliatePaymentModel.updateMany(
            { affiliate_id },
            { $set: { is_banned: true } }
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
