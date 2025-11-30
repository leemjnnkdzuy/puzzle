import nodemailer from "nodemailer";

const createTransporter = () => {
	const smtpUser = process.env.SMTP_USER;
	const smtpPass = process.env.SMTP_PASS;

	if (!smtpUser || !smtpPass) {
		throw new Error(
			"SMTP credentials are missing. Please set SMTP_USER and SMTP_PASS in your .env file."
		);
	}

	return nodemailer.createTransport({
		host: process.env.SMTP_HOST || "smtp.gmail.com",
		port: parseInt(process.env.SMTP_PORT || "587"),
		secure: process.env.SMTP_SECURE === "true",
		auth: {
			user: smtpUser,
			pass: smtpPass,
		},
	});
};

export const sendVerificationEmail = async (
	email: string,
	verificationCode: string,
	firstName?: string
): Promise<void> => {
	try {
		const transporter = createTransporter();
		const appName = process.env.APP_NAME || "Puzzle";

		const mailOptions = {
			from: `"${appName}" <${process.env.SMTP_USER}>`,
			to: email,
			subject: "Verify Your Email Address",
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
					<h2 style="color: #333;">Email Verification</h2>
					<p>Hello ${firstName || "there"},</p>
					<p>Thank you for registering with ${appName}!</p>
					<p>Please use the following verification code to verify your email address:</p>
					<div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
						<h1 style="color: #007bff; margin: 0; font-size: 32px; letter-spacing: 5px;">${verificationCode}</h1>
					</div>
					<p>This code will expire in 24 hours.</p>
					<p>If you didn't create an account, please ignore this email.</p>
					<hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
					<p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
				</div>
			`,
		};

		await transporter.sendMail(mailOptions);
	} catch (error) {
		throw error;
	}
};

export const sendResetCodeEmail = async (
	email: string,
	resetCode: string,
	firstName?: string
): Promise<void> => {
	try {
		const transporter = createTransporter();
		const appName = process.env.APP_NAME || "Puzzle";

		const mailOptions = {
			from: `"${appName}" <${process.env.SMTP_USER}>`,
			to: email,
			subject: "Password Reset Code",
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
					<h2 style="color: #333;">Password Reset</h2>
					<p>Hello ${firstName || "there"},</p>
					<p>You requested to reset your password for your ${appName} account.</p>
					<p>Please use the following code to reset your password:</p>
					<div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
						<h1 style="color: #dc3545; margin: 0; font-size: 32px; letter-spacing: 5px;">${resetCode}</h1>
					</div>
					<p>This code will expire in 1 hour.</p>
					<p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
					<hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
					<p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
				</div>
			`,
		};

		await transporter.sendMail(mailOptions);
	} catch (error) {
		throw error;
	}
};
