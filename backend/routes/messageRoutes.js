const express = require('express');
const router = express.Router();
const MessageLog = require('../models/MessageLog');
const Booking = require('../models/Booking');
const { sendReminderEmail } = require('../services/emailService');

// GET /api/messages - List all messages sent
router.get('/', async (req, res) => {
    try {
        const messages = await MessageLog.find().sort({ sentAt: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// POST /api/messages/send-reminder - Manually trigger a reminder message for a booking
router.post('/send-reminder', async (req, res) => {
    try {
        const { bookingId } = req.body;
        if (!bookingId) return res.status(400).json({ message: 'Missing bookingId' });

        const booking = await Booking.findById(bookingId).populate('vehicleId');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.status !== 'Active') {
            return res.status(400).json({ message: 'Reminder can only be sent for active bookings.' });
        }

        if (booking.reminderSent) {
            return res.status(400).json({ message: 'Reminder already sent for this booking.' });
        }

        // Check booking date
        if (!booking.startDate || isNaN(new Date(booking.startDate).getTime())) {
            return res.status(400).json({ message: 'Booking has an invalid start date.' });
        }

        const vehicleName = booking.vehicleId ? booking.vehicleId.name : 'Unknown Vehicle';
        const startDateStr = booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A';

        // Send real email reminder
        const emailRes = await sendReminderEmail({
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
            vehicleName,
            startDate: startDateStr,
            pickupLocation: booking.pickupLocation,
            dropLocation: booking.dropLocation
        });

        const reminderMsg = `Your RentalSys booking reminder

Vehicle:
${vehicleName}

Pickup:
${booking.pickupLocation || 'N/A'}

Date:
${startDateStr}

Thank you, RentalSys`;

        const isSuccess = emailRes.success;

        if (isSuccess) {
            booking.reminderSent = true;
            await booking.save();

            const log = new MessageLog({
                bookingId: booking._id,
                customerName: booking.customerName,
                customerEmail: booking.customerEmail,
                messageType: 'Reminder',
                message: reminderMsg
            });

            await log.save();
            res.status(201).json({ message: 'Reminder message sent successfully!', log });
        } else {
            res.status(500).json({ message: `Email failed: ${emailRes.error || 'Unknown SMTP Error'}`, error: emailRes.error });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message || error });
    }
});

module.exports = router;
