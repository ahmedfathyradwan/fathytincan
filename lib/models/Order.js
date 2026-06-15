import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    quantity:    { type: Number, required: true },
    sizeValue:   { type: Number, required: true },
    sizeLabel:   { type: String, required: true },
    canName:     { type: String, required: true },
    status:      { type: String, required: true, default: 'غير متاح' },
    createdAt:   { type: String, required: true },
  },
  {
    // Don't add mongoose's default __v field in responses
    versionKey: false,
  }
);

// Prevent model recompilation in Next.js dev hot-reload
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

export default Order;
