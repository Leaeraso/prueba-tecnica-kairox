import mongoose, { Document } from 'mongoose';

export interface AffiliateI extends Document {
  dni: number;
  affiliate_id: number;
  name: string;
  email: string;
  affiliate_since: Date;
}

class AffiliateModel {
  affiliateSchema: mongoose.Schema;
  affiliate: mongoose.Model<AffiliateI>;

  constructor() {
    this.affiliateSchema = new mongoose.Schema(
      {
        dni: { type: Number, required: true },
        affiliate_id: {
          type: Number,
          unique: true,
          required: true,
        },
        name: { type: String, required: true },
        email: { type: String, required: true },
        affiliate_since: { type: Date, required: true },
        is_active: { type: Boolean, required: true, default: false },
      },
      {
        timestamps: true,
        collection: 'affiliates',
      }
    );

    this.affiliate = mongoose.model<AffiliateI>(
      'Affiliate',
      this.affiliateSchema
    );
  }
}

export default new AffiliateModel().affiliate;
