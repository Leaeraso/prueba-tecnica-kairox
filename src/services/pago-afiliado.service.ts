import path from 'path';
import fs from 'fs';
import PagoAfiliadoModel from '../data/models/pago-afiliado.models';
import moment from 'moment';

class PagoService {
  async setPagoAfiliado(
    file: Express.Multer.File
  ): Promise<{ message: string }> {
    const filePath = path.join(__dirname, '../../dist/uploads', file.filename);
    const idsProcesados = new Set();

    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.split('\n');

      console.log('procesando pagos...');

      for (const line of lines) {
        if (line.trim()) {
          const campos = line
            .split('|')
            .map((value) => value.trim())
            .filter((value) => value !== '');

          const [
            dni,
            idAfiliado,
            nombre,
            fechaHoraPago,
            codTipoPago,
            descripcionTipoPago,
            nroTransaccion,
            descripcionConcepto,
            montoNeto,
            impuesto,
            tasaAplicada,
            periodoReferencia,
            montoTotal,
            montoPagado,
            categoria,
            hashId,
            cuitEmpresa,
            enMora,
          ] = campos;

          if (idsProcesados.has(idAfiliado)) {
            console.log(`El afiliado con ID ${idAfiliado} ya fue procesado`);
            continue;
          }

          idsProcesados.add(idAfiliado);

          const fechaHoraPagoDate = moment(
            fechaHoraPago,
            'DD/MM/YY HH:mm:ss'
          ).toDate();

          const enMoraBoolean = enMora.toLowerCase();

          await PagoAfiliadoModel.create({
            dni: parseInt(dni),
            idAfiliado: parseInt(idAfiliado),
            nombre,
            fechaHoraPagoDate,
            mes: new Date().getMonth(),
            annio: new Date().getFullYear(),
            codTipoPago: parseInt(codTipoPago),
            descripcionTipoPago,
            nroTransaccion: parseInt(nroTransaccion),
            descripcionConcepto,
            montoNeto: parseFloat(montoNeto),
            impuesto: parseFloat(impuesto),
            tasaAplicada: parseFloat(tasaAplicada),
            periodoReferencia: parseInt(periodoReferencia),
            montoTotal: parseFloat(montoTotal),
            montoPagado: parseFloat(montoPagado),
            categoria,
            hashId,
            cuitEmpresa,
            enMoraBoolean,
          });

          await PagoAfiliadoModel.updateOne(
            { idAfiliado: parseInt(idAfiliado) },
            { $set: { enMora: true } }
          );
        }
      }

      console.log('Archivo procesado y pagos guardados exitosamente.');
      return { message: 'archivo procesado con exito.' };
    } catch (error) {
      console.error('Error al procesar el archivo: ', error);
      throw new Error('No se ha podido procesar el archivo');
    } finally {
      fs.unlinkSync(filePath);
    }
  }
}

export default new PagoService();
