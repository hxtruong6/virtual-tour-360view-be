import {
	type CallHandler,
	type ExecutionContext,
	Injectable,
	type NestInterceptor,
	UseInterceptors,
} from '@nestjs/common';
import { type Observable } from 'rxjs';

import { API_HEADERS, LanguageCode } from '../../common/constants';
import { ContextProvider } from '../../common/providers';

@Injectable()
export class LanguageInterceptor implements NestInterceptor {
	intercept(
		context: ExecutionContext,
		next: CallHandler,
	): Observable<undefined> {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const request = context.switchToHttp().getRequest();
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const language: string =
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			request.headers[API_HEADERS.ACCEPT_LANGUAGE_CODE] || LanguageCode.en_US;

		if (LanguageCode[language]) {
			ContextProvider.setLanguage(language);
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return next.handle();
		// .pipe(
		// 	tap((data) => { // use the tap to log the response in the language
		// 		console.info(`Response in language: ${language}`);
		// 	}),
		// );
	}
}

export function UseLanguageInterceptor() {
	return UseInterceptors(LanguageInterceptor);
}
