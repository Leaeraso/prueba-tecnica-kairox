import mongoose, { Document } from 'mongoose';

export interface AffiliateI extends Document {
  dni: number;
  affiliate_id: number;
  name: string;
  email: string;
  affiliate_since: Date;
  payment_type_code: number;
  payment_type_description: string;
  transaction_number: number;
  concept_description: string;
  net_amount: number;
  taxes: number;
  applied_rate: number;
  reference_period: number;
  total_amount: number;
  paid_amount: number;
  category: string;
  hash_id: string;
  company_CUIT: string;
  paid: boolean;
  is_banned: boolean;
}

class PagoAfiliadoModel {
  affiliatePaymentSchema: mongoose.Schema;
  affiliate: mongoose.Model<AffiliateI>;

  constructor() {
    this.affiliatePaymentSchema = new mongoose.Schema(
      {
        dni: { type: Number, unique: false, required: true },
        affiliate_id: { type: Number, unique: false, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        affiliate_since: { type: Date, required: true },
        month: { type: String, required: true },
        year: { type: String, required: true },
        payment_type_code: { type: Number, required: true },
        payment_type_description: { type: String, required: true },
        transaction_number: { type: Number, required: true },
        concept_description: { type: String, required: true },
        net_amount: { type: Number, required: true },
        taxes: { type: Number, required: true },
        applied_rate: { type: Number, required: true },
        reference_period: { type: Number, required: true },
        total_amount: { type: Number, required: true },
        paid_amount: { type: Number, required: true },
        category: { type: String, required: true },
        hash_id: { type: String, required: true },
        company_CUIT: { type: String, required: true },
        paid: { type: Boolean, default: false, required: true },
        is_banned: { type: Boolean, default: false, required: true },
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
