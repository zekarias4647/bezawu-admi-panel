const express = require('express');
const router = express.Router();
const { query } = require('../connection/db');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// In-memory store for OTPs and Verified sessions
// format: email -> { otp, expires }
const otpStore = new Map();
// format: email -> expires
const verifiedStore = new Map();

// Send OTP
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await query('SELECT * FROM managers WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Store in memory (expires in 10 mins)
        otpStore.set(email, {
            otp,
            expires: Date.now() + 10 * 60 * 1000
        });

        const mailOptions = {
            from: 'Bezaw<' + process.env.EMAIL_USER + '>',
            to: email,
            subject: 'Bezaw Admin Panel - Password Reset OTP',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fdfaf6; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                    <div style="background-color: #064e3b; padding: 40px 20px; text-align: center; background-image: linear-gradient(135deg, #064e3b 0%, #047857 100%);">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 1px;">Bezaw Admin</h1>
                    </div>
                    <div style="padding: 40px; background-color: #ffffff;">
                        <h2 style="color: #1e293b; margin-top: 0; font-size: 24px; font-weight: 700;">Security Update</h2>
                        <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                            We received a request to update the security credentials for your terminal. Use the unique cryptographic sequence below to verify your identity.
                        </p>
                        
                        <div style="background-color: #ecfdf5; border: 1px dashed #10b981; border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0;">
                            <div style="color: #059669; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-bottom: 10px;">One-Time Password</div>
                            <div style="color: #064e3b; font-size: 36px; font-weight: 800; letter-spacing: 8px; font-family: monospace;">${otp}</div>
                        </div>

                        <p style="color: #94a3b8; font-size: 14px; margin-top: 30px; text-align: center;">
                            This sequence expires in <strong style="color: #64748b;">10 minutes</strong>.
                        </p>
                    </div>
                    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                         <p style="color: #cbd5e1; font-size: 12px; margin: 0; font-weight: 600;">SECURED BY BEZAW PROTOCOL</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'OTP sent successfully' });
    } catch (err) {
        console.error('Error sending OTP:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const record = otpStore.get(email);

        if (!record) {
            return res.status(400).json({ message: 'No OTP requested or expired' });
        }

        if (Date.now() > record.expires) {
            otpStore.delete(email);
            return res.status(400).json({ message: 'OTP has expired' });
        }

        if (record.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Mark as verified for the next step (valid for 5 minutes)
        verifiedStore.set(email, Date.now() + 5 * 60 * 1000);

        // Clear the used OTP
        otpStore.delete(email);

        res.json({ message: 'OTP verified successfully' });
    } catch (err) {
        console.error('Error verifying OTP:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    const { email, password } = req.body;
    try {
        const verifiedUntil = verifiedStore.get(email);

        // Security check: Must have verified OTP recently
        if (!verifiedUntil || Date.now() > verifiedUntil) {
            return res.status(401).json({ message: 'Unauthorized. Please verify OTP first.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password in managers table
        await query('UPDATE managers SET password_hash = $1 WHERE email = $2', [hashedPassword, email]);

        // Clear verification status
        verifiedStore.delete(email);

        res.json({ message: 'Password has been reset successfully' });
    } catch (err) {
        console.error('Error resetting password:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;