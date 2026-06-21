import mongoose, { Schema, Document, Model } from 'mongoose'
import { mailSender } from '../mail-sender'

export interface IOTP extends Document {
  email: string
  otp: string
  createdAt: Date
}

const OTPSchema = new Schema<IOTP>({
  email: {
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
    expires: 300, // 5 minutes
  },
})

async function sendVerificationEmail(email: string, otp: string) {
  try {
    const mailResponse = await mailSender(
      email,
      'FoodHub | Email Verification Code',
      `
      <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #FF385C; text-align: center;">Verify Your Account</h2>
        <p>Dear Customer,</p>
        <p>Thank you for choosing FoodHub. Please use the following One-Time Password (OTP) to complete your signup process:</p>
        <div style="font-size: 32px; font-weight: bold; text-align: center; margin: 30px 0; color: #333; letter-spacing: 5px;">${otp}</div>
        <p>This code is valid for <strong>5 minutes</strong>. If you did not request this verification, please ignore this email.</p>
        <p style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #888;">
          Best regards,<br>
          The FoodHub Team
        </p>
      </div>
      `
    )
    console.log('Email sent successfully:', mailResponse)
  } catch (error) {
    console.error('Error occurred while sending verification email:', error)
    throw error
  }
}

OTPSchema.pre('save', async function () {
  // Only send an email when a new document is created
  if (this.isNew) {
    await sendVerificationEmail(this.email, this.otp)
  }
})

export const OTP: Model<IOTP> = mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema)
