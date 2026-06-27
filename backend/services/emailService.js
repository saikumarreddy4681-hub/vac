const nodemailer = require('nodemailer');

// Helper function to validate customer email format
const validateEmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(email).toLowerCase());
};

// Helper function to send email with up to 3 retries for network resilience
const sendMailWithRetry = async (transporter, mailOptions, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const info = await transporter.sendMail(mailOptions);
            return { success: true, info };
        } catch (error) {
            console.log(`[SMTP RETRY ${i + 1}/${retries}] Failed to send:`, error.message);
            // If it is a credentials failure (535), fail immediately to avoid blocking
            if (error.message.includes('535') || error.message.includes('Username and Password not accepted')) {
                return { success: false, error: error.message };
            }
            if (i === retries - 1) {
                return { success: false, error: error.message };
            }
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

const sendConfirmationEmail = async (customerEmail, bookingDetails) => {
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

    if (!validateEmail(customerEmail)) {
        console.error('[EMAIL_ERROR] Invalid customer email address format:', customerEmail);
        return false;
    }

    if (!smtpUser || !smtpPass) {
        console.log('\n========================================================================');
        console.log('[WARNING] SMTP_USER/EMAIL_USER and SMTP_PASS/EMAIL_PASS are not configured.');
        console.log('Simulated Email Details:');
        console.log(`- To: ${customerEmail}`);
        console.log(`- Subject: Booking Confirmed! ✅ (ID: ${bookingDetails.bookingId})`);
        console.log(`- Vehicle: ${bookingDetails.vehicleName}`);
        console.log(`- Dates: ${bookingDetails.dates}`);
        console.log(`- Amount Paid: $${bookingDetails.amount}`);
        console.log(`- Method: ${bookingDetails.paymentMethod}`);
        console.log('========================================================================\n');
        return false;
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });

        const mailOptions = {
            from: `"RentalSys Notifications" <${smtpUser}>`,
            to: customerEmail,
            subject: `Rental Booking Confirmed! ✅ - Booking ID: ${bookingDetails.bookingId}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                    <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 24px; border-radius: 8px 8px 0 0; text-align: center; color: white;">
                        <h2 style="margin: 0; font-size: 24px;">Booking Confirmed! ✅</h2>
                        <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Secure Rental System Gateway</p>
                    </div>
                    
                    <div style="padding: 20px; color: #334155; line-height: 1.6;">
                        <p style="font-size: 16px;">Dear Customer,</p>
                        <p>Thank you for your business. Your payment was verified, and your booking is now active.</p>
                        
                        <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; padding: 16px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Booking Information</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Booking ID:</td>
                                    <td style="font-family: monospace; font-weight: bold; color: #0f172a; text-align: right;">${bookingDetails.bookingId}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Vehicle Model:</td>
                                    <td style="font-weight: bold; color: #0f172a; text-align: right;">${bookingDetails.vehicleName}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Rental Dates:</td>
                                    <td style="color: #0f172a; text-align: right;">${bookingDetails.dates}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Amount Paid:</td>
                                    <td style="font-weight: bold; color: #16a34a; text-align: right;">$${bookingDetails.amount}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Payment Method:</td>
                                    <td style="color: #0f172a; text-align: right;">${bookingDetails.paymentMethod}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
            `
        };

        const res = await sendMailWithRetry(transporter, mailOptions);
        return res.success;
    } catch (error) {
        console.error('[EMAIL_ERROR] Failed to send confirmation email:', error.message);
        return false;
    }
};

const sendBookingConfirmationEmail = async ({
    customerName,
    customerEmail,
    vehicleName,
    vehicleType,
    bookingId,
    pickupLocation = 'N/A',
    dropLocation = 'N/A',
    startDate,
    endDate,
    paymentMethod = 'N/A',
    paymentStatus = 'Completed',
    amount
}) => {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!validateEmail(customerEmail)) {
        return { success: false, error: "Invalid customer email address format" };
    }

    const textMessage = `Hello ${customerName},

Your vehicle rental booking is confirmed.

Booking ID: ${bookingId}
Customer Name: ${customerName}
Vehicle: ${vehicleName}
Vehicle Type: ${vehicleType}
Start Date: ${startDate}
End Date: ${endDate}
Amount: ${amount}
Payment Status: ${paymentStatus}

Thank you for using RentalSys.`;

    if (!emailUser || !emailPass) {
        const errorMsg = "EMAIL_USER and EMAIL_PASS are not configured in backend/.env";
        console.log(errorMsg);
        return { success: false, error: errorMsg };
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });

        const mailOptions = {
            from: `"RentalSys" <${emailUser}>`,
            to: customerEmail,
            subject: 'Booking Confirmed - RentalSys',
            text: textMessage
        };

        const res = await sendMailWithRetry(transporter, mailOptions);
        if (res.success) {
            console.log('[EMAIL] Booking confirmation email sent successfully to:', customerEmail);
            return { success: true };
        } else {
            return { success: false, error: res.error };
        }
    } catch (error) {
        console.log(error.message);
        return { success: false, error: error.message };
    }
};

const sendReminderEmail = async ({
    customerName,
    customerEmail,
    vehicleName,
    startDate,
    pickupLocation = 'N/A',
    dropLocation = 'N/A'
}) => {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!validateEmail(customerEmail)) {
        return { success: false, error: "Invalid customer email address format" };
    }

    if (!emailUser || !emailPass) {
        const errorMsg = "EMAIL_USER and EMAIL_PASS are not configured in backend/.env";
        console.log(errorMsg);
        return { success: false, error: errorMsg };
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });

        const textMessage = `Your RentalSys booking reminder

Vehicle:
${vehicleName}

Pickup:
${pickupLocation}

Date:
${startDate}

Thank you, RentalSys`;

        const mailOptions = {
            from: `"RentalSys" <${emailUser}>`,
            to: customerEmail,
            subject: 'Rental Reminder - Upcoming Vehicle Booking',
            text: textMessage
        };

        const res = await sendMailWithRetry(transporter, mailOptions);
        if (res.success) {
            console.log('[EMAIL] Reminder email sent successfully to:', customerEmail);
            return { success: true };
        } else {
            return { success: false, error: res.error };
        }
    } catch (error) {
        console.log(error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { sendConfirmationEmail, sendBookingConfirmationEmail, sendReminderEmail };

// Test SMTP connection on startup
const emailUserStartup = process.env.EMAIL_USER;
const emailPassStartup = process.env.EMAIL_PASS;
if (emailUserStartup && emailPassStartup) {
    const startupTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: emailUserStartup,
            pass: emailPassStartup
        }
    });
    startupTransporter.verify((error) => {
        if (error) {
            console.log("SMTP ERROR:", error.message);
        } else {
            console.log("SMTP CONNECTED");
        }
    });
} else {
    console.log("SMTP NOT CONFIGURING: EMAIL_USER or EMAIL_PASS missing on startup.");
}
