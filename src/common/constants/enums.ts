export enum PostgresErrorCode {
	NotNullViolation = '23502',
}
export const DEFAULT_USER_FILTER_DISTANCE_IN_M = 20_000; // 20 km
export const POSTGIS_SRID = 4326;

export const OTP_EXPIRY_IN_SECONDS = 60; // 60 seconds
export const OTP_DEFAULT_CODE = '6960';

export enum ETranslateKey {
	ADMIN_WELCOME = 'common.admin.welcome',
}

export enum EPaymongoWebhookEvent {
	// SOURCE_CHARGEABLE = 'source.chargeable',
	// PAYMENT_PAID = 'payment.paid',
	// PAYMENT_FAILED = 'payment.failed',
	// PAYMENT_REFUNDED = 'payment.refunded',
	// PAYMENT_REFUND_UPDATED = 'payment.refund.updated',
	LINK_PAYMENT_PAID = 'link.payment.paid',
	// CHECKOUT_SESSION_PAYMENT_PAID = 'checkout_session.payment.paid',
	// QRPH_EXPIRED = 'qrph.expired',
}

export enum EPaymongoWebhookPaymentStatus {
	PAID = 'paid',
	FAILED = 'failed',
	REFUNDED = 'refunded',
	REFUND_UPDATED = 'refund.updated',
}

export enum EResource {
	DASHBOARD = 'dashboard',
	BOOKINGS = 'bookings',
	USERS = 'users',
	ROLES = 'roles',
	PERMISSIONS = 'permissions',
	VOUCHERS = 'vouchers',
	WITHDRAWALS = 'withdrawals',
	WALLET = 'wallet',
	PRICE_FORMULA = 'price_formula',
}

export enum EAction {
	CREATE = 'create',
	READ = 'read',
	UPDATE = 'update',
	DELETE = 'delete',
	IMPORT = 'import',
	EXPORT = 'export',
}

export const PERMISSIONS = {
	[EResource.DASHBOARD]: {
		[EAction.READ]: 'read_dashboard',
	},
	[EResource.USERS]: {
		[EAction.READ]: 'read_users',
		[EAction.CREATE]: 'create_users',
		[EAction.UPDATE]: 'update_users',
		[EAction.DELETE]: 'delete_users',
	},
	[EResource.BOOKINGS]: {
		[EAction.READ]: 'read_bookings',
		[EAction.CREATE]: 'create_bookings',
		[EAction.UPDATE]: 'update_bookings',
		[EAction.DELETE]: 'delete_bookings',
	},
	[EResource.ROLES]: {
		[EAction.READ]: 'read_roles',
		[EAction.CREATE]: 'create_roles',
		[EAction.UPDATE]: 'update_roles',
		[EAction.DELETE]: 'delete_roles',
	},
	[EResource.PERMISSIONS]: {
		[EAction.READ]: 'read_permissions',
		[EAction.CREATE]: 'create_permissions',
		[EAction.UPDATE]: 'update_permissions',
		[EAction.DELETE]: 'delete_permissions',
	},
	[EResource.VOUCHERS]: {
		[EAction.READ]: 'read_vouchers',
		[EAction.CREATE]: 'create_vouchers',
		[EAction.UPDATE]: 'update_vouchers',
		[EAction.DELETE]: 'delete_vouchers',
	},
	[EResource.WITHDRAWALS]: {
		[EAction.READ]: 'read_withdrawals',
		[EAction.CREATE]: 'create_withdrawals',
		[EAction.UPDATE]: 'update_withdrawals',
		[EAction.DELETE]: 'delete_withdrawals',
	},
	[EResource.WALLET]: {
		[EAction.READ]: 'read_wallet',
		[EAction.CREATE]: 'create_wallet',
		[EAction.UPDATE]: 'update_wallet',
		[EAction.DELETE]: 'delete_wallet',
	},
	[EResource.PRICE_FORMULA]: {
		[EAction.READ]: 'read_price_formula',
		[EAction.CREATE]: 'create_price_formula',
		[EAction.UPDATE]: 'update_price_formula',
		[EAction.DELETE]: 'delete_price_formula',
	},
};

export enum ENotificationTemplate {
	USER_REGISTERED = 'user_registered',
	USER_VERIFIED = 'user_verified',

	BOOKING_CREATED = 'booking_created',
	BOOKING_UPDATED = 'booking_updated',
	BOOKING_CANCELLED = 'booking_cancelled',
	BOOKING_COMPLETED = 'booking_completed',
	BOOKING_CONFIRMED = 'booking_confirmed',
	BOOKING_REJECTED = 'booking_rejected',
}

export enum EVersion {
	V1 = '1',
}
