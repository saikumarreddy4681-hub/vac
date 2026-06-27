const express = require('express');
const router = express.Router();
const Enquiry = require('../models/Enquiry');
const FollowUp = require('../models/FollowUp');

// POST /api/enquiries - Submit a new enquiry
router.post('/', async (req, res) => {
    try {
        const { customerName, customerEmail, message } = req.body;
        if (!customerName || !customerEmail || !message) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const enquiry = new Enquiry({
            customerName,
            customerEmail,
            message,
            status: 'Open'
        });

        await enquiry.save();
        res.status(201).json({ message: 'Enquiry submitted successfully!', enquiry });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// GET /api/enquiries - Get all enquiries (with follow-ups populated dynamically)
router.get('/', async (req, res) => {
    try {
        const enquiries = await Enquiry.find().sort({ createdAt: -1 });
        
        // Populate follow-ups manually
        const enquiriesWithFollowUps = await Promise.all(enquiries.map(async (enq) => {
            const followUps = await FollowUp.find({ enquiryId: enq._id }).sort({ createdAt: -1 });
            return {
                ...enq.toObject(),
                followUps
            };
        }));

        res.json(enquiriesWithFollowUps);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// PATCH /api/enquiries/:id/status - Update enquiry status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Open', 'Resolved', 'Follow-up'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const enquiry = await Enquiry.findById(req.params.id);
        if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });

        enquiry.status = status;
        await enquiry.save();
        res.json({ message: `Enquiry status updated to ${status}`, enquiry });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// POST /api/enquiries/:id/follow-up - Add a follow-up log
router.post('/:id/follow-up', async (req, res) => {
    try {
        const { notes, status } = req.body; // status is for follow-up item (Pending/Completed)
        if (!notes) return res.status(400).json({ message: 'Notes are required for follow-up' });

        const enquiry = await Enquiry.findById(req.params.id);
        if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });

        const followUp = new FollowUp({
            enquiryId: req.params.id,
            notes,
            status: status || 'Pending'
        });

        await followUp.save();

        // Automatically mark the enquiry status as "Follow-up"
        enquiry.status = 'Follow-up';
        await enquiry.save();

        res.status(201).json({ message: 'Follow-up logged successfully!', followUp, enquiry });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

module.exports = router;
