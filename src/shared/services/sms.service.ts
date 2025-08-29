/* eslint-disable max-len */
import { Injectable, Logger } from '@nestjs/common';
import { MailtrapClient } from 'mailtrap';
import { TwilioService } from 'nestjs-twilio';

import { ApiConfigService } from './api-config.service';

@Injectable()
export class SMSService {
	private readonly mailtrapClient: MailtrapClient;

	private readonly logger = new Logger(SMSService.name);

	constructor(
		private readonly twilioService: TwilioService,
		private readonly apiConfigService: ApiConfigService,
	) {
		this.mailtrapClient = new MailtrapClient({
			token: this.apiConfigService.mailtrapConfig.token,
		});
	}

	private templateEmail = {
		otp: (fullName: string, otp: string) => `
					<!DOCTYPE html>
					<html>
					<head>
						<meta charset="UTF-8">
						<meta name="viewport" content="width=device-width, initial-scale=1.0">
					</head>
					<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
						<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="min-width: 100%; background-color: #f4f4f4;">
							<tr>
								<td align="center" style="padding: 40px 0;">
									<table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
										<tr>
											<td style="padding: 40px 30px;">
												<h1 style="color: #333333; font-size: 24px; margin: 0 0 20px; text-align: center;">CWGame - Verification Code</h1>
												<p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 20px;">
													Hi, ${fullName}<br><br>
													Your verification code is:
												</p>
												<p style="text-align: center; margin: 30px 0;">
													<span style="font-family: monospace; background-color: #f8f8f8; padding: 12px 30px; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #333333; border-radius: 4px; border: 1px solid #dddddd;">
														${otp}
													</span>
												</p>
												<p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 20px;">
													This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
												</p>
												<hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
												<p style="color: #999999; font-size: 13px; line-height: 21px; margin: 0;">
													This is an automated message, please do not reply to this email.
												</p>
											</td>
										</tr>
									</table>
								</td>
							</tr>
						</table>
					</body>
					</html>
				`,
	};

	async sendSmsOtp(phoneNumber: string, otp: string): Promise<void> {
		const fromPhoneNumber = this.apiConfigService.twilioConfig.phoneNumber;
		const recipientPhoneNumber =
			this.apiConfigService.isDevelopment ?
				this.apiConfigService.twilioConfig.recipientPhoneNumber
			:	phoneNumber;

		try {
			await this.twilioService.client.messages.create({
				body: `Your OTP is: ${otp}`,
				from: fromPhoneNumber,
				to: recipientPhoneNumber,
			});
		} catch (error) {
			console.error('Error sending SMS:', error);

			throw new Error('Failed to send SMS OTP');
		}
	}

	async sendEmailOtp({
		email,
		otp,
		fullName,
	}: {
		email: string;
		otp: string;
		fullName: string;
	}): Promise<void> {
		try {
			await this.mailtrapClient.send({
				from: {
					email: this.apiConfigService.mailtrapConfig.senderEmail,
					name: this.apiConfigService.mailtrapConfig.senderName,
				},
				to: [{ email }],
				subject: 'CWGame - Verification Code',
				html: this.templateEmail.otp(fullName, otp),
				text: `Your verification code is: ${otp}\n\nThis code will expire in 10 minutes. If you didn't request this code, please ignore this email.`,
				category: 'OTP',
			});
		} catch (error) {
			this.logger.error({
				error,
				email,
				otp,
				fullName,
			});

			throw new Error('Failed to send email OTP');
		}
	}
}
