const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
    enquiryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry', required: true },
    notes: { type: String, required: true },
    followUpDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('FollowUp', followUpSchema);
