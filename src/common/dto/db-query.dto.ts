import {
	EnumFieldOptional,
	NumberFieldOptional,
	StringFieldOptional,
} from '../../decorators';
import { EOrder } from '../constants';
import { getPagination } from '../utils';
import { PageOptionsDto } from './page-options.dto';

export class DBQueryDto {
	@EnumFieldOptional(() => EOrder, {
		default: EOrder.DESC,
	})
	readonly order: EOrder = EOrder.DESC;

	@StringFieldOptional()
	readonly orderBy?: string;

	@NumberFieldOptional({
		minimum: 0,
		default: 0,
		int: true,
	})
	readonly offset: number = 0;

	@NumberFieldOptional({
		minimum: 1,
		default: 10,
		int: true,
	})
	readonly limit: number = 10;

	@StringFieldOptional()
	readonly filter?: Record<string, unknown>;

	@StringFieldOptional()
	readonly search?: string;

	@StringFieldOptional()
	readonly searchBy?: string;

	constructor(query: PageOptionsDto) {
		const { order, orderBy, page, pageSize, q, qBy, ...filter } = query;

		Object.assign(this, {
			...getPagination({ page, pageSize }),
			order,
			orderBy,
			search: q,
			searchBy: qBy,
			filter,
		});
	}
}
