const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['Open', 'Resolved', 'Follow-up'], default: 'Open' }
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', enquirySchema);
