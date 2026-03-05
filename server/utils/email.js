const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

function logToFile(msg) {
    const logPath = path.join(__dirname, '../email_debug.log');
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
}

const primaryTransporter = nodemailer.createTransport({
    host: process.env.SUPPORT_EMAIL_HOST || 'mail.bezawcurbside.com',
    port: parseInt(process.env.SUPPORT_EMAIL_PORT) || 465,
    secure: parseInt(process.env.SUPPORT_EMAIL_PORT) === 465,
    auth: {
        user: process.env.SUPPORT_EMAIL_USER,
        pass: process.env.SUPPORT_EMAIL_PASS
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    tls: { rejectUnauthorized: false }
});

const fallbackTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verification check for BOTH
primaryTransporter.verify((err) => {
    if (err) {
        logToFile(`❌ [SMTP Support] Connection failed: ${err.message}`);
        console.error('❌ [SMTP Support] Connection failed (Auth Error). Emails will use fallback.');
    } else {
        logToFile('✅ [SMTP Support] Server is Ready.');
        console.log('✅ [SMTP Support] Server is Ready.');
    }
});
fallbackTransporter.verify((err) => {
    if (err) {
        logToFile(`❌ [SMTP Fallback] Gmail connection failed: ${err.message}`);
        console.error('❌ [SMTP Fallback] Gmail connection failed!');
    } else {
        logToFile('✅ [SMTP Fallback] Gmail Server is Ready.');
        console.log('✅ [SMTP Fallback] Gmail Server is Ready.');
    }
});

/**
 * Sends a transactional email to a customer.
 * @param {string} to - Customer email address
 * @param {string} subject - Email subject
 * @param {string} title - Heading inside the email
 * @param {string} message - Body text
 * @param {string} orderId - Related order ID
 * @param {object} details - Extra details { vendor, branch, location }
 */
async function sendStatusEmail(to, subject, title, message, orderId, details = {}) {
    if (!to) {
        logToFile(`❌ [Email Error] Recipient email is missing for Order #${orderId}`);
        return false;
    }

    const { vendor, branch, location, latitude, longitude } = details;
    const isPreparing = subject.toLowerCase().includes('preparing');
    const isReadyStatus = subject.toLowerCase().includes('ready');

    // --- LOGO PATH DISCOVERY ---
    const possiblePaths = [
        path.join(__dirname, '../../public/logo.png'),
        path.join(__dirname, '../public/logo.png'),
        path.join(process.cwd(), 'public/logo.png'),
        path.join(process.cwd(), 'logo.png'),
        path.join(process.cwd(), '../public_html/logo.png'),
        path.join(__dirname, '../../../public_html/logo.png')
    ];

    let finalLogoPath = null;
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            finalLogoPath = p;
            break;
        }
    }

    const attachments = [];
    if (finalLogoPath) {
        logToFile(`✅ [Email] Logo found at: ${finalLogoPath}`);
        attachments.push({
            filename: 'logo.png',
            path: finalLogoPath,
            cid: 'bezawlogo'
        });
    } else {
        logToFile(`⚠️ [Email Warning] logo.png NOT FOUND. Checked: ${possiblePaths.join(', ')}`);
    }

    const qrCodeUrl = isReadyStatus ? `https://api.qrserver.com/v1/create-qr-code/?data=${orderId}&size=200x200&color=10b981` : null;

    let dynamicMessage = message;
    if (isPreparing) {
        dynamicMessage = `Your order <strong>${orderId}</strong> from <strong>${vendor || 'our vendor'}</strong> (<strong>${branch || 'Branch'}</strong>, ${location || 'Location'}) is now <strong>PREPARING</strong>. We'll notify you once it's ready for pickup.`;
    }

    const mailOptions = {
        from: `"Bezaw Curbside Support" <${process.env.SUPPORT_EMAIL_USER || process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        attachments: attachments,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
                    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
                    .header { background: #10b981; padding: 40px 20px; text-align: center; }
                    .logo-img { height: 60px; width: auto; margin-bottom: 15px; }
                    .content { padding: 40px 30px; color: #1e293b; line-height: 1.6; }
                    h1 { margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 1px; }
                    p { font-size: 16px; color: #475569; margin: 20px 0; }
                    .order-badge { background: #f1f5f9; padding: 25px; border-radius: 15px; border: 1px solid #e2e8f0; text-align: center; }
                    .ref-title { font-size: 11px; font-weight: 700; color: #10b981; text-transform: uppercase; margin-bottom: 5px; }
                    .ref-id { font-size: 24px; font-weight: 900; color: #0f172a; margin: 0; }
                    .qr-box { margin-top: 25px; padding: 15px; border-top: 1px dashed #cbd5e1; }
                    .qr-image { width: 140px; height: 140px; background: #fff; padding: 10px; border-radius: 10px; border: 1px solid #f1f5f9; }
                    .footer { background: #f1f5f9; padding: 30px; text-align: center; color: #64748b; font-size: 12px; }
                    .btn-track { display: inline-block; padding: 12px 25px; background: #10b981; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="cid:bezawlogo" alt="Bezaw Curbside" class="logo-img">
                        <h1>${title}</h1>
                    </div>
                    <div class="content">
                        <p style="font-size: 18px; font-weight: 700; color: #0f172a;">Order Status Update</p>
                        <p>${dynamicMessage}</p>
                        
                        <div class="order-badge">
                            <div class="ref-title">Order ID</div>
                            <div class="ref-id">#${orderId}</div>
                            
                            ${isReadyStatus ? `
                                <div class="qr-box">
                                    <img src="${qrCodeUrl}" alt="QR Code" class="qr-image">
                                    <p style="font-size: 12px; margin-top: 10px;">Show this QR code to the branch manager for quick pickup</p>
                                </div>
                            ` : ''}
                        </div>

                        ${vendor ? `
                            <div style="margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 14px;">
                                <div style="margin-bottom: 5px;"><strong>Vendor:</strong> ${vendor}</div>
                                <div style="margin-bottom: 5px;"><strong>Branch:</strong> ${branch}</div>
                                <div style="margin-bottom: 15px;"><strong>Location:</strong> ${location || 'N/A'}</div>
                                ${(latitude && longitude) ? `
                                    <a href="https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}" target="_blank" style="display:inline-block; padding: 10px 20px; background-color: #e2e8f0; color: #0f172a; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px; border: 1px solid #cbd5e1;">
                                        📍 View on Map
                                    </a>
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 Bezaw Curbside Service | Tech5 Ethiopia</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        logToFile(`[Email] Attempting to send to ${to} via Primary...`);
        await primaryTransporter.sendMail(mailOptions);
        logToFile(`✅ [Email] Sent successfully to ${to} via Primary.`);
        console.log(`✅ [Email] Sent to ${to} via Primary Support Email.`);
        return true;
    } catch (primaryErr) {
        logToFile(`⚠️ [Email Primary Fail] ${primaryErr.message}. Trying Fallback...`);
        console.warn(`⚠️ [Email Primary Fail] ${primaryErr.message}. Trying Gmail fallback...`);

        try {
            await fallbackTransporter.sendMail({
                ...mailOptions,
                from: `"Bezaw Curbside (Support Fallback)" <${process.env.EMAIL_USER}>`
            });
            logToFile(`✅ [Email] Sent to ${to} via Gmail Fallback.`);
            console.log(`✅ [Email] Sent to ${to} via Gmail Fallback.`);
            return true;
        } catch (fallbackErr) {
            logToFile(`❌ [Critical Email Fail] All SMTP servers failed: ${fallbackErr.message}`);
            console.error('❌ [Critical Email Fail] All SMTP servers failed:', fallbackErr.message);
            return false;
        }
    }
}

async function sendGiftEmail(to, subject, title, message, orderId, details) {
    if (!to) {
        logToFile(`❌ [Email Error] Recipient email is missing for Gift Order #${orderId}`);
        return false;
    }

    const { senderName, products, vendor, branch, location, latitude, longitude, isReadyStatus } = details;

    const possiblePaths = [
        path.join(__dirname, '../../public/logo.png'),
        path.join(__dirname, '../public/logo.png'),
        path.join(process.cwd(), 'public/logo.png'),
        path.join(process.cwd(), 'logo.png'),
        path.join(process.cwd(), '../public_html/logo.png'),
        path.join(__dirname, '../../../public_html/logo.png')
    ];

    let finalLogoPath = null;
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            finalLogoPath = p;
            break;
        }
    }

    const attachments = [];
    if (finalLogoPath) {
        attachments.push({ filename: 'logo.png', path: finalLogoPath, cid: 'bezawlogo' });
    }

    const qrCodeUrl = isReadyStatus ? `https://api.qrserver.com/v1/create-qr-code/?data=${orderId}&size=200x200&color=10b981` : null;

    const mailOptions = {
        from: `"Bezaw Curbside Gifts" <${process.env.SUPPORT_EMAIL_USER || process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        attachments: attachments,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Arial, sans-serif; }
                    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
                    .header { background: #10b981; padding: 40px 20px; text-align: center; }
                    .logo-img { height: 60px; width: auto; margin-bottom: 15px; }
                    .content { padding: 40px 30px; color: #1e293b; line-height: 1.6; }
                    h1 { margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 1px; }
                    .gift-box { background: #f1f5f9; padding: 25px; border-radius: 15px; border: 1px solid #e2e8f0; text-align: center; margin-top: 20px; }
                    .qr-image { width: 140px; height: 140px; background: #fff; padding: 10px; border-radius: 10px; border: 1px solid #f1f5f9; display: block; margin: 15px auto; }
                    .footer { background: #f1f5f9; padding: 30px; text-align: center; color: #64748b; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="cid:bezawlogo" alt="Bezaw Curbside" class="logo-img">
                        <h1>${title}</h1>
                    </div>
                    <div class="content">
                        <p style="font-size: 18px; font-weight: 700; color: #0f172a; text-align: center;">You received a gift!</p>
                        <p style="text-align: center;">${message}</p>
                        
                        <div class="gift-box">
                            <h3 style="margin-top:0; color:#10b981; text-transform:uppercase; font-size:14px;">Gift Details</h3>
                            <div style="text-align: left; margin-bottom: 20px; font-size: 14px;">
                                <div style="margin-bottom: 8px;"><strong>From:</strong> ${senderName || 'Someone special'}</div>
                                <div style="margin-bottom: 8px;"><strong>Products:</strong> ${products || 'Surprise items'}</div>
                                <div style="margin-bottom: 8px;"><strong>Vendor:</strong> ${vendor || 'N/A'}</div>
                                <div style="margin-bottom: 8px;"><strong>Pick-up Location:</strong> ${branch || 'Branch'}, ${location || 'N/A'}</div>
                                ${(latitude && longitude) ? `
                                    <div style="margin-top: 15px; margin-bottom: 20px;">
                                        <a href="https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}" target="_blank" style="display:inline-block; padding: 10px 20px; background-color: #ffffff; color: #10b981; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px; border: 1px solid #10b981;">
                                            📍 View on Map
                                        </a>
                                    </div>
                                ` : ''}
                                <div style="margin-bottom: 8px;"><strong>Order Ref:</strong> #${orderId}</div>
                            </div>
                            
                            ${isReadyStatus ? `
                                <div style="border-top: 1px dashed #cbd5e1; padding-top: 15px;">
                                    <p style="font-weight: bold; font-size: 14px; margin-bottom: 10px; color: #0f172a;">Show this Code to Pickup</p>
                                    <img src="${qrCodeUrl}" alt="QR Code" class="qr-image">
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 Bezaw Curbside Service | Tech5 Ethiopia</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await primaryTransporter.sendMail(mailOptions);
        logToFile(`✅ [Gift Email] Sent successfully to ${to} via Primary.`);
        return true;
    } catch (primaryErr) {
        try {
            await fallbackTransporter.sendMail({
                ...mailOptions,
                from: `"Bezaw Curbside Gifts (Fallback)" <${process.env.EMAIL_USER}>`
            });
            logToFile(`✅ [Gift Email] Sent to ${to} via Gmail Fallback.`);
            return true;
        } catch (fallbackErr) {
            logToFile(`❌ [Gift Email Fail] All SMTP servers failed: ${fallbackErr.message}`);
            return false;
        }
    }
}

async function sendOTPEmail(to, otpCode) {
    if (!to) return false;

    const possiblePaths = [
        path.join(__dirname, '../../public/logo.png'),
        path.join(__dirname, '../public/logo.png'),
        path.join(process.cwd(), 'public/logo.png'),
        path.join(process.cwd(), 'logo.png'),
        path.join(process.cwd(), '../public_html/logo.png'),
        path.join(__dirname, '../../../public_html/logo.png')
    ];

    let finalLogoPath = null;
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            finalLogoPath = p;
            break;
        }
    }

    const attachments = [];
    if (finalLogoPath) {
        attachments.push({ filename: 'logo.png', path: finalLogoPath, cid: 'bezawlogo' });
    }

    const mailOptions = {
        from: `"Bezaw Curbside Security" <${process.env.SUPPORT_EMAIL_USER || process.env.EMAIL_USER}>`,
        to: to,
        subject: `Password Reset Code: ${otpCode}`,
        attachments: attachments,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Arial, sans-serif; }
                    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
                    .header { background: #10b981; padding: 40px 20px; text-align: center; }
                    .logo-img { height: 60px; width: auto; margin-bottom: 15px; }
                    .content { padding: 40px 30px; color: #1e293b; line-height: 1.6; text-align: center; }
                    h1 { margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 1px; }
                    .otp-box { background: #f1f5f9; padding: 20px; border-radius: 10px; border: 1px dashed #10b981; margin: 30px auto; max-width: 250px; font-size: 36px; font-weight: 900; letter-spacing: 5px; color: #0f172a; }
                    .warning { font-size: 13px; color: #ef4444; margin-top: 20px; }
                    .footer { background: #f1f5f9; padding: 30px; text-align: center; color: #64748b; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="cid:bezawlogo" alt="Bezaw Curbside" class="logo-img">
                        <h1>Password Reset</h1>
                    </div>
                    <div class="content">
                        <p style="font-size: 16px; color: #475569;">You requested to reset your password. Use the following 6-digit code to proceed:</p>
                        
                        <div class="otp-box">
                            ${otpCode}
                        </div>
                        
                        <p style="font-size: 14px; color: #64748b;">This code will expire in 10 minutes.</p>
                        <p class="warning">If you did not request a password reset, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 Bezaw Curbside Service | Tech5 Ethiopia</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await primaryTransporter.sendMail(mailOptions);
        logToFile(`✅ [OTP Email] Sent successfully to ${to} via Primary.`);
        return true;
    } catch (primaryErr) {
        try {
            await fallbackTransporter.sendMail({
                ...mailOptions,
                from: `"Bezaw Curbside Security (Fallback)" <${process.env.EMAIL_USER}>`
            });
            logToFile(`✅ [OTP Email] Sent to ${to} via Gmail Fallback.`);
            return true;
        } catch (fallbackErr) {
            logToFile(`❌ [OTP Email Fail] All SMTP servers failed: ${fallbackErr.message}`);
            return false;
        }
    }
}

module.exports = { sendStatusEmail, sendGiftEmail, sendOTPEmail, logToFile };
