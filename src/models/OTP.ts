import mongoose, { Document, Model } from 'mongoose';

interface IOtp extends Document {
  phone: string;
  otp: string;
  createdAt: Date;
}

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

otpSchema.pre('save', async function (next) {
  try {
    const existingOtp = await (this.constructor as Model<IOtp>).findOne({ phone: this.phone });
    if (existingOtp) {
      await (this.constructor as Model<IOtp>).deleteOne({ phone: this.phone });
    }
    next();
  } catch (error: any) {
    console.error(error)
  }
});

const OTPModel = mongoose.model<IOtp>('OTP', otpSchema);

export default OTPModel;
