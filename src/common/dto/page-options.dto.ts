import {
	EnumFieldOptional,
	NumberFieldOptional,
	StringFieldOptional,
} from '../../decorators';
import {
	EOrder,
	PAGINATION_DEFAULT_PAGE,
	PAGINATION_DEFAULT_PAGE_SIZE,
} from '../constants';

export class PageOptionsDto {
	@EnumFieldOptional(() => EOrder, { default: EOrder.DESC })
	readonly order: EOrder = EOrder.DESC;

	@StringFieldOptional()
	readonly orderBy?: string;

	@NumberFieldOptional({
		minimum: 1,
		default: PAGINATION_DEFAULT_PAGE,
		int: true,
	})
	readonly page: number = PAGINATION_DEFAULT_PAGE;

	@NumberFieldOptional({
		minimum: 1,
		maximum: 500,
		default: PAGINATION_DEFAULT_PAGE_SIZE,
		int: true,
	})
	readonly pageSize: number = PAGINATION_DEFAULT_PAGE_SIZE;

	get skip(): number {
		return (this.page - 1) * this.pageSize;
	}

	@StringFieldOptional()
	readonly q?: string;

	@StringFieldOptional()
	readonly qBy?: string;
}
