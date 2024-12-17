import path from 'path';
import fs from 'fs';
import AffiliateModel from '../data/models/affiliate.models';
import PaymentModel from '../data/models/payment.models';
import moment from 'moment';
import EmailHelper from '../helpers/email.helper';
import dotenv from 'dotenv';

dotenv.config();

const { UNION_EMAIL } = process.env;

class PaymentService {
  async setAffiliatePayment(
    file: Express.Multer.File
  ): Promise<{ message: string }> {
    // const uploadsDir = path.join(__dirname, '../../dist/uploads');
    const filePath = path.join(__dirname, '../../dist/uploads', file.filename);
    const affiliateIds = new Set<number>();

    try {
      // if (!fs.existsSync(uploadsDir)) {
      //   fs.mkdirSync(uploadsDir, { recursive: true }); // Crea la carpeta si no existe
      // }

      // if (fs.existsSync(filePath)) {
      //   console.log(
      //     `El archivo ${file.filename} ya fue cargado con anterioridad`
      //   );
      //   return {
      //     message:
      //       'El archivo que se intenta cargar ya fue cargado anteriormente',
      //   };
      // }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.split('\n');

      console.log('procesando pagos...');

      const monthMoment = moment().month() + 1;
      const yearMoment = moment().year();

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

          if (affiliateIds.has(parseInt(affiliateId))) {
            console.log(
              `The affiliate with ID ${affiliateId} has been already processed.}`
            );
            continue;
          }

          let affiliate = await AffiliateModel.findOne({
            affiliate_id: parseInt(affiliateId),
          });

          if (!affiliate) {
            affiliate = await AffiliateModel.create({
              affiliate_id: parseInt(affiliateId),
              dni: parseInt(dni),
              name: name,
              email: `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
              affiliate_since: affiliateSinceMoment,
              is_active: true,
            });
          } else {
            console.log(
              `The affiliate with ID ${affiliate.affiliate_id} already exists.`
            );
          }

          await PaymentModel.create({
            affiliate_oid: affiliate._id,
            month: monthMoment,
            year: yearMoment,
            payment_type_code: parseInt(paymentTypeCode),
            payment_type_description: paymentTypeDescription,
            transaction_number: parseInt(transactionNumber),
            concept_description: conceptDescription,
            net_amount: parseFloat(netAmount),
            taxes: parseFloat(taxes),
            applied_rate: parseFloat(appliedRate),
            reference_period: parseInt(referencePeriod),
            total_amount: parseFloat(totalAmount),
            paid_amount: parseFloat(paidAmount),
            category: category,
            hash_id: hashId,
            company_CUIT: companyCUIT,
            paid: paidBool,
          });

          affiliateIds.add(parseInt(affiliateId));
        }
      }

      console.log('Archivo procesado y pagos guardados exitosamente.');

      await this.checkInactiveAffiliates(monthMoment, yearMoment, UNION_EMAIL!);

      return { message: 'file processed successfully.' };
    } catch (error: any) {
      console.error('Error processing the file.', error.message);
      return { message: `Error: ${error.message}` };
    }
  }

  async checkInactiveAffiliates(
    month: number,
    year: number,
    unionEmail: string
  ) {
    try {
      const lastMonth = month;
      const oneMonthAgo = month - 1;
      const twoMonthsAgo = month - 2;

      const affiliates = await AffiliateModel.find({ is_active: true });

      const inactiveAffiliates = [];

      for (const affiliate of affiliates) {
        const payments = await PaymentModel.find({
          affiliate_oid: affiliate._id,
          $or: [
            { month: lastMonth },
            { month: oneMonthAgo },
            { month: twoMonthsAgo },
          ],
        });

        if (payments.length === 0) {
          console.log(
            `The affiliate with the ID ${affiliate.affiliate_id} has 3 months withouot payments. Proceed to desactivated`
          );

          inactiveAffiliates.push(affiliate.name);
        }

        await EmailHelper.sendNotificationEmailToAffiliate(
          affiliate.email,
          twoMonthsAgo,
          year
        );

        await EmailHelper.sendNotificationEmailToUnion(
          unionEmail,
          inactiveAffiliates
        );

        await AffiliateModel.updateOne(
          { affiliate_id: affiliate.affiliate_id },
          { is_active: false }
        );
      }
    } catch (error) {
      console.error(error);
      throw new Error('There has been an error during the payment check.');
    }
  }
}

export default new PaymentService();
