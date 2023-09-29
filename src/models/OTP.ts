import mongoose, { Document, Model } from "mongoose";

interface IOtp extends Document {
  phone: string;
  otp: string;
  createdAt: Date;
  expires: Date;
}

const otpSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expires: {
      type: Date,
      default: function () {
        return new Date(new Date().getTime() + 5 * 60 * 1000);
      },
    },
  },
  { timestamps: true }
);

otpSchema.pre('save', async function (next) {
  try {
    const existingOtp = await (this.constructor as Model<IOtp>).findOne({ phone: this.phone });

    if (existingOtp && existingOtp.expires > new Date()) {
      throw new Error('A valid OTP already exists for this phone number.');
    }

    if (existingOtp && existingOtp.expires <= new Date()) {
      await (this.constructor as Model<IOtp>).deleteOne({ phone: this.phone });
    }

    next();
  } catch (error: any) {
    console.error(error);
    next(error);
  }
});

const OTPModel = mongoose.model<IOtp>("OTP", otpSchema);

export default OTPModel;
