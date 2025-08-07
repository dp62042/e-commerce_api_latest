import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Card', 'COD', 'Wallet', 'NetBanking'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: { type: String },
    amount: { type: Number, required: true, min: 0 },
    paymentDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

const Payment = mongoose.model('Payment', paymentSchema)
export default Payment
