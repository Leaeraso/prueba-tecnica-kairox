import path from 'path';
import fs from 'fs';
import AffiliatePaymentModel from '../data/models/affiliate-payment.models';
import moment from 'moment';

class PaymentService {
  async setAffiliatePayment(
    file: Express.Multer.File
  ): Promise<{ message: string }> {
    const filePath = path.join(__dirname, '../../dist/uploads', file.filename);

    try {
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
            paymentDateTime,
            paymentTypeCode,
            paymentTypeDescription,
            transactionNumber,
            conceptDescription,
            netAmount,
            taxes,
            appliedRate,
            ReferencePeriod,
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
          );
          const month = paymentDateTimeMoment.format('MM');
          const year = paymentDateTimeMoment.format('YYYY');
          paymentDateTimeMoment.toDate();

          const paidBool = !paid?.toLowerCase();

          const existingPayent = await AffiliatePaymentModel.findOne({
            affiliateId: parseInt(affiliateId),
            mes: month,
            annio: year,
          });

          if (existingPayent) {
            console.log(
              `The affiliate with ID ${affiliateId} already has a registered payment on ${month}/${year}`
            );
            continue;
          }

          await AffiliatePaymentModel.create({
            dni: parseInt(dni),
            affiliateId: parseInt(affiliateId),
            name,
            paymentDateTime: paymentDateTimeMoment,
            mes: month,
            annio: year,
            paymentTypeCode: parseInt(paymentTypeCode),
            paymentTypeDescription,
            transactionNumber: parseInt(transactionNumber),
            conceptDescription,
            netAmount: parseFloat(netAmount),
            taxes: parseFloat(taxes),
            appliedRate: parseFloat(appliedRate),
            ReferencePeriod: parseInt(ReferencePeriod),
            totalAmount: parseFloat(totalAmount),
            paidAmount: parseFloat(paidAmount),
            category,
            hashId,
            companyCUIT,
            paid: paidBool,
          });
        }
      }

      console.log('Archivo procesado y pagos guardados exitosamente.');
      return { message: 'file proccessed successfully.' };
    } catch (error) {
      console.error('Error al procesar el archivo: ', error);
      throw new Error('No se ha podido procesar el archivo');
    } finally {
      fs.unlinkSync(filePath);
    }
  }
}

export default new PaymentService();
