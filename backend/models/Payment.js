const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
    invoiceId: { type: String, unique: true },
    paymentMethod: { type: String, enum: ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Bank Transfer', 'Net Banking', 'Other', 'N/A'], default: 'N/A' },
    transactionId: { type: String },
    paymentDate: { type: Date },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
