import {
	type ENotificationCategory,
	type ENotificationType,
} from '../entities/notification.entity';

export interface INotificationTemplate {
	title: string;
	message: string;
	shouldNotifyAdmin?: boolean;
	category: ENotificationCategory;
	type: ENotificationType;
	titleKey?: string;
	messageKey?: string;
	templateParams?: Record<string, unknown>;
}
