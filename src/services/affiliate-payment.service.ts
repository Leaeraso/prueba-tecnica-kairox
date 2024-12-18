import path from 'path';
import fs from 'fs';
import AffiliateModel from '../data/models/affiliate.models';
import PaymentModel from '../data/models/payment.models';
import moment from 'moment';
import EmailHelper from '../helpers/email.helper';
import dotenv from 'dotenv';
import inactiveAffiliateDTO from '../data/dto/inactive-affiliate.dto';

dotenv.config();

const { UNION_EMAIL } = process.env;

class PaymentService {
  async setAffiliatePayment(
    file: Express.Multer.File
  ): Promise<{ message: string }> {
    const uploadsDir = path.join(__dirname, '../../dist/uploads');
    const filePath = path.join(__dirname, '../../dist/uploads', file.filename);
    const affiliateIds = new Set<number>();

    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true }); // Crea la carpeta si no existe
      }

      if (fs.existsSync(filePath)) {
        console.log(`The file ${file.filename} has already been uploads`);
        return {
          message: 'The file has arleady been upload',
        };
      }

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

          console.log('buscando/creando afiliado...');
          if (!affiliate) {
            affiliate = await AffiliateModel.create({
              affiliate_id: parseInt(affiliateId),
              dni: parseInt(dni),
              name: name,
              email: `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
              affiliate_since: affiliateSinceMoment,
              is_active: true,
            });
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

      const affiliates = await AffiliateModel.find({ is_active: true });

      const missingAffiliates = affiliates.filter(
        (affiliate) => !affiliateIds.has(affiliate.affiliate_id)
      );

      console.log('missing Affiliates: ', missingAffiliates);

      for (const missingAffiliate of missingAffiliates) {
        await PaymentModel.create({
          affiliate_oid: missingAffiliate._id,
          month: monthMoment,
          year: yearMoment,
          payment_type_code: null,
          payment_type_description: '',
          transaction_number: null,
          concept_description: '',
          net_amount: 0,
          taxes: 0,
          applied_rate: 0,
          reference_period: null,
          total_amount: 0,
          paid_amount: 0,
          category: '',
          hash_id: null,
          company_CUIT: null,
          paid: false,
        });
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
      const oneMonthAgo = month - 1 > 0 ? month - 1 : 12;
      const twoMonthsAgo = month - 2 > 0 ? month - 2 : 12;
      const lastMonthYear = month === 1 ? year - 1 : year;
      const oneMonthAgoYear = month - 1 <= 0 ? year - 1 : year;
      const twoMonthsAgoYear = month - 2 <= 0 ? year - 1 : year;

      const affiliates = await AffiliateModel.find({ is_active: true });

      const inactiveAffiliates = [];

      for (const affiliate of affiliates) {
        const isNewAffiliate = moment(affiliate.created_at).isAfter(
          moment().subtract(3, 'months')
        );

        if (isNewAffiliate) {
          // console.log(
          //   `Skipping the affiliate with ID ${affiliate.affiliate_id} cause they are new`
          // );
          continue;
        }

        const payments = await PaymentModel.find({
          affiliate_oid: affiliate._id,
          $or: [
            { month: lastMonth, year: lastMonthYear },
            { month: oneMonthAgo, year: oneMonthAgoYear },
            { month: twoMonthsAgo, year: twoMonthsAgoYear },
          ],
        });

        const hasPaid = payments.some((payment) => payment.paid === true);

        if (!hasPaid) {
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

  async getAffiliatePaymentsByAffiliateId(affiliateId: number) {
    try {
      const affiliate = await AffiliateModel.findOne({
        affiliate_id: affiliateId,
      });

      if (!affiliate) {
        throw new Error('Affiliate not found');
      }

      const payments = await PaymentModel.find({
        affiliate_oid: affiliate._id,
      }).exec();

      if (!payments || payments.length === 0) {
        throw new Error('No payments found for affiliate');
      }

      return payments;
    } catch (error: any) {
      console.error(`Error obtaining the affiliate's payments`);
      return { message: `Error: ${error.message}` };
    }
  }

  async getInactiveAffiliates() {
    try {
      const affiliates = await AffiliateModel.find({ is_active: false });

      const result: inactiveAffiliateDTO[] = [];

      for (const affiliate of affiliates) {
        const payments = await PaymentModel.find(
          { affiliate_oid: affiliate._id, paid: false },
          { month: 1, year: 1 }
        ).lean();

        if (!payments || payments.length === 0) {
          throw new Error('Payments not found for affiliate');
        }
        if (payments.length > 0) {
          payments.forEach((payment) => {
            result.push({
              affiliate_id: affiliate.affiliate_id,
              name: affiliate.name,
              month: payment.month,
              year: payment.year,
            });
          });
        }
      }

      return result;
    } catch (error: any) {
      console.error(`Error obtaining the affiliate's payments`);
      return { message: `Error: ${error.message}` };
    }
  }
}

export default new PaymentService();
