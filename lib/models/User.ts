import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  password: string;
  accountType: 'Admin' | 'Customer';
  active: boolean;
  approved: boolean;
  token?: string;
  resetPasswordExpires?: Date;
  image?: string;
  outlookId?: string;
  googleId?: string;
  provider?: string;
  favorites: mongoose.Types.ObjectId[];
  orders: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    accountType: { type: String, enum: ['Admin', 'Customer'], default: 'Customer', required: true },
    active: { type: Boolean, default: true },
    approved: { type: Boolean, default: true },
    token: { type: String },
    resetPasswordExpires: { type: Date },
    image: { type: String },
    outlookId: { type: String },
    googleId: { type: String },
    provider: { type: String, default: 'credentials' },
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Food' }],
    orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
  },
  { timestamps: true }
)

// Virtual field for name
UserSchema.virtual('name').get(function(this: IUser) {
  return `${this.firstName} ${this.lastName}`.trim()
})
UserSchema.set('toJSON', { virtuals: true })
UserSchema.set('toObject', { virtuals: true })

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
