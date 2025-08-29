import { type Path } from 'nestjs-i18n';

import { type I18nTranslations } from '../core/interfaces';

export const TRANSLATE_MESSAGE_DECORATOR_KEY = 'custom:translate-message';

export interface ITranslateMessageOptions {
	key: Path<I18nTranslations>;
	args?: Record<string, unknown>;
}

export function TranslateMessage(
	options: ITranslateMessageOptions,
): PropertyDecorator {
	return (target, key) => {
		Reflect.defineMetadata(
			TRANSLATE_MESSAGE_DECORATOR_KEY,
			options,
			target,
			key,
		);
	};
}
