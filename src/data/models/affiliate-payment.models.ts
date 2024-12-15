import mongoose, { Document } from 'mongoose';

export interface AffiliateI extends Document {
  dni: number;
  affiliateId: number;
  name: string;
  email: string;
  paymentDateTime: Date;
  paymentTypeCode: number;
  paymentTypeDescription: string;
  transactionNumber: number;
  conceptDescription: string;
  netAmount: number;
  taxes: number;
  appliedRate: number;
  referencePeriod: number;
  totalAmount: number;
  paidAmount: number;
  category: string;
  hashId: string;
  companyCUIT: string;
  paid: boolean;
  isBanned: boolean;
}

class PagoAfiliadoModel {
  affiliatePaymentSchema: mongoose.Schema;
  affiliate: mongoose.Model<AffiliateI>;

  constructor() {
    this.affiliatePaymentSchema = new mongoose.Schema(
      {
        dni: { type: Number, unique: false, required: true },
        affiliateId: { type: Number, unique: false, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        paymentDateTime: { type: Date, required: true },
        month: { type: String, required: true },
        year: { type: String, required: true },
        paymentTypeCode: { type: Number, required: true },
        paymentTypeDescription: { type: String, required: true },
        transactionNumber: { type: Number, required: true },
        conceptDescription: { type: String, required: true },
        netAmount: { type: Number, required: true },
        taxes: { type: Number, required: true },
        appliedRate: { type: Number, required: true },
        referencePeriod: { type: Number, required: true },
        totalAmount: { type: Number, required: true },
        paidAmount: { type: Number, required: true },
        category: { type: String, required: true },
        hashId: { type: String, required: true },
        companyCUIT: { type: String, required: true },
        paid: { type: Boolean, default: false, required: true },
        isBanned: { type: Boolean, default: false, required: true },
      },
      {
        timestamps: true,
        collection: 'kairox',
      }
    );

    this.affiliate = mongoose.model<AffiliateI>(
      'affiliate_payment',
      this.affiliatePaymentSchema
    );
  }
}
export default new PagoAfiliadoModel().affiliate;
