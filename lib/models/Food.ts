import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IReview {
  userId: mongoose.Types.ObjectId;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface IFood extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  reviews: IReview[];
  inStock: boolean;
  preparationTime: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
})

const FoodSchema = new Schema<IFood>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  rating: { type: Number, default: 0 },
  reviews: [ReviewSchema],
  inStock: { type: Boolean, default: true },
  preparationTime: { type: Number, required: true }
}, { timestamps: true })

export const Food: Model<IFood> = mongoose.models.Food || mongoose.model<IFood>('Food', FoodSchema)
