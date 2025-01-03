import mongoose, { Document } from 'mongoose';

export interface PaymentI extends Document {
  month: number;
  year: number;
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
}

class PaymentModel {
  paymentSchema: mongoose.Schema;
  payment: mongoose.Model<PaymentI>;

  constructor() {
    this.paymentSchema = new mongoose.Schema(
      {
        affiliate_oid: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Affiliate',
          required: true,
        },
        month: { type: Number, required: true },
        year: { type: Number, required: true },
        payment_type_code: { type: Number, required: false },
        payment_type_description: { type: String, required: false },
        transaction_number: { type: Number, required: false },
        concept_description: { type: String, required: false },
        net_amount: { type: Number, required: true },
        taxes: { type: Number, required: true },
        applied_rate: { type: Number, required: true },
        reference_period: { type: Number, required: false },
        total_amount: { type: Number, required: true },
        paid_amount: { type: Number, required: true },
        category: { type: String, required: false },
        hash_id: { type: String, required: false },
        company_CUIT: { type: String, required: false },
        paid: { type: Boolean, default: false, required: true },
      },
      {
        timestamps: true,
        collection: 'payments',
      }
    );

    this.payment = mongoose.model<PaymentI>('Payment', this.paymentSchema);
  }
}

export default new PaymentModel().payment;
