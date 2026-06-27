const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Booking = require('../models/Booking');

// GET /api/customers - Get all customers
router.get('/', async (req, res) => {
    try {
        const customers = await Customer.find().sort({ name: 1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// GET /api/customers/:id/trips - Get trip history for a customer
router.get('/:id/trips', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });

        const bookings = await Booking.find({ customerEmail: customer.email })
            .populate('vehicleId')
            .populate('driverId')
            .sort({ startDate: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// PUT /api/customers/:id - Update customer profile
router.put('/:id', async (req, res) => {
    try {
        const { phone, licenseNumber, address } = req.body;
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });

        if (phone !== undefined) customer.phone = phone;
        if (licenseNumber !== undefined) customer.licenseNumber = licenseNumber;
        if (address !== undefined) customer.address = address;

        await customer.save();
        res.json({ message: 'Customer profile updated successfully!', customer });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

module.exports = router;
