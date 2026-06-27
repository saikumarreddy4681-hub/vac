const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    vehicleType: { type: String, enum: ['Car', 'Bus'], required: true },
    licensePlate: { type: String, required: true, unique: true },
    status: { type: String, enum: ['Available', 'Booked', 'Maintenance'], default: 'Available' },
    imageUrl: { type: String, default: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format' }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);