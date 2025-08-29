import { EnumField, StringField } from '../../decorators';
import { LanguageCode } from '../constants';

export class CreateTranslationDto {
	@EnumField(() => LanguageCode)
	languageCode!: LanguageCode;

	@StringField()
	text!: string;
}
