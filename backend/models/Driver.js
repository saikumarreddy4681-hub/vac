const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    status: { type: String, enum: ['Available', 'On Trip', 'Off Duty'], default: 'Available' }
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);
