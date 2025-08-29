export interface ITranslateMessage {
	translateKey: keyof I18nTranslations;
	args?: Record<string, unknown>;
	lang?: string;
	defaultValue?: string;
}

export interface I18nTranslations {
	errors: {
		not_found: string;
		unauthorized: string;
		forbidden: string;
		validation_error: string;
		internal_server_error: string;
		password_invalid_characters: string;
		field_required: string;
		phone_required: string;
		email_required: string;
	};
	success: {
		created: string;
		updated: string;
		deleted: string;
		retrieved: string;
	};
	validation: {
		required: string;
		invalid_email: string;
		min_length: string;
		max_length: string;
	};
	auth: {
		messages: {
			login_success: string;
			logout_success: string;
			register_success: string;
		};
		errors: {
			invalid_request: string;
			usertype_required: string;
			invalid_usertype: string;
			phone_required: string;
			invalid_phone: string;
			invalid_credentials: string;
			validation_error: string;
			invalid_otp: string;
		};
		validation: {
			phone_required: string;
			password_required: string;
			email_required: string;
			name_required: string;
		};
	};
	user: {
		messages: {
			profile: {
				updated: string;
				not_found: string;
			};
			card: {
				created: string;
				updated: string;
				deleted: string;
				not_found: string;
			};
			account: {
				status: {
					active: string;
					inactive: string;
					pending: string;
					new: string;
					deactivated: string;
				};
			};
			expert: {
				status: {
					pending: string;
					approved: string;
					rejected: string;
				};
			};
		};
		errors: {
			already_exists: string;
			not_found: string;
			invalid_phone: string;
			invalid_password: string;
			invalid_referral: string;
			emergency_contact: string;
		};
	};
	booking: {
		status: {
			pending: string;
			confirmed: string;
			cancelled: string;
			completed: string;
			draft: string;
			in_progress: string;
			cancel_by_customer: string;
			cancel_by_expert: string;
			cancel_by_admin: string;
		};
		messages: {
			created: string;
			updated: string;
			cancelled: string;
			not_found: string;
			already_cancelled: string;
			cannot_cancel: string;
			cannot_modify: string;
			expert_assigned: string;
			expert_rejected: string;
			expert_accepted: string;
			expert_arrived: string;
			expert_completed: string;
			work_shift_assigned: string;
			invalid_car_model: string;
			dangerous_level_calculated: string;
			deleted: string;
		};
		validation: {
			invalid_date: string;
			past_date: string;
			unavailable: string;
			overlap: string;
			invalid_status: string;
			invalid_action: string;
		};
		errors: {
			not_created: string;
			expert_not_found: string;
			invalid_expert_status: string;
			invalid_booking_status: string;
		};
	};
	admin: {
		test: string;
	};
}

export const i18nKeys = {
	errors: {
		passwordInvalidCharacters: 'common.errors.password_invalid_characters',
		fieldRequired: 'common.errors.field_required',
		phoneRequired: 'common.errors.phone_required',
		emailRequired: 'common.errors.email_required',
	},
	auth: {
		messages: {
			loginSuccess: 'auth.messages.login_success',
			logoutSuccess: 'auth.messages.logout_success',
			registerSuccess: 'auth.messages.register_success',
		},
		errors: {
			invalidRequest: 'auth.errors.invalid_request',
			usertypeRequired: 'auth.errors.usertype_required',
			invalidUsertype: 'auth.errors.invalid_usertype',
			phoneRequired: 'auth.errors.phone_required',
			invalidPhone: 'auth.errors.invalid_phone',
			invalidCredentials: 'auth.errors.invalid_credentials',
			validationError: 'auth.errors.validation_error',
			invalidOtp: 'auth.errors.invalid_otp',
		},
		validation: {
			fieldRequired: 'auth.validation.field_required',
			phoneRequired: 'auth.validation.phone_required',
			passwordRequired: 'auth.validation.password_required',
			emailRequired: 'auth.validation.email_required',
			nameRequired: 'auth.validation.name_required',
		},
	},
	user: {
		messages: {
			profile: {
				updated: 'user.messages.profile.updated',
				not_found: 'user.messages.profile.not_found',
			},
			card: {
				created: 'user.messages.card.created',
				updated: 'user.messages.card.updated',
				deleted: 'user.messages.card.deleted',
				not_found: 'user.messages.card.not_found',
			},
			account: {
				status: {
					active: 'user.messages.account.status.active',
					inactive: 'user.messages.account.status.inactive',
				},
			},
		},
		errors: {
			alreadyExists: 'user.errors.already_exists',
			notFound: 'user.errors.not_found',
			invalidPhone: 'user.errors.invalid_phone',
			invalidPassword: 'user.errors.invalid_password',
			invalidReferral: 'user.errors.invalid_referral',
			forbidden: 'user.errors.forbidden',
			emergencyContact: 'user.errors.emergency_contact',
		},
	},
	notification: {
		booking: {
			assigned: {
				title: 'notification.booking.assigned.title',
				message: 'notification.booking.assigned.message',
			},
			customerWaitingForPayment: {
				title: 'notification.booking.customer_waiting_for_payment.title',
				message: 'notification.booking.customer_waiting_for_payment.message',
			},
			active: {
				title: 'notification.booking.active.title',
				message: 'notification.booking.active.message',
			},
			completed: {
				title: 'notification.booking.completed.title',
				message: 'notification.booking.completed.message',
			},
			cancelled: {
				title: 'notification.booking.cancelled.title',
				message: 'notification.booking.cancelled.message',
			},
			expertRejected: {
				title: 'notification.booking.expert_rejected.title',
				message: 'notification.booking.expert_rejected.message',
			},
			refundVoucher: {
				title: 'notification.booking.refund_voucher.title',
				message: 'notification.booking.refund_voucher.message',
			},
			requestComplete: {
				title: 'notification.booking.request_complete.title',
				message: 'notification.booking.request_complete.message',
			},
			requestAdminArrangeWorkShift: {
				title: 'notification.booking.request_admin_arrange_work_shift.title',
				message:
					'notification.booking.request_admin_arrange_work_shift.message',
			},
			bookingIsActive: {
				title: 'notification.booking.booking_is_active.title',
				message: 'notification.booking.booking_is_active.message',
			},
			expertRequestingComplete: {
				title: 'notification.booking.expert_requesting_complete.title',
				message: 'notification.booking.expert_requesting_complete.message',
			},
			paymentVerified: {
				title: 'notification.booking.payment_verified.title',
				message: 'notification.booking.payment_verified.message',
			},
			cancelledByAdmin: {
				title: 'notification.booking.cancelled_by_admin.title',
				message: 'notification.booking.cancelled_by_admin.message',
			},
			bookingCompleted: {
				title: 'notification.booking.booking_completed.title',
				message: 'notification.booking.booking_completed.message',
			},
			carInfoUpdated: {
				title: 'notification.booking.car_info_updated.title',
				message: 'notification.booking.car_info_updated.message',
			},
		},
		payment: {
			paymentPaid: {
				title: 'notification.payment.payment_paid.title',
				message: 'notification.payment.payment_paid.message',
			},
			paymentPaidToAdmin: {
				title: 'notification.payment.payment_paid_to_admin.title',
				message: 'notification.payment.payment_paid_to_admin.message',
			},
			paymentByCash: {
				title: 'notification.payment.payment_by_cash.title',
				message: 'notification.payment.payment_by_cash.message',
			},
			paymentByPaymongo: {
				title: 'notification.payment.payment_by_paymongo.title',
				message: 'notification.payment.payment_by_paymongo.message',
			},
			success: {
				title: 'notification.payment.success.title',
				message: 'notification.payment.success.message',
			},
			failed: {
				title: 'notification.payment.failed.title',
				message: 'notification.payment.failed.message',
			},
			informToAdminVerifyPayment: {
				title: 'notification.payment.inform_to_admin_verify_payment.title',
				message: 'notification.payment.inform_to_admin_verify_payment.message',
			},
		},
		wallet: {
			withdrawalRequestApproved: {
				title: 'notification.wallet.withdrawal_request_approved.title',
				message: 'notification.wallet.withdrawal_request_approved.message',
			},
			withdrawalRequestRejected: {
				title: 'notification.wallet.withdrawal_request_rejected.title',
				message: 'notification.wallet.withdrawal_request_rejected.message',
			},
		},
	},
	payment: {
		booking: {
			alreadyPaid: 'payment.booking.already_paid',
			notFound: 'payment.booking.not_found',
			customerNotFound: 'payment.booking.customer_not_found',
			invalidStatus: 'payment.booking.invalid_status',
			amountNotMatch: 'payment.booking.amount_not_match',
		},
		voucher: {
			duplicate: 'payment.voucher.duplicate',
			invalid: 'payment.voucher.invalid',
			invalidUsage: 'payment.voucher.invalid_usage',
			invalidStatus: 'payment.voucher.invalid_status',
		},
	},
} as const;
