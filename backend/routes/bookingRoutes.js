const express = require('express');
const router = express.Router();
const { sendBookingConfirmationEmail } = require('../services/emailService');
const db = require('../db');
const Booking = require('../models/Booking');
const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Payment = require('../models/Payment');
const MessageLog = require('../models/MessageLog');
const Customer = require('../models/Customer');

const getVehicleById = (id) => {
    return new Promise((resolve, reject) => {
        if (!id) return resolve(null);
        const idStr = id.toString();
        // If it's a valid MongoDB ObjectId (24 hex characters)
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
                    status: v.status,
                    save: () => {
                        return new Promise((res, rej) => {
                            db.query("UPDATE vehicles SET status = ? WHERE id = ?", [v.status, v.id], (err) => {
                                if (err) return rej(err);
                                res();
                            });
                        });
                    }
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

// POST /api/bookings/check-conflict - Validate booking before creation
router.post('/check-conflict', async (req, res) => {
    try {
        const { vehicleId, startDate, endDate } = req.body;
        if (!vehicleId || !startDate || !endDate) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Invalid date format. Please enter valid dates.' });
        }

        if (start > end) {
            return res.status(400).json({ message: 'Start date must be before or equal to the end date.' });
        }

        // Check against active bookings
        const overlappingBookings = await Booking.find({
            vehicleId,
            status: 'Active',
            $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } }
            ]
        });

        if (overlappingBookings.length > 0) {
            return res.status(409).json({ 
                conflict: true, 
                message: 'Vehicle is already booked for the requested dates.' 
            });
        }

        // Check against maintenance blocks
        const overlappingMaintenance = await Maintenance.find({
            vehicleId,
            status: { $ne: 'Completed' },
            $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } }
            ]
        });

        if (overlappingMaintenance.length > 0) {
            return res.status(409).json({ 
                conflict: true, 
                message: 'Vehicle is blocked for maintenance during the requested dates.' 
            });
        }

        res.json({ conflict: false, message: 'Dates are available.' });
    } catch (error) {
        console.error("Error in check-conflict route:", error);
        res.status(500).json({ message: 'Server Error', error: error.message || error });
    }
});

// POST /api/bookings - Create booking
router.post('/', async (req, res) => {
    try {
        const { 
            vehicleId, 
            customerName, 
            customerEmail, 
            startDate, 
            endDate, 
            pickupLocation, 
            dropLocation, 
            driverId,
            paymentMethod,
            upiId,
            paymentStatus
        } = req.body;

        // Backend payment validation
        if (paymentMethod === 'upi') {
            if (!upiId) {
                return res.status(400).json({ message: 'Complete payment to confirm booking' });
            }
            const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
            if (!upiRegex.test(upiId)) {
                return res.status(400).json({ message: 'Complete payment to confirm booking' });
            }
        } else if (paymentMethod !== 'cash' && paymentMethod !== undefined) {
            return res.status(400).json({ message: 'Complete payment to confirm booking' });
        }

        if (paymentStatus !== undefined && paymentStatus !== 'Completed') {
            return res.status(400).json({ message: 'Complete payment to confirm booking' });
        }
        
        // Find vehicle to check type and details
        const vehicle = await getVehicleById(vehicleId);
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
        
        // Calculate price based on duration
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Invalid date format. Please enter valid dates.' });
        }

        if (start > end) {
            return res.status(400).json({ message: 'Start date must be before or equal to the end date.' });
        }

        const timeDiff = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) || 1; // charge at least 1 day
        
        let dailyRate = 50;
        if (vehicle.vehicleType === 'Car') dailyRate = 80;
        else if (vehicle.vehicleType === 'Bike') dailyRate = 25;
        else if (vehicle.vehicleType === 'Auto') dailyRate = 35;
        else if (vehicle.vehicleType === 'Van') dailyRate = 100;
        
        const price = dailyRate * diffDays;
        
        const booking = new Booking({
            vehicleId,
            customerName,
            customerEmail,
            startDate,
            endDate,
            pickupLocation,
            dropLocation,
            driverId: driverId || null,
            price
        });
        
        await booking.save();

        // Auto-create Customer profile if it doesn't exist
        try {
            const customerExists = await Customer.findOne({ email: customerEmail });
            if (!customerExists) {
                const customer = new Customer({
                    name: customerName,
                    email: customerEmail,
                    phone: '',
                    licenseNumber: '',
                    address: ''
                });
                await customer.save();
            }
        } catch (custErr) {
            console.error('Failed to auto-create customer entry:', custErr);
        }
        
        // Update driver status if driver is assigned
        if (driverId) {
            await Driver.findByIdAndUpdate(driverId, { status: 'On Trip' });
        }
        
        // Update vehicle status to booked
        vehicle.status = 'Booked';
        await vehicle.save();
        
        // Create Payment record
        const invoiceId = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
        const statusVal = paymentStatus || 'Completed'; // Default to Completed after Pay Now success
        const payment = new Payment({
            bookingId: booking._id,
            amount: price,
            status: statusVal,
            paymentMethod: paymentMethod === 'upi' ? 'UPI' : 'Cash',
            transactionId: paymentMethod === 'upi' ? `TXN-UPI-${Math.floor(100000 + Math.random() * 900000)}` : `TXN-CSH-${Math.floor(100000 + Math.random() * 900000)}`,
            paymentDate: new Date(),
            invoiceId
        });
        await payment.save();
        
        // Send Booking Confirmation Message
        const confirmationMsg = `Hello ${customerName},

Your vehicle rental booking is confirmed.

Booking ID: ${booking._id}
Customer Name: ${customerName}
Vehicle: ${vehicle.name}
Vehicle Type: ${vehicle.vehicleType}
Start Date: ${start.toLocaleDateString()}
End Date: ${end.toLocaleDateString()}
Amount: $${price}
Payment Status: ${statusVal}

Thank you for using RentalSys.`;
        const confirmationLog = new MessageLog({
            bookingId: booking._id,
            customerName,
            customerEmail,
            messageType: 'Confirmation',
            message: confirmationMsg
        });
        await confirmationLog.save();

        // Send real email confirmation in the background so it doesn't block the API response
        const vehicleType = vehicle ? vehicle.vehicleType : 'Car';
        const amount = `$${price}`;
        const startStr = start.toLocaleDateString();
        const endStr = end.toLocaleDateString();

        sendBookingConfirmationEmail({
            customerName,
            customerEmail,
            vehicleName: vehicle.name,
            vehicleType,
            bookingId: booking._id || booking.id,
            pickupLocation,
            dropLocation,
            startDate: startStr,
            endDate: endStr,
            paymentMethod: paymentMethod === 'upi' ? 'UPI' : 'Cash',
            amount
        }).then(emailRes => {
            if (emailRes.success) {
                console.log('[BACKGROUND EMAIL] Booking confirmation email sent successfully to:', customerEmail);
            } else {
                console.error('[BACKGROUND EMAIL] Booking confirmation email failed:', emailRes.error);
            }
        }).catch(emailErr => {
            console.error('[BACKGROUND EMAIL] Error sending confirmation email during booking creation (background):', emailErr);
        });
        
        res.status(201).json({
            booking,
            payment,
            emailSent: true,
            emailError: null,
            messages: [confirmationLog]
        });
    } catch (error) {
        console.error("Failed to create booking:", error);
        res.status(500).json({ message: 'Server Error', error: error.message || error });
    }
});

// GET /api/bookings - Get all bookings
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find().populate('driverId');
        const populatedBookings = await Promise.all(bookings.map(async (b) => {
            const bookingObj = b.toObject();
            try {
                bookingObj.vehicleId = await getVehicleById(bookingObj.vehicleId);
            } catch (err) {
                console.error("Error populating vehicle ID in booking list:", err);
            }
            try {
                const Payment = require('../models/Payment');
                const payment = await Payment.findOne({ bookingId: b._id });
                bookingObj.paymentStatus = payment ? payment.status : 'Pending';
                bookingObj.paymentMethod = payment ? payment.paymentMethod : 'N/A';
            } catch (paymentErr) {
                console.error("Error fetching payment for booking:", paymentErr);
                bookingObj.paymentStatus = 'Pending';
                bookingObj.paymentMethod = 'N/A';
            }
            return bookingObj;
        }));
        res.json(populatedBookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// PATCH /api/bookings/:id/status - Complete or cancel a booking
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body; // 'Completed' or 'Cancelled'
        if (!['Completed', 'Cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        booking.status = status;
        await booking.save();

        // Release vehicle and driver
        if (booking.vehicleId) {
            await updateVehicleStatus(booking.vehicleId, 'Available');
        }
        if (booking.driverId) {
            await Driver.findByIdAndUpdate(booking.driverId, { status: 'Available' });
        }

        res.json({ message: `Booking marked as ${status} successfully!`, booking });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// POST /api/bookings/:id/send-email - Send booking confirmation email
router.post('/:id/send-email', async (req, res) => {
    try {
        const { paymentMethod } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const vehicle = await getVehicleById(booking.vehicleId);
        const vehicleName = vehicle ? vehicle.name : 'Unknown Vehicle';
        const vehicleType = vehicle ? vehicle.vehicleType : 'Car';

        // Find payment for total amount
        const payment = await Payment.findOne({ bookingId: booking._id });
        const amount = payment ? `$${payment.amount}` : `$${booking.price}`;

        const emailRes = await sendBookingConfirmationEmail({
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
            vehicleName,
            vehicleType,
            bookingId: booking._id || booking.id,
            pickupLocation: booking.pickupLocation,
            dropLocation: booking.dropLocation,
            startDate: booking.startDate ? new Date(booking.startDate).toLocaleDateString() : '',
            endDate: booking.endDate ? new Date(booking.endDate).toLocaleDateString() : '',
            paymentMethod: paymentMethod || (payment ? payment.paymentMethod : 'UPI'),
            amount
        });

        if (emailRes.success) {
            res.json({ success: true, message: 'Confirmation email sent' });
        } else {
            res.status(500).json({ success: false, message: `Email sending failed: ${emailRes.error || 'Booking completed but email could not be sent'}` });
        }
    } catch (error) {
        console.error('Error sending confirmation email API:', error);
        res.status(500).json({ success: false, message: 'Booking completed but email could not be sent', error: error.message });
    }
});

module.exports = router;
