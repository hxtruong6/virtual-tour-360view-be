import {
	DYNAMIC_TRANSLATION_DECORATOR_KEY,
	DateField,
	DateFieldOptional,
	UUIDField,
	UUIDFieldOptional,
} from '../../decorators';
import { type AbstractEntity } from '../abstract.entity';
import { ContextProvider } from '../providers';

export class BaseDto {
	@UUIDField()
	id!: Uuid;

	@DateField()
	createdAt!: Date;

	@DateFieldOptional()
	deletedAt?: Date;

	@DateFieldOptional()
	updatedAt?: Date;

	@UUIDFieldOptional()
	createdBy?: Uuid;

	@UUIDFieldOptional()
	updatedBy?: Uuid;

	@UUIDFieldOptional()
	deletedBy?: Uuid;
}

export class AbstractDto {
	@UUIDField()
	id!: Uuid;

	@DateField()
	createdAt!: Date;

	@DateField()
	updatedAt!: Date;

	translations?: AbstractTranslationDto[];

	constructor(entity: AbstractEntity, options?: { excludeFields?: boolean }) {
		if (!options?.excludeFields) {
			this.id = entity.id;
			this.createdAt = entity.createdAt;
			this.updatedAt = entity.updatedAt;
		}

		const languageCode = ContextProvider.getLanguage();

		if (languageCode && entity.translations) {
			const translationEntity = entity.translations.find(
				(titleTranslation) => titleTranslation.languageCode === languageCode,
			)!;

			const fields: Record<string, string> = {};

			for (const key of Object.keys(translationEntity)) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				const metadata = Reflect.getMetadata(
					DYNAMIC_TRANSLATION_DECORATOR_KEY,
					this,
					key,
				);

				if (metadata) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					fields[key] = translationEntity[key];
				}
			}

			Object.assign(this, fields);
		} else {
			console.warn(`No translations found for ${JSON.stringify(entity)}`);
			// this.translations = entity.translations?.toDtos();
		}
	}
}

export class AbstractTranslationDto extends AbstractDto {
	constructor(entity: AbstractEntity) {
		super(entity, { excludeFields: true });
	}
}
