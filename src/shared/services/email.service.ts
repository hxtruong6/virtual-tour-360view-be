import { Injectable, Logger } from '@nestjs/common';
import * as ejs from 'ejs';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import * as nodemailer from 'nodemailer';

import { ApiConfigService } from './api-config.service';

interface IEmailOptions {
	to: string | string[];
	subject: string;
	template: string;
	context?: Record<string, unknown>;
	attachments?: Array<{
		filename: string;
		content: string | Buffer;
		contentType?: string;
	}>;
}

@Injectable()
export class EmailService {
	private readonly logger = new Logger(EmailService.name);

	private transporter!: nodemailer.Transporter;

	private readonly templateDir: string;

	constructor(private configService: ApiConfigService) {
		this.templateDir = path.join(process.cwd(), 'src/shared/email-templates');
		this.initializeTransporter();
	}

	private initializeTransporter() {
		this.transporter = nodemailer.createTransport({
			host: this.configService.emailConfig.host,
			port: this.configService.emailConfig.port,
			secure: this.configService.emailConfig.secure,
			auth: {
				user: this.configService.emailConfig.user,
				pass: this.configService.emailConfig.pass,
			},
		});
	}

	private async loadTemplate(templateName: string): Promise<string> {
		const templatePath = path.join(this.templateDir, `${templateName}.ejs`);

		try {
			return await fs.readFile(templatePath, 'utf8');
		} catch {
			throw new Error(`Template ${templateName} not found`);
		}
	}

	private async renderTemplate(
		template: string,
		context: Record<string, unknown> = {},
	): Promise<string> {
		try {
			return await ejs.render(template, context, { async: true });
		} catch (error) {
			this.logger.error(`Failed to render template: ${error}`);

			throw new Error(`Mail service error.`);
		}
	}

	async sendMail(options: IEmailOptions): Promise<boolean> {
		try {
			const template = await this.loadTemplate(options.template);
			const html = await this.renderTemplate(template, options.context);

			console.info('xxx 171 sendMail html:', html);

			await this.transporter.sendMail({
				from: this.configService.emailConfig.fromEmail,
				to: options.to,
				subject: options.subject,
				html,
				attachments: options.attachments,
			});

			return true;
		} catch (error) {
			console.error('Failed to send email:', error);

			return false;
		}
	}

	// Utility method for sending welcome emails
	async sendWelcomeEmail(to: string, userName: string): Promise<boolean> {
		return this.sendMail({
			to,
			subject: 'Welcome to Our Platform',
			template: 'welcome',
			context: {
				userName,
				loginUrl: this.configService.appConfig.frontendUrl,
			},
		});
	}

	async sendOTPCodeEmail(
		to: string,
		data: {
			otpCode: string;
			expiryTime: string;
			fullName: string;
		},
	): Promise<boolean> {
		console.info('xxx 170 sendOTPCodeEmail data:', { to, data });

		return this.sendMail({
			to,
			subject: 'CWGame Asia - OTP Code',
			template: 'otp-code',
			context: {
				otpCode: data.otpCode,
				expiryTime: data.expiryTime,
				fullName: data.fullName,
			},
		});
	}

	// Utility method for sending password reset emails
	// async sendPasswordResetEmail(
	// 	to: string,
	// 	resetToken: string,
	// ): Promise<boolean> {
	// 	const resetUrl = `${this.configService.get<string>('APP_URL')}/reset-password?token=${resetToken}`;

	// 	return this.sendMail({
	// 		to,
	// 		subject: 'Password Reset Request',
	// 		template: 'password-reset',
	// 		context: {
	// 			resetUrl,
	// 			expiryTime: '1 hour',
	// 		},
	// 	});
	// }

	// Utility method for sending booking confirmation emails
	async sendBookingConfirmationEmail(
		to: string,
		bookingDetails: {
			id: string;
			date: string;
			time: string;
			location: string;
			service: string;
			name: string;
		},
	): Promise<boolean> {
		return this.sendMail({
			to,
			subject: `Booking Confirmation - ${bookingDetails.name}`,
			template: 'booking-confirmation',
			context: {
				bookingId: bookingDetails.id,
				bookingDate: bookingDetails.date,
				bookingTime: bookingDetails.time,
				location: bookingDetails.location,
				service: bookingDetails.service,
			},
		});
	}
}
