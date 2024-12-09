import mongoose, { Document } from 'mongoose';

interface IAfiliado extends Document {
  dni: number;
  idAfiliado: number;
  nombre: string;
  fechaHoraPago: string;
  codTipoPago: number;
  descripcionTipoPago: string;
  nroTransaccion: number;
  descripcionConcepto: string;
  montoNeto: number;
  impuesto: number;
  tasaAplicada: number;
  periodoReferencia: number;
  montoTotal: number;
  montoPagado: number;
  categoria: string;
  hashId: string;
  cuitEmpresa: number;
  enMora: boolean;
}

class PagoAfiliadoModel {
  pagoAfiliadoSchema: mongoose.Schema;
  afiliado: mongoose.Model<IAfiliado>;

  constructor() {
    this.pagoAfiliadoSchema = new mongoose.Schema(
      {
        dni: { type: Number, unique: true, required: true },
        idAfiliado: { type: Number, required: true },
        nombre: { type: String, required: true },
        fechaHoraPago: { type: Date, default: Date.now, required: true },
        mes: { type: Number, required: true },
        annio: { type: Number, required: true },
        codTipoPago: { type: Number, required: true },
        descripcionTipoPago: { type: String, required: true },
        nroTransaccion: { type: Number, required: true },
        descripcionConcepto: { type: String, required: true },
        montoNeto: { type: Number, required: true },
        impuesto: { type: Number, required: true },
        tasaAplicada: { type: Number, required: true },
        periodoReferencia: { type: Number, required: true },
        montoTotal: { type: Number, required: true },
        montoPagado: { type: Number, required: true },
        categoria: { type: String, required: true },
        hashId: { type: String, required: true },
        cuitEmpresa: { type: String, required: true },
        enMora: { type: Boolean, default: false, required: true },
      },
      {
        timestamps: true,
        collection: 'kairox',
      }
    );

    this.afiliado = mongoose.model<IAfiliado>(
      'pago_afiliado',
      this.pagoAfiliadoSchema
    );
  }
}
export default new PagoAfiliadoModel().afiliado;
