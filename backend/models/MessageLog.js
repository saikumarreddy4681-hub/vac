const mongoose = require('mongoose');

const messageLogSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    customerName: { type: String },
    customerEmail: { type: String },
    messageType: { type: String, enum: ['Confirmation', 'Reminder', 'AdminReport'], required: true },
    message: { type: String, required: true },
    sentAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('MessageLog', messageLogSchema);
