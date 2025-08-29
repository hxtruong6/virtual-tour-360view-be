import { i18nKeys } from '../../core/interfaces';

export enum ENotificationCategory {
	BOOKING = 'booking',
	WALLET = 'wallet',
	PAYMENT = 'payment',
}

export enum ENotificationType {
	INFO = 'info',
	WARNING = 'warning',
	ERROR = 'error',
}

export const notificationTemplates = {
	booking: {
		assignExpert: {
			title: 'New booking assigned',
			message: 'You have been assigned to a new booking {{displayId}}',
			shouldNotifyAdmin: false,
			category: ENotificationCategory.BOOKING,
			type: ENotificationType.INFO,
			titleKey: i18nKeys.notification.booking.assigned.title,
			messageKey: i18nKeys.notification.booking.assigned.message,
		},
		customerWaitingForPayment: {
			title: 'Your booking {{displayId}} is waiting for payment',
			message:
				'Please make a payment to confirm your booking. Our team will process your booking after the payment is confirmed.',
			shouldNotifyAdmin: false,
			category: ENotificationCategory.BOOKING,
			type: ENotificationType.INFO,
			titleKey: i18nKeys.notification.booking.customerWaitingForPayment.title,
			messageKey:
				i18nKeys.notification.booking.customerWaitingForPayment.message,
		},
		expertRejected: {
			title: '[{{displayId}}] Expert Rejected Booking',
			message:
				'Expert {{expertName}} has rejected the booking assignment for booking {{displayId}}',
			shouldNotifyAdmin: true,
			category: ENotificationCategory.BOOKING,
			type: ENotificationType.INFO,
			titleKey: i18nKeys.notification.booking.expertRejected.title,
			messageKey: i18nKeys.notification.booking.expertRejected.message,
		},
		requestAdminArrangeWorkShift: {
			title: '[{{displayId}}] Request to arrange work shift',
			message:
				'Booking {{displayId}} has been requested for admin to arrange work shift',
			shouldNotifyAdmin: true,
			category: ENotificationCategory.BOOKING,
			type: ENotificationType.INFO,
			titleKey:
				i18nKeys.notification.booking.requestAdminArrangeWorkShift.title,
			messageKey:
				i18nKeys.notification.booking.requestAdminArrangeWorkShift.message,
		},
		bookingIsActive: {
			title: 'Booking {{displayId}} is active',
			message: 'Your booking {{displayId}} is now active',
			shouldNotifyAdmin: false,
			category: ENotificationCategory.BOOKING,
			type: ENotificationType.INFO,
			titleKey: i18nKeys.notification.booking.bookingIsActive.title,
			messageKey: i18nKeys.notification.booking.bookingIsActive.message,
		},
		expertRequestingComplete: {
			title: 'Booking {{displayId}} is requesting to be completed',
			message: 'The expert has requested to complete the booking {{displayId}}',
			shouldNotifyAdmin: true,
			category: ENotificationCategory.BOOKING,
			type: ENotificationType.INFO,
			titleKey: i18nKeys.notification.booking.expertRequestingComplete.title,
			messageKey:
				i18nKeys.notification.booking.expertRequestingComplete.message,
		},
		refundVoucher: {
			title: 'Refund Voucher Issued',
			message: 'A refund voucher has been issued for booking {{displayId}}',
			shouldNotifyAdmin: false,
			category: ENotificationCategory.BOOKING,
			type: ENotificationType.INFO,
			titleKey: i18nKeys.notification.booking.refundVoucher.title,
			messageKey: i18nKeys.notification.booking.refundVoucher.message,
		},
		paymentVerified: {
			title: '[{{displayId}}] Payment Verified',
			message: 'Your booking {{displayId}} is verified payment',
			shouldNotifyAdmin: false,
			category: ENotificationCategory.BOOKING,
			type: ENotificationType.INFO,
			titleKey: i18nKeys.notification.booking.paymentVerified.title,
			messageKey: i18nKeys.notification.booking.paymentVerified.message,
		},
		cancelledByAdmin: {
			title: '[{{displayId}}] Booking Cancelled by Admin',
			message: 'Your booking {{displayId}} has been cancelled by admin',
			shouldNotifyAdmin: false,
			category: ENotificationCategory.BOOKING,
			type: ENotificationType.INFO,
			titleKey: i18nKeys.notification.booking.cancelledByAdmin.title,
			messageKey: i18nKeys.notification.booking.cancelledByAdmin.message,
		},
		bookingCompleted: {
			title: '[{{displayId}}] Booking Completed',
			message: 'Your booking {{displayId}} has been completed',
			shouldNotifyAdmin: false,
			category: ENotificationCategory.BOOKING,
			type: ENotificationType.INFO,
			titleKey: i18nKeys.notification.booking.bookingCompleted.title,
			messageKey: i18nKeys.notification.booking.bookingCompleted.message,
		},
		carInfoUpdated: {
			title: '[{{displayId}}] Car Info Updated',
			message:
				'Your booking {{displayId}} has been updated with car license plate {{licensePlate}}',
			shouldNotifyAdmin: false,
			category: ENotificationCategory.BOOKING,
			type: ENotificationType.INFO,
			titleKey: i18nKeys.notification.booking.carInfoUpdated.title,
			messageKey: i18nKeys.notification.booking.carInfoUpdated.message,
		},
	},
	wallet: {
		withdrawalRequestApproved: {
			title: 'Withdrawal Request Approved',
			message: 'Your withdrawal request has been approved by admin.',
			shouldNotifyAdmin: true,
			category: ENotificationCategory.WALLET,
			type: ENotificationType.INFO,
			titleKey: i18nKeys.notification.wallet.withdrawalRequestApproved.title,
			messageKey:
				i18nKeys.notification.wallet.withdrawalRequestApproved.message,
		},
		withdrawalRequestRejected: {
			title: 'Withdrawal Request Rejected',
			message: 'Your withdrawal request has been rejected by admin.',
			shouldNotifyAdmin: true,
			category: ENotificationCategory.WALLET,
			type: ENotificationType.INFO,
			titleKey: i18nKeys.notification.wallet.withdrawalRequestRejected.title,
			messageKey:
				i18nKeys.notification.wallet.withdrawalRequestRejected.message,
		},
	},

	payment: {
		paymentByCash: {
			title: '[{{displayId}}] Payment by Cash request',
			message:
				'You need to contact the admin to make a payment for booking {{displayId}}',
			shouldNotifyAdmin: false,
			category: ENotificationCategory.PAYMENT,
			type: ENotificationType.INFO,
			titleKey: i18nKeys.notification.payment.paymentByCash.title,
			messageKey: i18nKeys.notification.payment.paymentByCash.message,
		},
		paymentByPaymongo: {
			title: '[{{displayId}}] Payment online request',
			message:
				'Access the payment link to make a payment for booking {{displayId}}',
			shouldNotifyAdmin: false,
			category: ENotificationCategory.PAYMENT,
			type: ENotificationType.INFO,
			titleKey: i18nKeys.notification.payment.paymentByPaymongo.title,
			messageKey: i18nKeys.notification.payment.paymentByPaymongo.message,
		},
		informToAdminVerifyPayment: {
			title: '[{{displayId}}] Payment request to be verified',
			message:
				'The booking {{displayId}} has been requested to be verified payment by admin',
			shouldNotifyAdmin: true,
			category: ENotificationCategory.PAYMENT,
			type: ENotificationType.INFO,
			titleKey: i18nKeys.notification.payment.informToAdminVerifyPayment.title,
			messageKey:
				i18nKeys.notification.payment.informToAdminVerifyPayment.message,
		},
		paymentPaid: {
			title: '[{{displayId}}] Payment paid successfully',
			message:
				'Your booking {{displayId}} has been paid {{amount}} successfully',
			shouldNotifyAdmin: false,
			category: ENotificationCategory.PAYMENT,
			type: ENotificationType.INFO,
			titleKey: i18nKeys.notification.payment.paymentPaid.title,
			messageKey: i18nKeys.notification.payment.paymentPaid.message,
		},
		paymentPaidToAdmin: {
			title: '[{{displayId}}] Booking is paid by customer successfully',
			message:
				'The booking {{displayId}} has been paid {{amount}} by customer successfully',
			shouldNotifyAdmin: true,
			category: ENotificationCategory.PAYMENT,
			type: ENotificationType.INFO,
			titleKey: i18nKeys.notification.payment.paymentPaidToAdmin.title,
			messageKey: i18nKeys.notification.payment.paymentPaidToAdmin.message,
		},
	},
};
