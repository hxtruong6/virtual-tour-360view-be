import { Injectable, Logger } from '@nestjs/common';
import { isArray, isObject, isString, map } from 'lodash';
import { I18nService, Path } from 'nestjs-i18n';

import { LanguageCode } from '../../common/constants';
import { AbstractDto } from '../../common/dto/abstract.dto';
import { ContextProvider } from '../../common/providers';
import {
	type I18nTranslations,
	type ITranslateMessage,
	type ITranslationDecoratorInterface,
} from '../../core/interfaces';
import {
	STATIC_TRANSLATION_DECORATOR_KEY,
	TRANSLATE_MESSAGE_DECORATOR_KEY,
} from '../../decorators';
import { type ITranslateMessageOptions } from '../../decorators/translate-message.decorator';

@Injectable()
export class TranslationService {
	private readonly logger = new Logger(TranslationService.name);

	constructor(private readonly i18n: I18nService<I18nTranslations>) {}

	async translate<P extends Path<I18nTranslations>>(
		key: P,
		options?: {
			args?: Record<string, unknown>;
			lang?: string;
			defaultValue?: string;
		},
	): Promise<string> {
		try {
			return await this.i18n.translate(key, {
				...options,
				lang:
					options?.lang || ContextProvider.getLanguage() || LanguageCode.en_US,
			});
		} catch {
			// Fallback to the key if translation is not found
			this.logger.warn(`Translation not found for key: ${key}`);

			return options?.defaultValue || String(key);
		}
	}

	async translateNecessaryKeys<T extends AbstractDto>(dto: T): Promise<T> {
		try {
			await Promise.all(
				map(dto, async (value, key) => {
					if (isString(value)) {
						console.info(
							'xxx 37 TranslationService translateNecessaryKeys key:',
							{
								key,
								value,
							},
						);

						// Check for TranslateMessage decorator
						// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
						const messageOptions: ITranslateMessageOptions | undefined =
							Reflect.getMetadata(TRANSLATE_MESSAGE_DECORATOR_KEY, dto, key);

						console.info('xxx 43 messageOptions:', messageOptions);

						if (messageOptions) {
							dto[key] = await this.translate(messageOptions.key, {
								args: messageOptions.args,
							});

							return;
						}

						// Check for StaticTranslate decorator
						// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
						const translateDec: ITranslationDecoratorInterface | undefined =
							Reflect.getMetadata(STATIC_TRANSLATION_DECORATOR_KEY, dto, key);

						if (translateDec) {
							const translationKey =
								`${translateDec.translationKey ?? key}.${value}` as Path<I18nTranslations>;
							dto[key] = await this.translate(translationKey);
						}

						return;
					}

					if (value instanceof AbstractDto) {
						return this.translateNecessaryKeys(value);
					}

					if (isArray(value)) {
						return Promise.all(
							map(value, (v) => {
								if (v instanceof AbstractDto) {
									return this.translateNecessaryKeys(v);
								}
							}),
						);
					}
				}),
			);

			return dto;
		} catch (error) {
			this.logger.error('Error translating keys:', error);

			return dto;
		}
	}

	async translateMessage<T extends Record<string, unknown>>(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		data: any,
	): Promise<T> {
		try {
			await Promise.all(
				map(data, async (value, key) => {
					if (
						isObject(value) &&
						// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
						(value as unknown as ITranslateMessage).translateKey
					) {
						const { translateKey, args, lang, defaultValue } =
							value as unknown as ITranslateMessage;

						// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
						data[key] = await this.translate(
							translateKey as Path<I18nTranslations>,
							{
								args,
								lang,
								defaultValue,
							},
						);
					}

					// if value is an object, recursively translate it
					if (isObject(value)) {
						return this.translateMessage(value as unknown as T);
					}
				}),
			);

			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return data;
		} catch (error) {
			this.logger.error('Error translating message:', error);

			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return data;
		}
	}
}
