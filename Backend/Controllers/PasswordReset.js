import Users from "../Models/ModelUser.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

const emailDomain = "@students.satyaterrabhinneka.ac.id";

// Configure transporter using env variables
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const requestReset = async (req, res) => {
    const { nim } = req.body;
    try {
        const user = await Users.findOne({ where: { nim } });
        if (!user) {
            return res.status(404).json({ msg: "User with this NIM not found" });
        }

        const email = `${nim}${emailDomain}`;

        // Generate a reset token valid for 30 minutes
        const resetToken = jwt.sign(
            { userId: user.id },
            process.env.ACCESS_TOKEN_SECRET, // Reusing secret or use a dedicated one
            { expiresIn: '30m' }
        );

        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        const mailOptions = {
            from: `"DofE System" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Password Reset Request - DofE System",
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2>Password Reset Request</h2>
                    <p>Hello ${user.nama},</p>
                    <p>You requested a password reset for your DofE System account.</p>
                    <p>Click the link below to reset your password. This link will expire in 30 minutes.</p>
                    <div style="margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
                    </div>
                    <p>If you did not request this, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
                    <p style="font-size: 12px; color: #888;">This is an automated message, please do not reply.</p>
                </div>
            `,
        };

        // If SMTP isn't configured, we'll just log it for now to avoid crashing in dev
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log("--- DEVELOPMENT MODE: Reset Link ---");
            console.log(`To: ${email}`);
            console.log(`Link: ${resetLink}`);
            console.log("-----------------------------------");
            return res.json({ msg: "Reset link generated (check server logs for link as SMTP is not configured)" });
        }

        await transporter.sendMail(mailOptions);
        res.json({ msg: "Password reset link has been sent to your student email" });
    } catch (error) {
        console.error("Request reset error:", error);
        res.status(500).json({ msg: "Failed to send reset email" });
    }
};

export const resetPassword = async (req, res) => {
    const { token, password, confPass } = req.body;

    if (password !== confPass) {
        return res.status(400).json({ msg: "Passwords do not match" });
    }

    // Reuse validation logic
    if (password.length < 8) {
        return res.status(400).json({ msg: "Password must be at least 8 characters long" });
    }

    const alphanumericRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(password)) {
        return res.status(400).json({ msg: "Password must be alphanumeric (letters and numbers only) with no special characters" });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userId = decoded.userId;

        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);

        await Users.update({ password: hashPassword }, {
            where: { id: userId }
        });

        res.json({ msg: "Password has been successfully reset. You can now login with your new password." });
    } catch (error) {
        console.error("Reset password error:", error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: "Reset link has expired" });
        }
        res.status(401).json({ msg: "Invalid or expired reset link" });
    }
};
