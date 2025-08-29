import {
	type CallHandler,
	type ExecutionContext,
	Injectable,
	type NestInterceptor,
} from '@nestjs/common';
import { type Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { type AbstractDto } from '../../common/dto/abstract.dto';
import { TranslationService } from '../../shared/services/translation.service';

@Injectable()
export class TranslationInterceptor implements NestInterceptor {
	constructor(private readonly translationService: TranslationService) {}

	public intercept(
		_context: ExecutionContext,
		next: CallHandler,
	): Observable<AbstractDto> {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return next.handle().pipe(
			mergeMap((data) => {
				// return this.translationService.translateNecessaryKeys(data);
				// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
				return this.translationService.translateMessage(data) as never;
			}),
		);
	}
}
