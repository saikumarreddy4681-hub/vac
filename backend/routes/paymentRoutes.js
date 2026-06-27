const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const db = require('../db');
const { sendConfirmationEmail } = require('../services/emailService');
const Razorpay = require('razorpay');

// Initialize Razorpay SDK if keys are provided in .env
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('[RAZORPAY] Initialized with Key ID:', process.env.RAZORPAY_KEY_ID);
} else {
    console.log('[RAZORPAY] Running in MOCK Mode. (Configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env for live integration)');
}

const getVehicleById = (id) => {
    return new Promise((resolve, reject) => {
        if (!id) return resolve(null);
        const idStr = id.toString();
        if (idStr.match(/^[0-9a-fA-F]{24}$/)) {
            const Vehicle = require('../models/Vehicle');
            Vehicle.findById(id).then(resolve).catch(reject);
        } else {
            db.query("SELECT * FROM vehicles WHERE id = ?", [id], (error, results) => {
                if (error) return reject(error);
                if (results.length === 0) return resolve(null);
                resolve(results[0]);
            });
        }
    });
};

// GET /api/payments - List all payments
router.get('/', async (req, res) => {
    try {
        const payments = await Payment.find().populate('bookingId');
        const populatedPayments = await Promise.all(payments.map(async (p) => {
            const paymentObj = p.toObject();
            if (paymentObj.bookingId) {
                try {
                    paymentObj.bookingId.vehicleId = await getVehicleById(paymentObj.bookingId.vehicleId);
                } catch (err) {
                    console.error("Error populating vehicle ID in payment list:", err);
                }
            }
            return paymentObj;
        }));
        res.json(populatedPayments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// POST /api/payments/create-order - Create a Razorpay Order
router.post('/create-order', async (req, res) => {
    try {
        const { amount, currency } = req.body;
        const totalAmount = Math.round(amount * 100); // smallest currency unit (paise/cents)

        if (razorpay) {
            const options = {
                amount: totalAmount,
                currency: currency || 'INR',
                receipt: `receipt_${Date.now()}`
            };
            const order = await razorpay.orders.create(options);
            return res.json({
                order_id: order.id,
                amount: order.amount,
                currency: order.currency,
                key_id: process.env.RAZORPAY_KEY_ID,
                isMock: false
            });
        } else {
            // Mock Mode fallback
            const mockOrderId = `order_mock_${Math.random().toString(36).substring(2, 15)}`;
            return res.json({
                order_id: mockOrderId,
                amount: totalAmount,
                currency: currency || 'INR',
                key_id: 'rzp_test_mockKeyId12345',
                isMock: true
            });
        }
    } catch (error) {
        console.error("Create order error:", error);
        res.status(500).json({ message: 'Failed to create payment order', error: error.message });
    }
});

// POST /api/payments/verify-payment - Verify Razorpay Signature
router.post('/verify-payment', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (razorpay_order_id.startsWith('order_mock_')) {
            return res.json({
                status: 'success',
                message: 'Payment verified successfully (Mock Mode)',
                paymentId: razorpay_payment_id || `pay_mock_${Math.random().toString(36).substring(2, 15)}`
            });
        }

        const crypto = require('crypto');
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            res.json({
                status: 'success',
                message: 'Payment verified successfully',
                paymentId: razorpay_payment_id
            });
        } else {
            res.status(400).json({
                status: 'failure',
                message: 'Invalid signature verification'
            });
        }
    } catch (error) {
        console.error("Verify payment error:", error);
        res.status(500).json({ message: 'Payment verification failed', error: error.message });
    }
});

// POST /api/payments/:id/pay - Complete a payment
router.post('/:id/pay', async (req, res) => {
    try {
        const { paymentMethod, transactionId, notes, status } = req.body;
        const payment = await Payment.findById(req.params.id).populate('bookingId');
        if (!payment) return res.status(404).json({ message: 'Payment not found' });
        
        payment.status = status || 'Completed';
        payment.paymentMethod = paymentMethod || 'Cash';
        payment.transactionId = transactionId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
        payment.paymentDate = new Date();
        if (notes !== undefined) payment.notes = notes;
        
        await payment.save();

        // Trigger verification/confirmation email
        if (payment.status === 'Completed' && payment.bookingId) {
            const booking = payment.bookingId;
            let vehicleName = 'Selected Vehicle';
            try {
                const vehicle = await getVehicleById(booking.vehicleId);
                if (vehicle) vehicleName = vehicle.name;
            } catch (e) {
                console.error("Error fetching vehicle details for email:", e);
            }

            const startStr = booking.startDate ? new Date(booking.startDate).toLocaleDateString() : '';
            const endStr = booking.endDate ? new Date(booking.endDate).toLocaleDateString() : '';

            // Run asynchronously so we don't delay the API response
            sendConfirmationEmail(booking.customerEmail, {
                bookingId: booking._id,
                vehicleName,
                dates: `${startStr} to ${endStr}`,
                amount: payment.amount,
                paymentMethod: payment.paymentMethod
            }).catch(err => console.error("Error triggering confirmation email:", err));
        }
        
        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

module.exports = router;
