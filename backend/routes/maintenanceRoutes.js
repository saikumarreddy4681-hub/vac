const express = require('express');
const router = express.Router();
const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');

// POST /api/maintenance/block - Block vehicle for maintenance
router.post('/block', async (req, res) => {
    try {
        const { vehicleId, startDate, endDate, reason } = req.body;
        
        if (!vehicleId || !startDate || !endDate || !reason) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const maintenance = new Maintenance({
            vehicleId,
            startDate,
            endDate,
            reason
        });

        await maintenance.save();
        
        // Optionally update vehicle status if the block starts today
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (start <= now && now <= end) {
            await Vehicle.findByIdAndUpdate(vehicleId, { status: 'Maintenance' });
        }

        res.status(201).json(maintenance);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// GET /api/maintenance - Retrieve all maintenance blocks
router.get('/', async (req, res) => {
    try {
        const blocks = await Maintenance.find().populate('vehicleId');
        res.json(blocks);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// DELETE /api/maintenance/:id/unblock - Remove maintenance block
router.delete('/:id/unblock', async (req, res) => {
    try {
        const block = await Maintenance.findById(req.params.id);
        if (!block) {
            return res.status(404).json({ message: 'Maintenance block not found' });
        }

        await Maintenance.findByIdAndDelete(req.params.id);
        
        // Re-evaluate vehicle status
        await Vehicle.findByIdAndUpdate(block.vehicleId, { status: 'Available' });

        res.json({ message: 'Maintenance block removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

module.exports = router;
