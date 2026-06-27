const express = require('express');
const router = express.Router();
const db = require('../db');
const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');

const getVehicleById = (id) => {
    return new Promise((resolve, reject) => {
        if (!id) return resolve(null);
        const idStr = id.toString();
        if (idStr.match(/^[0-9a-fA-F]{24}$/)) {
            Vehicle.findById(id).then(resolve).catch(reject);
        } else {
            db.query("SELECT * FROM vehicles WHERE id = ?", [id], (error, results) => {
                if (error) return reject(error);
                if (results.length === 0) return resolve(null);
                const v = results[0];
                resolve({
                    _id: v.id,
                    id: v.id,
                    name: v.name,
                    vehicleType: v.vehicleType,
                    licensePlate: v.licensePlate,
                    status: v.status
                });
            });
        }
    });
};

const updateVehicleStatus = (id, status) => {
    return new Promise((resolve, reject) => {
        if (!id) return resolve(null);
        const idStr = id.toString();
        if (idStr.match(/^[0-9a-fA-F]{24}$/)) {
            Vehicle.findByIdAndUpdate(id, { status }).then(resolve).catch(reject);
        } else {
            db.query("UPDATE vehicles SET status = ? WHERE id = ?", [status, id], (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        }
    });
};

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
            await updateVehicleStatus(vehicleId, 'Maintenance');
        }

        res.status(201).json(maintenance);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message || error });
    }
});

// GET /api/maintenance - Retrieve all maintenance blocks
router.get('/', async (req, res) => {
    try {
        const blocks = await Maintenance.find();
        const populatedBlocks = await Promise.all(blocks.map(async (block) => {
            const blockObj = block.toObject();
            try {
                blockObj.vehicleId = await getVehicleById(blockObj.vehicleId);
            } catch (err) {
                console.error("Error populating vehicle ID in maintenance block:", err);
            }
            return blockObj;
        }));
        res.json(populatedBlocks);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message || error });
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
        await updateVehicleStatus(block.vehicleId, 'Available');

        res.json({ message: 'Maintenance block removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message || error });
    }
});

module.exports = router;
