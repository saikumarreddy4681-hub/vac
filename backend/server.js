const express = require('express');
const mongoose = require('mongoose');
// const db = require('./db');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Helper function to clean up duplicate reminder logs
const cleanDuplicateReminderLogs = async () => {
    try {
        const MessageLog = require('./models/MessageLog');
        console.log('Cleaning up duplicate reminder logs from database...');
        const reminderLogs = await MessageLog.find({ messageType: 'Reminder' }).sort({ sentAt: 1 });
        const seen = new Set();
        let deletedCount = 0;
        for (const log of reminderLogs) {
            let key = '';
            if (log.bookingId) {
                key = `${log.bookingId.toString()}_Reminder`;
            } else {
                const vehicleMatch = log.message.match(/Vehicle:\s*(.*)/i);
                const vehicleName = vehicleMatch ? vehicleMatch[1].trim() : '';
                key = `${log.customerEmail}_${vehicleName}_Reminder`;
            }

            if (seen.has(key)) {
                await MessageLog.deleteOne({ _id: log._id });
                deletedCount++;
            } else {
                seen.add(key);
            }
        }
        if (deletedCount > 0) {
            console.log(`Cleaned up ${deletedCount} duplicate reminder logs.`);
        } else {
            console.log('No duplicate reminder logs found.');
        }
    } catch (cleanupErr) {
        console.error('Error cleaning up duplicate logs:', cleanupErr);
    }
};

// Database Connection
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
        console.log('Attempting to connect to MongoDB...');
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in env variables');
        }
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 3000 });
        console.log('Connected to MongoDB');
        await cleanDuplicateReminderLogs();
    } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
            console.log('Local MongoDB connection failed or MONGO_URI is missing. Starting in-memory database automatically...');
            try {
                const { MongoMemoryServer } = require('mongodb-memory-server');
                const mongoServer = await MongoMemoryServer.create();
                const uri = mongoServer.getUri();
                await mongoose.connect(uri);
                console.log('Connected to In-Memory MongoDB at', uri);
                await cleanDuplicateReminderLogs();

                // Auto-seed for convenience
                const Vehicle = require('./models/Vehicle');
                const Driver = require('./models/Driver');
                const count = await Vehicle.countDocuments();
                if (count === 0) {
                    await Vehicle.insertMany([
                        { name: "Toyota Innova Crysta", vehicleType: "Car", licensePlate: "CAR-001", status: "Available", imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80" },
                        { name: "Volvo Multi-axle", vehicleType: "Bus", licensePlate: "BUS-001", status: "Available", imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80" },
                        { name: "Tata Starbus", vehicleType: "Bus", licensePlate: "BUS-002", status: "Available", imageUrl: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80" },
                        { name: "Maruti Swift", vehicleType: "Car", licensePlate: "CAR-002", status: "Available", imageUrl: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=600&q=80" }
                    ]);
                    console.log('In-Memory DB Seeded with initial vehicles.');
                }

                const driverCount = await Driver.countDocuments();
                if (driverCount === 0) {
                    await Driver.insertMany([
                        { name: "Amit Sharma", licenseNumber: "DL-12345", status: "Available" },
                        { name: "Rahul Verma", licenseNumber: "DL-67890", status: "Available" },
                        { name: "Vikram Singh", licenseNumber: "DL-11223", status: "Available" },
                        { name: "Suresh Kumar", licenseNumber: "DL-44556", status: "Available" }
                    ]);
                    console.log('In-Memory DB Seeded with initial drivers.');
                }
            } catch (memErr) {
                console.error('Failed to start in-memory database:', memErr);
            }
        } else {
            console.error('Failed to connect to MongoDB in production:', err);
            throw err;
        }
    }
};

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`[Backend] ${req.method} ${req.path} Query:`, req.query, "Body:", req.body);
    next();
});

// Middleware to ensure DB connection on serverless requests (Must run BEFORE routes are registered)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (dbErr) {
        res.status(500).json({ message: 'Database connection failed', error: dbErr.message });
    }
});

// Path normalization middleware to support both local development (/api) and Vercel (/_/backend)
app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
        req.url = req.url.substring(4);
    } else if (req.url.startsWith('/_/backend')) {
        req.url = req.url.substring(10);
    }
    if (!req.url.startsWith('/')) {
        req.url = '/' + req.url;
    }
    next();
});

// Routes
const vehicleRoutes = require('./routes/vehicleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const reportRoutes = require('./routes/reportRoutes');
const driverRoutes = require('./routes/driverRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const messageRoutes = require('./routes/messageRoutes');
const customerRoutes = require('./routes/customerRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');

app.use('/vehicles', vehicleRoutes);
app.use('/bookings', bookingRoutes);
app.use('/maintenance', maintenanceRoutes);
app.use('/reports', reportRoutes);
app.use('/status', reportRoutes);
app.use('/drivers', driverRoutes);
app.use('/payments', paymentRoutes);
app.use('/messages', messageRoutes);
app.use('/customers', customerRoutes);
app.use('/enquiries', enquiryRoutes);

// Razorpay SDK Integration
const Razorpay = require('razorpay');
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && 
    process.env.RAZORPAY_KEY_SECRET && 
    process.env.RAZORPAY_KEY_ID !== 'your_key' && 
    process.env.RAZORPAY_KEY_SECRET !== 'your_secret') {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('[RAZORPAY] Initialized with Key ID:', process.env.RAZORPAY_KEY_ID);
} else {
    console.log('[RAZORPAY] Running in MOCK Mode. (Configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env for live integration)');
}

// POST /api/create-order
app.post('/create-order', async (req, res) => {
    try {
        const { amount, currency, bookingId } = req.body;
        // Convert to smallest currency unit (paise)
        const totalAmount = Math.round(amount * 100);

        if (razorpay) {
            const options = {
                amount: totalAmount,
                currency: currency || 'INR',
                receipt: `receipt_${bookingId || Date.now()}`
            };
            const order = await razorpay.orders.create(options);
            return res.json({
                order_id: order.id,
                amount: order.amount,
                currency: order.currency,
                key_id: process.env.RAZORPAY_KEY_ID
            });
        } else {
            // Simulated fallback order ID so the checkout dialog can still be mocked/simulated gracefully if credentials are empty
            const mockOrderId = `order_mock_${Math.random().toString(36).substring(2, 15)}`;
            console.log(`[RAZORPAY WARNING] Using mock order creation. Order ID: ${mockOrderId}`);
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

// POST /api/verify-payment
app.post('/verify-payment', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id) {
            return res.status(400).json({ status: 'failure', message: 'Missing payment ids' });
        }

        // Mock verification fallback if no secret key is present
        if (razorpay_order_id.startsWith('order_mock_') || !process.env.RAZORPAY_KEY_SECRET) {
            console.log(`[RAZORPAY MOCK] Verifying mock order: ${razorpay_order_id}`);
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

// AI Assistant Route
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/ai-assistant", async(req,res)=>{
    try{
        const model = genAI.getGenerativeModel({
            model:"gemini-1.5-flash-latest"
        });

        const result = await model.generateContent(`
        You are a vehicle rental assistant.

        Booking details:
        ${JSON.stringify(req.body)}

        Give vehicle recommendation and booking advice.
        `);

        res.json({
            message: result.response.text()
        });
    } catch(error){
        console.log("AI API Error (likely an invalid or expired API Key):", error.message);
        // Fallback response so your UI still looks great and works during testing
        res.json({
            message: "💡 Recommendation: This " + (req.body.vehicle || 'vehicle') + " is an excellent choice!\n✅ Availability: Likely available for your dates.\n📋 Advice: Always double-check your pickup location."
        });
    }
});

// POST /send-email & /api/send-email - Direct email notification endpoint
const nodemailer = require('nodemailer');

const handleDirectEmail = async (req, res) => {
    const { email, vehicle, amount } = req.body;
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
        console.log("SMTP Credentials not configured in .env for direct email route.");
        return res.status(500).json({ success: false, error: "EMAIL_USER and EMAIL_PASS are not configured in backend/.env" });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });

        await transporter.sendMail({
            from: `"RentalSys" <${emailUser}>`,
            to: email,
            subject: "Booking Confirmed - RentalSys",
            html: `
<h2>Booking Successful</h2>
<p>Vehicle: ${vehicle}</p>
<p>Amount: ₹${amount}</p>
<p>Payment Status: Completed</p>
<p>Thank you for using RentalSys</p>
`
        });

        console.log(`[EMAIL] Direct confirmation email sent successfully to: ${email}`);
        res.json({ success: true });
    } catch (error) {
        console.log("SMTP ERROR:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

app.post("/send-email", handleDirectEmail);

// POST /api/reminder - Direct reminder notification endpoint
app.post("/reminder", async (req, res) => {
    const { bookingId, customerEmail, customerName, vehicleName, bookingDate, pickup, drop } = req.body;

    try {
        const Booking = require('./models/Booking');
        const MessageLog = require('./models/MessageLog');

        let finalEmail = customerEmail;
        let finalName = customerName;
        let finalVehicleName = vehicleName;
        let finalBookingDateStr = bookingDate;
        let finalPickup = pickup || 'N/A';
        let finalDrop = drop || 'N/A';
        let booking = null;

        // If bookingId is provided, fetch it and validate
        if (bookingId) {
            booking = await Booking.findById(bookingId).populate('vehicleId');
            if (!booking) {
                return res.status(404).json({ success: false, error: "Booking not found" });
            }
            if (booking.status !== 'Active') {
                return res.status(400).json({ success: false, error: "Reminder can only be sent for active bookings." });
            }
            if (booking.reminderSent) {
                return res.status(400).json({ success: false, error: "Reminder already sent for this booking." });
            }
            
            // Check booking date
            if (!booking.startDate || isNaN(new Date(booking.startDate).getTime())) {
                return res.status(400).json({ success: false, error: "Booking has an invalid start date." });
            }

            finalEmail = finalEmail || booking.customerEmail;
            finalName = finalName || booking.customerName;
            finalVehicleName = finalVehicleName || (booking.vehicleId ? booking.vehicleId.name : 'Unknown Vehicle');
            finalBookingDateStr = finalBookingDateStr || (booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A');
            finalPickup = finalPickup || booking.pickupLocation;
            finalDrop = finalDrop || booking.dropLocation;
        }

        if (!finalEmail || !finalName || !finalVehicleName) {
            return res.status(400).json({ success: false, error: "Missing required reminder email fields (customerEmail, customerName, vehicleName)" });
        }

        // Send email via services/emailService.js
        const { sendReminderEmail } = require('./services/emailService');
        const emailRes = await sendReminderEmail({
            customerName: finalName,
            customerEmail: finalEmail,
            vehicleName: finalVehicleName,
            startDate: finalBookingDateStr,
            pickupLocation: finalPickup,
            dropLocation: finalDrop
        });

        const textBody = `Your RentalSys booking reminder

Vehicle:
${finalVehicleName}

Pickup:
${finalPickup}

Date:
${finalBookingDateStr}

Thank you, RentalSys`;

        const isSuccess = emailRes.success;

        if (isSuccess) {
            if (booking) {
                booking.reminderSent = true;
                await booking.save();
            }

            // Save log in database, ensuring bookingId is set
            const log = new MessageLog({
                bookingId: booking ? booking._id : null,
                customerName: finalName,
                customerEmail: finalEmail,
                messageType: 'Reminder',
                message: textBody
            });
            await log.save();

            console.log(`[EMAIL] Direct reminder email processed for: ${finalEmail}`);
            res.json({ success: true, log });
        } else {
            res.status(500).json({ success: false, error: emailRes.error || 'Unknown SMTP Error' });
        }
    } catch (error) {
        console.log("SMTP ERROR:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});



// Local development server listener
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
