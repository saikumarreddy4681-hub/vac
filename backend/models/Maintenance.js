const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
    vehicleId: { type: String, required: true },
    reason: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['Scheduled', 'InProgress', 'Completed'], default: 'Scheduled' }
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
