const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Maintenance = require('../models/Maintenance');

// GET /api/reports/availability
router.get('/availability', async (req, res) => {
    try {
        const vehicles = await Vehicle.find();
        const totalVehicles = vehicles.length;
        const availableCount = vehicles.filter(v => v.status === 'Available').length;
        const bookedCount = vehicles.filter(v => v.status === 'Booked').length;
        const maintenanceCount = vehicles.filter(v => v.status === 'Maintenance').length;

        res.json({
            totalVehicles,
            availableCount,
            bookedCount,
            maintenanceCount,
            details: vehicles
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// GET /api/reports/bookings
router.get('/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().populate('vehicleId');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// GET /api/reports/maintenance
router.get('/maintenance', async (req, res) => {
    try {
        const blocks = await Maintenance.find().populate('vehicleId');
        res.json(blocks);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// GET /api/status/summary
router.get('/summary', async (req, res) => {
    try {
        const vehicles = await Vehicle.find();
        const totalVehicles = vehicles.length;
        const availableCount = vehicles.filter(v => v.status === 'Available').length;
        const bookedCount = vehicles.filter(v => v.status === 'Booked').length;
        const maintenanceCount = vehicles.filter(v => v.status === 'Maintenance').length;

        const carsCount = vehicles.filter(v => v.vehicleType === 'Car').length;
        const busesCount = vehicles.filter(v => v.vehicleType === 'Bus').length;

        res.json({
            cars: carsCount,
            buses: busesCount,
            available: availableCount,
            booked: bookedCount,
            maintenance: maintenanceCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// GET /api/reports/export/csv - Messaging/Reports Layer
// Role: PDF or CSV export for summaries and admin reports
router.get('/export/csv', async (req, res) => {
    try {
        const vehicles = await Vehicle.find();
        
        let csvContent = 'ID,Name,Type,LicensePlate,Status\n';
        vehicles.forEach(v => {
            csvContent += `${v._id},${v.name},${v.vehicleType},${v.licensePlate},${v.status}\n`;
        });

        res.header('Content-Type', 'text/csv');
        res.attachment('vehicles_report.csv');
        return res.send(csvContent);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

module.exports = router;
