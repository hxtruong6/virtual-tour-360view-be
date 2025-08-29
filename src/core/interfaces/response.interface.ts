import { type Path } from 'nestjs-i18n';

import { type I18nTranslations } from './i18n.interface';

export interface ITranslatedMessage {
	translateKey: Path<I18nTranslations>;
	args?: Record<string, unknown>;
}

export interface IApiResponse<T = void> {
	data?: T;
	message?: ITranslatedMessage;
	error?: ITranslatedMessage;
}

export interface IApiListResponse<T> {
	data: T[];
	message?: ITranslatedMessage;
	error?: ITranslatedMessage;
	meta?: {
		total: number;
		page: number;
		limit: number;
	};
}
