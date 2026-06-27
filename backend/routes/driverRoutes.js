const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');

// GET /api/drivers - List all drivers
router.get('/', async (req, res) => {
    try {
        const drivers = await Driver.find();
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// GET /api/drivers/available - List available drivers
router.get('/available', async (req, res) => {
    try {
        const drivers = await Driver.find({ status: 'Available' });
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// POST /api/drivers - Add a driver
router.post('/', async (req, res) => {
    try {
        const driver = new Driver(req.body);
        await driver.save();
        res.status(201).json(driver);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

module.exports = router;
